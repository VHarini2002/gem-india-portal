import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sun, Moon, Type, LayoutGrid, X, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsPageProps {
  onClose: () => void;
  fontSize: string;
  setFontSize: (s: string) => void;
  portalView: string;
  setPortalView: (s: string) => void;
  setTheme?: (isDark: boolean) => void;
}

const SettingsPage = ({ onClose, fontSize, setFontSize, portalView, setPortalView, setTheme }: SettingsPageProps) => {
  const { isDarkTheme, setIsDarkTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const fontSizes = [
    { key: 'small', label: 'Small', desc: 'Compact text, more content visible', preview: 'text-sm' },
    { key: 'medium', label: 'Medium', desc: 'Balanced readability (default)', preview: 'text-base' },
    { key: 'large', label: 'Large', desc: 'Larger text for accessibility', preview: 'text-lg' },
  ];

  const portalViews = [
    { key: 'default', label: 'Default', desc: 'Standard dashboard layout' },
    { key: 'compact', label: 'Compact', desc: 'Dense information display' },
    { key: 'expanded', label: 'Expanded', desc: 'Spacious comfortable layout' },
  ];

  return (
    <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        transition={{ type: 'spring', damping: 28 }}
        className="relative z-10 w-full max-w-md h-full flex flex-col overflow-hidden"
        style={{ background: 'rgba(10, 12, 22, 0.92)', backdropFilter: 'blur(32px)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
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

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Text Size</h3>
            </div>
            <div className="space-y-2">
              {fontSizes.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFontSize(f.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    fontSize === f.key ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className={`${f.preview} font-heading font-bold w-6 text-center ${fontSize === f.key ? 'text-primary' : 'text-muted-foreground'}`}>Aa</span>
                  <div className="flex-1">
                    <p className={`text-sm font-heading font-semibold ${fontSize === f.key ? 'text-primary' : 'text-foreground'}`}>{f.label}</p>
                    <p className="text-xs font-body text-muted-foreground">{f.desc}</p>
                  </div>
                  {fontSize === f.key && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Portal View */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Portal View</h3>
            </div>
            <div className="space-y-2">
              {portalViews.map(v => (
                <button
                  key={v.key}
                  onClick={() => setPortalView(v.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    portalView === v.key ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <LayoutGrid className={`w-5 h-5 flex-shrink-0 ${portalView === v.key ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-heading font-semibold ${portalView === v.key ? 'text-primary' : 'text-foreground'}`}>{v.label}</p>
                    <p className="text-xs font-body text-muted-foreground">{v.desc}</p>
                  </div>
                  {portalView === v.key && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
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
