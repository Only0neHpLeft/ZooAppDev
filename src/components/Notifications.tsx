import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Clock, Info, AlertCircle, CheckCircle, Trash2, Download } from 'lucide-react';
import { useNotifications, formatTimeAgo } from '../contexts/NotificationContext';
import { ROUTES } from '../navigation';

type NotificationType = 'success' | 'info' | 'warning' | 'unlock' | 'update';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

interface FilterButtonProps {
  id: string;
  label: string;
  isSelected: boolean;
  unreadCount?: number;
  onClick: () => void;
}

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
}

const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'Všechna oznámení' },
  { id: 'unread', label: 'Nepřečtená' },
  { id: 'unlock', label: 'Odemčení' },
  { id: 'update', label: 'Aktualizace' },
] as const;

const NOTIFICATION_ICONS: Record<NotificationType, JSX.Element> = {
  unlock: <Bell className="w-5 h-5 text-yellow-400" />,
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
  update: <Download className="w-5 h-5 text-indigo-400" />
};

const BUTTON_BASE_STYLES = 'px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2';
const FILTER_BUTTON_STYLES = {
  base: 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
  active: 'bg-slate-800 text-white',
  inactive: 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
};

const ACTION_BUTTON_VARIANTS = {
  default: 'text-slate-400 hover:text-slate-300 border border-slate-800 hover:bg-slate-800/50',
  danger: 'text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/20'
};

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => (
  NOTIFICATION_ICONS[type]
);

const FilterButton: React.FC<FilterButtonProps> = ({ 
  id, 
  label, 
  isSelected, 
  unreadCount, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`${FILTER_BUTTON_STYLES.base} ${
      isSelected ? FILTER_BUTTON_STYLES.active : FILTER_BUTTON_STYLES.inactive
    }`}
  >
    {label}
    {id === 'all' && typeof unreadCount === 'number' && unreadCount > 0 && (
      <span className="ml-auto text-xs bg-slate-700 px-2 py-0.5 rounded-full">
        {unreadCount}
      </span>
    )}
  </button>
);

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  icon,
  label,
  variant = 'default'
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`${BUTTON_BASE_STYLES} ${ACTION_BUTTON_VARIANTS[variant]}`}
  >
    {icon}
    {label}
  </button>
);

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => (
  <div
    className={`p-4 rounded-xl border transition-colors ${
      notification.isRead ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-900/80 border-slate-700'
    }`}
  >
    <div className="flex items-start gap-4">
      <NotificationIcon type={notification.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-white">{notification.title}</h3>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(notification.time)}
            </span>
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-300 transition-colors"
                title="Označit jako přečtené"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
    <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
    <p className="text-slate-400">Žádná oznámení k zobrazení</p>
  </div>
);

const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [selectedFilter, setSelectedFilter] = React.useState<typeof NOTIFICATION_FILTERS[number]['id']>('all');

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notif) => {
      switch (selectedFilter) {
        case 'all': return true;
        case 'unread': return !notif.isRead;
        default: return notif.type === selectedFilter;
      }
    });
  }, [notifications, selectedFilter]);

  const hasUnreadNotifications = notifications.some(n => !n.isRead);
  const hasNotifications = notifications.length > 0;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="mb-8">
        <Link to={ROUTES.CATEGORIES} className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-300 mb-6">
          ← Zpět na přehled
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-slate-400" />
            <h1 className="text-2xl font-bold text-white">Oznámení</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <ActionButton
              onClick={markAllAsRead}
              disabled={!hasUnreadNotifications}
              icon={<Check className="w-4 h-4" />}
              label="Označit vše jako přečtené"
            />
            <ActionButton
              onClick={clearNotifications}
              disabled={!hasNotifications}
              icon={<Trash2 className="w-4 h-4" />}
              label="Vymazat vše"
              variant="danger"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-64 shrink-0">
          <nav className="space-y-1">
            {NOTIFICATION_FILTERS.map((filter) => (
              <FilterButton
                key={filter.id}
                id={filter.id}
                label={filter.label}
                isSelected={selectedFilter === filter.id}
                unreadCount={filter.id === 'all' ? unreadCount : undefined}
                onClick={() => setSelectedFilter(filter.id)}
              />
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;