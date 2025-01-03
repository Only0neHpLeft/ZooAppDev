import React from 'react'; 
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, PAGE_TITLES } from '../navigation';

interface NavButtonProps {
  to: string;
  children: React.ReactNode;
  showNotification?: boolean;
}

interface AuthButtonProps {
  onSignOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const NAV_BUTTON_STYLES = 'p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors';
const AUTH_BUTTON_STYLES = {
  signOut: 'ml-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 text-sm font-medium hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-2',
  signIn: 'ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg hover:from-indigo-600 hover:to-purple-700'
};

const getPageTitle = (pathname: string): string => {
  return PAGE_TITLES[pathname] || PAGE_TITLES.DEFAULT;
};

const NavButton: React.FC<NavButtonProps> = ({ to, children, showNotification }) => (
  <Link to={to} className={`${NAV_BUTTON_STYLES} relative`}>
    {children}
    {showNotification && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
    )}
  </Link>
);

const AuthButton: React.FC<AuthButtonProps> = ({ onSignOut, isAuthenticated }) => {
  if (isAuthenticated) {
    return (
      <button onClick={onSignOut} className={AUTH_BUTTON_STYLES.signOut}>
        <LogOut className="w-4 h-4" />
        Odhlásit se
      </button>
    );
  }

  return (
    <Link to={ROUTES.LOGIN} className={AUTH_BUTTON_STYLES.signIn}>
      Přihlásit se
    </Link>
  );
};

const BrandSection: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
  return (
    <div className="flex items-center gap-4">
      <h1 className="text-lg font-bold text-white">{pageTitle}</h1>
      <div className="h-6 w-px bg-slate-800" />
      <span className="text-sm font-medium text-slate-400">Zoo Databáze</span>
    </div>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="w-full border-b border-slate-800 relative z-50">
      <div className="max-w-[1400px] mx-auto px-8">
        <nav className="flex justify-between items-center h-16">
          <BrandSection pageTitle={pageTitle} />

          <div className="flex items-center gap-2">
            <NavButton to={ROUTES.SETTINGS}>
              <Settings className="w-5 h-5" />
            </NavButton>
            
            <NavButton 
              to={ROUTES.NOTIFICATIONS} 
              showNotification={unreadNotificationsCount > 0}
            >
              <Bell className="w-5 h-5" />
            </NavButton>

            <AuthButton 
              onSignOut={handleSignOut}
              isAuthenticated={!!user}
            />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navigation;