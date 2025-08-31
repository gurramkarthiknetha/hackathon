"""
Socket.IO server implementation for real-time communication.
Maintains compatibility with existing frontend Socket.IO events.
"""

import socketio
from typing import Dict, Any, Optional
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.db.mongo import get_database
from app.auth.service import AuthService


# Create Socket.IO server with CORS configuration
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.cors_origins,
    logger=settings.debug,
    engineio_logger=settings.debug
)


class SocketManager:
    """Manages Socket.IO connections and rooms"""
    
    def __init__(self):
        self.connected_users: Dict[str, Dict[str, Any]] = {}
    
    async def add_user(self, sid: str, user_data: Dict[str, Any]):
        """Add user to connected users tracking"""
        self.connected_users[sid] = user_data
    
    async def remove_user(self, sid: str):
        """Remove user from connected users tracking"""
        self.connected_users.pop(sid, None)
    
    async def get_user(self, sid: str) -> Optional[Dict[str, Any]]:
        """Get user data by session ID"""
        return self.connected_users.get(sid)
    
    async def join_rooms(self, sid: str, user_data: Dict[str, Any]):
        """Join user to appropriate rooms based on role and zone"""
        role = user_data.get('role')
        zone = user_data.get('zone')
        
        # Join role-based room
        if role:
            await sio.enter_room(sid, role)
            
        # Join zone-based room
        if zone:
            await sio.enter_room(sid, zone)
            
        # Join special rooms
        if role == 'responder':
            await sio.enter_room(sid, 'responders')
        elif role in ['operator', 'admin']:
            await sio.enter_room(sid, 'operators')


# Global socket manager instance
socket_manager = SocketManager()


@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    print(f'🔌 User connected: {sid}')
    
    # Optional: Authenticate user on connect
    # This can be implemented if needed for additional security


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    user_data = await socket_manager.get_user(sid)
    if user_data:
        print(f'🔌 User disconnected: {sid} (User: {user_data.get("userId", "unknown")})')
    else:
        print(f'🔌 User disconnected: {sid}')
    
    await socket_manager.remove_user(sid)


@sio.event
async def join_room(sid, data):
    """Handle user joining rooms based on role and zone"""
    try:
        user_id = data.get('userId')
        role = data.get('role')
        zone = data.get('zone')
        
        if not user_id or not role:
            await sio.emit('error', {'message': 'Invalid room join data'}, room=sid)
            return
        
        # Store user data
        user_data = {
            'userId': user_id,
            'role': role,
            'zone': zone
        }
        await socket_manager.add_user(sid, user_data)
        
        # Join appropriate rooms
        await socket_manager.join_rooms(sid, user_data)
        
        print(f'👥 User {user_id} ({role}) joined rooms')
        
    except Exception as e:
        print(f'❌ Error in join_room: {e}')
        await sio.emit('error', {'message': 'Failed to join room'}, room=sid)


@sio.event
async def location_update(sid, data):
    """Handle location updates from responders"""
    try:
        user_data = await socket_manager.get_user(sid)
        if not user_data or user_data.get('role') != 'responder':
            return
        
        location_data = {
            'userId': user_data['userId'],
            'location': data.get('location'),
            'timestamp': data.get('timestamp')
        }
        
        # Broadcast to operators
        await sio.emit('responder-location-update', location_data, room='operators')
        
    except Exception as e:
        print(f'❌ Error in location_update: {e}')


@sio.event
async def incident_update(sid, data):
    """Handle incident updates"""
    try:
        # Broadcast to all connected users
        await sio.emit('incident-updated', data)
        
    except Exception as e:
        print(f'❌ Error in incident_update: {e}')


@sio.event
async def new_incident(sid, data):
    """Handle new incident creation"""
    try:
        zone = data.get('zone')
        
        # Broadcast to operators
        await sio.emit('new-incident', data, room='operators')
        
        # Broadcast to zone if specified
        if zone:
            await sio.emit('new-incident', data, room=zone)
            
    except Exception as e:
        print(f'❌ Error in new_incident: {e}')


@sio.event
async def status_update(sid, data):
    """Handle responder status updates"""
    try:
        user_data = await socket_manager.get_user(sid)
        if not user_data or user_data.get('role') != 'responder':
            return
        
        status_data = {
            'userId': user_data['userId'],
            'status': data.get('status'),
            'timestamp': data.get('timestamp')
        }
        
        # Broadcast to operators
        await sio.emit('responder-status-update', status_data, room='operators')
        
    except Exception as e:
        print(f'❌ Error in status_update: {e}')


@sio.event
async def send_message(sid, data):
    """Handle team communication messages"""
    try:
        user_data = await socket_manager.get_user(sid)
        if not user_data:
            await sio.emit('message-error', {'error': 'User not found'}, room=sid)
            return
        
        db = await get_database()
        
        # Get sender information
        sender = await AuthService.get_user_by_id(db, user_data['userId'])
        if not sender:
            await sio.emit('message-error', {'error': 'Sender not found'}, room=sid)
            return
        
        # Create message document
        from datetime import datetime
        message_doc = {
            'content': data.get('content'),
            'type': data.get('type', 'team'),
            'priority': data.get('priority', 'normal'),
            'sender': sender['_id'],
            'senderName': sender['name'],
            'senderRole': sender['role'],
            'recipients': data.get('recipients', 'responders'),
            'targetZone': data.get('targetZone'),
            'specificRecipients': data.get('specificRecipients'),
            'isEmergency': data.get('priority') == 'critical',
            'createdAt': datetime.utcnow()
        }
        
        # Save message to database
        result = await db.messages.insert_one(message_doc)
        message_doc['_id'] = str(result.inserted_id)
        
        # Prepare message data for broadcasting
        message_data = {
            'id': str(message_doc['_id']),
            'content': message_doc['content'],
            'type': message_doc['type'],
            'priority': message_doc['priority'],
            'sender': {
                'id': str(sender['_id']),
                'name': sender['name'],
                'role': sender['role']
            },
            'recipients': message_doc['recipients'],
            'targetZone': message_doc.get('targetZone'),
            'timestamp': message_doc['createdAt'].isoformat(),
            'isEmergency': message_doc['isEmergency']
        }
        
        # Broadcast message based on recipients
        recipients = data.get('recipients', 'responders')
        target_zone = data.get('targetZone')
        
        if recipients == 'all':
            await sio.emit('new-message', message_data)
        elif recipients == 'responders':
            await sio.emit('new-message', message_data, room='responders')
        elif recipients == 'operators':
            await sio.emit('new-message', message_data, room='operators')
        elif recipients == 'admins':
            await sio.emit('new-message', message_data, room='admin')
        elif recipients == 'zone' and target_zone:
            await sio.emit('new-message', message_data, room=target_zone)
        elif recipients == 'specific':
            # For specific recipients, emit to all and let clients filter
            await sio.emit('new-message', message_data)
        else:
            await sio.emit('new-message', message_data, room='responders')
        
        # Confirm message sent to sender
        await sio.emit('message-sent', {
            'messageId': str(message_doc['_id']),
            'timestamp': message_doc['createdAt'].isoformat()
        }, room=sid)
        
    except Exception as e:
        print(f'❌ Error in send_message: {e}')
        await sio.emit('message-error', {'error': 'Failed to send message'}, room=sid)


@sio.event
async def mark_message_read(sid, data):
    """Handle message read status"""
    try:
        user_data = await socket_manager.get_user(sid)
        if not user_data:
            return
        
        message_id = data.get('messageId')
        if not message_id:
            return
        
        db = await get_database()
        from bson import ObjectId
        from datetime import datetime
        
        # Update message read status
        await db.messages.update_one(
            {'_id': ObjectId(message_id)},
            {
                '$addToSet': {
                    'readBy': {
                        'user': ObjectId(user_data['userId']),
                        'readAt': datetime.utcnow()
                    }
                }
            }
        )
        
        # Get message to notify sender
        message = await db.messages.find_one({'_id': ObjectId(message_id)})
        if message:
            # Notify sender that message was read
            await sio.emit('message-read', {
                'messageId': message_id,
                'readBy': user_data['userId'],
                'readAt': datetime.utcnow().isoformat()
            }, room=str(message['sender']))
        
    except Exception as e:
        print(f'❌ Error in mark_message_read: {e}')


@sio.event
async def broadcast_message(sid, data):
    """Handle broadcast messages (emergency/high priority)"""
    try:
        user_data = await socket_manager.get_user(sid)
        if not user_data or user_data.get('role') not in ['operator', 'admin']:
            await sio.emit('message-error', {'error': 'Unauthorized to broadcast'}, room=sid)
            return
        
        db = await get_database()
        
        # Get sender information
        sender = await AuthService.get_user_by_id(db, user_data['userId'])
        if not sender:
            await sio.emit('message-error', {'error': 'Sender not found'}, room=sid)
            return
        
        # Create broadcast message
        from datetime import datetime
        message_doc = {
            'content': data.get('content'),
            'type': 'broadcast',
            'priority': data.get('priority', 'high'),
            'sender': sender['_id'],
            'senderName': sender['name'],
            'senderRole': sender['role'],
            'recipients': data.get('recipients', 'all'),
            'isEmergency': data.get('priority') == 'critical',
            'createdAt': datetime.utcnow()
        }
        
        # Save message to database
        result = await db.messages.insert_one(message_doc)
        
        # Prepare message data
        message_data = {
            'id': str(result.inserted_id),
            'content': message_doc['content'],
            'type': message_doc['type'],
            'priority': message_doc['priority'],
            'sender': {
                'id': str(sender['_id']),
                'name': sender['name'],
                'role': sender['role']
            },
            'recipients': message_doc['recipients'],
            'timestamp': message_doc['createdAt'].isoformat(),
            'isEmergency': message_doc['isEmergency']
        }
        
        # Broadcast to all users
        await sio.emit('new-message', message_data)
        
        # Confirm broadcast sent
        await sio.emit('message-sent', {
            'messageId': str(result.inserted_id),
            'timestamp': message_doc['createdAt'].isoformat()
        }, room=sid)
        
    except Exception as e:
        print(f'❌ Error in broadcast_message: {e}')
        await sio.emit('message-error', {'error': 'Failed to broadcast message'}, room=sid)


def create_socket_app(fastapi_app: FastAPI):
    """Create Socket.IO ASGI application"""
    return socketio.ASGIApp(sio, fastapi_app)
