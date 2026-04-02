import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder, HelpCircle, LayoutDashboard, Settings, BarChart3, CalendarDays } from 'lucide-react';

type DockKey = 'dashboard' | 'calendar' | 'analytics' | 'files' | 'help' | 'settings';

export type BottomDockAction = {
  key: DockKey;
  label: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  isActive: boolean;
};

const BottomDock = ({
  activePanel,
  onOpenPanel,
}: {
  activePanel: 'settings' | 'files' | null;
  onOpenPanel: (panel: 'settings' | 'files') => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;

  const actions = useMemo<BottomDockAction[]>(() => {
    const isRouteActive = (p: string) => pathname === p || pathname.startsWith(`${p}/`);

    return [
      {
        key: 'dashboard',
        label: 'Dashboard',
        tooltip: 'Dashboard',
        icon: LayoutDashboard,
        onClick: () => navigate('/dashboard?tab=dashboard'),
        isActive: isRouteActive('/dashboard') && !location.search.includes('tab=calendar') && !location.search.includes('tab=analytics'),
      },
      {
        key: 'calendar',
        label: 'Calendar',
        tooltip: 'Calendar',
        icon: CalendarDays,
        onClick: () => navigate('/dashboard?tab=calendar'),
        isActive: location.search.includes('tab=calendar'),
      },
      {
        key: 'analytics',
        label: 'Analytics',
        tooltip: 'Analytics',
        icon: BarChart3,
        onClick: () => navigate('/dashboard?tab=analytics'),
        isActive: location.search.includes('tab=analytics'),
      },
      {
        key: 'files',
        label: 'Files',
        tooltip: 'Files',
        icon: Folder,
        onClick: () => onOpenPanel('files'),
        isActive: activePanel === 'files',
      },
      {
        key: 'help',
        label: 'Help',
        tooltip: 'Help',
        icon: HelpCircle,
        onClick: () => navigate('/help'),
        isActive: isRouteActive('/help'),
      },
      {
        key: 'settings',
        label: 'Settings',
        tooltip: 'Settings',
        icon: Settings,
        onClick: () => onOpenPanel('settings'),
        isActive: activePanel === 'settings',
      },
    ];
  }, [activePanel, navigate, onOpenPanel, pathname, location.search]);

  return (
    <div className="dock pointer-events-auto">
      {actions.map((a) => (
        <button
          key={a.key}
          type="button"
          className={`dock-item ${a.isActive ? 'active' : ''}`}
          data-tooltip={a.tooltip}
          aria-label={a.label}
          onClick={a.onClick}
        >
          <a.icon className="dock-icon" />
        </button>
      ))}
    </div>
  );
};

export default BottomDock;

