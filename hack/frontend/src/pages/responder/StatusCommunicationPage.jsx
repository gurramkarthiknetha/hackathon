import React from "react";
import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Radio, MessageSquare, Phone, Users, Signal, Battery, Wifi, Send, Mic, MicOff } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useSocket } from "../../hooks/useSocket";
import axios from "axios";

const StatusCommunicationPage = () => {
  const { sidebarOpen } = useSidebar();
  const { user } = useAuthStore();
  const {
    isConnected,
    messages,
    unreadCount,
    sendTeamMessage,
    broadcastMessage,
    markMessageAsRead,
    updateStatus
  } = useSocket();

  const [currentStatus, setCurrentStatus] = useState('available');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const [teamMembers, setTeamMembers] = useState([]);
  const [messageStats, setMessageStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    unreadCount: 0,
    emergencyCount: 0
  });

  // State for storing fetched messages from API
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingMessages(true);

        // Configure API base URL
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

        // Configure axios for authenticated requests
        const axiosConfig = {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        // Fetch existing messages
        const messagesResponse = await axios.get(`${API_BASE_URL}/messages?limit=50`, axiosConfig);
        if (messagesResponse.data.success) {
          setFetchedMessages(messagesResponse.data.data.messages || []);
        }

        // Fetch message statistics
        const statsResponse = await axios.get(`${API_BASE_URL}/messages/stats`, axiosConfig);
        if (statsResponse.data.success) {
          setMessageStats(statsResponse.data.data);
        }

        // Fetch team members (responders in same zone or all responders)
        const teamResponse = await axios.get(`${API_BASE_URL}/dashboard/responders`, axiosConfig);
        if (teamResponse.data.success) {
          setTeamMembers(teamResponse.data.data.filter(member =>
            member.id !== user.id && member.isActive
          ));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Log more details about the error
        if (error.response) {
          console.error('Response error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('Request error:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Combine fetched messages with real-time messages, avoiding duplicates
  const allMessages = React.useMemo(() => {
    const messageMap = new Map();

    // Add fetched messages first
    fetchedMessages.forEach(msg => {
      messageMap.set(msg.id || msg._id, msg);
    });

    // Add real-time messages, they will override if same ID
    messages.forEach(msg => {
      messageMap.set(msg.id || msg._id, msg);
    });

    // Convert back to array and sort by timestamp (newest first)
    return Array.from(messageMap.values()).sort((a, b) =>
      new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
    );
  }, [fetchedMessages, messages]);

  // Communication statistics based on real data
  const commStats = [
    {
      label: "Messages Sent",
      value: messageStats.totalSent.toString(),
      color: "from-blue-500 to-blue-600",
      change: `+${Math.floor(messageStats.totalSent * 0.2)}`,
      icon: MessageSquare
    },
    {
      label: "Messages Received",
      value: messageStats.totalReceived.toString(),
      color: "from-green-500 to-green-600",
      change: `+${Math.floor(messageStats.totalReceived * 0.15)}`,
      icon: Radio
    },
    {
      label: "Team Members",
      value: teamMembers.length.toString(),
      color: "from-purple-500 to-purple-600",
      change: "online",
      icon: Users
    },
    {
      label: "Signal Quality",
      value: isConnected ? "Excellent" : "Poor",
      color: "from-orange-500 to-orange-600",
      change: isConnected ? "stable" : "unstable",
      icon: Signal
    }
  ];

  // Status options
  const statusOptions = [
    { value: 'available', label: 'Available', color: 'bg-green-600', description: 'Ready for assignments' },
    { value: 'responding', label: 'Responding', color: 'bg-blue-600', description: 'En route to incident' },
    { value: 'busy', label: 'Busy', color: 'bg-yellow-600', description: 'Handling incident' },
    { value: 'break', label: 'On Break', color: 'bg-purple-600', description: 'Taking a break' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-600', description: 'Not available' }
  ];

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-600';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    updateStatus(newStatus);
    console.log("Status changed to:", newStatus);
  };

  const handleSendMessage = () => {
    if (message.trim() && isConnected) {
      const messageData = {
        content: message.trim(),
        type: 'team',
        priority: 'normal',
        recipients: 'responders'
      };

      sendTeamMessage(messageData);
      setMessage('');
    }
  };

  const handleBroadcastMessage = (content, priority = 'high') => {
    if (content.trim() && isConnected) {
      const messageData = {
        content: content.trim(),
        priority,
        recipients: 'all'
      };

      broadcastMessage(messageData);
    }
  };

  const handleMessageClick = (messageId) => {
    markMessageAsRead(messageId);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording functionality would be implemented here
  };

  return (
    <div className={`space-y-6 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-600 text-transparent bg-clip-text mb-2">
            Status & Communication
          </h1>
          <p className="text-gray-300">
            Manage your status and communicate with your team and command center
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Unread Messages Count */}
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">{unreadCount} unread</span>
            </div>
          )}
          
          {/* Battery Level */}
          <div className="flex items-center space-x-1">
            <Battery className={`h-4 w-4 ${batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-sm text-gray-400">{batteryLevel}%</span>
          </div>
          
          {/* Signal Strength */}
          <div className="flex items-center space-x-1">
            <Signal className="h-4 w-4 text-green-400" />
            <div className="flex space-x-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-full ${
                    i < signalStrength ? 'bg-green-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Communication Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {commStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-green-400">
                  {stat.change}
                </span>
                <p className="text-gray-500 text-xs">today</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Status Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                currentStatus === status.value
                  ? `${status.color} border-white text-white`
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${status.color}`}></div>
                <h4 className="font-medium text-sm">{status.label}</h4>
                <p className="text-xs opacity-75 mt-1">{status.description}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Center */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Team Communication</h3>
              <p className="text-gray-400 text-sm">Send messages to your team and command center</p>
            </div>
            
            {/* Recent Messages */}
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {isLoadingMessages ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
                  <p>Loading messages...</p>
                </div>
              ) : allMessages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start a conversation with your team</p>
                </div>
              ) : (
                allMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id || msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`p-3 bg-gray-800 rounded-lg border-l-4 ${getPriorityColor(msg.priority)} cursor-pointer hover:bg-gray-750 transition-colors`}
                    onClick={() => handleMessageClick(msg.id || msg._id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">
                        {msg.sender?.name || msg.senderName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-xs">
                          {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}
                        </span>
                        {msg.isEmergency && (
                          <span className="text-red-400 text-xs font-bold">!</span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{msg.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        msg.type === 'broadcast' ? 'bg-red-600 text-white' :
                        msg.type === 'emergency' ? 'bg-red-700 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {msg.type}
                      </span>
                      <span className={`text-xs ${
                        msg.priority === 'critical' ? 'text-red-400' :
                        msg.priority === 'high' ? 'text-orange-400' :
                        msg.priority === 'normal' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {msg.priority} priority
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-700/50">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isConnected ? "Type your message..." : "Connecting..."}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={!isConnected}
                />

                <button
                  onClick={toggleRecording}
                  disabled={!isConnected}
                  className={`p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  } text-white`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !isConnected}
                  className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Team Status</h3>
              <p className="text-gray-400 text-sm">Current team member status</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {teamMembers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members online</p>
                </div>
              ) : (
                teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">{member.name}</h4>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status || 'available')}`}></div>
                    </div>

                    <p className="text-gray-400 text-xs mb-1">{member.role}</p>
                    <p className="text-gray-500 text-xs">{member.assignedZone || 'No zone assigned'}</p>
                    <p className="text-gray-500 text-xs">
                      Last seen: {member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}
                    </p>

                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => {
                          // Send direct message to this team member
                          const directMessage = prompt(`Send message to ${member.name}:`);
                          if (directMessage && directMessage.trim()) {
                            sendTeamMessage({
                              content: directMessage.trim(),
                              type: 'direct',
                              priority: 'normal',
                              recipients: 'specific',
                              specificRecipients: [member.id]
                            });
                          }
                        }}
                        disabled={!isConnected}
                        className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs transition-colors duration-200"
                      >
                        Message
                      </button>
                      <button
                        disabled={!isConnected}
                        className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs transition-colors duration-200"
                      >
                        Call
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Communication Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Communication</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              const emergencyMessage = prompt("Emergency message:");
              if (emergencyMessage && emergencyMessage.trim()) {
                handleBroadcastMessage(emergencyMessage.trim(), 'critical');
              }
            }}
            disabled={!isConnected}
            className="p-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-center"
          >
            <Phone className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Emergency Alert</span>
          </button>

          <button
            onClick={() => {
              sendTeamMessage({
                content: "Radio check - testing communication",
                type: 'team',
                priority: 'normal',
                recipients: 'responders'
              });
            }}
            disabled={!isConnected}
            className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-center"
          >
            <Radio className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Radio Check</span>
          </button>

          <button
            onClick={() => {
              const broadcastMessage = prompt("Broadcast message to all:");
              if (broadcastMessage && broadcastMessage.trim()) {
                handleBroadcastMessage(broadcastMessage.trim(), 'high');
              }
            }}
            disabled={!isConnected}
            className="p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-center"
          >
            <MessageSquare className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Broadcast</span>
          </button>

          <button
            onClick={() => {
              sendTeamMessage({
                content: "Team call requested - please respond",
                type: 'team',
                priority: 'high',
                recipients: 'responders'
              });
            }}
            disabled={!isConnected}
            className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-center"
          >
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Team Call</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StatusCommunicationPage;
