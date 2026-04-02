import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, Plane, Truck, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { mockEngines, mockShipments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface CalendarEvent {
  date: string;
  category: 'gemIndia' | 'upcoming';
  title: string;
  detail: string;
  engine?: string;
  icon: LucideIcon;
  colorClass: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const GOLD_COLOR_CLASS = 'bg-[#F5C000]/15 text-[#F5C000]';
const UPCOMING_COLOR_CLASS = 'bg-white/10 text-white/80';

const toDateStrUTC = (d: Date) => d.toISOString().slice(0, 10);

const shiftDateUTC = (dateStr: string, days: number) => {
  const [y, m, day] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day, 12, 0, 0)); // noon UTC to avoid timezone date shift
  dt.setUTCDate(dt.getUTCDate() + days);
  return toDateStrUTC(dt);
};

const replaceYearUTC = (dateStr: string, year: number) => {
  const [, m, day] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(year, m - 1, day, 12, 0, 0));
  return toDateStrUTC(dt);
};

const formatDateForDetail = (dateStr: string) => {
  const [y, m, day] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
  return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const buildSystemEvents = (clientEmail?: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const engines = clientEmail ? mockEngines.filter(e => e.clientEmail === clientEmail) : mockEngines;
  const targetYear = new Date().getFullYear();

  engines.forEach(e => {
    const inductionDateYear = replaceYearUTC(e.inductionDate, targetYear);
    const lastUpdatedYear = replaceYearUTC(e.lastUpdated, targetYear);
    const expectedCompletionYear = replaceYearUTC(e.expectedCompletion, targetYear);

    events.push({
      date: expectedCompletionYear,
      category: 'upcoming',
      title: 'Upcoming: Expected Engine Completion',
      detail: `${e.esn} is expected to complete by this date. Phase: ${e.currentPhase}. (${e.model})`,
      engine: e.esn,
      icon: Plane,
      colorClass: UPCOMING_COLOR_CLASS,
    });

    events.push({
      date: inductionDateYear,
      category: 'gemIndia',
      title: 'GEM India: Inducted at Chennai',
      detail: `${e.esn} (${e.model}) GEM India participation: inducted at ${e.currentLocation} on ${formatDateForDetail(inductionDateYear)}.`,
      engine: e.esn,
      icon: Plane,
      colorClass: GOLD_COLOR_CLASS,
    });

    events.push({
      date: lastUpdatedYear,
      category: 'gemIndia',
      title: 'GEM India: Status Update',
      detail: `${e.esn} GEM India participation: status updated to "${e.status}" on ${formatDateForDetail(lastUpdatedYear)}.`,
      engine: e.esn,
      icon: Plane,
      colorClass: GOLD_COLOR_CLASS,
    });
  });

  // Upcoming events: expected to reach Chennai (mocked using inductionDate + shipments to Chennai).
  const shipmentsToChennai = mockShipments.filter(s => {
    if (!s.toLocation.toLowerCase().includes('chennai')) return false;
    const eng = mockEngines.find(en => en.id === s.engineId);
    return clientEmail ? eng?.clientEmail === clientEmail : true;
  });

  // Add a generic "expected to reach Chennai" for every engine (based on inductionDate - 7 days).
  engines.forEach(e => {
    const inductionDateYear = replaceYearUTC(e.inductionDate, targetYear);
    const reachChennaiDate = shiftDateUTC(inductionDateYear, -7);
    events.push({
      date: reachChennaiDate,
      category: 'upcoming',
      title: 'Upcoming: Expected to Reach Chennai',
      detail: `${e.esn} is expected to reach Chennai, India on ${formatDateForDetail(reachChennaiDate)}. (Mock delivery lead time)`,
      engine: e.esn,
      icon: Truck,
      colorClass: UPCOMING_COLOR_CLASS,
    });
  });

  // Add more specific upcoming "ETA to Chennai" when shipment mock data includes Chennai destination.
  shipmentsToChennai.forEach(s => {
    const engine = mockEngines.find(en => en.id === s.engineId);
    if (!engine) return;

    events.push({
      date: replaceYearUTC(s.eta, targetYear),
      category: 'upcoming',
      title: 'Upcoming: Shipment ETA to Chennai',
      detail: `${engine.esn} is expected to reach Chennai, India on ${formatDateForDetail(replaceYearUTC(s.eta, targetYear))}. ${s.shipmentId} via ${s.carrier} (${s.mode}).`,
      engine: engine.esn,
      icon: Truck,
      colorClass: UPCOMING_COLOR_CLASS,
    });
  });

  // Extra fixed April mock events (so you can visibly test upcoming vs completed).
  // If today's date has passed these, they will show as "Completed:" in the UI.
  const aprilEngine = engines[0] ?? mockEngines[0];
  if (aprilEngine) {
    events.push({
      date: `${targetYear}-04-01`,
      category: 'upcoming',
      title: 'Upcoming: Expected to Reach Chennai',
      detail: `${aprilEngine.esn} is expected to reach Chennai, India on Apr 01, ${targetYear}. (Mock delivery)`,
      engine: aprilEngine.esn,
      icon: Truck,
      colorClass: UPCOMING_COLOR_CLASS,
    });
    events.push({
      date: `${targetYear}-04-02`,
      category: 'upcoming',
      title: 'Upcoming: Expected to Reach Chennai',
      detail: `${aprilEngine.esn} is expected to reach Chennai, India on Apr 02, ${targetYear}. (Mock delivery - today)`,
      engine: aprilEngine.esn,
      icon: Truck,
      colorClass: UPCOMING_COLOR_CLASS,
    });
    events.push({
      date: `${targetYear}-04-10`,
      category: 'upcoming',
      title: 'Upcoming: Expected Engine Completion',
      detail: `${aprilEngine.esn} expected engine completion on Apr 10, ${targetYear}. Phase: ${aprilEngine.currentPhase}. (Mock completion)`,
      engine: aprilEngine.esn,
      icon: Plane,
      colorClass: UPCOMING_COLOR_CLASS,
    });
    events.push({
      date: `${targetYear}-04-18`,
      category: 'upcoming',
      title: 'Upcoming: Shipment ETA to Chennai',
      detail: `${aprilEngine.esn} is expected to reach Chennai, India on Apr 18, ${targetYear}. SHP-MOCK-100 via DHL Aviation (Air).`,
      engine: aprilEngine.esn,
      icon: Truck,
      colorClass: UPCOMING_COLOR_CLASS,
    });
    events.push({
      date: `${targetYear}-04-03`,
      category: 'gemIndia',
      title: 'GEM India: Inducted at Chennai',
      detail: `${aprilEngine.esn} (${aprilEngine.model}) GEM India participation: inducted at Chennai on Apr 03, ${targetYear}. (Mock)`,
      engine: aprilEngine.esn,
      icon: Plane,
      colorClass: GOLD_COLOR_CLASS,
    });
    events.push({
      date: `${targetYear}-04-06`,
      category: 'gemIndia',
      title: 'GEM India: Status Update',
      detail: `${aprilEngine.esn} GEM India participation: status updated to "${aprilEngine.status}" on Apr 06, ${targetYear}. (Mock)`,
      engine: aprilEngine.esn,
      icon: Plane,
      colorClass: GOLD_COLOR_CLASS,
    });
  }

  return events;
};

const InlineCalendar = () => {
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);
  const todayLocalDateStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const systemEvents = useMemo(() => buildSystemEvents(user?.email), [user?.email]);

  // Auto-focus the calendar to the nearest month that has mock events.
  const hasAutoFocusedRef = useRef(false);
  const prevUserEmailRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!systemEvents.length) return;

    if (prevUserEmailRef.current !== user?.email) {
      hasAutoFocusedRef.current = false;
      prevUserEmailRef.current = user?.email;
    }

    if (hasAutoFocusedRef.current) return;

    const parsed = systemEvents
      .map((e) => {
        const dt = new Date(e.date + 'T00:00:00');
        return Number.isNaN(dt.getTime()) ? null : { e, dt };
      })
      .filter(Boolean) as { e: CalendarEvent; dt: Date }[];

    if (!parsed.length) return;

    const nearest = parsed
      .slice()
      .sort((a, b) => Math.abs(a.dt.getTime() - today.getTime()) - Math.abs(b.dt.getTime() - today.getTime()))[0];

    if (!nearest) return;

    setYear(nearest.dt.getFullYear());
    setMonth(nearest.dt.getMonth());
    hasAutoFocusedRef.current = true;
  }, [systemEvents, today, user?.email]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goBack = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const goNext = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return systemEvents.filter(e => e.date === dateStr);
  };

  const carouselImages = useMemo(() => {
    const modules = import.meta.glob('../../carousel/*.{jpg,jpeg,png,webp,gif}', {
      eager: true,
      import: 'default',
    }) as Record<string, string>;

    return Object.entries(modules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, url]) => url);
  }, []);

  const [carouselRotationIndex, setCarouselRotationIndex] = useState(0);
  const carouselViewportRef = useRef<HTMLDivElement | null>(null);
  const [carouselViewportHeight, setCarouselViewportHeight] = useState(270);
  const disableCarouselTransitionRef = useRef(false);
  const carouselRotationIndexRef = useRef(0);
  const [isCarouselAutoPlay, setIsCarouselAutoPlay] = useState(true);
  const isCarouselAutoPlayRef = useRef(true);
  const autoPlayResumeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    carouselRotationIndexRef.current = carouselRotationIndex;
  }, [carouselRotationIndex]);

  useEffect(() => {
    isCarouselAutoPlayRef.current = isCarouselAutoPlay;
  }, [isCarouselAutoPlay]);

  // Rotate forward with wrap (no back-and-forth):
  // middle image sequence for N items becomes: N, 1, 2, ..., N-1, N, ...
  useEffect(() => {
    const len = carouselImages.length;
    if (len <= 2) return;

    // If images list changes, snap back to initial state.
    setCarouselRotationIndex(0);
    setIsCarouselAutoPlay(true);

    const id = window.setInterval(() => {
      if (!isCarouselAutoPlayRef.current) return;
      setCarouselRotationIndex((prev) => {
        const next = (prev + 1) % len;

        // Disable transition only for the wrap jump.
        const wrappedForward = prev === len - 1 && next === 0;
        if (wrappedForward) {
          disableCarouselTransitionRef.current = true;
          window.setTimeout(() => {
            disableCarouselTransitionRef.current = false;
          }, 80);
        }

        return next;
      });
    }, 3500);

    return () => window.clearInterval(id);
  }, [carouselImages.length]);

  const handleManualCarousel = (dir: -1 | 1) => {
    const len = carouselImages.length;
    if (len <= 2) return;

    // Pause autoplay briefly after manual action.
    setIsCarouselAutoPlay(false);
    if (autoPlayResumeTimerRef.current) window.clearTimeout(autoPlayResumeTimerRef.current);
    autoPlayResumeTimerRef.current = window.setTimeout(() => {
      setIsCarouselAutoPlay(true);
    }, 6000);

    setCarouselRotationIndex((prev) => {
      const next = (prev + dir + len) % len;
      const wrappedForward = dir === 1 && prev === len - 1 && next === 0;
      const wrappedBackward = dir === -1 && prev === 0 && next === len - 1;

      if (wrappedForward || wrappedBackward) {
        disableCarouselTransitionRef.current = true;
        window.setTimeout(() => {
          disableCarouselTransitionRef.current = false;
        }, 80);
      }

      return next;
    });
  };

  useEffect(() => {
    if (!carouselViewportRef.current) return;

    const el = carouselViewportRef.current;
    const ro = new ResizeObserver(() => {
      setCarouselViewportHeight(el.clientHeight);
    });
    ro.observe(el);
    setCarouselViewportHeight(el.clientHeight);

    return () => ro.disconnect();
  }, []);

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
          <h2 className="font-heading text-lg font-bold text-foreground">CALENDAR</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
          <span className="font-heading text-sm font-semibold text-foreground min-w-36 text-center">{MONTHS[month]} {year}</span>
          <button onClick={goNext} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-heading font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const sys = getEventsForDate(day);
              const totalEvents = sys.length;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div
                  key={day}
                  className={`min-h-[96px] p-3 rounded-xl border text-left transition-all ${
                    isToday ? 'border-primary/40 bg-primary/10' :
                    totalEvents > 0 ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]' :
                    'border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`text-[22px] leading-none font-heading font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>{day}</span>
                  <div className="mt-2 space-y-1">
                    {sys.slice(0, 2).map((ev, idx) => {
                      const isUpcomingCompleted = ev.category === 'upcoming' && ev.date < todayLocalDateStr;
                      const displayTitle = isUpcomingCompleted
                        ? (ev.title.startsWith('Upcoming:') ? ev.title.replace(/^Upcoming:/, 'Completed:') : `Completed: ${ev.title}`)
                        : ev.title;
                      const displayColorClass = isUpcomingCompleted ? 'bg-emerald-500/15 text-emerald-300' : ev.colorClass;

                      return (
                        <div
                          key={idx}
                          className={`px-2 py-0.5 rounded-md truncate ${displayColorClass}`}
                        >
                          <div className="text-[9px] font-body font-semibold opacity-90 truncate">
                            {ev.engine}
                          </div>
                          <div className="text-[10px] font-body truncate">{displayTitle}</div>
                        </div>
                      );
                    })}
                    {totalEvents > 3 && <div className="text-[10px] text-muted-foreground px-1">+{totalEvents - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Images carousel */}
        <div className="w-[320px] flex-shrink-0">
          <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 overflow-hidden">
            <div className="font-heading text-sm font-bold text-foreground mb-3">Highlights</div>

            {carouselImages.length <= 1 && (
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/10 h-[190px]">
                <img
                  src={carouselImages[0]}
                  alt="Highlight image"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {carouselImages.length === 2 && (
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/10 h-[190px] flex flex-col">
                <div className="flex-1">
                  <img
                    src={carouselImages[0]}
                    alt="Highlight image 1"
                    className="w-full h-full object-contain bg-black/10"
                  />
                </div>
                <div className="flex-1 border-t border-white/10">
                  <img
                    src={carouselImages[1]}
                    alt="Highlight image 2"
                    className="w-full h-full object-contain bg-black/10"
                  />
                </div>
              </div>
            )}

            {carouselImages.length >= 3 && (
              <div
                ref={carouselViewportRef}
                className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10 bg-black/10 relative"
              >
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => handleManualCarousel(-1)}
                  className="absolute left-2 top-2 z-10 h-8 w-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => handleManualCarousel(1)}
                  className="absolute left-2 bottom-2 z-10 h-8 w-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                {(() => {
                  const len = carouselImages.length;
                  const ITEM_HEIGHT = Math.max(1, carouselViewportHeight / 3);
                  const viewportHeight = carouselViewportHeight;

                  // Make a 3-copy track to support wrap without needing boundary placeholders.
                  const track = [...carouselImages, ...carouselImages, ...carouselImages];

                  // Track index of the "middle" visible row.
                  const middleIndex = (len - 1) + carouselRotationIndex;
                  const topIndex = middleIndex - 1;

                  return (
                    <div
                      className="absolute inset-0"
                      style={{
                        transform: `translateY(-${topIndex * ITEM_HEIGHT}px)`,
                        transition: disableCarouselTransitionRef.current ? 'none' : 'transform 850ms cubic-bezier(0.22, 1, 0.36, 1)',
                        willChange: 'transform',
                      }}
                    >
                      <div className="flex flex-col">
                        {track.map((src, pos) => {
                          const distance = Math.abs(pos - middleIndex);
                          const opacity = distance === 0 ? 1 : distance === 1 ? 0.4 : 0.12;
                          const scale = distance === 0 ? 1 : 0.99;

                          return (
                            <div
                              key={`${src}-${pos}`}
                              className="flex items-center justify-center"
                              style={{
                                height: ITEM_HEIGHT,
                                opacity,
                                transform: `scale(${scale})`,
                                transition: 'opacity 450ms cubic-bezier(0.22, 1, 0.36, 1), transform 850ms cubic-bezier(0.22, 1, 0.36, 1)',
                              }}
                            >
                              <img
                                src={src}
                                alt="Highlight image"
                                className="block w-full h-full object-contain bg-black/10"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineCalendar;
