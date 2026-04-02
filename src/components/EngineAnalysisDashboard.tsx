import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Package,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { Engine, FinancialSummary, Part, Shipment } from '@/data/mockData';
import type { EngineHealth } from '@/lib/engineIntelligence';
import { getEngineStory } from '@/lib/engineIntelligence';
import { cn } from '@/lib/utils';

const CHART = {
  background: 'rgba(10, 14, 26, 0.92)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  fontSize: 11,
  color: '#9ca3af',
};

type Story = ReturnType<typeof getEngineStory>;

type Props = {
  engine: Engine;
  parts: Part[];
  financial: FinancialSummary | undefined;
  shipments: Shipment[];
  phases: string[];
  currentPhaseIndex: number;
  health: EngineHealth;
  story: Story;
};

const fmtMoney = (n: number) => {
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

const SectionInsight = ({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'success' | 'warning' }) => (
  <p
    className={cn(
      'text-sm font-body mt-4 pl-4 border-l-2 py-0.5',
      tone === 'success' && 'border-success text-success/90',
      tone === 'warning' && 'border-warning text-warning/90',
      tone === 'neutral' && 'border-primary/60 text-muted-foreground'
    )}
  >
    {children}
  </p>
);

const SmallRing = ({ pct, label, sub }: { pct: number; label: string; sub?: string }) => {
  const r = 36;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, pct) / 100);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-[88px] h-[88px]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#F5C000"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={off}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-lg font-bold text-foreground">{Math.round(pct)}%</span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground mt-1 max-w-[100px] leading-tight">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground/80 mt-0.5">{sub}</span>}
    </div>
  );
};

export function EngineAnalysisDashboard({ engine, parts, financial, shipments, phases, currentPhaseIndex, health, story }: Props) {
  const [riskOpen, setRiskOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);

  const sellParts = useMemo(() => parts.filter((p) => p.category === 'Sell'), [parts]);
  const scrapParts = useMemo(() => parts.filter((p) => p.category === 'Scrap'), [parts]);
  const repairParts = useMemo(() => parts.filter((p) => p.category === 'Repair'), [parts]);
  const soldParts = useMemo(() => sellParts.filter((p) => p.saleStatus === 'Sold'), [sellParts]);
  const availParts = useMemo(() => sellParts.filter((p) => p.saleStatus === 'Available'), [sellParts]);

  const totalRevenue = financial?.totalRevenue ?? soldParts.reduce((s, p) => s + (p.price ?? 0), 0);
  const netRealised = financial?.netPayable ?? totalRevenue * 0.82;
  const estimatedTarget = Math.max(netRealised * 1.14, totalRevenue * 1.08, 1);
  const valueProgress = Math.min(100, Math.round((netRealised / estimatedTarget) * 100));
  const unsoldValue = availParts.reduce((s, p) => s + (p.price ?? 0), 0);
  const priorUnsoldMock = unsoldValue * 0.92;
  const unsoldDeltaPct = priorUnsoldMock > 0 ? Math.round(((unsoldValue - priorUnsoldMock) / priorUnsoldMock) * 100) : 0;

  const repairSpend = financial?.repairCost ?? repairParts.reduce((s, p) => s + (p.repairCost ?? 0), 0);
  const repairValueGained = Math.round(repairSpend * 1.35);
  const scrapRecovery = scrapParts.length * 1800;

  const revenueSparkline = useMemo(() => {
    const base = totalRevenue / 1e6;
    return [
      { i: 'M1', v: base * 0.45 },
      { i: 'M2', v: base * 0.52 },
      { i: 'M3', v: base * 0.61 },
      { i: 'M4', v: base * 0.78 },
      { i: 'M5', v: base * 0.88 },
      { i: 'M6', v: base },
    ];
  }, [totalRevenue]);

  const moduleScrapStack = useMemo(
    () => [
      {
        name: 'Modules',
        core: Math.max(1, Math.round(scrapParts.length * 0.25)),
        fan: Math.max(1, Math.round(scrapParts.length * 0.2)),
        lpt: Math.max(1, Math.round(scrapParts.length * 0.15)),
        acc: Math.max(1, scrapParts.length - Math.round(scrapParts.length * 0.6)),
      },
    ],
    [scrapParts.length]
  );

  const revenueSplitDonut = useMemo(() => {
    const llp = soldParts.filter((p) => p.llpStatus === 'LLP').reduce((s, p) => s + (p.price ?? 0), 0);
    const non = soldParts.filter((p) => p.llpStatus !== 'LLP').reduce((s, p) => s + (p.price ?? 0), 0);
    const other = Math.max(1, totalRevenue * 0.08);
    if (llp + non < 1)
      return [
        { name: 'Sold (est.)', value: Math.max(1, totalRevenue * 0.4), color: '#a855f7' },
        { name: 'Pipeline', value: Math.max(1, totalRevenue * 0.35), color: '#38bdf8' },
        { name: 'Other', value: other, color: '#34d399' },
      ];
    return [
      { name: 'LLP', value: llp, color: '#a855f7' },
      { name: 'Non-LLP', value: non, color: '#38bdf8' },
      { name: 'Fees / adj.', value: other, color: '#34d399' },
    ];
  }, [soldParts, totalRevenue]);

  const phaseIdx = currentPhaseIndex >= 0 ? currentPhaseIndex : 0;
  const phaseComplete = phaseIdx;
  const pipelineRingLabel = `${Math.min(phaseComplete + 1, phases.length)} / ${phases.length}`;

  const partsStack = useMemo(
    () => [
      {
        name: 'Mix',
        repair: repairParts.length,
        sold: soldParts.length,
        storage: availParts.length,
        scrap: scrapParts.length,
      },
    ],
    [repairParts.length, soldParts.length, availParts.length, scrapParts.length]
  );

  const repairPartsSpend = repairParts.reduce((s, p) => s + (p.repairCost ?? 0), 0);
  const storageUtil = Math.min(96, 48 + Math.round(engine.progress * 0.38));

  const tatTrend = useMemo(
    () =>
      ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((w, i) => ({
        w,
        days: 120 + i * 8 + (i === 3 ? 22 : 0),
      })),
    []
  );

  const tatByPhase = [
    { phase: 'Transit', days: 18, max: 28 },
    { phase: 'Teardown', days: 34, max: 42 },
    { phase: 'Repair', days: 41, max: 55 },
    { phase: 'Sales', days: 22, max: 40 },
  ];

  const daysToSellLlp =
    availParts.filter((p) => p.llpStatus === 'LLP').length > 0
      ? 58 + (engine.esn.length % 12)
      : 0;
  const daysToSellNon =
    availParts.filter((p) => p.llpStatus !== 'LLP').length > 0
      ? 74 + (engine.model.length % 18)
      : 0;

  const agedRows = useMemo(
    () =>
      availParts.slice(0, 12).map((p, i) => ({
        pn: p.partNumber,
        days: 94 + i * 11 + (p.partNumber.length % 17),
        value: p.price ?? 0,
      })),
    [availParts]
  );

  const vendorYield = [
    { vendor: 'Shop A', yield: 88 },
    { vendor: 'Shop B', yield: 76 },
    { vendor: 'GEM in-house', yield: 93 },
  ];

  const scrapDonuts = [
    { label: engine.model, scrap: 12, srv: 88 },
    { label: 'Fleet avg.', scrap: 18, srv: 82 },
  ];

  const openCompliance = 3;
  const missingPartsCount = Math.min(8, Math.max(3, Math.round(parts.length * 0.04)));

  const insightMoney =
    repairSpend > 0 && repairValueGained > repairSpend
      ? `Repair ROI looks ${Math.round(((repairValueGained - repairSpend) / repairSpend) * 100)}% ahead of spend — strong recovery vs cost.`
      : 'Revenue mix is weighted toward sellable pool — monitor unsold depth vs programme end date.';

  const llpFaster =
    daysToSellLlp > 0 && daysToSellNon > 0 && daysToSellLlp < daysToSellNon
      ? `LLP parts are selling ~${Math.round(((daysToSellNon - daysToSellLlp) / daysToSellNon) * 100)}% faster than non-LLP in this engine.`
      : 'Align LLP releases with buyer campaigns to compress days-to-sell.';

  return (
    <div className="space-y-8">
      {/* Row 1 — Engine summary strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent p-5 md:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Engine</p>
              <p className="font-heading text-xl font-bold text-foreground">{engine.esn}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{engine.model}</p>
            </div>
            <span
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-heading font-semibold border',
                engine.status === 'In Transit' && 'bg-amber-500/15 text-amber-200 border-amber-400/35',
                engine.status === 'Completed' && 'bg-emerald-500/15 text-emerald-200 border-emerald-400/35',
                !['In Transit', 'Completed'].includes(engine.status) && 'bg-sky-500/15 text-sky-200 border-sky-400/35'
              )}
            >
              {engine.status}
            </span>
          </div>

          <div className="flex-1 min-w-[200px] max-w-xl">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
              <span>Lifecycle progress</span>
              <span className="font-semibold text-foreground">{engine.progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${engine.progress}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Value vs expected</p>
              <p className="font-heading text-lg font-bold text-foreground">{fmtMoney(netRealised)}</p>
              <p className="text-xs text-muted-foreground">of {fmtMoney(estimatedTarget)} est.</p>
            </div>
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 border',
                health.isAtRisk ? 'bg-destructive/15 border-destructive/40 text-destructive' : 'bg-success/10 border-success/30 text-success'
              )}
            >
              <AlertTriangle className={cn('w-4 h-4', !health.isAtRisk && 'opacity-40')} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide">{health.isAtRisk ? 'Risk elevated' : 'Risk stable'}</p>
                <p className="text-[10px] opacity-90">{health.driver}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 2 — Money */}
      <section>
        <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Portfolio value &amp; revenue
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/5 p-6 min-h-[200px]">
            <div className="absolute inset-0 opacity-[0.35] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sparkE" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F5C000" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#F5C000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#F5C000" fill="url(#sparkE)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="relative">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total revenue</p>
              <p className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">{fmtMoney(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-2">Programme recognised (mock trend behind)</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-4">Estimated vs realised</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Realised (net)</span>
                  <span className="text-foreground font-semibold">{fmtMoney(netRealised)}</span>
                </div>
                <div className="h-4 rounded-full bg-white/15 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${valueProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-primary to-amber-400"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>0</span>
                  <span>Stretch target {fmtMoney(estimatedTarget)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Executive bullet: fill = realised net vs stretch target band for this work order.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Unsold inventory</p>
            <p className="font-heading text-3xl font-bold text-foreground mt-2">{fmtMoney(unsoldValue)}</p>
            <div
              className={cn(
                'mt-3 inline-flex items-center gap-1.5 text-sm font-semibold',
                unsoldDeltaPct <= 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {unsoldDeltaPct <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {unsoldDeltaPct <= 0 ? 'Down' : 'Up'} {Math.abs(unsoldDeltaPct)}% vs prior snapshot
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
          <div className="rounded-2xl border border-white/10 p-4 xl:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Scrap recovery value (by module group)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moduleScrapStack} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={72} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={CHART} />
                <Bar dataKey="core" stackId="s" fill="#ef4444" name="Core" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fan" stackId="s" fill="#f59e0b" name="Fan" radius={[0, 0, 0, 0]} />
                <Bar dataKey="lpt" stackId="s" fill="#eab308" name="LPT" radius={[0, 0, 0, 0]} />
                <Bar dataKey="acc" stackId="s" fill="#64748b" name="Accessories" radius={[0, 4, 4, 0]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-muted-foreground mt-1">Units = scrap disposition count proxy. Booked recovery ≈ {fmtMoney(scrapRecovery)}.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Repair ROI</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={[{ name: 'Engine', cost: repairSpend / 1e6, gain: repairValueGained / 1e6 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={CHART} formatter={(v: number) => [`$${v.toFixed(2)}M`]} />
                  <Bar dataKey="cost" fill="#f59e0b" name="Repair cost" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gain" fill="#34d399" name="Value gained" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Revenue split</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={revenueSplitDonut} innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {revenueSplitDonut.map((e, i) => (
                      <Cell key={i} fill={e.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART} formatter={(v: number) => fmtMoney(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <SectionInsight tone="success">{insightMoney}</SectionInsight>
      </section>

      {/* Row 3 — Pipeline */}
      <section>
        <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Pipeline &amp; programme status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-3">Programme phases</p>
            <div className="relative w-[140px] h-[140px]">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F5C000"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(1, (phaseComplete + 1) / phases.length))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-heading text-2xl font-bold text-foreground">{pipelineRingLabel}</span>
                <span className="text-[10px] text-muted-foreground">phases</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">Active: {engine.currentPhase}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4 xl:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Parts breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={partsStack} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={48} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={CHART} />
                <Bar dataKey="repair" stackId="p" fill="#f59e0b" name="In repair" />
                <Bar dataKey="sold" stackId="p" fill="#34d399" name="Sold" />
                <Bar dataKey="storage" stackId="p" fill="#38bdf8" name="In storage (avail.)" />
                <Bar dataKey="scrap" stackId="p" fill="#ef4444" name="Scrap" radius={[0, 4, 4, 0]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Parts in repair</p>
              <p className="font-heading text-2xl font-bold text-foreground mt-1">{repairParts.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total repair spend</p>
              <p className="font-heading text-xl font-bold text-foreground mt-1">{fmtMoney(repairPartsSpend)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Storage utilisation</p>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-primary transition-all" style={{ width: `${storageUtil}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{storageUtil}% FTZ capacity used (alloc. to this WO)</p>
            </div>
          </div>
        </div>
        <SectionInsight>
          {`Shipments on file: ${shipments.length} leg(s). Programme pacing at ${engine.progress}% vs calendar.`}{' '}
          {typeof story.dueInDays === 'number' &&
            (story.isOverdue
              ? `Schedule is behind by ~${Math.abs(story.dueInDays)} days.`
              : `~${story.dueInDays} days to expected completion.`)}
        </SectionInsight>
      </section>

      {/* Row 4 — TAT */}
      <section>
        <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-primary">⏱</span>
          Turnaround time &amp; speed
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Avg end-to-end TAT (trend)</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={tatTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="w" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={CHART} />
                <Line type="monotone" dataKey="days" stroke="#F5C000" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">TAT by phase</p>
            <div className="space-y-3">
              {tatByPhase.map((row) => (
                <div key={row.phase}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{row.phase}</span>
                    <span className="text-muted-foreground">
                      {row.days} / {row.max} days
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-primary/90" style={{ width: `${Math.min(100, (row.days / row.max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-6 mb-2">On-time performance</p>
            <div className="flex flex-wrap gap-6 justify-around">
              <SmallRing pct={88} label="Transit" sub="✅" />
              <SmallRing pct={64} label="Repair" sub="⚠️" />
              <SmallRing pct={91} label="Sales" sub="✅" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Days to sell (available)</p>
            <div className="space-y-2">
              {daysToSellLlp > 0 && (
                <div>
                  <div className="flex justify-between text-xs">
                    <span>LLP</span>
                    <span>{daysToSellLlp} d est.</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 mt-1">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min(100, (daysToSellLlp / 90) * 100)}%` }} />
                  </div>
                </div>
              )}
              {daysToSellNon > 0 && (
                <div>
                  <div className="flex justify-between text-xs">
                    <span>Non-LLP</span>
                    <span>{daysToSellNon} d est.</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 mt-1">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(100, (daysToSellNon / 90) * 100)}%` }} />
                  </div>
                </div>
              )}
              {daysToSellLlp === 0 && daysToSellNon === 0 && (
                <p className="text-sm text-muted-foreground">No open sell lines for this engine in mock data.</p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-destructive/10">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">Aged inventory (&gt;90d)</p>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-muted-foreground border-b border-white/10">
                    <th className="px-4 py-2">Part</th>
                    <th className="px-2 py-2">Days</th>
                    <th className="px-4 py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {agedRows.map((r) => (
                    <tr key={r.pn} className={cn('border-b border-white/5', r.days > 90 && 'bg-destructive/10')}>
                      <td className="px-4 py-2 font-mono text-xs">{r.pn}</td>
                      <td className="px-2 py-2">{r.days}</td>
                      <td className="px-4 py-2 text-right">{fmtMoney(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <SectionInsight tone="warning">{llpFaster}</SectionInsight>
      </section>

      {/* Row 5 — Quality */}
      <section>
        <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Quality &amp; compliance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 p-6 flex flex-col items-center">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Records completeness</p>
            <SmallRing pct={92} label="Digital pack" />
          </div>
          <div className="rounded-2xl border border-white/10 p-4 xl:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Repair yield by vendor</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vendorYield}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="vendor" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis domain={[60, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={CHART} formatter={(v: number) => [`${v}%`, 'Yield']} />
                <Bar dataKey="yield" fill="hsl(213,94%,68%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-white/10 p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scrap rate vs serviceable</p>
            <div className="flex gap-4 justify-center">
              {scrapDonuts.map((d) => (
                <div key={d.label} className="text-center">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Scrap', value: d.scrap },
                          { name: 'Srv', value: d.srv },
                        ]}
                        innerRadius={28}
                        outerRadius={40}
                        dataKey="value"
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#34d399" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-muted-foreground">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden">
          <button
            type="button"
            onClick={() => setComplianceOpen(!complianceOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="font-heading text-sm font-bold text-foreground">Compliance issues — {openCompliance} open</span>
            {complianceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {complianceOpen && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-3 space-y-2 text-sm text-muted-foreground border-t border-white/10"
              >
                <li>EASA dual-release pending on hot section lot HS-{engine.esn.slice(-3)}</li>
                <li>Borescope index page mismatch vs evercore ref EC-8821</li>
                <li>LLP cycle sheet missing cycle count for one sell line</li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <SectionInsight>
          Scrap rate for {engine.model} is below fleet average in this mock — good serviceable retention for resale.
        </SectionInsight>
      </section>

      {/* Row 6 — Risk */}
      <section className="pb-2">
        <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          Risk &amp; exposure
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setRiskOpen(!riskOpen)}
            className={cn(
              'rounded-2xl border p-5 text-left transition-colors',
              health.isAtRisk ? 'border-destructive/50 bg-destructive/15' : 'border-white/10 bg-white/[0.03]'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-destructive">This engine</p>
                <p className="font-heading text-2xl font-bold text-foreground mt-1">{health.isAtRisk ? 'At risk' : 'Nominal'}</p>
                <p className="text-xs text-muted-foreground mt-2">{health.driver} · score {health.score}</p>
              </div>
              {riskOpen ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
            </div>
          </button>
          <div className="rounded-2xl border border-white/10 p-4 lg:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Repair spend outstanding by vendor</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={vendorYield.map((v) => ({ ...v, outstanding: (repairSpend / 3 / 1e6) * (1 - v.yield / 100) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="vendor" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={CHART} formatter={(v: number) => `$${v.toFixed(2)}M`} />
                <Bar dataKey="outstanding" fill="#f97316" name="Outstanding" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl border border-warning/30 overflow-hidden">
            <div className="px-4 py-2 bg-warning/10 border-b border-white/10">
              <p className="text-xs font-bold uppercase tracking-wide text-warning">Storage risk — days before SLA penalty</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  { bin: 'Zone A', days: 14 },
                  { bin: 'Climate vault', days: 41 },
                  { bin: 'Quarantine hold', days: 6 },
                ].map((r) => (
                  <tr key={r.bin} className="border-b border-white/5">
                    <td className="px-4 py-2">{r.bin}</td>
                    <td className={cn('px-4 py-2 text-right font-semibold', r.days < 12 && 'text-destructive')}>{r.days} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Overdue repairs — vendor delay (days)</p>
            <div className="space-y-2">
              {[
                { v: 'Shop B', d: 12 },
                { v: 'Vendor X', d: 4 },
                { v: 'GEM in-house', d: 0 },
              ].map((row) => (
                <div key={row.v}>
                  <div className="flex justify-between text-xs">
                    <span>{row.v}</span>
                    <span className={row.d > 7 ? 'text-destructive font-semibold' : ''}>{row.d}d</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 mt-1">
                    <div className={cn('h-full rounded-full', row.d > 7 ? 'bg-destructive' : 'bg-muted')} style={{ width: `${Math.min(100, row.d * 8)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-destructive">Missing parts</p>
            <p className="font-heading text-2xl font-bold text-foreground mt-1">{missingPartsCount}</p>
            <p className="text-xs text-muted-foreground">Tagged discrepancies awaiting inbound / teardown trace</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 max-w-md">
            <li>PN trace: seek borescope kit inserts + 1 LLP back-to-birth folder</li>
          </ul>
        </div>
        <SectionInsight tone="warning">
          {health.isAtRisk
            ? `${health.driver}: prioritise recovery plan this week to protect net payable and client SLA.`
            : 'Risk within tolerance; keep watching repair vendor backlog and aged sell lines.'}
        </SectionInsight>
      </section>
    </div>
  );
}
