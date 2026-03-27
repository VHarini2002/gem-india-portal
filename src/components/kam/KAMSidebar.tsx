import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Folder, HelpCircle, LogOut, Users, Wrench, Package, Bell, Settings as SettingsIcon, Lock, LockOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export type KAMModule = 'dashboard' | 'engine-management' | 'client-management' | 'folder-management' | 'part-management';
export type KAMSidebarAction = 'notifications' | 'settings';

interface KAMSidebarProps {
  activeModule: KAMModule;
  onModuleChange: (module: KAMModule) => void;
  onAction: (action: KAMSidebarAction) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

const moduleItems: { icon: any; module: KAMModule; label: string }[] = [
  { icon: LayoutDashboard, module: 'dashboard', label: 'Dashboard' },
  { icon: Wrench, module: 'engine-management', label: 'Engine Management' },
  { icon: Users, module: 'client-management', label: 'Client Management' },
  { icon: Folder, module: 'folder-management', label: 'Folder Management' },
  { icon: Package, module: 'part-management', label: 'Part Management' },
];

const sessionLockKey = 'kam-sidebar-locked';

const KAMSidebar = ({ activeModule, onModuleChange, onAction, onExpandedChange }: KAMSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(() => sessionStorage.getItem(sessionLockKey) === 'true');
  const isExpanded = isHovered || isLocked;

  const handleLogout = () => { logout(); navigate('/'); };
  const toggleLock = () => {
    setIsLocked(prev => {
      const next = !prev;
      sessionStorage.setItem(sessionLockKey, String(next));
      return next;
    });
  };

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-4 top-4 bottom-4 rounded-[2.5rem] flex flex-col py-6 z-40 shadow-2xl overflow-hidden glass-sidebar transition-all duration-300 ${
        isExpanded ? 'w-72 px-3' : 'w-20 px-2 items-center'
      }`}
    >
      <div className="w-full justify-center mb-2">
        {isExpanded ? (
          <img
            src="https://globalengine-india.com/wp-content/uploads/2023/06/White-GEM-India-Logo.png"
            alt="GEM India Logo"
            className="w-45 h-20  object-contain mx-auto rounded-xl"
          />
        ) : (
          <div>
          <img src="public/logo.png" alt="GEM India Logo" className="w-20 h-20 object-contain mx-auto rounded-xl" />
        </div>
        )}
      </div>

      <div className="w-full flex justify-center">
        <button
          onClick={toggleLock}
          aria-label={isLocked ? 'Unlock Sidebar' : 'Lock Sidebar'}
          className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-sidebar-border"
        >
          {isLocked ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full flex-1 justify-start pt-2">
        {moduleItems.map((item) => {
          const isActive = activeModule === item.module;
          return (
            <div key={item.label} className="relative group w-full">
              <button
                onClick={() => onModuleChange(item.module)}
                className={`relative h-12 rounded-2xl flex items-center transition-all duration-300 w-full ${
                  isExpanded ? 'justify-start px-4 gap-3' : 'justify-center'
                } ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-primary/10'
                    : 'text-sidebar-foreground hover:bg-sidebar-border'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
              </button>
              <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 shadow-lg z-50 ${isExpanded ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
              </div>
            </div>
          );
        })}

        <div className="my-1 h-px bg-sidebar-border" />

        <button
          onClick={() => navigate('/help')}
          className={`relative h-12 rounded-2xl flex items-center text-sidebar-foreground hover:bg-sidebar-border transition-all duration-300 w-full ${
            isExpanded ? 'justify-start px-4 gap-3' : 'justify-center'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Help & Feedback</span>}
        </button>
        <button
          onClick={() => onAction('notifications')}
          className={`relative h-12 rounded-2xl flex items-center text-sidebar-foreground hover:bg-sidebar-border transition-all duration-300 w-full ${
            isExpanded ? 'justify-start px-4 gap-3' : 'justify-center'
          }`}
        >
          <Bell className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Notifications</span>}
        </button>
        <button
          onClick={() => onAction('settings')}
          className={`relative h-12 rounded-2xl flex items-center text-sidebar-foreground hover:bg-sidebar-border transition-all duration-300 w-full ${
            isExpanded ? 'justify-start px-4 gap-3' : 'justify-center'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Settings</span>}
        </button>
      </div>

      <div className="pb-2 relative group w-full">
        <button
          onClick={handleLogout}
          className={`h-12 rounded-2xl flex items-center text-sidebar-foreground hover:bg-destructive transition-all duration-300 w-full ${
            isExpanded ? 'justify-start px-4 gap-3' : 'justify-center'
          }`}
        >
          <LogOut className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Log Out</span>}
        </button>
        <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 shadow-lg z-50 ${isExpanded ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
          Log Out
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
        </div>
      </div>
    </aside>
  );
};

export default KAMSidebar;
