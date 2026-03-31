import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockEngines, mockShipments, mockParts, mockFinancials, getPhases, Part } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import PartLifecycleDialog from '@/components/PartLifecycleDialog';
import AppLayout from '@/components/AppLayout';
import { Tooltip as RadixTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Package, Truck, Settings, Wrench, FileText, DollarSign, BarChart3, Clock, MapPin, Plane, Ship, Car } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { getEngineHealth, getEngineStory } from '@/lib/engineIntelligence';

const allTabs = [
  { id: 'overview', label: 'Overview', icon: Package },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'service', label: 'Service Process', icon: Settings },
  { id: 'parts', label: 'Parts', icon: Wrench },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
];

const CHART_STYLE = { background: 'rgba(10, 14, 26, 0)', border: '1px solid rgba(255, 255, 255, 0)', borderRadius: '12px', fontFamily: 'Inter', fontSize: '12px', color: '#9ca3af' };

const EngineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [partsFilter, setPartsFilter] = useState<'all' | 'Scrap' | 'Repair' | 'Sell'>('all');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);

  const engine = mockEngines.find(e => `${e.workOrder}-${e.esn}` === id);
  if (!engine) return <div className="min-h-screen flex items-center justify-center font-heading text-primary">Engine not found</div>;

  const shipments = mockShipments.filter(s => s.engineId === engine.id);
  const parts = mockParts.filter(p => p.engineId === engine.id);
  const financial = mockFinancials.find(f => f.engineId === engine.id);
  const phases = getPhases(engine.serviceType);
  const isLeaseStorage = engine.serviceType === 'Lease Storage';
  const tabs = isLeaseStorage ? allTabs.filter(t => t.id !== 'parts') : allTabs;
  const currentPhaseIndex = phases.indexOf(engine.currentPhase);
  const health = getEngineHealth(engine);
  const story = getEngineStory(engine);
  const todayPct =
    typeof story.timelineProgress === "number"
      ? Math.min(100, Math.max(0, story.timelineProgress))
      : 0;

  const filteredParts = partsFilter === 'all' ? parts : parts.filter(p => p.category === partsFilter);
  const scrapCount = parts.filter(p => p.category === 'Scrap').length;
  const repairCount = parts.filter(p => p.category === 'Repair').length;
  const sellCount = parts.filter(p => p.category === 'Sell').length;
  const llpCount = parts.filter(p => p.llpStatus === 'LLP').length;

  

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Engine Story */}
            <div className="glass-card-glow p-6 rounded-2xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">Engine Story</h3>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    Entry → Today → Completion (decision-focused timeline)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold ${
                      health.score >= 80
                        ? 'bg-success/15 text-success border border-success/25'
                        : health.score >= 70
                        ? 'bg-warning/15 text-warning border border-warning/25'
                        : 'bg-destructive/15 text-destructive border border-destructive/25'
                    }`}
                  >
                    Health {health.score}/100
                  </span>
                  <span className="text-[11px] font-body text-muted-foreground bg-white/5 px-3 py-1.5 rounded-xl border border-border/30">
                    {health.driver}
                  </span>
                </div>
              </div>

              <div className="relative pt-3 pb-4">
                <div className="absolute left-0 right-0 top-4 h-1.5 rounded-full bg-muted" />
                <motion.div
                  className="absolute left-0 top-4 h-1.5 rounded-full progress-glow"
                  style={{
                    width: `${Math.min(100, Math.max(0, story.timelineProgress ?? 0))}%`,
                  }}
                  initial={{ scaleX: 0.7 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6 }}
                />

                {/* Markers */}
                <div className="absolute top-0 left-0 -translate-x-0.5 text-[10px] font-body text-muted-foreground">
                  Entry
                </div>
                <div
                  className="absolute top-0 -translate-x-1/2 text-[10px] font-body text-muted-foreground whitespace-nowrap"
                  style={{ left: `${todayPct}%` }}
                >
                  Today
                </div>
                <div className="absolute top-0 right-0 translate-x-0.5 text-[10px] font-body text-muted-foreground">
                  Completion
                </div>

                {/* You are here pulse */}
                <motion.div
                  className={`absolute top-3 -translate-x-1/2 w-4 h-4 rounded-full ${
                    health.isAtRisk ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ left: `${todayPct}%` }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-border/30 rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground">Entry</p>
                  <p className="text-sm font-heading font-semibold text-foreground mt-1">
                    {engine.inductionDate}
                  </p>
                </div>
                <div className="bg-white/5 border border-border/30 rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground">Today</p>
                  <p className="text-sm font-heading font-semibold text-foreground mt-1">
                    {engine.lastUpdated}
                  </p>
                </div>
                <div className="bg-white/5 border border-border/30 rounded-xl p-4">
                  <p className="text-xs font-body text-muted-foreground">Completion</p>
                  <p className="text-sm font-heading font-semibold text-foreground mt-1">
                    {engine.expectedCompletion}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-xs font-body text-muted-foreground">
                  Elapsed vs planned:{' '}
                  <span className="font-heading text-foreground">
                    {typeof story.elapsedDays === 'number' ? story.elapsedDays : '-'} /{' '}
                    {typeof story.plannedDays === 'number' ? story.plannedDays : '-'} days
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  {typeof story.dueInDays === 'number' ? (
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold ${
                        story.isOverdue ? 'bg-destructive/15 text-destructive border border-destructive/25' : 'bg-warning/15 text-warning border border-warning/25'
                      }`}
                    >
                      {story.isOverdue
                        ? `Overdue by ${Math.abs(story.dueInDays)} days`
                        : `Due in ${story.dueInDays} days`}
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full text-xs font-heading font-semibold bg-white/5 text-muted-foreground border border-border/30">
                      Due date unavailable
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Engine Model', value: engine.model },
                { label: 'ESN', value: engine.esn },
                { label: 'Work Order', value: engine.workOrder },
                { label: 'Client', value: engine.clientName },
                { label: 'Induction Date', value: engine.inductionDate },
                { label: 'Expected Completion', value: engine.expectedCompletion },
                { label: 'Current Phase', value: engine.currentPhase },
                { label: 'Service Type', value: engine.serviceType },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 rounded-xl">
                  <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-heading text-sm font-semibold text-foreground">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="glass-card-glow p-6 rounded-2xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-6">Lifecycle Timeline</h3>
              <div className="relative">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
                  <div className="absolute top-4 left-0 h-0.5 progress-glow" style={{ width: `${(currentPhaseIndex / (phases.length - 1)) * 100}%` }} />
                  {phases.map((phase, i) => (
                    <div key={phase} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / phases.length}%` }}>
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
                        }`}
                      >
                        {i + 1}
                      </motion.div>
                      <p className={`mt-2 text-xs font-body text-center ${i <= currentPhaseIndex ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        {phase}
                      </p>
                      {i === currentPhaseIndex && (
                        <p className="mt-1 text-[10px] font-body text-destructive/90">You are here</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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

      case 'parts':
        return (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'Scrap', 'Repair', 'Sell'] as const).map(f => (
                <button key={f} onClick={() => setPartsFilter(f)} className={`px-4 py-2 rounded-xl font-heading text-xs font-semibold transition-all ${partsFilter === f ? 'btn-primary' : 'btn-secondary'}`}>
                  {f === 'all' ? `All (${parts.length})` : `${f} (${parts.filter(p => p.category === f).length})`}
                </button>
              ))}
            </div>
            <div className="glass-card-glow rounded-2xl overflow-hidden">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border/50 bg-white/3">
                    <th className="text-left py-3 px-4 font-heading text-xs font-semibold text-muted-foreground">Part #</th>
                    <th className="text-left py-3 px-4 font-heading text-xs font-semibold text-muted-foreground">Serial</th>
                    <th className="text-left py-3 px-4 font-heading text-xs font-semibold text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-heading text-xs font-semibold text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 font-heading text-xs font-semibold text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.slice(0, 20).map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/20 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        {p.category === 'Scrap' ? (
                          <TooltipProvider>
                            <RadixTooltip>
                              <TooltipTrigger asChild>
                                <span className="text-muted-foreground/60 cursor-not-allowed">{p.partNumber}</span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white border-border text-foreground">
                                <p className="text-xs">Scrap parts have no further lifecycle</p>
                              </TooltipContent>
                            </RadixTooltip>
                          </TooltipProvider>
                        ) : (
                          <button onClick={() => { setSelectedPart(p); setIsPartDialogOpen(true); }} className="text-primary font-semibold hover:underline cursor-pointer text-left">
                            {p.partNumber}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-foreground/80">{p.serialNumber}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.category === 'Scrap' ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                          : p.category === 'Repair' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          : 'bg-green-500/15 text-green-400 border border-green-500/25'
                        }`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{p.currentLocation}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {p.category === 'Repair' && `Cost: $${p.repairCost?.toLocaleString()}`}
                        {p.category === 'Sell' && `$${p.price?.toLocaleString()} • ${p.saleStatus}`}
                        {p.category === 'Scrap' && p.scrapReason}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredParts.length > 20 && (
                <p className="text-center text-xs text-muted-foreground py-4 font-body">Showing 20 of {filteredParts.length} parts</p>
              )}
            </div>
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

      case 'analysis': {
        const pieData = [
          { name: 'Scrap', value: scrapCount, color: '#ef4444' },
          { name: 'Repair', value: repairCount, color: '#f59e0b' },
          { name: 'Sell', value: sellCount, color: '#10b981' },
        ];
        const revenueData = [
          { name: 'Parts Sold', value: financial ? financial.totalRevenue / 1000 : 0 },
          { name: 'Repair Costs', value: financial ? financial.repairCost / 1000 : 0 },
          { name: 'Logistics', value: financial ? financial.logisticsCost / 1000 : 0 },
          { name: 'Net Revenue', value: financial ? financial.netPayable / 1000 : 0 },
        ];
        const storageLine = Array.from({ length: 12 }, (_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
          cost: engine.serviceType === 'Lease Storage' ? (i + 1) * 4500 : 0,
        }));
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card-glow p-6 rounded-2xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Parts Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <RechartsTooltip contentStyle={CHART_STYLE} />
                  <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card-glow p-6 rounded-2xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Revenue Breakdown ($K)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 210, 230, 0)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsla(221, 9.80%, 50.00%, 0.00)', fontFamily: 'Inter', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsla(221, 9.80%, 50.00%, 0.00)', fontFamily: 'Inter', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={CHART_STYLE} />
                  <Bar dataKey="value" fill="hsl(221,83%,53%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {engine.serviceType === 'Lease Storage' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card-glow p-6 rounded-2xl lg:col-span-2">
                <h3 className="font-heading text-sm font-bold text-foreground mb-4">Storage Cost Accumulation</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={storageLine}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,210,230,0.5)" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(220,10%,50%)', fontFamily: 'Inter', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(220,10%,50%)', fontFamily: 'Inter', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={CHART_STYLE} />
                    <Line type="monotone" dataKey="cost" stroke="hsl(221,83%,53%)" strokeWidth={2.5} dot={{ fill: 'hsl(221,83%,53%)', r: 4, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card-glow p-6 rounded-2xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Engine Lifecycle Progress</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(220,15%,90%)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none" stroke="hsl(221,83%,53%)"
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - engine.progress / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatedCounter target={engine.progress} suffix="%" className="font-heading text-2xl font-bold text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      }

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
                  engine.status === 'In Transit' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : engine.status === 'Completed' ? 'bg-primary/15 text-primary border border-primary/25'
                  : 'bg-blue-500/15 text-blue-900 border border-blue-500/25'
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

        <PartLifecycleDialog part={selectedPart} open={isPartDialogOpen} onOpenChange={setIsPartDialogOpen} />
      </div>
    </AppLayout>
  );
};

export default EngineDetail;

