import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Package, FileText, Plane, FileCheck, X, CheckCheck } from 'lucide-react';
import { mockEngines, mockParts } from '@/data/mockData';

const notifications = [
  { id: 1, type: 'engine', icon: Plane, color: 'text-primary bg-primary/15', title: 'New Engine Inducted', desc: `ESN-726481 (CFM56-5B) has been received at Chennai facility.`, time: '2 hours ago', unread: true },
  { id: 2, type: 'parts', icon: Package, color: 'text-warning bg-warning/15', title: 'Parts Available for Sale', desc: `${mockParts.filter(p => p.category === 'Sell' && p.saleStatus === 'Available').length} new parts from ESN-726481 listed in catalog.`, time: '4 hours ago', unread: true },
  { id: 3, type: 'document', icon: FileText, color: 'text-success bg-success/15', title: 'New Document Uploaded', desc: 'Disassembly Report for WO-2024-001 is now available.', time: '1 day ago', unread: true },
  { id: 4, type: 'report', icon: FileCheck, color: 'text-purple-400 bg-purple-500/15', title: 'Report Uploaded', desc: 'Logistics Report for ESN-839205 (V2500-A5) is ready.', time: '2 days ago', unread: false },
  { id: 5, type: 'engine', icon: Plane, color: 'text-primary bg-primary/15', title: 'Engine Status Update', desc: 'ESN-198734 moved to In Repair phase at Dubai facility.', time: '3 days ago', unread: false },
  { id: 6, type: 'parts', icon: Package, color: 'text-warning bg-warning/15', title: 'Part Access Granted', desc: 'Sell-category part PN-73-8821 certified and listed.', time: '4 days ago', unread: false },
  { id: 7, type: 'document', icon: FileText, color: 'text-success bg-success/15', title: 'New Document Uploaded', desc: 'Inspection Workscope for ESN-672314 uploaded by KAM.', time: '5 days ago', unread: false },
  { id: 8, type: 'report', icon: FileCheck, color: 'text-purple-400 bg-purple-500/15', title: 'Financial Report Ready', desc: 'Q4 2024 Revenue Summary for AeroLease Corp available.', time: '1 week ago', unread: false },
];

const filters = ['All', 'New Parts', 'New Engine', 'New Document', 'New Report'];

interface NotificationsPageProps {
  onClose: () => void;
}

const NotificationsPage = ({ onClose }: NotificationsPageProps) => {
  const [active, setActive] = useState('All');
  const [items, setItems] = useState(notifications);

  const filtered = items.filter(n => {
    if (active === 'All') return true;
    if (active === 'New Parts') return n.type === 'parts';
    if (active === 'New Engine') return n.type === 'engine';
    if (active === 'New Document') return n.type === 'document';
    if (active === 'New Report') return n.type === 'report';
    return true;
  });

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, unread: false })));
  const unreadCount = items.filter(n => n.unread).length;

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
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
              )}
            </div>
            <h2 className="font-heading text-base font-bold text-foreground">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-body text-primary hover:text-primary/80 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 p-4 border-b border-white/06 overflow-x-auto flex-shrink-0">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all ${
                active === f ? 'bg-primary text-primary-foreground' : 'bg-white/08 text-muted-foreground hover:bg-white/12'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/05">
          {filtered.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-start gap-4 p-5 cursor-pointer transition-colors hover:bg-white/04 ${n.unread ? 'bg-white/02' : ''}`}
              onClick={() => setItems(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                <n.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-heading font-semibold text-foreground">{n.title}</p>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <p className="text-xs font-body text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</p>
                <p className="text-[10px] font-body text-muted-foreground/60 mt-1.5">{n.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationsPage;
