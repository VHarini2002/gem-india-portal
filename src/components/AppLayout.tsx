import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import BeamBackground from '@/components/BeamBackground';
import SettingsPage from '@/pages/SettingsPage';
import FilesPage from '@/pages/FilesPage';
import { patchUserPreferences, readUserPreferences } from '@/lib/userPreferences';
import { readProfilePreferences, type ProfilePreferences } from '@/lib/profilePreferences';
import PortalFooter from '@/components/PortalFooter';
import PortalHeader from '@/components/PortalHeader';
import { PORTAL_GENERAL_NOTIFICATION_COUNT } from '@/data/portalNotifications';
import ProfilePopover from '@/components/ProfilePopover';

interface AppLayoutProps {
  children: React.ReactNode;
}

type PanelType = 'settings' | 'files' | null;

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkTheme, setIsDarkTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [fontSize, setFontSize] = useState('medium');
  const [portalView, setPortalView] = useState('default');
  const [profile, setProfile] = useState<ProfilePreferences | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const isNotificationsTab =
    location.pathname === '/dashboard' &&
    new URLSearchParams(location.search).get('tab') === 'notifications';

  const openPanel = (panel: PanelType) => {
    setProfileOpen(false);
    setActivePanel((prev) => (prev === panel ? null : panel));
  };
  const closePanel = () => setActivePanel(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBellClick = () => {
    setProfileOpen(false);
    if (location.pathname === '/dashboard') {
      if (isNotificationsTab) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/dashboard?tab=notifications', { replace: true });
      }
    } else {
      navigate('/dashboard?tab=notifications');
    }
  };

  const fontSizeClass =
    fontSize === 'small'
      ? 'text-sm'
      : fontSize === 'large'
      ? 'text-lg'
      : 'text-base';

  const portalViewClass =
    portalView === 'compact'
      ? 'portal-view-compact'
      : portalView === 'expanded'
      ? 'portal-view-expanded'
      : 'portal-view-default';

  const userKey = user?.email ?? null;

  useEffect(() => {
    if (!userKey) return;
    const prefs = readUserPreferences(userKey);
    setFontSize(prefs.fontSize);
    setPortalView(prefs.portalView);
    setIsDarkTheme(prefs.isDarkTheme);
    setProfile(readProfilePreferences(userKey, { name: user?.name ?? '' }));
  }, [userKey, user?.name]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    // Close profile card when navigating.
    setProfileOpen(false);
  }, [location.pathname, location.search]);

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

  const logoSrc =
    'https://globalengine-india.com/wp-content/uploads/2023/06/White-GEM-India-Logo.png';

  return (
    <div className={`min-h-screen relative ${fontSizeClass} ${portalViewClass}`}>
      <BeamBackground />

      <PortalHeader
        logoSrc={logoSrc}
        userName={profile?.name || user?.name}
        isDarkTheme={isDarkTheme}
        onThemeLight={() => setThemePref(false)}
        onThemeDark={() => setThemePref(true)}
        onProfileClick={() => setProfileOpen((v) => !v)}
        onBellClick={handleBellClick}
        notificationsOpen={isNotificationsTab}
        notificationBadgeCount={isNotificationsTab ? 0 : PORTAL_GENERAL_NOTIFICATION_COUNT}
        onSignOut={handleLogout}
      />

      <ProfilePopover
        open={profileOpen}
        name={profile?.name || user?.name}
        email={user?.email}
        phone={profile?.phone}
        onClose={() => setProfileOpen(false)}
      />

      <main className="relative z-10 pt-[4.5rem] md:pt-24 pb-32 md:pb-36">
        <div className="mx-auto max-w-[1800px] px-4 md:px-10">{children}</div>
      </main>

      <PortalFooter
        activePanel={activePanel === 'settings' || activePanel === 'files' ? activePanel : null}
        onOpenPanel={(p) => openPanel(p)}
      />

      <AnimatePresence>
        {activePanel === 'settings' && (
          <SettingsPage
            onClose={closePanel}
            setTheme={setThemePref}
          />
        )}
        {activePanel === 'files' && <FilesPage onClose={closePanel} />}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
