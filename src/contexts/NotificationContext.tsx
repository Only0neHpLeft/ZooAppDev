import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { CSSProperties } from 'react';
import { UnlockNotification } from '../components/notifications/UnlockNotification';
import { UpdateNotification } from '../components/notifications/updateNotification';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'unlock' | 'update';
  time: string;
  isRead: boolean;
  categoryLetter?: string;
  version?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'time' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  pushNotificationsEnabled: boolean;
  setPushNotificationsEnabled: (enabled: boolean) => void;
}

type TimeInterval = {
  value: number;
  unit: string;
};

const STORAGE_KEYS = {
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'notification_settings'
} as const;

const LIMITS = {
  MAX_NOTIFICATIONS: 50,
  TOAST_LIMIT: 3,
  DUPLICATE_WINDOW: 5000
} as const;

const TIME_INTERVALS: TimeInterval[] = [
  { value: 31536000, unit: 'let' },
  { value: 2592000, unit: 'měsíců' },
  { value: 86400, unit: 'dní' },
  { value: 3600, unit: 'hodin' },
  { value: 60, unit: 'minut' }
];

const generateNotificationId = (baseId?: string): string => 
  baseId || `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const formatTimeAgo = (date: string): string => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  for (const { value, unit } of TIME_INTERVALS) {
    const interval = seconds / value;
    if (interval > 1) {
      return `${Math.floor(interval)} ${unit}`;
    }
  }
  
  return 'Před chvílí';
};

const ToastContainer: React.FC<{
  toasts: Notification[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => (
  <div className="fixed right-0 top-0 z-[100] p-4 space-y-4 pointer-events-none">
    {toasts.map((toast, index) => {
      const containerStyle: CSSProperties = {
        position: 'fixed',
        top: `${24 + (index * 100)}px`,
        right: '32px',
        zIndex: 9999 - index
      };

      switch (toast.type) {
        case 'update':
          return (
            <div
              key={toast.id}
              className="pointer-events-auto"
              style={containerStyle}
            >
              <UpdateNotification 
                version={toast.version || '0.0.2'} 
                onClose={() => onRemove(toast.id)}
              />
            </div>
          );
        case 'unlock':
          return (
            <div
              key={toast.id}
              className="pointer-events-auto"
              style={containerStyle}
            >
              <UnlockNotification 
                categoryLetter={toast.categoryLetter || ''} 
                onClose={() => onRemove(toast.id)}
              />
            </div>
          );
        default:
          return null;
      }
    })}
  </div>
);

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => 
    getStoredValue(STORAGE_KEYS.NOTIFICATIONS, [])
  );

  const [toasts, setToasts] = useState<Notification[]>([]);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(() => 
    getStoredValue(STORAGE_KEYS.SETTINGS, { pushEnabled: true }).pushEnabled
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS, 
      JSON.stringify(notifications.slice(0, LIMITS.MAX_NOTIFICATIONS))
    );
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS, 
      JSON.stringify({ pushEnabled: pushNotificationsEnabled })
    );
  }, [pushNotificationsEnabled]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'time' | 'isRead'>) => {
    const newNotification = {
      ...notification,
      time: new Date().toISOString(),
      isRead: false,
      id: generateNotificationId(notification.id)
    };

    setNotifications(prev => {
      const hasDuplicate = prev.some(n => 
        n.type === notification.type &&
        n.title === notification.title &&
        Date.now() - new Date(n.time).getTime() < LIMITS.DUPLICATE_WINDOW
      );

      if (hasDuplicate) return prev;
      return [newNotification, ...prev].slice(0, LIMITS.MAX_NOTIFICATIONS);
    });

    if ((notification.type === 'unlock' || notification.type === 'update') && pushNotificationsEnabled) {
      setToasts(prev => {
        const filtered = prev.filter(t =>
          notification.type === 'unlock' ? 
            t.categoryLetter !== notification.categoryLetter :
            t.type !== 'update'
        );
        return [...filtered, newNotification].slice(-LIMITS.TOAST_LIMIT);
      });
    }
  }, [pushNotificationsEnabled]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue = useMemo(() => ({
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    pushNotificationsEnabled,
    setPushNotificationsEnabled
  }), [
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    pushNotificationsEnabled
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};