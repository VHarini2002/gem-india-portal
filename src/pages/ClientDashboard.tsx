import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockEngines, mockParts } from '@/data/mockData';
import EngineCard from '@/components/EngineCard';
import { Search, Filter, X, AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AttentionBannerStack from '../components/AttentionBannerStack';
import GeneralNotificationsPanel from '@/components/GeneralNotificationsPanel';
import { buildAttentionItems } from '@/lib/engineIntelligence';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InlineCalendar from '@/components/InlineCalendar';
import InlineAnalytics from '@/components/InlineAnalytics';

const statusOptions = ['All', 'In Transit', 'In Repair', 'In Storage', 'Disassembly', 'Inspection', 'Completed', 'Preservation Active', 'Ready for Release'];
const serviceOptions = ['All', 'Teardown & Return', 'Teardown, Repair & Sell', 'Lease Storage'];

function attentionStorageKey(email: string) {
  return `gem_attention_dismissed_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const enginesSectionRef = useRef<HTMLDivElement | null>(null);

  const clientEngines = mockEngines.filter(e =>
    user?.role === 'client' ? e.clientEmail === user.email : true
  );

  const filtered = clientEngines.filter(e => {
    const matchSearch = e.esn.toLowerCase().includes(search.toLowerCase()) ||
      e.workOrder.toLowerCase().includes(search.toLowerCase()) ||
      e.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchService = serviceFilter === 'All' || e.serviceType === serviceFilter;
    return matchSearch && matchStatus && matchService;
  });

  const activeFilters = (statusFilter !== 'All' ? 1 : 0) + (serviceFilter !== 'All' ? 1 : 0);
  const attention = buildAttentionItems({ engines: clientEngines, parts: mockParts, limit: 6 });

  const [dismissedAttentionIds, setDismissedAttentionIds] = useState<string[]>([]);
  const [showEngineCards, setShowEngineCards] = useState(false);

  useLayoutEffect(() => {
    if (!user?.email) {
      setDismissedAttentionIds([]);
      return;
    }
    try {
      const raw = sessionStorage.getItem(attentionStorageKey(user.email));
      setDismissedAttentionIds(raw ? JSON.parse(raw) : []);
    } catch {
      setDismissedAttentionIds([]);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    sessionStorage.setItem(attentionStorageKey(user.email), JSON.stringify(dismissedAttentionIds));
  }, [dismissedAttentionIds, user?.email]);

  const visibleAttention = useMemo(
    () => attention.filter((i) => !dismissedAttentionIds.includes(i.id)),
    [attention, dismissedAttentionIds]
  );

  useEffect(() => {
    const onScroll = () => {
      // Show engine section once user moves away from the welcome viewport,
      // and restore welcome state when they return to the top.
      setShowEngineCards(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dismissAttention = useCallback((id: string) => {
    setDismissedAttentionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const dismissAllAttention = useCallback(() => {
    setDismissedAttentionIds((prev) => {
      const s = new Set([...prev, ...attention.map((a) => a.id)]);
      return Array.from(s);
    });
  }, [attention]);

  const heroStats = useMemo(() => {
    const inTransit = clientEngines.filter(e => e.status === 'In Transit').length;
    const inRepair = clientEngines.filter(e => ['In Repair', 'Disassembly', 'Inspection'].includes(e.status)).length;
    const inStorage = clientEngines.filter(e => ['In Storage', 'Preservation Active'].includes(e.status)).length;
    const disassembly = clientEngines.filter(e => e.status === 'Disassembly').length;
    return [{ label: 'Total Engines', value: clientEngines.length },  { label: 'In Transit', value: inTransit }, { label: 'Disassembly', value: disassembly }, { label: 'In Repair', value: inRepair }, { label: 'In Storage', value: inStorage }];
  }, [clientEngines]);

  const activeTab =
    searchParams.get('tab') === 'calendar'
      ? 'calendar'
      : searchParams.get('tab') === 'analytics'
      ? 'analytics'
      : searchParams.get('tab') === 'notifications'
      ? 'notifications'
      : 'dashboard';

  return (
    <AppLayout>
      <div className="w-full">
        {activeTab === 'calendar' && (
          <div className="rounded-2xl border border-white/50 bg-white/[0.03] backdrop-blur-2xl p-5">
            <InlineCalendar />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="rounded-2xl border border-white/80 bg-white/[0.03] backdrop-blur-2xl p-5">
            <InlineAnalytics />
          </div>
        )}

        {activeTab === 'notifications' && (
          <GeneralNotificationsPanel onClose={() => navigate('/dashboard')} />
        )}

        {/* Landing / Hero (new UI) */}
        {activeTab === 'dashboard' && (
        <>
        {!showEngineCards && visibleAttention.length > 0 && (
          <AttentionBannerStack
            items={visibleAttention}
            onDismiss={dismissAttention}
            onDismissAll={dismissAllAttention}
          />
        )}

        <div className="min-h-[calc(100vh-240px)] flex flex-col items-center justify-center text-center pt-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="w-full max-w-5xl"
          >
            <div className="text-[11px] tracking-[0.2em] uppercase text-white/80 font-semibold mb-4">
              SPI Aviation
            </div>
            <h1 className="font-heading text-white leading-[1.05] tracking-[-0.01em] mb-2 text-[clamp(44px,6vw,78px)]">
              <span className="block">Welcome back,</span>
              <span className="block">{user?.name?.split(' ')[0] ?? 'Client'}</span>
            </h1>
<br></br>

            <div className="flex flex-wrap sm:flex-nowrap justify-center gap-2 sm:gap-3 mb-10 w-full max-w-[1100px] mx-auto">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="relative rounded-[14px] bg-[#111113] border border-white/10 px-4 py-4 sm:px-5 sm:py-5 min-w-[100px] sm:min-w-[118px] flex-shrink-0 text-left overflow-visible"
                  onPointerMove={(e) => {
                    const el = e.currentTarget;
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    el.style.setProperty('--mx', `${x}px`);
                    el.style.setProperty('--my', `${y}px`);
                  }}
                  onPointerLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.setProperty('--mx', '-100px');
                    el.style.setProperty('--my', '-100px');
                  }}
                  style={{
                    // @ts-expect-error CSS vars
                    '--mx': '-100px',
                    '--my': '-100px',
                  }}
                >
                  <div className="pointer-events-none absolute -inset-[3px] rounded-[17px] -z-10"
                    style={{
                      background:
                        'radial-gradient(150px circle at var(--mx) var(--my), rgba(245,192,0,0.8) 0%, rgba(245,192,0,0.3) 25%, rgba(245,192,0,0.05) 50%, transparent 70%)',
                    }}
                  />
                  <div className="pointer-events-none absolute -inset-[8px] rounded-[22px] -z-20 blur-[8px]"
                    style={{
                      background:
                        'radial-gradient(200px circle at var(--mx) var(--my), rgba(245,192,0,0.15) 0%, rgba(245,192,0,0.05) 35%, transparent 65%)',
                    }}
                  />
                  <div className="text-[11px] uppercase tracking-[0.15em] text-white/80 mb-2">
                    {s.label}
                  </div>
                  <div className="font-heading text-[clamp(28px,4.2vw,40px)] leading-none text-white">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="px-7 py-3.5 rounded-full font-semibold text-[14px] bg-[#F5C000] text-[#0a0a0b] hover:bg-[#ffc800] transition-transform hover:scale-[1.02]"
                onClick={() => {
                  setShowEngineCards(true);
                  window.setTimeout(() => {
                    enginesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }}
              >
                View My Engines <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="px-7 py-3.5 rounded-full font-semibold text-[14px] border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition-colors"
                onClick={() => navigate('/help')}
              >
                Contact KAM
              </button>
            </div>
          </motion.div>
        </div>

        {/* Spacer so the dashboard can be scrolled naturally (engine grid/search appears after scroll). */}
        <div aria-hidden className="h-[50px]" />

            {showEngineCards && (
              <>
                {/* Search & Filters */}
                <div ref={enginesSectionRef} className="flex items-center gap-3 mt-4 mb-6 scroll-mt-28">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by ESN, Work Order, or Client..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.06] focus:ring-2 focus:ring-[#F5C000]/20 outline-none font-body transition-all text-sm text-white placeholder:text-white/80"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all border ${
                      showFilters || activeFilters > 0
                        ? 'bg-[#F5C000] text-[#0a0a0b] border-transparent'
                        : 'bg-white/[0.05] text-white/80 hover:text-white border-white/10'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFilters > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl p-5 mb-6 border border-white/10 bg-white/[0.03] backdrop-blur-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-semibold text-sm text-white">Filter Engines</h3>
                      {activeFilters > 0 && (
                        <button
                          onClick={() => { setStatusFilter('All'); setServiceFilter('All'); }}
                          className="text-xs text-[#F5C000] hover:underline flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Clear all
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-medium mb-2 block text-white/80">Status</label>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setStatusFilter(opt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === opt
                                  ? 'bg-[#F5C000] text-[#0a0a0b]'
                                  : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.1]'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-2 block text-white/80">Service Type</label>
                        <div className="flex flex-wrap gap-2">
                          {serviceOptions.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setServiceFilter(opt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                serviceFilter === opt
                                  ? 'bg-[#F5C000] text-[#0a0a0b]'
                                  : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.1]'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {showEngineCards && (
              <>
                {/* Engine Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
                  {filtered.map((engine, i) => (
                    <EngineCard key={engine.id} engine={engine} index={i} />
                  ))}
                  {filtered.length === 0 && (
                    <div className="col-span-full text-center py-16 text-white/80">
                      <p className="text-lg font-heading text-white">No engines found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </>
            )}
        </>
        )}
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
