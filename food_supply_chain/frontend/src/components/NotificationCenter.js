import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock,
  ExternalLink
} from 'lucide-react';
import notificationService from '../services/notification-service';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to notifications
    const handleNotification = (data) => {
      const newNotification = {
        id: Date.now() + Math.random(),
        type: data.type,
        payload: data.payload,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
      setUnreadCount(prev => prev + 1);
    };

    notificationService.subscribe('notification-center', handleNotification);

    return () => {
      notificationService.unsubscribe('notification-center');
    };
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'crop_registered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'crop_transferred':
        return <ExternalLink className="w-5 h-5 text-blue-600" />;
      case 'crop_purchased':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'role_granted':
        return <Info className="w-5 h-5 text-purple-600" />;
      case 'system_notification':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationTitle = (type, payload) => {
    switch (type) {
      case 'crop_registered':
        return `New Crop: ${payload.cropName}`;
      case 'crop_transferred':
        return `Crop Transferred: ${payload.cropName}`;
      case 'crop_purchased':
        return `Crop Sold: ${payload.cropName}`;
      case 'role_granted':
        return `Role Granted: ${payload.role}`;
      case 'system_notification':
        return 'System Notification';
      default:
        return 'Notification';
    }
  };

  const getNotificationMessage = (type, payload) => {
    switch (type) {
      case 'crop_registered':
        return `Crop "${payload.cropName}" (Batch: ${payload.batchNumber}) has been registered`;
      case 'crop_transferred':
        return `Crop "${payload.cropName}" transferred from ${payload.fromAddress?.slice(0, 6)}... to ${payload.toAddress?.slice(0, 6)}...`;
      case 'crop_purchased':
        return `Crop "${payload.cropName}" was purchased for ${payload.amount} ETH`;
      case 'role_granted':
        return `Role "${payload.role}" granted to ${payload.userAddress?.slice(0, 6)}...`;
      case 'system_notification':
        return payload.message;
      default:
        return 'New notification received';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <div className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-scroll bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You'll see updates here when they happen</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {getNotificationTitle(notification.type, notification.payload)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        !notification.read ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        {getNotificationMessage(notification.type, notification.payload)}
                      </p>
                      
                      {notification.payload.transactionHash && (
                        <div className="mt-2">
                          <a
                            href={`https://etherscan.io/tx/${notification.payload.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Transaction →
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Real-time blockchain notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
