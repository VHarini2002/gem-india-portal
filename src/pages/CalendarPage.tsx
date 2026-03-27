import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X, Plane, Package, FileText, Truck } from 'lucide-react';
import { mockEngines, mockParts, mockShipments } from '@/data/mockData';

interface CalendarEvent {
  date: string;
  type: 'engine' | 'part' | 'shipment' | 'report';
  title: string;
  detail: string;
  engine?: string;
  icon: any;
  color: string;
}

// Build events from mock data
const buildEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  mockEngines.forEach(e => {
    events.push({
      date: e.inductionDate,
      type: 'engine',
      title: `Engine Inducted`,
      detail: `${e.esn} (${e.model}) inducted at ${e.currentLocation} — ${e.serviceType}`,
      engine: e.esn,
      icon: Plane,
      color: 'text-primary bg-primary/15',
    });
    events.push({
      date: e.expectedCompletion,
      type: 'engine',
      title: `Expected Completion`,
      detail: `${e.esn} (${e.model}) expected to complete by this date. Phase: ${e.currentPhase}`,
      engine: e.esn,
      icon: Plane,
      color: 'text-success bg-success/15',
    });
    events.push({
      date: e.lastUpdated,
      type: 'engine',
      title: `Status Update`,
      detail: `${e.esn} status updated to: ${e.status}`,
      engine: e.esn,
      icon: Plane,
      color: 'text-warning bg-warning/15',
    });
  });

  mockShipments.forEach(s => {
    const engine = mockEngines.find(e => e.id === s.engineId);
    events.push({
      date: s.dispatchDate,
      type: 'shipment',
      title: `Shipment Dispatched`,
      detail: `${s.shipmentId}: ${s.fromLocation} → ${s.toLocation} via ${s.carrier} (${s.mode})`,
      engine: engine?.esn,
      icon: Truck,
      color: 'text-cyan-400 bg-cyan-500/15',
    });
    events.push({
      date: s.eta,
      type: 'shipment',
      title: `Shipment ETA`,
      detail: `${s.shipmentId} expected arrival at ${s.toLocation}`,
      engine: engine?.esn,
      icon: Truck,
      color: 'text-purple-400 bg-purple-500/15',
    });
  });

  // Add some part sell dates
  mockParts.filter(p => p.category === 'Sell' && p.saleStatus === 'Sold').slice(0, 8).forEach(p => {
    const engine = mockEngines.find(e => e.id === p.engineId);
    const month = Math.floor(Math.random() * 3) + 10;
    const day = Math.floor(Math.random() * 28) + 1;
    events.push({
      date: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      type: 'part',
      title: `Part Sold`,
      detail: `${p.partNumber} (${p.serialNumber}) sold — $${p.price?.toLocaleString()}. Engine: ${engine?.esn}`,
      engine: engine?.esn,
      icon: Package,
      color: 'text-warning bg-warning/15',
    });
  });

  return events;
};

const allEvents = buildEvents();

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarPageProps {
  onClose: () => void;
}

const CalendarPage = ({ onClose }: CalendarPageProps) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goBack = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const goNext = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDate ? allEvents.filter(e => e.date === selectedDate) : [];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative z-10 m-auto w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden rounded-2xl"
        style={{ background: 'rgba(10, 12, 22, 0.95)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/08 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading text-base font-bold text-foreground">Operations Calendar</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
              <span className="font-heading text-sm font-semibold text-foreground min-w-36 text-center">{MONTHS[month]} {year}</span>
              <button onClick={goNext} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Calendar Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-heading font-semibold text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            {/* Date cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const events = getEventsForDate(day);
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`min-h-[70px] p-2 rounded-xl border text-left transition-all ${
                      isSelected ? 'border-primary bg-primary/15' :
                      isToday ? 'border-primary/40 bg-primary/08' :
                      events.length > 0 ? 'border-white/10 bg-white/03 hover:bg-white/06 hover:border-white/15' :
                      'border-transparent hover:bg-white/04'
                    }`}
                  >
                    <span className={`text-xs font-heading font-semibold ${isToday ? 'text-primary' : isSelected ? 'text-primary' : 'text-foreground'}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {events.slice(0, 2).map((ev, idx) => (
                        <div key={idx} className={`text-[9px] font-body px-1.5 py-0.5 rounded-md truncate ${ev.color}`}>
                          {ev.title}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-[9px] font-body text-muted-foreground px-1">+{events.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Detail Panel */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-white/08 flex flex-col overflow-hidden flex-shrink-0"
                style={{ background: 'rgba(10, 12, 28, 0.6)' }}
              >
                <div className="p-4 border-b border-white/06 flex-shrink-0">
                  <p className="text-xs font-body text-muted-foreground">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="font-heading text-sm font-bold text-foreground mt-0.5">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedEvents.length === 0 ? (
                    <p className="text-xs font-body text-muted-foreground text-center py-8">No events on this day</p>
                  ) : selectedEvents.map((ev, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${ev.color}`}>
                          <ev.icon className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs font-heading font-bold text-foreground">{ev.title}</p>
                      </div>
                      <p className="text-xs font-body text-muted-foreground leading-relaxed">{ev.detail}</p>
                      {ev.engine && (
                        <span className="inline-block text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{ev.engine}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarPage;
