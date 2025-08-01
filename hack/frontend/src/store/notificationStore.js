import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotificationStore = create(
  persist(
    (set, get) => ({
      // Notification state
      notifications: [],
      unreadCount: 0,
      emailNotifications: [],
      
      // Email notification settings
      emailSettings: {
        emailNotificationsEnabled: true,
        incidentCreated: {
          enabled: true,
          notifyRoles: ["admin", "operator"],
          notifyZoneResponders: true,
        },
        incidentAssigned: {
          enabled: true,
          notifyRoles: ["admin", "operator"],
          notifyAssignedResponder: true,
        },
        incidentStatusUpdate: {
          enabled: true,
          notifyRoles: ["admin", "operator"],
          notifyOnResolved: true,
          notifyOnInProgress: true,
        },
        incidentApproval: {
          enabled: true,
          notifyRoles: ["admin", "operator"],
          notifyOnApproved: true,
          notifyOnDismissed: true,
        },
        severityFilters: {
          notifyOnLow: true,
          notifyOnMedium: true,
          notifyOnHigh: true,
          notifyOnCritical: true,
        },
      },

      // Actions
      addNotification: (notification) => {
        const newNotification = {
          id: notification.id || `notification-${Date.now()}-${Math.random()}`,
          ...notification,
          timestamp: notification.timestamp || new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100
          unreadCount: state.unreadCount + 1,
        }));
      },

      addEmailNotification: (emailNotification) => {
        const newEmailNotification = {
          id: emailNotification.id || `email-${Date.now()}-${Math.random()}`,
          type: 'email',
          ...emailNotification,
          timestamp: emailNotification.timestamp || new Date(),
          read: false,
        };

        set((state) => ({
          emailNotifications: [newEmailNotification, ...state.emailNotifications].slice(0, 50), // Keep last 50
          notifications: [newEmailNotification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          );
          const updatedEmailNotifications = state.emailNotifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          );
          
          const wasUnread = state.notifications.find(n => n.id === notificationId && !n.read);
          
          return {
            notifications: updatedNotifications,
            emailNotifications: updatedEmailNotifications,
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          emailNotifications: state.emailNotifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (notificationId) => {
        set((state) => {
          const notificationToRemove = state.notifications.find(n => n.id === notificationId);
          const wasUnread = notificationToRemove && !notificationToRemove.read;
          
          return {
            notifications: state.notifications.filter(n => n.id !== notificationId),
            emailNotifications: state.emailNotifications.filter(n => n.id !== notificationId),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      clearAllNotifications: () => {
        set({
          notifications: [],
          emailNotifications: [],
          unreadCount: 0,
        });
      },

      // Email settings actions
      updateEmailSettings: (newSettings) => {
        set((state) => ({
          emailSettings: { ...state.emailSettings, ...newSettings },
        }));
      },

      // Simulate receiving email notifications (in real app, this would come from WebSocket or API)
      simulateEmailNotification: (type, incident) => {
        const { addEmailNotification } = get();
        
        let title, message, severity;
        
        switch (type) {
          case 'incident_created':
            title = `New ${incident.severity} Incident Alert`;
            message = `${incident.type.replace('_', ' ')} detected in ${incident.zone}: ${incident.description}`;
            severity = incident.severity;
            break;
          case 'incident_assigned':
            title = 'Incident Assignment';
            message = `You have been assigned to handle a ${incident.type.replace('_', ' ')} incident in ${incident.zone}`;
            severity = incident.severity;
            break;
          case 'incident_status_update':
            title = 'Incident Status Update';
            message = `Incident in ${incident.zone} status changed to ${incident.status}`;
            severity = 'medium';
            break;
          case 'incident_approval':
            title = 'Incident Approval Decision';
            message = `High-risk incident in ${incident.zone} has been ${incident.humanApproved ? 'approved' : 'dismissed'}`;
            severity = 'high';
            break;
          default:
            title = 'Email Notification';
            message = 'You have received a new email notification';
            severity = 'medium';
        }

        addEmailNotification({
          title,
          message,
          severity,
          data: { emailType: type, incident },
        });
      },

      // Get notifications by type
      getNotificationsByType: (type) => {
        const { notifications } = get();
        return notifications.filter(n => n.type === type);
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        const { notifications } = get();
        return notifications.filter(n => !n.read);
      },

      // Update unread count based on external sources (incidents, system alerts)
      updateUnreadCount: (externalCount) => {
        set((state) => {
          const internalUnread = state.notifications.filter(n => !n.read).length;
          return {
            unreadCount: internalUnread + externalCount,
          };
        });
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications,
        emailNotifications: state.emailNotifications,
        emailSettings: state.emailSettings,
        // Don't persist unreadCount as it should be calculated fresh
      }),
    }
  )
);

export default useNotificationStore;
