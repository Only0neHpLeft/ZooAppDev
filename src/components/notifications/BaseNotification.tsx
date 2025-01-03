import { useEffect, useState, memo } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  id?: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
  variant?: 'indigo' | 'yellow';
}

const ANIMATION_TIMING = {
  MOUNT_DELAY: 100,
  DISPLAY_DURATION: 3000,
  EXIT_DURATION: 300
} as const;

export const BaseNotification = memo<ToastProps>(({
  title,
  message,
  onClose,
  onAction,
  actionLabel,
  icon,
  variant = 'indigo'
}) => {
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), ANIMATION_TIMING.MOUNT_DELAY);
    const exitTimer = setTimeout(() => setIsExiting(true), ANIMATION_TIMING.DISPLAY_DURATION);
    const closeTimer = setTimeout(onClose, ANIMATION_TIMING.DISPLAY_DURATION + ANIMATION_TIMING.EXIT_DURATION);

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const getVariantStyles = () => {
    const variants = {
      indigo: 'bg-indigo-500/10 border-indigo-500/20',
      yellow: 'bg-yellow-500/10 border-yellow-500/20'
    };
    return variants[variant];
  };

  return (
    <div
      className={`
        w-96 p-4 rounded-xl border shadow-lg shadow-black/10 backdrop-blur-sm
        ${getVariantStyles()}
        ${mounted && !isExiting ? 'animate-slide-in-right' : ''}
        ${isExiting ? 'animate-slide-out-right' : ''}
      `}
      role="alert"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {icon}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-300">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(onClose, ANIMATION_TIMING.EXIT_DURATION);
            }}
            className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="w-full px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 
                     text-sm font-medium rounded-lg transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
});

BaseNotification.displayName = 'BaseNotification';