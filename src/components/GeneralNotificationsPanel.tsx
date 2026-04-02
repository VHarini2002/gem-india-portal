import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import {
  BANNER_ICONS,
  PORTAL_GENERAL_NOTIFICATIONS,
} from '@/data/portalNotifications';

type GeneralNotificationsPanelProps = {
  onClose: () => void;
};

const GeneralNotificationsPanel = ({ onClose }: GeneralNotificationsPanelProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden min-h-[min(70vh,520px)]"
    >
      <div className="flex items-center justify-between gap-4 p-5 md:p-6 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#F5C000]/15 border border-[#F5C000]/25 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#F5C000]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-lg md:text-xl font-bold text-white tracking-tight">Notifications</h2>
            <p className="text-xs text-white/45 mt-0.5">Approvals, milestones, parts, and reports</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-xl border border-white/12 bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.1] transition-colors shrink-0"
          aria-label="Close notifications"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 md:p-6 space-y-3">
        {PORTAL_GENERAL_NOTIFICATIONS.map((n, i) => {
          const Icon = BANNER_ICONS[n.icon];
          const hoverBg =
            n.colors.text.startsWith('#') && n.colors.text.length <= 7
              ? `${n.colors.text}1F`
              : 'rgba(255,255,255,0.12)';
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="gem-banner gem-banner--static w-full text-left"
              style={{ borderColor: n.colors.border }}
            >
              <div
                className="gem-banner-icon-bg"
                style={{ background: n.colors.bg, color: n.colors.text }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="gem-banner-content">
                <div className="gem-banner-title">{n.title}</div>
                <div className="gem-banner-desc whitespace-normal">{n.description}</div>
              </div>
              <div className="gem-banner-actions">
                <button
                  type="button"
                  className="gem-banner-cta"
                  style={
                    {
                      borderColor: n.colors.border,
                      color: n.colors.text,
                      ['--hover-bg' as string]: hoverBg,
                    } as CSSProperties
                  }
                  onClick={() => {
                    if (n.href) navigate(n.href);
                  }}
                >
                  {n.cta}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GeneralNotificationsPanel;
