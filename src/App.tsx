import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ROUTES } from './navigation';
import { CategoryGrid } from './components/CategoryGrid';
import { UpdateManager } from './components/UpdateManager';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { initDb } from './services/database';
import CategoryPage from './components/CategoryPage';
import Navigation from './components/Navigation';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import VerificationCode from './components/VerificationCode';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import LiveEditor from './pages/LiveEditor';

const STYLES = {
  container: 'min-h-screen bg-[#0A0F1E] relative overflow-x-hidden',
  mainContent: 'relative z-10 flex flex-col min-h-screen',
  mainSection: 'flex-1'
} as const;

const BackgroundEffects: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[#0A0F1E]" />
    <div
      className="absolute -top-[25%] -left-[25%] w-[80%] h-[80%] bg-[#4D34E3]/20 blur-[120px] rounded-full animate-float-slow"
      style={{ animationDelay: '0s' }}
    />
    <div
      className="absolute -bottom-[25%] -right-[25%] w-[80%] h-[80%] bg-[#E3348B]/10 blur-[120px] rounded-full animate-float-slow"
      style={{ animationDelay: '-7.5s' }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
  </div>
);

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.CATEGORIES} replace />} />
    <Route path={ROUTES.LOGIN} element={<Login />} />
    <Route path={ROUTES.REGISTER} element={<Register />} />
    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
    <Route path={ROUTES.VERIFY_EMAIL} element={<VerificationCode />} />
    <Route path={ROUTES.CATEGORIES} element={<CategoryGrid />} />
    <Route path={ROUTES.CATEGORY_DETAIL(':id')} element={<CategoryPage />} />
    <Route path={ROUTES.CATEGORY_TASK(':id', ':taskId')} element={<LiveEditor />} />
    <Route path={ROUTES.SETTINGS} element={<Settings />} />
    <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
  </Routes>
);

const App: React.FC = () => {
    useEffect(() => {
        initDb().catch(console.error);
    }, []);
    
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <DatabaseProvider>
          <UpdateManager />
            <div className={STYLES.container}>
              <BackgroundEffects />
              <div className={STYLES.mainContent}>
                <Navigation />
                <main className={STYLES.mainSection}>
                  <AppRoutes />
                </main>
              </div>
            </div>
          </DatabaseProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;