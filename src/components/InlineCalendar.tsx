import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Plane, Package, Truck, Calendar } from 'lucide-react';
import { mockEngines, mockParts, mockShipments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface CalendarEvent {
  date: string;
  type: 'engine' | 'part' | 'shipment' | 'custom';
  title: string;
  detail: string;
  engine?: string;
  icon: any;
  colorClass: string;
}

interface CustomEvent {
  id: string;
  date: string;
  note: string;
  clientEmail: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildSystemEvents = (clientEmail?: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const engines = clientEmail ? mockEngines.filter(e => e.clientEmail === clientEmail) : mockEngines;

  engines.forEach(e => {
    // Future: expected completion
    events.push({
      date: e.expectedCompletion,
      type: 'engine',
      title: 'Expected Completion',
      detail: `${e.esn} (${e.model}) expected to complete. Phase: ${e.currentPhase}`,
      engine: e.esn,
      icon: Plane,
      colorClass: 'bg-primary/15 text-primary',
    });
    // Induction date
    events.push({
      date: e.inductionDate,
      type: 'engine',
      title: 'Engine Inducted',
      detail: `${e.esn} (${e.model}) inducted at ${e.currentLocation}`,
      engine: e.esn,
      icon: Plane,
      colorClass: 'bg-success/15 text-success',
    });
    // Status update
    events.push({
      date: e.lastUpdated,
      type: 'engine',
      title: 'Status Update',
      detail: `${e.esn} status: ${e.status}`,
      engine: e.esn,
      icon: Plane,
      colorClass: 'bg-warning/15 text-warning',
    });
  });

  const shipments = mockShipments.filter(s => {
    const eng = mockEngines.find(en => en.id === s.engineId);
    return clientEmail ? eng?.clientEmail === clientEmail : true;
  });

  shipments.forEach(s => {
    const engine = mockEngines.find(en => en.id === s.engineId);
    events.push({
      date: s.dispatchDate,
      type: 'shipment',
      title: 'Shipment Dispatched',
      detail: `${s.shipmentId}: ${s.fromLocation} → ${s.toLocation}`,
      engine: engine?.esn,
      icon: Truck,
      colorClass: 'bg-cyan-500/15 text-cyan-400',
    });
    events.push({
      date: s.eta,
      type: 'shipment',
      title: 'Shipment ETA',
      detail: `${s.shipmentId} arriving at ${s.toLocation}`,
      engine: engine?.esn,
      icon: Truck,
      colorClass: 'bg-purple-500/15 text-purple-400',
    });
  });

  // Part sell dates
  const parts = mockParts.filter(p => {
    if (p.category !== 'Sell' || p.saleStatus !== 'Sold') return false;
    const eng = mockEngines.find(en => en.id === p.engineId);
    return clientEmail ? eng?.clientEmail === clientEmail : true;
  }).slice(0, 8);

  parts.forEach(p => {
    const engine = mockEngines.find(en => en.id === p.engineId);
    const month = Math.floor(Math.random() * 3) + 10;
    const day = Math.floor(Math.random() * 28) + 1;
    events.push({
      date: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      type: 'part',
      title: 'Part Sold',
      detail: `${p.partNumber} sold — $${p.price?.toLocaleString()}`,
      engine: engine?.esn,
      icon: Package,
      colorClass: 'bg-warning/15 text-warning',
    });
  });

  return events;
};

const getStorageKey = (email: string) => `gem_calendar_events_${email}`;

const InlineCalendar = () => {
  const { user } = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventNote, setNewEventNote] = useState('');
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);

  const systemEvents = buildSystemEvents(user?.email);

  // Load custom events from localStorage
  useEffect(() => {
    if (user?.email) {
      const stored = localStorage.getItem(getStorageKey(user.email));
      if (stored) setCustomEvents(JSON.parse(stored));
    }
  }, [user?.email]);

  const saveCustomEvents = (events: CustomEvent[]) => {
    setCustomEvents(events);
    if (user?.email) localStorage.setItem(getStorageKey(user.email), JSON.stringify(events));
  };

  const handleAddEvent = () => {
    if (!newEventDate || !newEventNote.trim() || !user?.email) return;
    const newEvent: CustomEvent = {
      id: Date.now().toString(),
      date: newEventDate,
      note: newEventNote.trim(),
      clientEmail: user.email,
    };
    saveCustomEvents([...customEvents, newEvent]);
    setNewEventDate('');
    setNewEventNote('');
    setShowAddDialog(false);
  };

  const deleteCustomEvent = (id: string) => {
    saveCustomEvents(customEvents.filter(e => e.id !== id));
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goBack = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const goNext = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const sys = systemEvents.filter(e => e.date === dateStr);
    const custom = customEvents.filter(e => e.date === dateStr);
    return { sys, custom };
  };

  const selectedDateEvents = selectedDate ? {
    sys: systemEvents.filter(e => e.date === selectedDate),
    custom: customEvents.filter(e => e.date === selectedDate),
  } : { sys: [], custom: [] };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Operations Calendar</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
          <span className="font-heading text-sm font-semibold text-foreground min-w-36 text-center">{MONTHS[month]} {year}</span>
          <button onClick={goNext} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
          <button
            onClick={() => { setShowAddDialog(true); setNewEventDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-5 min-h-0">
        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-heading font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const { sys, custom } = getEventsForDate(day);
              const totalEvents = sys.length + custom.length;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`min-h-[72px] p-2 rounded-xl border text-left transition-all ${
                    isSelected ? 'border-primary bg-primary/15' :
                    isToday ? 'border-primary/40 bg-primary/10' :
                    totalEvents > 0 ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]' :
                    'border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`text-xs font-heading font-semibold ${isToday || isSelected ? 'text-primary' : 'text-foreground'}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {sys.slice(0, 2).map((ev, idx) => (
                      <div key={idx} className={`text-[9px] font-body px-1.5 py-0.5 rounded-md truncate ${ev.colorClass}`}>{ev.title}</div>
                    ))}
                    {custom.slice(0, 1).map((ev, idx) => (
                      <div key={`c-${idx}`} className="text-[9px] font-body px-1.5 py-0.5 rounded-md truncate bg-emerald-500/20 text-emerald-400">📌 {ev.note.slice(0, 20)}</div>
                    ))}
                    {totalEvents > 3 && <div className="text-[9px] text-muted-foreground px-1">+{totalEvents - 3} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Detail Sidebar */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/10 pl-5 flex flex-col overflow-hidden flex-shrink-0"
            >
              <div className="mb-4">
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="font-heading text-sm font-bold text-foreground mt-0.5">
                  {selectedDateEvents.sys.length + selectedDateEvents.custom.length} event{(selectedDateEvents.sys.length + selectedDateEvents.custom.length) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {selectedDateEvents.sys.map((ev, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="glass-card p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${ev.colorClass}`}>
                        <ev.icon className="w-3 h-3" />
                      </div>
                      <p className="text-xs font-heading font-bold text-foreground">{ev.title}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{ev.detail}</p>
                    {ev.engine && <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{ev.engine}</span>}
                  </motion.div>
                ))}
                {selectedDateEvents.custom.map((ev, i) => (
                  <motion.div key={`c-${i}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl space-y-1.5 border border-emerald-500/30 bg-emerald-500/10">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-heading font-bold text-emerald-400">📌 Your Note</p>
                      <button onClick={() => deleteCustomEvent(ev.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-300/80 leading-relaxed">{ev.note}</p>
                  </motion.div>
                ))}
                {selectedDateEvents.sys.length === 0 && selectedDateEvents.custom.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No events on this day</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Event Dialog */}
      <AnimatePresence>
        {showAddDialog && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddDialog(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md rounded-2xl p-6 border border-white/10"
              style={{ background: 'rgba(10, 12, 22, 0.95)', backdropFilter: 'blur(32px)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-base font-bold text-foreground">Add Calendar Event</h3>
                <button onClick={() => setShowAddDialog(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Note</label>
                  <textarea
                    value={newEventNote}
                    onChange={e => setNewEventNote(e.target.value)}
                    placeholder="e.g. Follow up on ESN-726481 shipment status"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={handleAddEvent}
                  disabled={!newEventDate || !newEventNote.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InlineCalendar;
