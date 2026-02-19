import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, LayoutDashboard, Package, HelpCircle, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { icon: Package, path: '/catalog', label: 'Parts Catalog' },
    { icon: HelpCircle, path: '/help', label: 'Help' },
    { icon: Settings, path: '/settings', label: 'Settings' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen">
      {/* Fixed Icon Sidebar */}
      <nav className="icon-sidebar">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
          <Plane className="w-5 h-5 text-primary" />
        </div>

        <div className="w-8 h-px bg-border mb-2" />

        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={item.label}
              className={`icon-sidebar-btn ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          );
        })}

        <div className="flex-1" />

        {/* User avatar */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <div
            className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer"
            title={user?.name}
          >
            <span className="text-primary font-heading font-bold text-sm">{user?.name?.[0]}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="icon-sidebar-btn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main content with left offset */}
      <div className="flex-1 pl-16">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
