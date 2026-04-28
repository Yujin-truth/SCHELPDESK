import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationsWidget = ({ autoRefresh = true }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const notificationIcons = {
    'ticket_created': '📝',
    'ticket_updated': '✏️',
    'ticket_assigned': '👤',
    'ticket_resolved': '✓',
    'status_change': '🔄',
    'new_comment': '💬',
    'general': 'ℹ️'
  };

  useEffect(() => {
    fetchNotifications();
    
    if (autoRefresh) {
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications?limit=10');
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/all/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="notifications-widget">
      <div className="widget-header">
        <h3>
          <span className="bell-icon">🔔</span>
          Notifications
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </h3>
        {unreadCount > 0 && (
          <button 
            className="mark-all-btn"
            onClick={markAllAsRead}
            title="Mark all as read"
          >
            ✓
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications</p>
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {displayedNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {notificationIcons[notification.type] || notificationIcons['general']}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {notifications.length > 5 && (
            <button 
              className="view-all-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show less' : `View all (${notifications.length})`}
            </button>
          )}
        </>
      )}

      <style jsx>{`
        .notifications-widget {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }

        .widget-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          color: #333;
        }

        .bell-icon {
          font-size: 18px;
        }

        .badge {
          background: #f44336;
          color: white;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .mark-all-btn {
          background: #2196F3;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .mark-all-btn:hover {
          background: #1976D2;
        }

        .loading,
        .empty-state {
          text-align: center;
          padding: 24px 12px;
          color: #999;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 4px;
          background: #f9f9f9;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }

        .notification-item.unread {
          background: #e3f2fd;
          border-left-color: #2196F3;
        }

        .notification-item:hover {
          background: #f0f0f0;
        }

        .notification-item.unread:hover {
          background: #e3f2fd;
        }

        .notification-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #333;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .notification-message {
          color: #666;
          font-size: 13px;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notification-time {
          color: #999;
          font-size: 11px;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 20px;
          padding: 0;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .delete-btn:hover {
          color: #f44336;
        }

        .view-all-btn {
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #2196F3;
          transition: all 0.2s;
        }

        .view-all-btn:hover {
          background: #eeeeee;
        }

        @media (max-width: 600px) {
          .notifications-widget {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsWidget;
