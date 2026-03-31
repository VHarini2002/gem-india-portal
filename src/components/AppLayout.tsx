import { useEffect, useState } from 'react';
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
  Search,
  Lock,
  LockOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from '@/components/VideoBackground';
import SettingsPage from '@/pages/SettingsPage';
import FilesPage from '@/pages/FilesPage';
import InlineCalendar from '@/components/InlineCalendar';
import InlineAnalytics from '@/components/InlineAnalytics';
import { patchUserPreferences, readUserPreferences } from '@/lib/userPreferences';

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
  const [isHovered, setIsHovered] = useState(false);
  const sessionLockKey = 'portal-left-sidebar-locked';
  const [isLocked, setIsLocked] = useState(() => sessionStorage.getItem(sessionLockKey) === 'true');
  const isExpanded = isHovered || isLocked;

  const openPanel = (panel: PanelType) => setActivePanel(prev => prev === panel ? null : panel);
  const closePanel = () => setActivePanel(null);

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems: { icon: any; panel?: PanelType; path?: string; label: string; action?: () => void }[] = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { icon: Folder, panel: 'files', label: 'Files' },
    { icon: HelpCircle, path: '/help', label: 'FAQ & Help' },
    { icon: Settings, panel: 'settings', label: 'Settings' },
  ];

  // Global font sizing for the entire portal, driven by Settings.
  // All sizes are slightly larger than default for better readability.
  const fontSizeClass =
    fontSize === 'small'
      ? 'text-sm'   // previously xs
      : fontSize === 'large'
      ? 'text-lg'   // previously base
      : 'text-base'; // medium (default) is now bigger than before

  const portalViewClass =
    portalView === 'compact'
      ? 'portal-view-compact'
      : portalView === 'expanded'
      ? 'portal-view-expanded'
      : 'portal-view-default';

  const userKey = user?.email ?? null;

  // Load preferences per-user when session changes.
  useEffect(() => {
    if (!userKey) return;
    const prefs = readUserPreferences(userKey);
    setFontSize(prefs.fontSize);
    setPortalView(prefs.portalView);
    setIsDarkTheme(prefs.isDarkTheme);
  }, [userKey]);

  const setFontSizePref = (s: string) => {
    setFontSize(s);
    if (!userKey) return;
    patchUserPreferences(userKey, { fontSize: s as any });
  };

  const setPortalViewPref = (s: string) => {
    setPortalView(s);
    if (!userKey) return;
    patchUserPreferences(userKey, { portalView: s as any });
  };

  const setThemePref = (dark: boolean) => {
    setIsDarkTheme(dark);
    if (!userKey) return;
    patchUserPreferences(userKey, { isDarkTheme: dark });
  };

  const toggleLock = () => {
    setIsLocked(prev => {
      const next = !prev;
      sessionStorage.setItem(sessionLockKey, String(next));
      return next;
    });
  };

  // Avoid `new URL()` because BASE_URL can be '' in some dev setups.
  const base = import.meta.env.BASE_URL ?? "/";
  const logoSrc = `${base.endsWith("/") ? base : `${base}/`}logo.png`;

  return (
    <div className={`flex min-h-screen relative ${fontSizeClass} ${portalViewClass}`}>
      <VideoBackground />

      {/* Side Panel — purple gradient pill */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-4 top-4 bottom-4 rounded-2xl flex flex-col py-6 z-40 shadow-2xl overflow-hidden group/sidebar glass-sidebar transition-[width,padding] duration-300 ${
          isExpanded ? 'w-72 px-3 items-start' : 'w-20 px-2 items-center'
        }`}
      >
        <div className={`flex flex-col gap-4 w-full flex-1 justify-start pt-2 ${isExpanded ? 'items-start' : 'items-center'}`}>
          <div className={`w-full flex ${isExpanded ? 'justify-start' : 'justify-center'}`}>
            {isExpanded ? (
              <img
                src="https://globalengine-india.com/wp-content/uploads/2023/06/White-GEM-India-Logo.png"
                alt="GEM India Logo"
                className="w-45 h-20 object-contain mx-auto rounded-xl"
              />
            ) : (
              <div>
                <img src={logoSrc} alt="GEM India Logo" className="w-20 h-20 object-contain mx-auto rounded-xl" />
              </div>
            )}
          </div>

          <div className={`w-full flex ${isExpanded ? 'justify-start' : 'justify-center'}`}>
            <button
              onClick={toggleLock}
              aria-label={isLocked ? 'Unlock Sidebar' : 'Lock Sidebar'}
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-sidebar-border mx-auto"
            >
              {isLocked ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          </div>

          {navItems.map((item) => {
            const isActive = item.path
              ? location.pathname === item.path
              : item.panel
              ? activePanel === item.panel
              : false;
            return (
              <div key={item.label} className="relative group w-full">
                <button
                  onClick={() => {
                    if (item.action) item.action();
                    else if (item.path) { closePanel(); navigate(item.path); }
                    else if (item.panel) openPanel(item.panel);
                  }}
                  className={`relative flex items-center transition-all duration-300 ${
                    isExpanded ? 'w-full h-12 rounded-2xl justify-start px-4 gap-3' : 'w-12 h-12 rounded-full justify-center'
                  } ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-primary/10'
                      : 'text-sidebar-foreground hover:bg-sidebar-border'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
                </button>
                {!isExpanded && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout at bottom */}
        <div className={`pb-2 relative group w-full ${isExpanded ? 'px-1' : 'px-2'}`}>
          <button
            onClick={handleLogout}
            className={`transition-all duration-300 flex items-center ${
              isExpanded ? 'w-full h-12 rounded-2xl justify-start px-4 gap-3' : 'w-12 h-12 rounded-full justify-center'
            } text-sidebar-foreground hover:bg-destructive hover:text-destructive`}
          >
            <LogOut className="w-5 h-5" />
            {isExpanded && <span className="text-sm font-medium">Log Out</span>}
          </button>
          {!isExpanded && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
              Log Out
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 min-h-screen relative z-10 transition-[margin-left] duration-300 ${
          isExpanded ? 'ml-80' : 'ml-28'
        }`}
      >
        <div
          className={`max-w-[1800px] mx-auto h-full flex flex-col ${
            portalView === 'compact' ? 'gap-6' : portalView === 'expanded' ? 'gap-10' : 'gap-8'
          } ${portalView === 'compact' ? 'px-4 py-6' : portalView === 'expanded' ? 'px-10 py-10' : 'px-8 py-8'}`}
        >
          {/* Top Navigation Bar */}
            <header className="flex items-center justify-between backdrop-blur-xl rounded-2xl px-8 py-4 shadow-sm glass-header border border-border/40">
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
          <div
            className={`flex-1 backdrop-blur-xl rounded-2xl border border-border/40 shadow-sm overflow-auto glass-card-glow ${
              portalView === 'compact' ? 'p-6' : portalView === 'expanded' ? 'p-10' : 'p-8'
            }`}
          >
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
            setFontSize={setFontSizePref}
            portalView={portalView}
            setPortalView={setPortalViewPref}
            setTheme={setThemePref}
          />
        )}
        {activePanel === 'files' && <FilesPage onClose={closePanel} />}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
