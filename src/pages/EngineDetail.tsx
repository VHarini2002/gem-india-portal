import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockEngines, mockShipments, mockParts, mockFinancials, getPhases, Part } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft, Package, Truck, Settings, FileText, DollarSign, Clock, MapPin, Plane, Ship, Car, LayoutDashboard } from 'lucide-react';
import { EngineAnalysisDashboard } from '@/components/EngineAnalysisDashboard';
import { getEngineHealth, getEngineStory } from '@/lib/engineIntelligence';

const allTabs = [
  { id: 'overview', label: 'Overview', icon: Package },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'service', label: 'Service Process', icon: Settings },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'analysis', label: 'Engine Analysis', icon: LayoutDashboard },
  { id: 'financial', label: 'Financial', icon: DollarSign },
];

const CHART_STYLE = { background: 'rgba(10, 14, 26, 0)', border: '1px solid rgba(255, 255, 255, 0)', borderRadius: '12px', fontFamily: 'Inter', fontSize: '12px', color: '#9ca3af' };

const EngineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const engine = mockEngines.find(e => `${e.workOrder}-${e.esn}` === id);

  const phaseMeta = useMemo(() => {
    if (!engine) return [] as { phase: string; plannedStart: number; plannedEnd: number; delayed: boolean }[];
    const phases = getPhases(engine.serviceType);
    const currentPhaseIndex = phases.indexOf(engine.currentPhase);
    const story = getEngineStory(engine);
    return phases.map((phase, index) => {
      const plannedDays = story.plannedDays ?? phases.length * 10;
      const perPhase = plannedDays / Math.max(1, phases.length);
      const plannedStart = index * perPhase;
      const plannedEnd = (index + 1) * perPhase;
      const elapsed = story.elapsedDays ?? 0;
      const delayed = elapsed > plannedEnd + 5 && index >= currentPhaseIndex;
      return { phase, plannedStart, plannedEnd, delayed };
    });
  }, [engine]);

  if (!engine) return <div className="min-h-screen flex items-center justify-center font-heading text-primary">Engine not found</div>;

  const shipments = mockShipments.filter(s => s.engineId === engine.id);
  const parts = mockParts.filter(p => p.engineId === engine.id);
  const financial = mockFinancials.find(f => f.engineId === engine.id);
  const phases = getPhases(engine.serviceType);
  const isLeaseStorage = engine.serviceType === 'Lease Storage';
  const tabs = allTabs;
  const currentPhaseIndex = phases.indexOf(engine.currentPhase);
  const health = getEngineHealth(engine);
  const story = getEngineStory(engine);
  const todayPct =
    typeof story.timelineProgress === "number"
      ? Math.min(100, Math.max(0, story.timelineProgress))
      : 0;

  const scrapCount = parts.filter(p => p.category === 'Scrap').length;
  const repairCount = parts.filter(p => p.category === 'Repair').length;
  const sellCount = parts.filter(p => p.category === 'Sell').length;
  const llpCount = parts.filter(p => p.llpStatus === 'LLP').length;

  const sellParts = parts.filter(p => p.category === 'Sell');
  const saleReadyParts = sellParts.filter(p => p.saleStatus === 'Available');
  const totalRecoveredValue = sellParts.reduce((sum, p) => sum + (p.price ?? 0), 0);
  const saleReadyValue = saleReadyParts.reduce((sum, p) => sum + (p.price ?? 0), 0);
  const totalPartsCount = parts.length || 1;
  const yieldPct = ((sellCount + repairCount) / totalPartsCount) * 100;
  const scrapPct = (scrapCount / totalPartsCount) * 100;
  const topValueParts = [...sellParts]
    .filter(p => typeof p.price === 'number')
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, 3);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="glass-card-glow p-6 rounded-2xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-6">Lifecycle Timeline</h3>
              <div className="relative">
                <div className="relative pt-1 pb-2 px-6">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
                  <div
                    className="absolute top-4 left-0 h-0.5 progress-glow"
                    style={{ width: `${(currentPhaseIndex / (phases.length - 1)) * 100}%` }}
                  />

                  <div className="relative h-[86px]">
                    {phaseMeta.map(({ phase, delayed }, i) => {
                      const isClickable = delayed || i === currentPhaseIndex;
                      const leftPct = phases.length > 1 ? (i / (phases.length - 1)) * 100 : 0;
                      return (
                        <div
                          key={phase}
                          className="absolute top-0 flex flex-col items-center"
                          style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold ${
                              i === currentPhaseIndex
                                ? health.isAtRisk
                                  ? 'bg-destructive text-white shadow-sm animate-pulse'
                                  : 'bg-primary text-white shadow-sm'
                                : i <= currentPhaseIndex
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-muted text-muted-foreground'
                            } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => {
                              if (!isClickable) return;
                              setExpandedPhase(expandedPhase === phase ? null : phase);
                            }}
                          >
                            {i + 1}
                          </motion.div>
                          <p className={`mt-2 text-xs font-body text-center whitespace-nowrap ${i <= currentPhaseIndex ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                            {phase}
                          </p>
                          {i === currentPhaseIndex && (
                            <p className="mt-1 text-[10px] font-body text-destructive/90 whitespace-nowrap">You are here</p>
                          )}

                          {isClickable && expandedPhase === phase && (
                            <div className="mt-2 w-[220px] text-left text-[11px] font-body bg-white/5 border border-border/40 rounded-xl p-3 shadow-lg">
                              <p className="text-muted-foreground">
                                {delayed
                                  ? 'This phase is running longer than planned. Consider escalation.'
                                  : i < currentPhaseIndex
                                  ? 'Completed on time.'
                                  : 'On-track vs current plan.'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-body text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_0_1px_rgba(255,255,255,0.10)]" /> On track
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_0_1px_rgba(255,255,255,0.10)]" /> At risk / delayed
                  </span>
                </div>
                {typeof story.dueInDays === 'number' && (
                  <p>
                    Predicted completion:{" "}
                    <span className="font-semibold text-foreground">
                      {story.isOverdue
                        ? `slipping by ~${Math.abs(story.dueInDays)} days`
                        : `on track (due in ~${story.dueInDays} days)`}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Induction Date', value: engine.inductionDate },
                { label: 'Expected Completion', value: engine.expectedCompletion },
                { label: 'Work Order', value: engine.workOrder },
                { label: 'Service Type', value: engine.serviceType },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 rounded-xl">
                  <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-heading text-sm font-semibold text-foreground">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {engine.status === 'In Transit' && (
              <div className="glass-card-glow p-6 rounded-2xl">
                <h3 className="font-heading text-sm font-bold text-warning mb-3">ETA Progress</h3>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${engine.progress}%` }} transition={{ duration: 1.5 }} className="h-full rounded-full bg-gradient-to-r from-warning to-primary" />
                </div>
                <p className="font-body text-sm text-muted-foreground mt-2">{engine.progress}% of estimated transit completed</p>
              </div>
            )}
          </div>
        );

      case 'logistics':
        return (
          <div className="space-y-4">
            {shipments.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-glow p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-heading text-sm font-bold text-primary">{s.shipmentId}</p>
                    <p className="font-body text-xs text-muted-foreground">{s.carrier}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground bg-white/5 px-2.5 py-1 rounded-lg">
                    {s.mode === 'Air' && <Plane className="w-3 h-3" />}
                    {s.mode === 'Sea' && <Ship className="w-3 h-3" />}
                    {s.mode === 'Road' && <Car className="w-3 h-3" />}
                    {s.mode}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'From', value: s.fromLocation },
                    { label: 'To', value: s.toLocation },
                    { label: 'Dispatch', value: s.dispatchDate },
                    { label: 'ETA', value: s.eta },
                  ].map(item => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-2.5">
                      <p className="text-xs text-muted-foreground font-body">{item.label}</p>
                      <p className="text-sm font-body font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs font-body text-muted-foreground">{s.currentPosition}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.etaCompleted}%` }} transition={{ duration: 1 }} className="h-full rounded-full progress-glow" />
                  </div>
                  <span className="text-xs text-primary font-heading font-semibold">{s.etaCompleted}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'service':
        return (
          <div className="space-y-4">
            {engine.serviceType === 'Lease Storage' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Previous Lessee', value: 'SkyWays Airlines' },
                  { label: 'Storage Days', value: '198' },
                  { label: 'Cost Per Day', value: '$150' },
                  { label: 'Total Accrued', value: '$29,700' },
                  { label: 'Warehouse Bay', value: 'Bay-C14' },
                  { label: 'Preservation', value: 'Active' },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-2xl">
                    <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-heading text-lg font-bold text-primary">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            )}
            {engine.serviceType === 'Teardown & Return' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Disassembly %', value: '72%' },
                  { label: 'Modules Removed', value: '14' },
                  { label: 'Expected Return', value: engine.expectedCompletion },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-2xl">
                    <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-heading text-lg font-bold text-foreground">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            )}
            {engine.serviceType === 'Teardown, Repair & Sell' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Parts', value: parts.length, color: 'text-foreground' },
                  { label: 'Scrap', value: scrapCount, color: 'text-destructive' },
                  { label: 'Repairable', value: repairCount, color: 'text-warning' },
                  { label: 'Sellable', value: sellCount, color: 'text-success' },
                  { label: 'LLP Parts', value: llpCount, color: 'text-primary' },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-2xl">
                    <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                    <AnimatedCounter target={item.value} className={`font-heading text-2xl font-bold ${item.color}`} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Engine Documents', 'Logistics Documents', 'Part Certifications', 'Repair Reports', 'Financial Documents'].map((cat, i) => (
              <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-glow p-5 rounded-2xl">
                <h4 className="font-heading text-sm font-bold text-foreground mb-3">{cat}</h4>
                <div className="space-y-2">
                  {[`${cat.split(' ')[0]}_Report_${engine.esn}.pdf`, `${cat.split(' ')[0]}_Summary_${engine.workOrder}.pdf`, `${cat.split(' ')[0]}_Certificate.pdf`].map(doc => (
                    <div key={doc} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors border border-border/30">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-body text-foreground truncate">{doc}</span>
                      </div>
                      <button className="btn-secondary py-1 px-3 text-xs rounded-lg flex-shrink-0">View</button>
                    </div>
                  ))}
                </div>
                <button className="mt-3 btn-secondary py-2 px-4 text-xs w-full rounded-xl">Upload Document</button>
              </motion.div>
            ))}
          </div>
        );

      case 'analysis':
        return (
          <EngineAnalysisDashboard
            engine={engine}
            parts={parts}
            financial={financial}
            shipments={shipments}
            phases={phases}
            currentPhaseIndex={currentPhaseIndex}
            health={health}
            story={story}
          />
        );

      case 'financial':
        if (isLeaseStorage) {
          const storageDays = 198;
          const costPerDay = 150;
          const totalStorage = storageDays * costPerDay;
          const logCost = 12000;
          const storageItems = [
            { label: 'Storage Days', value: storageDays, prefix: '', color: 'text-primary' },
            { label: 'Cost Per Day', value: costPerDay, prefix: '$', color: 'text-foreground' },
            { label: 'Total Storage Cost', value: totalStorage, prefix: '$', color: 'text-warning' },
            { label: 'Logistics Cost', value: logCost, prefix: '$', color: 'text-foreground' },
            { label: 'Total Accrued', value: totalStorage + logCost, prefix: '$', color: 'text-success' },
            { label: 'Payment Status', value: 0, prefix: '', color: 'text-warning' },
          ];
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {storageItems.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-2xl">
                  <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                  {item.label === 'Payment Status' ? (
                    <p className={`font-heading text-lg font-bold mt-1 ${item.color}`}>Pending</p>
                  ) : (
                    <AnimatedCounter target={item.value} prefix={item.prefix} className={`font-heading text-xl font-bold ${item.color}`} />
                  )}
                </motion.div>
              ))}
            </div>
          );
        }
        if (!financial) return <p className="text-muted-foreground font-body">No financial data available.</p>;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: financial.totalRevenue, prefix: '$', color: 'text-success' },
              { label: 'Repair Cost', value: financial.repairCost, prefix: '$', color: 'text-warning' },
              { label: 'Logistics Cost', value: financial.logisticsCost, prefix: '$', color: 'text-foreground' },
              { label: 'Storage Cost', value: financial.storageCost, prefix: '$', color: 'text-primary' },
              { label: 'Commission %', value: financial.commissionPercent, suffix: '%', color: 'text-foreground' },
              { label: 'Commission Amount', value: financial.commissionAmount, prefix: '$', color: 'text-foreground' },
              { label: 'Net Payable', value: financial.netPayable, prefix: '$', color: 'text-success' },
              { label: 'Payment Status', value: 0, color: financial.paymentStatus === 'Paid' ? 'text-success' : 'text-warning' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-2xl">
                <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                {item.label === 'Payment Status' ? (
                  <p className={`font-heading text-lg font-bold mt-1 ${item.color}`}>{financial.paymentStatus}</p>
                ) : (
                  <AnimatedCounter target={item.value} prefix={item.prefix} suffix={item.suffix} className={`font-heading text-xl font-bold ${item.color}`} />
                )}
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="page-wrapper min-h-screen">
        <header className="sticky top-0 z-30 glass-header rounded-2xl">
          <div className="max-w-8xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="h-5 w-px bg-border" />
              <h1 className="font-heading text-base font-bold text-foreground">GEM India</h1>
            </div>
            <span className="font-body text-sm text-foreground/70 hidden sm:block">{user?.name}</span>
          </div>
        </header>

        <div className="max-w-8xl mx-auto px-6 pt-6 pb-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-glow p-6 rounded-2xl mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">{engine.esn}</h2>
                <p className="font-body text-muted-foreground text-sm mt-1">{engine.model} • {engine.workOrder} • {engine.clientName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold ${
                  engine.status === 'In Transit' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                  : engine.status === 'Completed' ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                  : 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                }`}>{engine.status}</span>
                <div className="flex items-center gap-1.5 text-sm font-body text-muted-foreground bg-white/5 px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5" />{engine.lastUpdated}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="glass-card flex gap-1 p-1.5 rounded-2xl mb-6 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-gray-900 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === t.id ? 'bg-primary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </AppLayout>
  );
};

export default EngineDetail;

