import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Folder,
  HelpCircle,
  Settings,
  LogOut,
  Sun,
  Moon,
  Download,
  ChevronDown,
  Calendar,
  BarChart3,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from '@/components/VideoBackground';
import SettingsPage from '@/pages/SettingsPage';
import FilesPage from '@/pages/FilesPage';
import InlineCalendar from '@/components/InlineCalendar';
import InlineAnalytics from '@/components/InlineAnalytics';

interface AppLayoutProps {
  children: React.ReactNode;
}

type PanelType = 'settings' | 'files' | 'analytics' | null;

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkTheme, setIsDarkTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [fontSize, setFontSize] = useState('medium');
  const [portalView, setPortalView] = useState('default');
  const [activeTopTab, setActiveTopTab] = useState<'dashboard' | 'calendar' | 'analytics'>('dashboard');

  const openPanel = (panel: PanelType) => setActivePanel(prev => prev === panel ? null : panel);
  const closePanel = () => setActivePanel(null);

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems: { icon: any; panel?: PanelType; path?: string; label: string; action?: () => void }[] = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { icon: Folder, panel: 'files', label: 'Files' },
    { icon: HelpCircle, path: '/help', label: 'FAQ & Help' },
    { icon: Settings, panel: 'settings', label: 'Settings' },
  ];

  const fontSizeClass = fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className={`flex min-h-screen relative ${fontSizeClass}`}>
      <VideoBackground />

      {/* Side Panel — purple gradient pill */}
      <aside className="fixed left-4 top-4 bottom-4 w-20 rounded-[2.5rem] flex flex-col items-center py-6 z-40 shadow-2xl overflow-hidden group/sidebar glass-sidebar">
        <div className="flex flex-col items-center gap-4 w-full px-2 flex-1 justify-start pt-2">
          {navItems.map((item) => {
            const isActive = item.path
              ? location.pathname === item.path
              : item.panel
              ? activePanel === item.panel
              : false;
            return (
              <div key={item.label} className="relative group">
                <button
                  onClick={() => {
                    if (item.action) item.action();
                    else if (item.path) { closePanel(); navigate(item.path); }
                    else if (item.panel) openPanel(item.panel);
                  }}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-primary shadow-lg shadow-white/20'
                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </button>
                {/* Hover tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Logout at bottom */}
        <div className="px-2 pb-2 relative group">
          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:bg-destructive/20 hover:text-destructive transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
            Log Out
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-28 p-8 min-h-screen relative z-10">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-8">
          {/* Top Navigation Bar */}
          <header className="flex items-center justify-between backdrop-blur-xl rounded-[2.5rem] px-8 py-4 shadow-sm glass-header border border-border/40">
            <div className="flex items-center gap-8">
              <nav className="flex items-center gap-6">
                <button
                  onClick={() => { setActiveTopTab('dashboard'); closePanel(); }}
                  className={`font-semibold pb-1 flex items-center gap-2 transition-all ${
                    activeTopTab === 'dashboard'
                      ? 'border-b-2 border-primary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => { setActiveTopTab('calendar'); closePanel(); }}
                  className={`font-semibold pb-1 flex items-center gap-2 transition-all ${
                    activeTopTab === 'calendar'
                      ? 'border-b-2 border-primary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Calendar
                </button>
                <button
                  onClick={() => { setActiveTopTab('analytics'); closePanel(); }}
                  className={`font-semibold pb-1 flex items-center gap-2 transition-all ${
                    activeTopTab === 'analytics'
                      ? 'border-b-2 border-primary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Analytics
                </button>
              </nav>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search or type command"
                  className="border border-border/50 bg-muted/40 rounded-2xl py-2 pl-12 pr-4 w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-2xl p-1 gap-1 bg-muted/50">
                <button onClick={() => setIsDarkTheme(false)} className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${!isDarkTheme ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button onClick={() => setIsDarkTheme(true)} className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${isDarkTheme ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
              </div>
              <div className="h-8 w-[1px] mx-2 bg-border/50" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-border/50 rounded-2xl text-sm font-medium cursor-pointer bg-muted/30 text-foreground hover:bg-muted/50 transition-all">
                  <Download className="w-4 h-4" /> Export data <ChevronDown className="w-4 h-4" />
                </div>
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 backdrop-blur-xl rounded-[3rem] p-8 border border-border/40 shadow-sm overflow-auto glass-card-glow">
            {activeTopTab === 'dashboard' && children}
            {activeTopTab === 'calendar' && <InlineCalendar />}
            {activeTopTab === 'analytics' && <InlineAnalytics />}
          </div>
        </div>
      </main>

      {/* Overlay Panels */}
      <AnimatePresence>
        {activePanel === 'settings' && (
          <SettingsPage
            onClose={closePanel}
            fontSize={fontSize}
            setFontSize={setFontSize}
            portalView={portalView}
            setPortalView={setPortalView}
          />
        )}
        {activePanel === 'files' && <FilesPage onClose={closePanel} />}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
