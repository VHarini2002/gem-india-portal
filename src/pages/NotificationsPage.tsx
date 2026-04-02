import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Package, FileText, Plane, FileCheck, X, CheckCheck } from 'lucide-react';
import { mockEngines, mockParts } from '@/data/mockData';
import { getEngineHealth, getEngineStory } from '@/lib/engineIntelligence';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

type Priority = 'Critical' | 'High' | 'Medium';
type NotificationType = 'engine' | 'parts' | 'document' | 'report';

type NotificationItem = {
  id: number;
  type: NotificationType;
  icon: typeof Plane;
  color: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  priority: Priority;
  ctaHref?: string;
};

const filters = ['All', 'Critical', 'High', 'Medium', 'New Parts', 'New Engine', 'New Document', 'New Report'];

const borderByPriority: Record<Priority, string> = {
  Critical: 'rgba(239, 68, 68, 0.45)',
  High: 'rgba(245, 192, 0, 0.45)',
  Medium: 'rgba(255, 255, 255, 0.35)',
};

const iconBgByPriority: Record<Priority, { bg: string; text: string }> = {
  Critical: { bg: 'rgba(239, 68, 68, 0.12)', text: '#fca5a5' },
  High: { bg: 'rgba(245, 192, 0, 0.12)', text: '#f5c000' },
  Medium: { bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff' },
};

interface NotificationsPageProps {
  onClose: () => void;
}

const NotificationsPage = ({ onClose }: NotificationsPageProps) => {
  const navigate = useNavigate();
  const { isDarkTheme } = useTheme();
  const [active, setActive] = useState('All');
  const initialItems = useMemo<NotificationItem[]>(() => {
    const generated: NotificationItem[] = [];
    let nid = 1;

    mockEngines.forEach((e) => {
      const health = getEngineHealth(e);
      const story = getEngineStory(e);
      if (story.isOverdue || health.score < 65) {
        generated.push({
          id: nid++,
          type: 'engine',
          icon: Plane,
          color: 'text-destructive bg-destructive/15',
          title: 'Teardown delay risk',
          desc: `${e.esn} (${e.workOrder}) is ${story.isOverdue ? 'overdue' : 'at risk'} — Health ${health.score}/100 (${health.driver}).`,
          time: 'Now',
          unread: true,
          priority: 'Critical',
          ctaHref: `/engine/${e.workOrder}-${e.esn}`,
        });
      } else if (typeof story.dueInDays === 'number' && story.dueInDays <= 14) {
        generated.push({
          id: nid++,
          type: 'engine',
          icon: Plane,
          color: 'text-warning bg-warning/15',
          title: 'Completion approaching',
          desc: `${e.esn} is due in ${story.dueInDays} days. Review milestones and approvals.`,
          time: '2 hours ago',
          unread: true,
          priority: 'High',
          ctaHref: `/engine/${e.workOrder}-${e.esn}`,
        });
      }
    });

    const saleReady = mockParts.filter((p) => p.category === 'Sell' && p.saleStatus === 'Available');
    if (saleReady.length) {
      const totalValue = saleReady.reduce((s, p) => s + (p.price ?? 0), 0);
      generated.push({
        id: nid++,
        type: 'parts',
        icon: Package,
        color: 'text-success bg-success/15',
        title: 'Parts ready for sale',
        desc: `${saleReady.length} parts available (est. $${totalValue.toLocaleString()}).`,
        time: '4 hours ago',
        unread: true,
        priority: 'High',
        ctaHref: '/catalog',
      });
    }

    generated.push(
      {
        id: nid++,
        type: 'document',
        icon: FileText,
        color: 'text-primary bg-primary/15',
        title: 'Release readiness update',
        desc: 'Compliance documents updated for WO-2024-004. Verify remaining gaps.',
        time: '1 day ago',
        unread: false,
        priority: 'Medium',
      },
      {
        id: nid++,
        type: 'report',
        icon: FileCheck,
        color: 'text-primary bg-primary/15',
        title: 'Weekly value report available',
        desc: 'Recovery value vs expectation report is ready for review.',
        time: '2 days ago',
        unread: false,
        priority: 'Medium',
      }
    );

    const rank: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2 };
    return generated.sort((a, b) => rank[a.priority] - rank[b.priority]);
  }, []);

  const [items, setItems] = useState(initialItems);

  const filtered = items.filter((n) => {
    if (active === 'All') return true;
    if (active === 'Critical' || active === 'High' || active === 'Medium') return n.priority === active;
    if (active === 'New Parts') return n.type === 'parts';
    if (active === 'New Engine') return n.type === 'engine';
    if (active === 'New Document') return n.type === 'document';
    if (active === 'New Report') return n.type === 'report';
    return true;
  });

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  const unreadCount = items.filter((n) => n.unread).length;

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
          background: isDarkTheme ? 'rgba(10, 10, 11, 0.94)' : 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(32px)',
          borderRight: isDarkTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/12 flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-[#F5C000]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <h2 className="font-heading text-base font-bold text-white tracking-wide">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-body text-[#F5C000] hover:text-[#ffc800] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button type="button" onClick={onClose} className="gem-banner-close !w-9 !h-9 rounded-full hover:bg-white/10" aria-label="Close">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-b border-white/08 overflow-x-auto flex-shrink-0">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all border ${
                active === f
                  ? 'bg-[#F5C000]/15 text-[#F5C000] border-[#F5C000]/35'
                  : 'bg-white/[0.06] text-white/50 border-white/10 hover:bg-white/[0.1]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {filtered.map((n, i) => {
            const Icon = n.icon;
            const ic = iconBgByPriority[n.priority];
            const border = borderByPriority[n.priority];
            return (
              <motion.button
                key={n.id}
                type="button"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`gem-banner gem-banner--static text-left w-full cursor-pointer hover:bg-white/[0.04] transition-colors ${
                  n.unread ? 'ring-1 ring-[#F5C000]/15' : ''
                }`}
                style={{ borderColor: border }}
                onClick={() => {
                  setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
                  if (n.ctaHref) {
                    onClose();
                    navigate(n.ctaHref);
                  }
                }}
              >
                <div className="gem-banner-icon-bg" style={{ background: ic.bg, color: ic.text }}>
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div className="gem-banner-content">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="gem-banner-title">{n.title}</span>
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#F5C000] flex-shrink-0" />}
                  </div>
                  <p className="gem-banner-desc whitespace-normal">{n.desc}</p>
                  <p className="text-[10px] text-white/35 mt-1">{n.time}</p>
                </div>
                <div className="gem-banner-actions flex-col items-end gap-1">
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      n.priority === 'Critical'
                        ? 'border-red-500/40 text-red-300'
                        : n.priority === 'High'
                        ? 'border-[#F5C000]/40 text-[#F5C000]'
                        : 'border-white/20 text-white/45'
                    }`}
                  >
                    {n.priority}
                  </span>
                  {n.ctaHref && (
                    <span className="text-[10px] tracking-[0.08em] px-3 py-1 rounded-full border border-white/35 text-white/85">
                      Open
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationsPage;
