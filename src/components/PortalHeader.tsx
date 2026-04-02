import { Bell, Moon, Sun, UserCircle2 } from 'lucide-react';

type PortalHeaderProps = {
  logoSrc: string;
  userName?: string | null;
  isDarkTheme: boolean;
  onThemeLight: () => void;
  onThemeDark: () => void;
  onProfileClick: () => void;
  onBellClick: () => void;
  notificationsOpen: boolean;
  /** Shown when stack is closed; omit or 0 to hide badge */
  notificationBadgeCount?: number;
  onSignOut: () => void;
};

const PortalHeader = ({
  logoSrc,
  userName,
  isDarkTheme,
  onThemeLight,
  onThemeDark,
  onProfileClick,
  onBellClick,
  notificationsOpen,
  notificationBadgeCount = 0,
  onSignOut,
}: PortalHeaderProps) => {
  return (
    <header className="portal-header-bar fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#0a0a0b]/88 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mx-auto max-w-[1800px] flex items-center justify-between gap-4 px-4 md:px-10 py-3 md:py-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src={logoSrc} alt="GEM India" className="h-11 md:h-14 w-auto object-contain shrink-0" />
          <div className="hidden sm:block min-w-0 border-l border-white/15 pl-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold">Client portal</p>
            {userName ? (
              <p className="text-sm text-white/80 truncate font-medium">{userName}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="flex items-center rounded-full p-1 gap-0.5 bg-white/10 border border-white/10">
            <button
              type="button"
              aria-label="Light mode"
              onClick={onThemeLight}
              className={`px-2.5 md:px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                !isDarkTheme ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Light</span>
            </button>
            <button
              type="button"
              aria-label="Dark mode"
              onClick={onThemeDark}
              className={`px-2.5 md:px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                isDarkTheme ? 'bg-[#F5C000] text-black' : 'text-white/70 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          <button
            type="button"
            className="critical-items-btn"
            aria-label="Profile settings"
            onClick={onProfileClick}
          >
            <UserCircle2 className="w-4 h-4 text-[#F5C000]" />
          </button>

          <button
            type="button"
            className={`critical-items-btn transition-colors ${
              notificationsOpen ? 'bg-white/[0.12] border-[#F5C000]/40 ring-1 ring-[#F5C000]/25' : ''
            }`}
            aria-label={notificationsOpen ? 'Hide notifications' : 'Show notifications'}
            aria-expanded={notificationsOpen}
            onClick={onBellClick}
          >
            <Bell className="w-4 h-4" />
            {!notificationsOpen && notificationBadgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F5C000] text-[10px] font-bold text-black flex items-center justify-center border-2 border-[#0a0a0b]">
                {notificationBadgeCount > 9 ? '9+' : notificationBadgeCount}
              </span>
            )}
          </button>

          <button type="button" className="sign-out-btn hidden sm:inline-flex" onClick={onSignOut}>
            Sign out
          </button>
          <button
            type="button"
            className="critical-items-btn sm:hidden"
            aria-label="Sign out"
            onClick={onSignOut}
          >
            <span className="text-[11px] font-semibold text-white/90">Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;
