import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Bell,
  Settings,
  Calendar,
  Folder,
  Mail,
  BarChart3,
  RotateCcw,
  Plane,
  Triangle,
  Search,
  Sun,
  Moon,
  Download,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkTheme, setIsDarkTheme } = useTheme();

  // Navigation items matching the image exactly
  const navItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { icon: User, path: '/profile', label: 'Profile' },
    { icon: Bell, path: '/notifications', label: 'Notifications' },
    { icon: Settings, path: '/settings', label: 'Settings' },
    { icon: Calendar, path: '/calendar', label: 'Calendar' },
    { icon: Folder, path: '/files', label: 'Files' },
    { icon: Mail, path: '/messages', label: 'Messages' },
    { icon: BarChart3, path: '/analytics', label: 'Analytics' },
    { icon: RotateCcw, path: '/refresh', label: 'Refresh' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`flex min-h-screen ${isDarkTheme ? 'bg-[#0F0F1E]' : 'bg-[#F5F7FB]'}`}>
      {/* Premium Side Panel - Matching Image Design */}
      <aside className="fixed left-4 top-4 bottom-4 w-20 rounded-[2.5rem] flex flex-col items-center py-6 z-50 shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg,rgb(34, 18, 73) 0%,rgb(22, 23, 105) 50%,rgb(15, 49, 104) 100%)'
        }}
      >
        {/* Navigation Items - Circular Icons */}
        <div className="flex flex-col items-center gap-5 w-full px-2 flex-1 justify-start pt-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || (index === 0 && location.pathname === '/');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`relative group w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-[#6366F1] shadow-lg shadow-white/20'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main content with left offset */}
      <main className="flex-1 ml-28 p-8 min-h-screen">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-8">
          {/* Top Navigation Bar - Dark Theme */}
          <header className={`flex items-center justify-between backdrop-blur-xl rounded-[2.5rem] px-8 py-4 shadow-sm ${
            isDarkTheme 
              ? 'bg-[#1A1A2E]/80 border border-white/10' 
              : 'bg-white/50 border border-white/20'
          }`}>
            <div className="flex items-center gap-8">
              <nav className="flex items-center gap-6">
                <a href="#" className={`font-semibold border-b-2 border-indigo-500 pb-1 flex items-center gap-2 ${
                  isDarkTheme ? 'text-white' : 'text-gray-900'
                }`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </a>
                <a href="#" className={`font-medium transition-colors flex items-center gap-2 ${
                  isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}>
                  <Plane className="w-4 h-4" /> Workflows
                </a>
                <a href="#" className={`font-medium transition-colors flex items-center gap-2 ${
                  isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}>
                  <Triangle className="w-4 h-4" /> Integrations
                </a>
              </nav>

              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDarkTheme ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search or type command"
                  className={`border-none rounded-2xl py-2 pl-12 pr-4 w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm ${
                    isDarkTheme 
                      ? 'bg-[#0F0F1E]/50 text-white placeholder-gray-500' 
                      : 'bg-gray-100/50 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center rounded-2xl p-1 gap-1 ${
                isDarkTheme ? 'bg-[#0F0F1E]/50' : 'bg-gray-100/50'
              }`}>
                <button 
                  onClick={() => setIsDarkTheme(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    !isDarkTheme 
                      ? 'bg-white shadow-sm text-indigo-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button 
                  onClick={() => setIsDarkTheme(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    isDarkTheme 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'text-gray-500 hover:bg-white/50'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
              </div>

              <div className="flex items-center gap-2 px-2">
                <button className={`p-2 transition-colors relative ${
                  isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                }`}>
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
                </button>
                <button className={`p-2 transition-colors ${
                  isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                }`}>
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className={`h-8 w-[1px] mx-2 ${
                isDarkTheme ? 'bg-white/10' : 'bg-gray-200'
              }`} />

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-2xl text-sm font-medium ${
                  isDarkTheme 
                    ? 'border-white/10 text-gray-300 bg-[#0F0F1E]/50' 
                    : 'border-gray-200 text-gray-700 bg-white/50'
                }`}>
                  <Download className="w-4 h-4" />
                  Export data
                  <ChevronDown className="w-4 h-4" />
                </div>
                <button className="bg-[#6366F1] text-white px-6 py-2.5 rounded-2xl text-sm font-medium hover:bg-[#7C3AED] transition-all shadow-lg shadow-indigo-500/20">
                  Add new board
                </button>
              </div>
            </div>
          </header>

          {/* Page Content Container - Dark Theme */}
          <div className={`flex-1 backdrop-blur-xl rounded-[3rem] p-8 border shadow-sm overflow-auto ${
            isDarkTheme 
              ? 'bg-[#1A1A2E]/60 border-white/10' 
              : 'bg-white/50 border-white/20'
          }`}>
            {children}
          </div>
        </div>
      </main>

    </div>
  );
};

export default AppLayout;

