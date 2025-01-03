import React from 'react';
import { UserCircle, LogOut, Shield, BarChart3, Calendar, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from  '../navigation';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface AchievementProps {
  title: string;
  description: string;
  progress: number;
}

const STYLES = {
  cardBase: 'p-6 bg-slate-800/50 rounded-xl',
  progressBarBase: 'w-full bg-slate-700/50 rounded-full',
  progressBarFill: 'bg-gradient-to-r from-indigo-500 to-purple-600',
  iconContainer: 'flex items-center justify-center',
  achievementContainer: 'space-y-3'
} as const;

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => (
  <div className="p-3 bg-slate-800/50 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-indigo-400" />
      <span className="text-sm text-slate-400">{label}</span>
    </div>
    <div className="text-lg font-medium text-white">{value}</div>
  </div>
);

const Achievement: React.FC<AchievementProps> = ({ title, description, progress }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
      <Trophy className="w-4 h-4 text-indigo-400" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-300">{title}</span>
        <span className="text-xs text-indigo-400">{progress}%</span>
      </div>
      <div className="text-xs text-slate-400">{description}</div>
      <div className={`mt-1 ${STYLES.progressBarBase} h-1`}>
        <div
          className="bg-indigo-500 h-1 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);

const NotLoggedInView: React.FC = () => (
  <div className="space-y-6">
    <div className={STYLES.cardBase}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <div className="text-slate-300 font-medium">Nejste přihlášeni</div>
          <div className="text-sm text-slate-500">Přihlašte se pro ukládání postupu</div>
        </div>
      </div>
      <Link 
        to={ROUTES.LOGIN}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-colors"
      >
        Přihlásit se
      </Link>
    </div>
  </div>
);

const LevelProgress: React.FC = () => (
  <div className="mb-6">
    <div className="flex justify-between mb-2">
      <span className="text-sm text-slate-400">Level 15</span>
      <span className="text-sm text-indigo-400">7,850 / 8,000 XP</span>
    </div>
    <div className={`${STYLES.progressBarBase} h-2`}>
      <div className={`${STYLES.progressBarFill} h-2 rounded-full`} style={{ width: '98%' }} />
    </div>
  </div>
);

const StatsGrid: React.FC = () => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <StatCard icon={Trophy} label="Dokončené úkoly" value="42" />
    <StatCard icon={BarChart3} label="Úspěšnost" value="89%" />
    <StatCard icon={Calendar} label="Aktivní dny" value="15" />
    <StatCard icon={Clock} label="Průměrný čas" value="4:25" />
  </div>
);

const SecuritySection: React.FC = () => (
  <div className="p-4 bg-slate-800/50 rounded-lg mb-6">
    <div className="flex items-center gap-3 text-slate-300">
      <Shield className="w-5 h-5" />
      <div>
        <div className="font-medium">Dvoufázové ověření</div>
        <div className="text-sm text-slate-400">Zabezpečte svůj účet</div>
      </div>
      <button className="ml-auto text-sm text-indigo-400 hover:text-indigo-300">
        Nastavit
      </button>
    </div>
  </div>
);

const AchievementsSection: React.FC = () => (
  <div className="mb-6">
    <h3 className="text-sm font-medium text-slate-400 mb-3">Poslední úspěchy</h3>
    <div className={STYLES.achievementContainer}>
      <Achievement title="SQL Master" description="Dokončili jste 40 úkolů" progress={100} />
      <Achievement title="Rychlé prsty" description="Dokončete úkol pod 3 minuty" progress={75} />
      <Achievement title="Perfekcionista" description="100% úspěšnost v kategorii" progress={60} />
    </div>
  </div>
);

const LogoutButton: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => (
  <div className="space-y-2">
    <button
      onClick={onSignOut}
      className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm"
    >
      <LogOut className="w-4 h-4" />
      Odhlásit se
    </button>
  </div>
);

const AccountPanel: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return <NotLoggedInView />;
  }

  return (
    <div className="space-y-6">
      <div className={STYLES.cardBase}>
        {/* Profile Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-white font-medium">
              {user.user_metadata.username || user.email}
            </div>
            <div className="text-sm text-slate-400">{user.email}</div>
          </div>
        </div>

        <LevelProgress />
        <StatsGrid />
        <AchievementsSection />
        <SecuritySection />
        <LogoutButton onSignOut={signOut} />
      </div>
    </div>
  );
};

export type { StatCardProps, AchievementProps };
export default AccountPanel;