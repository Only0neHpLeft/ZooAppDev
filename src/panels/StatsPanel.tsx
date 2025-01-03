import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Clock, Trophy, Zap, Brain, Target, Flame,
  Award, Check
} from 'lucide-react';


interface SessionData {
  day: string;
  queries: number;
  correctQueries: number;
  avgTime: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  earned: boolean;
}

interface CategoryPerformance {
  name: string;
  value: number;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  suffix?: string;
  color: string;
}

interface TimeRangeButtonProps {
  range: TimeRange;
  label: string;
  activeRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

interface TabButtonProps {
  tab: TabType;
  label: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface Stats {
  totalQueries: number;
  accuracy: number;
  avgTimePerQuery: number;
  completedCategories: number;
  rank: string;
  level: number;
  xp: number;
  nextLevelXp: number;
}

type TimeRange = 'day' | 'week' | 'month';
type TabType = 'overview' | 'achievements' | 'performance';

const COLORS = ['#818cf8', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'];

const TOOLTIP_STYLES = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '0.5rem'
};

const MOCK_DATA = {
  monthlyData: Array(30).fill(0).map((_, i) => ({
    day: `${i + 1}`,
    queries: Math.floor(Math.random() * 25 + 10),
    correctQueries: Math.floor(Math.random() * 20 + 8),
    avgTime: Math.floor(Math.random() * 20 + 30),
  })),
  dailyData: Array(24).fill(0).map((_, i) => ({
    day: `${i}:00`,
    queries: Math.floor(Math.random() * 8 + 2),
    correctQueries: Math.floor(Math.random() * 6 + 2),
    avgTime: Math.floor(Math.random() * 15 + 30),
  })),
  weeklyData: [
    { day: 'Po', queries: 15, correctQueries: 12, avgTime: 45 },
    { day: 'Út', queries: 20, correctQueries: 18, avgTime: 40 },
    { day: 'St', queries: 25, correctQueries: 22, avgTime: 35 },
    { day: 'Čt', queries: 18, correctQueries: 15, avgTime: 42 },
    { day: 'Pá', queries: 22, correctQueries: 20, avgTime: 38 },
    { day: 'So', queries: 30, correctQueries: 28, avgTime: 30 },
    { day: 'Ne', queries: 28, correctQueries: 25, avgTime: 33 },
  ]
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: 'První SELECT', description: 'Napsal jste první SQL dotaz', earned: true },
  { id: 2, name: 'JOIN Master', description: '100 úspěšných JOIN dotazů', earned: true },
  { id: 3, name: 'Rychlé Prsty', description: 'Dokončete dotaz pod 30 sekund', earned: true },
  { id: 4, name: 'SQL Guru', description: 'Dokončete všechny kategorie', earned: false },
  { id: 5, name: 'Perfekcionista', description: '100% přesnost v celé kategorii', earned: true },
  { id: 6, name: 'Vytrvalec', description: '30 denní streak', earned: false }
];

const CATEGORY_PERFORMANCE: CategoryPerformance[] = [
  { name: 'SELECT', value: 95 },
  { name: 'JOIN', value: 85 },
  { name: 'WHERE', value: 90 },
  { name: 'GROUP BY', value: 75 },
  { name: 'ORDER BY', value: 88 }
];

const INITIAL_STATS: Stats = {
  totalQueries: 158,
  accuracy: 89,
  avgTimePerQuery: 37.5,
  completedCategories: 8,
  rank: 'SQL Master',
  level: 15,
  xp: 7850,
  nextLevelXp: 8000
};

const STYLES = {
  container: 'space-y-6',
  tabContainer: 'flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg w-fit',
  statCard: {
    wrapper: 'bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors duration-300',
    header: 'flex items-center gap-3 mb-2',
    icon: 'p-2 rounded-lg',
    title: 'text-sm text-slate-400',
    value: 'text-2xl font-bold text-white'
  },
  button: {
    base: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
    active: 'bg-slate-800 text-white',
    inactive: 'text-slate-400 hover:text-slate-300'
  },
  charts: {
    wrapper: 'bg-slate-800/50 rounded-xl p-4 border border-slate-700',
    title: 'text-sm font-medium text-slate-400 mb-4',
    container: 'h-64'
  }
} as const;

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, suffix = '', color }) => (
  <div className={STYLES.statCard.wrapper}>
    <div className={STYLES.statCard.header}>
      <div className={`${STYLES.statCard.icon} ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className={STYLES.statCard.title}>{title}</span>
    </div>
    <div className={STYLES.statCard.value}>
      {value}{suffix}
    </div>
  </div>
);

const TimeRangeButton: React.FC<TimeRangeButtonProps> = ({ 
  range, 
  label, 
  activeRange,
  onRangeChange 
}) => (
  <button
    onClick={() => onRangeChange(range)}
    className={`
      px-3 py-1 rounded-lg text-sm font-medium transition-colors border
      ${activeRange === range ? 
        'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 
        'text-slate-400 hover:text-slate-300 border-transparent'
      }
    `}
  >
    {label}
  </button>
);

const TabButton: React.FC<TabButtonProps> = ({ tab, label, activeTab, onTabChange }) => (
  <button
    onClick={() => onTabChange(tab)}
    className={`
      ${STYLES.button.base}
      ${activeTab === tab ? STYLES.button.active : STYLES.button.inactive}
    `}
  >
    {label}
  </button>
);

const ActivityCharts: React.FC<{ data: SessionData[] }> = ({ data }) => (
  <div className="grid grid-cols-2 gap-6">
    <div className={STYLES.charts.wrapper}>
      <h4 className={STYLES.charts.title}>Počet dotazů</h4>
      <div className={STYLES.charts.container}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={TOOLTIP_STYLES} />
            <Bar dataKey="queries" name="Celkem dotazů" fill="#818cf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="correctQueries" name="Správné dotazy" fill="#34d399" radius={[4, 4, 0, 0]} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className={STYLES.charts.wrapper}>
      <h4 className={STYLES.charts.title}>Průměrný čas řešení</h4>
      <div className={STYLES.charts.container}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={TOOLTIP_STYLES} />
            <Line 
              type="monotone" 
              dataKey="avgTime" 
              stroke="#60a5fa" 
              strokeWidth={2}
              name="Průměrný čas (s)"
              dot={{ fill: '#60a5fa', strokeWidth: 2 }}
            />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const LevelProgress: React.FC<{ stats: Stats; streak: number }> = ({ stats, streak }) => (
  <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 
    rounded-xl p-6 border border-indigo-500/20 mb-6">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
        flex items-center justify-center">
        <Brain className="w-8 h-8 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-indigo-400 mb-1">Level {stats.level}</div>
        <div className="text-2xl font-bold text-white mb-2">{stats.rank}</div>
        <div className="w-full bg-slate-800/50 rounded-full h-2 mb-1">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
            style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{stats.xp} XP</span>
          <span>{stats.nextLevelXp} XP</span>
        </div>
      </div>
      <div className="pl-4 border-l border-slate-800">
        <div className="text-sm text-slate-400 mb-1">Streak</div>
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-lg font-bold text-white">{streak} dní</span>
        </div>
      </div>
    </div>
  </div>
);

const StatsOverview: React.FC<{ stats: Stats }> = ({ stats }) => (
  <div className="grid grid-cols-4 gap-4 mb-6">
    <StatCard 
      icon={Zap} 
      title="Celkem dotazů" 
      value={stats.totalQueries}
      color="bg-amber-500/10 text-amber-400"
    />
    <StatCard 
      icon={Target} 
      title="Přesnost" 
      value={stats.accuracy} 
      suffix="%" 
      color="bg-emerald-500/10 text-emerald-400"
    />
    <StatCard 
      icon={Clock} 
      title="Průměrný čas" 
      value={stats.avgTimePerQuery} 
      suffix="s"
      color="bg-blue-500/10 text-blue-400" 
    />
    <StatCard 
      icon={Trophy} 
      title="Kategorie" 
      value={stats.completedCategories} 
      color="bg-purple-500/10 text-purple-400"
    />
  </div>
);

const AchievementsTab: React.FC = () => (
  <div className="grid grid-cols-2 gap-4">
    {ACHIEVEMENTS.map(achievement => (
      <div 
        key={achievement.id}
        className={`
          p-4 rounded-xl border transition-all duration-300
          ${achievement.earned ? 
            'bg-indigo-500/10 border-indigo-500/20' : 
            'bg-slate-800/50 border-slate-700 opacity-50'
          }
        `}
      >
        <div className="flex items-start gap-3">
          <div className={`
            p-2 rounded-lg shrink-0
            ${achievement.earned ? 'bg-indigo-500/20' : 'bg-slate-700'}
          `}>
            <Award className={`w-5 h-5 ${achievement.earned ? 'text-indigo-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{achievement.name}</h3>
              {achievement.earned && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-sm text-slate-400 mt-1">{achievement.description}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PerformanceTab: React.FC = () => (
  <div className="grid grid-cols-2 gap-6">
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-200">SQL Znalosti</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={CATEGORY_PERFORMANCE}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({name, value}) => `${name}: ${value}%`}
            >
              {CATEGORY_PERFORMANCE.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLES} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-200">Detailní Statistiky</h3>
      {CATEGORY_PERFORMANCE.map((category, index) => (
        <div key={category.name} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300">{category.name}</span>
            <span className="text-sm font-medium text-indigo-400">{category.value}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full"
              style={{ 
                width: `${category.value}%`,
                backgroundColor: COLORS[index % COLORS.length]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const getActivityData = (timeRange: TimeRange): SessionData[] => {
  switch (timeRange) {
    case 'day':
      return MOCK_DATA.dailyData;
    case 'month':
      return MOCK_DATA.monthlyData;
    default:
      return MOCK_DATA.weeklyData;
  }
};

const StatsPanel: React.FC = () => {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('week');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [streak] = useState(5);
  
  const renderOverviewTab = () => {
    const chartData = getActivityData(activeTimeRange);
    
    return (
      <>
        <StatsOverview stats={INITIAL_STATS} />
        <LevelProgress stats={INITIAL_STATS} streak={streak} />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-200">Statistiky aktivity</h3>
            <div className="flex gap-2">
              {[
                { range: 'day', label: 'Den' },
                { range: 'week', label: 'Týden' },
                { range: 'month', label: 'Měsíc' }
              ].map(({ range, label }) => (
                <TimeRangeButton
                  key={range}
                  range={range as TimeRange}
                  label={label}
                  activeRange={activeTimeRange}
                  onRangeChange={setActiveTimeRange}
                />
              ))}
            </div>
          </div>
          <ActivityCharts data={chartData} />
        </div>
      </>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'achievements':
        return <AchievementsTab />;
      case 'performance':
        return <PerformanceTab />;
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className={STYLES.container}>
      <div className={STYLES.tabContainer}>
        {[
          { tab: 'overview', label: 'Přehled' },
          { tab: 'achievements', label: 'Úspěchy' },
          { tab: 'performance', label: 'Výkon' }
        ].map(({ tab, label }) => (
          <TabButton
            key={tab}
            tab={tab as TabType}
            label={label}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};

export type { 
  SessionData,
  Achievement,
  CategoryPerformance,
  StatCardProps,
  TimeRangeButtonProps,
  TabButtonProps,
  Stats,
  TimeRange,
  TabType
};

export default StatsPanel;