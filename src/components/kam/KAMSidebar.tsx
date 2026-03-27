import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings as SettingsIcon, Folder, HelpCircle, LogOut, Users, Wrench, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export type KAMModule = 'dashboard' | 'engine-management' | 'client-management' | 'folder-management' | 'part-management';

interface KAMSidebarProps {
  activeModule: KAMModule;
  onModuleChange: (module: KAMModule) => void;
}

const navItems: { icon: any; module: KAMModule; label: string }[] = [
  { icon: LayoutDashboard, module: 'dashboard', label: 'Dashboard' },
  { icon: Wrench, module: 'engine-management', label: 'Engine Management' },
  { icon: Users, module: 'client-management', label: 'Client Management' },
  { icon: Folder, module: 'folder-management', label: 'Folder Management' },
  { icon: Package, module: 'part-management', label: 'Part Management' },
];

const KAMSidebar = ({ activeModule, onModuleChange }: KAMSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-20 rounded-[2.5rem] flex flex-col items-center py-6 z-40 shadow-2xl overflow-hidden glass-sidebar">
      <div className="flex flex-col items-center gap-3 w-full px-2 flex-1 justify-start pt-2">
        {navItems.map((item) => {
          const isActive = activeModule === item.module;
          return (
            <div key={item.label} className="relative group">
              <button
                onClick={() => onModuleChange(item.module)}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-primary shadow-lg shadow-white/20'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-2 pb-2 relative group">
        <button onClick={handleLogout} className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:bg-destructive/20 hover:text-destructive transition-all duration-300">
          <LogOut className="w-5 h-5" />
        </button>
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
          Log Out
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
        </div>
      </div>
    </aside>
  );
};

export default KAMSidebar;
