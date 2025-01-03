import { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Database,
  UserCircle,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { ROUTES } from '../navigation';

interface Panel {
  id: string;
  title: string;
  icon: JSX.Element;
  component: React.LazyExoticComponent<React.FC>;
}

interface SettingsSection {
  title: string;
  panels: Panel[];
}

interface SidebarButtonProps {
  icon: JSX.Element;
  title: string;
  isSelected: boolean;
  onClick: () => void;
}

interface PanelHeaderProps {
  icon: JSX.Element;
  title: string;
}

const LOADING_SPINNER_SIZE = 8;

const AccountPanel = lazy(() => import('../panels/AccountPanel'));
const DatabasePanel = lazy(() => import('../panels/DatabasePanel'));
const ResetPanel = lazy(() => import('../panels/ProgressPanel'));
const StatsPanel = lazy(() => import('../panels/StatsPanel'));

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: 'Profil',
    panels: [
      {
        id: 'account',
        title: 'Účet',
        icon: <UserCircle className="w-5 h-5" />,
        component: AccountPanel
      },
      {
        id: 'stats',
        title: 'Statistiky',
        icon: <BarChart3 className="w-5 h-5" />,
        component: StatsPanel
      },
    ]
  },
  {
    title: 'Aplikace',
    panels: [
      {
        id: 'database',
        title: 'Databáze',
        icon: <Database className="w-5 h-5" />,
        component: DatabasePanel
      },
      {
        id: 'reset',
        title: 'Tvůj Pokrok',
        icon: <RotateCcw className="w-5 h-5" />,
        component: ResetPanel
      },
    ]
  }
];

const BUTTON_STYLES = {
  base: 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
  selected: 'bg-slate-800 text-white',
  default: 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
};

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className={`animate-spin rounded-full h-${LOADING_SPINNER_SIZE} w-${LOADING_SPINNER_SIZE} border-b-2 border-indigo-500`} />
  </div>
);

const BackButton = () => (
  <Link
    to={ROUTES.CATEGORIES}
    className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-300 mb-6"
  >
    ← Zpět na přehled
  </Link>
);

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  title,
  isSelected,
  onClick
}) => (
  <button
    onClick={onClick}
    className={`${BUTTON_STYLES.base} ${isSelected ? BUTTON_STYLES.selected : BUTTON_STYLES.default}`}
  >
    {icon}
    <span className="font-medium">{title}</span>
  </button>
);

const PanelHeader: React.FC<PanelHeaderProps> = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    {icon}
    <h2 className="text-xl font-bold text-white">{title}</h2>
  </div>
);

const SettingsSidebar: React.FC<{
  sections: SettingsSection[];
  selectedPanel: string;
  onPanelSelect: (id: string) => void;
}> = ({ sections, selectedPanel, onPanelSelect }) => (
  <div className="w-64 shrink-0">
    <nav className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="text-sm font-medium text-slate-500 px-4 mb-2">
            {section.title}
          </div>
          <div className="space-y-1">
            {section.panels.map((panel) => (
              <SidebarButton
                key={panel.id}
                icon={panel.icon}
                title={panel.title}
                isSelected={selectedPanel === panel.id}
                onClick={() => onPanelSelect(panel.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  </div>
);

const PanelContent: React.FC<{ panel: Panel }> = ({ panel }) => (
  <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
    <PanelHeader icon={panel.icon} title={panel.title} />
    <Suspense fallback={<LoadingSpinner />}>
      <panel.component />
    </Suspense>
  </div>
);

const Settings: React.FC = () => {
  const [selectedPanel, setSelectedPanel] = useState('account');
  
  const allPanels = SETTINGS_SECTIONS.flatMap(section => section.panels);
  const currentPanel = allPanels.find(p => p.id === selectedPanel);

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="mb-8">
        <BackButton />
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-slate-400" />
          <h1 className="text-2xl font-bold text-white">Nastavení</h1>
        </div>
      </div>

      <div className="flex gap-8">
        <SettingsSidebar
          sections={SETTINGS_SECTIONS}
          selectedPanel={selectedPanel}
          onPanelSelect={setSelectedPanel}
        />

        <div className="flex-1 min-h-[400px]">
          {currentPanel && <PanelContent panel={currentPanel} />}
        </div>
      </div>
    </div>
  );
};

export default Settings;