import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  Bell,
  Settings,
  Calendar,
  Folder,
  Mail,
  BarChart3,
  RotateCcw,
  Search,
  Sun,
  Moon,
  Download,
  ChevronDown,
  Plane,
  Triangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from '@/components/VideoBackground';
import ProfilePage from '@/pages/ProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import CalendarPage from '@/pages/CalendarPage';
import FilesPage from '@/pages/FilesPage';
import MessagesPage from '@/pages/MessagesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';

interface AppLayoutProps {
  children: React.ReactNode;
}

type PanelType = 'profile' | 'notifications' | 'settings' | 'calendar' | 'files' | 'messages' | 'analytics' | null;

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkTheme, setIsDarkTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [fontSize, setFontSize] = useState('medium');
  const [portalView, setPortalView] = useState('default');

  const openPanel = (panel: PanelType) => setActivePanel(prev => prev === panel ? null : panel);
  const closePanel = () => setActivePanel(null);

  const handleRefresh = () => window.location.reload();
  const handleLogout = () => { logout(); navigate('/'); };

  const navItems: { icon: any; panel?: PanelType; path?: string; label: string; action?: () => void }[] = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    ...(user?.role === 'kam'
      ? [{ icon: Users, path: '/manageClient', label: 'Manage Client' }]
      : []),
    { icon: User, panel: 'profile', label: 'Profile' },
    { icon: Bell, panel: 'notifications', label: 'Notifications' },
    { icon: Settings, panel: 'settings', label: 'Settings' },
    { icon: Calendar, panel: 'calendar', label: 'Calendar' },
    { icon: Folder, panel: 'files', label: 'Files' },
    { icon: Mail, panel: 'messages', label: 'Messages' },
    { icon: BarChart3, panel: 'analytics', label: 'Analytics' },
    { icon: RotateCcw, label: 'Refresh', action: handleRefresh },
  ];

  const fontSizeClass = fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className={`flex min-h-screen relative ${fontSizeClass}`}>
      <VideoBackground />

      {/* Premium Side Panel */}
      <aside
        className="fixed left-4 top-4 bottom-4 w-20 rounded-[2.5rem] flex flex-col items-center py-6 z-40 shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg,rgb(34,18,73) 0%,rgb(22,23,105) 50%,rgb(15,49,104) 100%)' }}
      >
        <div className="flex flex-col items-center gap-4 w-full px-2 flex-1 justify-start pt-2">
          {navItems.map((item) => {
            const isActive = item.path
              ? location.pathname === item.path
              : item.panel
              ? activePanel === item.panel
              : false;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.path) { closePanel(); navigate(item.path); }
                  else if (item.panel) openPanel(item.panel);
                }}
                title={item.label}
                className={`relative group w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-[#6366F1] shadow-lg shadow-white/20'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label === 'Notifications' && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-[#6366F1]" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-28 p-8 min-h-screen relative z-10">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-8">
          {/* Top Navigation Bar */}
          <header className="flex items-center justify-between backdrop-blur-xl rounded-[2.5rem] px-8 py-4 shadow-sm glass-header border border-border/40 opacity-90">
            <div className="flex items-center gap-8">
              <nav className="flex items-center gap-6">
                <a href="#" className={`font-semibold border-b-2 border-indigo-500 pb-1 flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </a>
                <a href="#" className={`font-medium transition-colors flex items-center gap-2 ${isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-900'}`}>
                  <Plane className="w-4 h-4" /> Workflows
                </a>
                <a href="#" className={`font-medium transition-colors flex items-center gap-2 ${isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-900'}`}>
                  <Triangle className="w-4 h-4" /> Integrations
                </a>
              </nav>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search or type command"
                  className={`border-none rounded-2xl py-2 pl-12 pr-4 w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm ${
                    isDarkTheme ? 'bg-[#0F0F1E]/50 text-white placeholder-gray-500' : 'bg-gray-100/50 text-gray-900'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center rounded-2xl p-1 gap-1 ${isDarkTheme ? 'bg-[#0F0F1E]/50' : 'bg-gray-100/50'}`}>
                <button onClick={() => setIsDarkTheme(false)} className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${!isDarkTheme ? 'bg-white shadow-sm text-indigo-500' : 'text-gray-400 hover:text-white'}`}>
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button onClick={() => setIsDarkTheme(true)} className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${isDarkTheme ? 'bg-white/20 text-white shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
              </div>
              <div className={`h-8 w-[1px] mx-2 ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-2xl text-sm font-medium ${isDarkTheme ? 'border-white/10 text-gray-300 bg-[#0F0F1E]/50' : 'border-gray-200 text-gray-700 bg-white/50'}`}>
                  <Download className="w-4 h-4" /> Export data <ChevronDown className="w-4 h-4" />
                </div>
                <button className="bg-[#6366F1] text-white px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-[#7C3AED] transition-all shadow-lg shadow-indigo-500/20" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 backdrop-blur-xl rounded-[3rem] p-8 border border-border/40 shadow-sm overflow-auto glass-card-glow opacity-90">
            {children}
          </div>
        </div>
      </main>

      {/* Overlay Panels */}
      <AnimatePresence>
        {activePanel === 'profile' && <ProfilePage onClose={closePanel} />}
        {activePanel === 'notifications' && <NotificationsPage onClose={closePanel} />}
        {activePanel === 'settings' && (
          <SettingsPage
            onClose={closePanel}
            fontSize={fontSize}
            setFontSize={setFontSize}
            portalView={portalView}
            setPortalView={setPortalView}
          />
        )}
        {activePanel === 'calendar' && <CalendarPage onClose={closePanel} />}
        {activePanel === 'files' && <FilesPage onClose={closePanel} />}
        {activePanel === 'messages' && <MessagesPage onClose={closePanel} />}
        {activePanel === 'analytics' && <AnalyticsPage onClose={closePanel} />}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
