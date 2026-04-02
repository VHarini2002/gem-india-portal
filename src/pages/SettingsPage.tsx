import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sun, Moon, User, X, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  patchProfilePreferences,
  readProfilePreferences,
  type ProfilePreferences,
} from '@/lib/profilePreferences';

interface SettingsPageProps {
  onClose: () => void;
  setTheme?: (isDark: boolean) => void;
}

const SettingsPage = ({ onClose, setTheme }: SettingsPageProps) => {
  const { user } = useAuth();
  const { isDarkTheme, setIsDarkTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const userKey = user?.email ?? null;

  const [profile, setProfile] = useState<ProfilePreferences>({
    name: '',
    phone: '',
    address: '',
    alternateEmail: '',
  });

  useEffect(() => {
    if (!userKey) return;
    const fallback = { name: user?.name ?? '' };
    setProfile(readProfilePreferences(userKey, fallback));
  }, [userKey, user?.name]);

  const save = () => {
    if (!userKey) return;
    patchProfilePreferences(userKey, profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        transition={{ type: 'spring', damping: 28 }}
        className="relative z-10 w-full max-w-md h-full flex flex-col overflow-hidden"
        style={{
          background: isDarkTheme ? 'rgba(20, 20, 22, 0.92)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(32px)',
          borderRight: isDarkTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/08">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading text-base font-bold text-foreground">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Theme */}
          <div>
            <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">Appearance</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => (setTheme ? setTheme(false) : setIsDarkTheme(false))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  !isDarkTheme ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground hover:border-white/20'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-heading font-semibold">Light Mode</span>
                {!isDarkTheme && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
              <button
                onClick={() => (setTheme ? setTheme(true) : setIsDarkTheme(true))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  isDarkTheme ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground hover:border-white/20'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-heading font-semibold">Dark Mode</span>
                {isDarkTheme && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                Profile Settings
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Name
                </label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#F5C000]/20 outline-none text-sm"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Number
                </label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#F5C000]/20 outline-none text-sm"
                  placeholder="Enter number"
                />
              </div>

              <div>
                <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Address
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                  className="w-full min-h-[84px] resize-none px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#F5C000]/20 outline-none text-sm"
                  placeholder="Enter address"
                />
              </div>

              <div>
                <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Alternate Email
                </label>
                <input
                  value={profile.alternateEmail}
                  onChange={(e) => setProfile((p) => ({ ...p, alternateEmail: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#F5C000]/20 outline-none text-sm"
                  placeholder="Enter alternate email"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/06">
          <button onClick={save} className="btn-primary w-full py-2.5 text-sm rounded-xl">
            {saved ? '✓ Saved!' : 'Save Preferences'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
