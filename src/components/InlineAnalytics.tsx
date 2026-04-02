import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ClipboardCheck,
  Wrench,
  Warehouse,
  FileText,
  Globe,
  Tag,
  Boxes,
  Truck,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Thermometer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { mockEngines, mockFinancials, mockParts, mockShipments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CHART_STYLE = {
  background: 'rgba(10, 14, 26, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  fontFamily: 'Inter',
  fontSize: '11px',
  color: '#9ca3af',
};

const WAREHOUSE_GALLERY_SRC = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556388158-158e896b76e4?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524143986877-618d2c17fcc9?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1590288488595-7b3149098d9c?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1510906005288-2ae5ec995d3a?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80&auto=format&fit=crop',
] as const;

type TabKey =
  | 'assessmentLogistics'
  | 'teardown'
  | 'cleaningTagging'
  | 'repair'
  | 'warehouse'
  | 'technicalRecords'
  | 'globalSales';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'assessmentLogistics', label: 'Assessment & Logistics', icon: ClipboardCheck },
  { key: 'teardown', label: 'Teardown & Dismantling', icon: Boxes },
  { key: 'cleaningTagging', label: 'Parts Cleaning & Tagging', icon: Tag },
  { key: 'repair', label: 'Repair Management', icon: Wrench },
  { key: 'warehouse', label: 'Warehouse', icon: Warehouse },
  { key: 'technicalRecords', label: 'Technical Records', icon: FileText },
  { key: 'globalSales', label: 'Global Parts Sales', icon: Globe },
];

const InlineAnalytics = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('assessmentLogistics');

  const accessibleEngines = user?.role === 'client'
    ? mockEngines.filter(e => e.clientEmail === user.email)
    : mockEngines;

  const [selectedEngineId, setSelectedEngineId] = useState<string>('all');

  const engines = useMemo(() => {
    if (selectedEngineId === 'all') return accessibleEngines;
    return accessibleEngines.filter((e) => e.id === selectedEngineId);
  }, [accessibleEngines, selectedEngineId]);

  const engineIds = useMemo(() => new Set(engines.map((e) => e.id)), [engines]);
  const parts = useMemo(() => mockParts.filter((p) => engineIds.has(p.engineId)), [engineIds]);
  const financials = useMemo(() => mockFinancials.filter((f) => engineIds.has(f.engineId)), [engineIds]);
  const shipments = useMemo(() => mockShipments.filter((s) => engineIds.has(s.engineId)), [engineIds]);

  const totalRevenue = financials.reduce((s, f) => s + f.totalRevenue, 0);
  const avgProgress = Math.round(engines.reduce((s, e) => s + e.progress, 0) / (engines.length || 1));

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const formatCompactMoney = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${Math.round(n).toLocaleString()}`;
  };

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
  };

  const AnimatedNumber = ({
    target,
    format,
    durationMs = 900,
    className = '',
  }: {
    target: number;
    format: (n: number) => string;
    durationMs?: number;
    className?: string;
  }) => {
    const [val, setVal] = useState(0);

    useEffect(() => {
      let raf = 0;
      const start = performance.now();
      const from = 0;
      const tick = (t: number) => {
        const p = clamp((t - start) / durationMs, 0, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(from + (target - from) * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [target, durationMs]);

    return <span className={className}>{format(val)}</span>;
  };

  const Gauge = ({ value, label }: { value: number; label: string }) => {
    const pct = clamp(value, 0, 100);
    const radius = 44;
    const stroke = 10;
    const r = radius;
    const c = 2 * Math.PI * r;
    const targetOffset = c * (1 - pct / 100);

    return (
      <div className="relative w-full h-[220px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-[190px] h-[190px]">
            <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} fill="transparent" />
            <motion.circle
              cx="60"
              cy="60"
              r={r}
              stroke="#F5C000"
              strokeWidth={stroke}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: targetOffset }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </svg>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-heading text-4xl font-bold text-white leading-none">
            {Math.round(pct)}%
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center max-w-[180px]">{label}</div>
        </div>
      </div>
    );
  };

  const BigRing = ({ value, label, size = 220 }: { value: number; label: string; size?: number }) => {
    const pct = clamp(value, 0, 100);
    const stroke = 14;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const targetOffset = c * (1 - pct / 100);
    const cx = size / 2;
    const cy = size / 2;
    return (
      <div className="flex flex-col items-center">
        <div className="relative mx-auto" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <motion.circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#F5C000"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: targetOffset }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold text-foreground leading-none">{Math.round(pct)}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3 max-w-[220px]">{label}</p>
      </div>
    );
  };

  const scrapCount = parts.filter((p) => p.category === 'Scrap').length;
  const serviceableCount = parts.filter((p) => p.category !== 'Scrap').length;
  const sellThroughPct = useMemo(() => {
    const sold = parts.filter((p) => p.saleStatus === 'Sold').length;
    const av = parts.filter((p) => p.saleStatus === 'Available').length;
    return Math.round((sold / Math.max(1, sold + av)) * 100);
  }, [parts]);
  const repairPartsCount = parts.filter((p) => p.category === 'Repair').length;
  const repairCostTotalAggregate = parts
    .filter((p) => p.category === 'Repair')
    .reduce((s, p) => s + (p.repairCost ?? 0), 0);
  const storageUtilPct = Math.min(96, 54 + engines.length * 3);
  const recordsLineData = useMemo(
    () => [
      { name: 'W1', score: 84 },
      { name: 'W2', score: 87 },
      { name: 'W3', score: 90 },
      { name: 'W4', score: 92 },
    ],
    []
  );

  const leadLogisticsShipment = useMemo(() => {
    if (!shipments.length) return null;
    return [...shipments].sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime())[0];
  }, [shipments]);

  const leadLogisticsEngine = useMemo(() => {
    if (!leadLogisticsShipment) return engines[0] ?? null;
    return engines.find((e) => e.id === leadLogisticsShipment.engineId) ?? engines[0] ?? null;
  }, [engines, leadLogisticsShipment]);

  const etaHoursToArrival = useMemo(() => {
    if (!leadLogisticsShipment) return 0;
    return Math.max(0, Math.ceil((new Date(leadLogisticsShipment.eta).getTime() - Date.now()) / (1000 * 60 * 60)));
  }, [leadLogisticsShipment]);

  const avgLegCompletion = useMemo(() => {
    if (!shipments.length) return 0;
    return Math.round(shipments.reduce((s, x) => s + x.etaCompleted, 0) / shipments.length);
  }, [shipments]);

  const assessmentLifecycleStages = useMemo(() => {
    const n = engines.length || 1;
    const pickupPct = Math.min(100, Math.round((engines.filter((e) => e.progress > 0).length / n) * 100));
    const transitPct = Math.min(100, Math.round((engines.filter((e) => e.status === 'In Transit').length / n) * 100) + 12);
    const arrivalPct = Math.min(
      100,
      Math.round(
        (engines.filter((e) =>
          ['Disassembly', 'Inspection', 'In Repair', 'In Storage', 'Completed', 'Ready for Release', 'Preservation Active'].includes(e.status)
        ).length / n) * 100
      )
    );
    const inspectPct = Math.min(
      100,
      Math.round(
        (engines.filter((e) => ['Inspection', 'In Repair', 'In Storage', 'Completed', 'Ready for Release'].includes(e.status)).length / n) * 100
      )
    );
    let current = 0;
    if (engines.some((e) => e.status === 'Inspection')) current = 3;
    else if (engines.some((e) => e.status === 'Disassembly')) current = 2;
    else if (engines.some((e) => e.status === 'In Transit')) current = 1;
    else current = 0;
    return [
      { label: 'Pickup', pct: pickupPct, current: current === 0, Icon: Package },
      { label: 'Transit', pct: transitPct, current: current === 1, Icon: Truck },
      { label: 'Arrival', pct: arrivalPct, current: current === 2, Icon: MapPin },
      { label: 'Inspection', pct: inspectPct, current: current === 3, Icon: ClipboardCheck },
    ];
  }, [engines]);

  const damageAnalysisStack = useMemo(() => {
    const base = Math.max(40, Math.floor(parts.length * 0.03));
    const severe = Math.max(2, Math.round(base * 0.15));
    const moderate = Math.max(6, Math.round(base * 0.35));
    const minor = Math.max(10, base - severe - moderate);
    return [{ name: 'Fleet', severe, moderate, minor }];
  }, [parts.length]);

  const teardownTatTrend = useMemo(
    () =>
      ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((w, i) => ({
        week: w,
        planned: 11 + i,
        actual: i === 3 ? 18 : 10 + i + (i % 2),
      })),
    []
  );

  const taggedPartsShare = useMemo(() => {
    const tagged = parts.filter((p) => p.stockLocation || p.saleStatus === 'Available' || p.saleStatus === 'Sold').length;
    return parts.length ? Math.round((tagged / parts.length) * 100) : 0;
  }, [parts]);

  const scrapValueNum = useMemo(
    () => parts.filter((p) => p.category === 'Scrap').length * 1800,
    [parts]
  );

  const usmValueNum = useMemo(() => {
    const sell = parts.filter((p) => p.category === 'Sell');
    return Math.round(sell.reduce((s, p) => s + (p.price ?? 0), 0) * 1.12);
  }, [parts]);

  const missingPartsRows = useMemo(() => {
    const n = Math.min(10, Math.max(4, Math.round(parts.length * 0.015) || 4));
    return Array.from({ length: n }, (_, i) => ({
      pn: `PN-73${480 + i * 11}${i}`,
      engine: engines[i % Math.max(1, engines.length)]?.esn ?? '—',
      status: i < 2 ? 'Critical shortage' : 'Awaiting tag',
      daysOpen: 12 + i * 7,
      highlight: i < 3,
    }));
  }, [parts.length, engines]);

  const repairTatBars = useMemo(() => {
    const r = parts.filter((p) => p.category === 'Repair').slice(0, 8);
    return r.map((p, i) => ({
      id: p.id,
      label: p.partNumber.slice(0, 12),
      days: 14 + (i * 3) % 21,
      max: 35,
    }));
  }, [parts]);

  const postRepairByEngine = useMemo(
    () =>
      financials.map((f) => {
        const eng = engines.find((e) => e.id === f.engineId);
        return {
          name: eng?.esn.split('-')[1] || f.engineId,
          repair: +(f.repairCost / 1e6).toFixed(2),
          postValue: +((f.repairCost * 2.1) / 1e6).toFixed(2),
        };
      }),
    [financials, engines]
  );

  const envLogTrend = useMemo(
    () =>
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
        day: d,
        temp: 21 + (i % 3),
        hum: 48 + (i % 4) * 2,
      })),
    []
  );

  const revenueTrendMonths = useMemo(() => {
    const m = totalRevenue / 1e6;
    return ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, i) => ({
      month,
      revenue: +(m * (0.55 + i * 0.08)).toFixed(2),
    }));
  }, [totalRevenue]);

  const llpStackedByEngine = useMemo(
    () =>
      financials.slice(0, 8).map((f) => {
        const eng = engines.find((e) => e.id === f.engineId);
        const engParts = parts.filter((p) => p.engineId === f.engineId && p.saleStatus === 'Sold');
        const llp = engParts.filter((p) => p.llpStatus === 'LLP').reduce((s, p) => s + (p.price ?? 0), 0);
        const non = engParts.filter((p) => p.llpStatus !== 'LLP').reduce((s, p) => s + (p.price ?? 0), 0);
        return {
          name: eng?.esn.split('-')[1] ?? '?',
          llp: +(llp / 1e6).toFixed(2),
          nonLlp: +(non / 1e6).toFixed(2),
        };
      }),
    [financials, engines, parts]
  );

  const unsoldOver90Rows = useMemo(() => {
    const avail = parts.filter((p) => p.saleStatus === 'Available');
    return avail.slice(0, 14).map((p, i) => ({
      pn: p.partNumber,
      engine: engines.find((e) => e.id === p.engineId)?.esn ?? '—',
      days: 92 + (i * 17) % 120,
      value: p.price ?? 0,
      flag: (p.price ?? 0) > 50000,
    }));
  }, [parts, engines]);

  const warehousePendingPickups = useMemo(() => {
    const sold = parts.filter((p) => p.saleStatus === 'Sold');
    const lots = Math.max(1, Math.round(sold.length * 0.08));
    const val = sold.reduce((s, p) => s + (p.price ?? 0), 0) * 0.08;
    return { lots, value: Math.round(val) };
  }, [parts]);

  const surpriseFlagCount = useMemo(() => Math.max(1, Math.round(engines.filter((e) => e.serviceType !== 'Lease Storage').length * 0.15)), [engines]);

  const delayInsight = useMemo<{ tone: 'danger' | 'warning' | 'success'; title: string }>(() => {
    const transitEngineIds = new Set(engines.filter((e) => e.status === 'In Transit').map((e) => e.id));
    const transitShipments = shipments.filter((s) => transitEngineIds.has(s.engineId));
    const minCompletion = transitShipments.length ? Math.min(...transitShipments.map((s) => s.etaCompleted)) : 100;
    const delayed = transitShipments.some((s) => s.etaCompleted < 65);
    return {
      tone: delayed ? 'danger' : minCompletion < 75 ? 'warning' : 'success',
      title: delayed ? 'Delay detected in transit' : 'Transit is within expected window',
    };
  }, [engines, shipments]);

  const repairInsight = useMemo<{ tone: 'danger' | 'warning' | 'success'; title: string }>(() => {
    const repairParts = parts.filter((p) => p.category === 'Repair');
    const repairCostTotal = repairParts.reduce((s, p) => s + (p.repairCost ?? 0), 0);
    const revenueBase = totalRevenue > 0 ? totalRevenue : 1;
    const ratio = repairCostTotal / revenueBase;
    const rising = ratio > 0.18;
    return {
      tone: rising ? 'warning' : 'success',
      title: rising ? 'Repair cost rising' : 'Repair cost stable',
    };
  }, [parts, totalRevenue]);

  const salesInsight = useMemo<{ tone: 'danger' | 'warning' | 'success'; title: string }>(() => {
    const sold = parts.filter((p) => p.saleStatus === 'Sold').length;
    const available = parts.filter((p) => p.saleStatus === 'Available').length;
    const sellThrough = Math.round((sold / Math.max(1, sold + available)) * 100);
    const good = sellThrough >= 45;
    return {
      tone: good ? 'success' : 'warning',
      title: good ? 'Sales performing well' : 'Sales under target',
    };
  }, [parts]);

  const riskInsightsForTab = useMemo(() => {
    const transitCt = engines.filter((e) => e.status === 'In Transit').length;
    const disasmCt = engines.filter((e) => ['Disassembly', 'Inspection'].includes(e.status)).length;
    const scrapShare = parts.length ? (parts.filter((p) => p.category === 'Scrap').length / parts.length) * 100 : 0;
    const util = Math.min(96, 54 + engines.length * 3);
    const availableCt = parts.filter((p) => p.saleStatus === 'Available').length;
    const pendingPay = financials.filter((f) => f.paymentStatus === 'Pending').length;

    switch (activeTab) {
      case 'assessmentLogistics':
        return [
          { tone: delayInsight.tone, title: delayInsight.title, subtitle: 'Monitor transit ETA and linked dispatch milestones.' },
          {
            tone: (transitCt > 2 ? 'warning' : 'success') as const,
            title: transitCt > 2 ? 'Elevated inbound volume' : 'Inbound flow steady',
            subtitle: `${transitCt} engine(s) currently in transit.`,
          },
          { tone: 'success' as const, title: `${shipments.length} shipment legs tracked`, subtitle: 'Carrier milestones synced to this view.' },
        ];
      case 'teardown':
        return [
          {
            tone: (disasmCt > 0 ? 'warning' : 'success') as const,
            title: disasmCt > 0 ? 'Disassembly active' : 'No engines in disassembly',
            subtitle: 'Watch module sequencing and tooling readiness.',
          },
          { tone: 'success' as const, title: 'Pre-teardown pack aligned', subtitle: 'Borescope / records staged for gate review.' },
          { tone: 'warning' as const, title: 'Damage review queue', subtitle: 'Flagged modules awaiting engineering disposition.' },
        ];
      case 'cleaningTagging':
        return [
          {
            tone: (scrapShare > 20 ? 'warning' : 'success') as const,
            title: scrapShare > 20 ? 'Scrap mix elevated' : 'Scrap mix healthy',
            subtitle: 'Balance scrap vs serviceable for USM planning.',
          },
          { tone: 'success' as const, title: 'Tagging throughput OK', subtitle: 'Parts flowing through clean & tag stations.' },
          { tone: 'warning' as const, title: 'LLP cycle checks due', subtitle: 'Preliminary LLP counts pending sign-off.' },
        ];
      case 'repair':
        return [
          { tone: repairInsight.tone, title: repairInsight.title, subtitle: 'Repair spend vs revenue coverage.' },
          { tone: 'warning' as const, title: 'Vendor TAT watch', subtitle: 'Critical parts awaiting shop return.' },
          { tone: 'success' as const, title: 'Pre-emptive sales window', subtitle: 'Hot parts flagged for early market testing.' },
        ];
      case 'warehouse':
        return [
          {
            tone: (util > 85 ? 'warning' : 'success') as const,
            title: util > 85 ? 'Storage capacity tight' : 'Utilisation balanced',
            subtitle: `Current utilisation ${util}%.`,
          },
          { tone: 'success' as const, title: 'Environmental log OK', subtitle: 'Humidity / temperature within SLA.' },
          { tone: 'warning' as const, title: 'Collection lots pending', subtitle: 'Sold lots awaiting pickup windows.' },
        ];
      case 'technicalRecords':
        return [
          { tone: 'success' as const, title: 'Evercore link active', subtitle: 'Technical records bridge connected.' },
          { tone: 'warning' as const, title: 'Release pack pending', subtitle: 'Two documents awaiting KAM approval.' },
          { tone: 'success' as const, title: 'Audit trail intact', subtitle: 'Immutable log for regulated parts.' },
        ];
      case 'globalSales':
        return [
          { tone: salesInsight.tone, title: salesInsight.title, subtitle: 'Sell-through vs available inventory depth.' },
          {
            tone: (availableCt > 400 ? 'warning' : 'success') as const,
            title: 'Inventory depth',
            subtitle: `${availableCt.toLocaleString()} parts available for sale.`,
          },
          {
            tone: (pendingPay > 0 ? 'warning' : 'success') as const,
            title: pendingPay > 0 ? 'Settlements pending' : 'Payments current',
            subtitle: `${pendingPay} engine settlement(s) awaiting closure.`,
          },
        ];
      default:
        return [
          { tone: delayInsight.tone, title: delayInsight.title, subtitle: 'Transit and logistics signals.' },
          { tone: repairInsight.tone, title: repairInsight.title, subtitle: 'Repair spend signals.' },
          { tone: salesInsight.tone, title: salesInsight.title, subtitle: 'Sales and availability signals.' },
        ];
    }
  }, [activeTab, engines, parts, shipments.length, financials, delayInsight, repairInsight, salesInsight]);

  const RiskPillIcon = ({ tone }: { tone: 'danger' | 'warning' | 'success' }) => {
    const Icon = tone === 'danger' ? AlertTriangle : tone === 'warning' ? AlertCircle : ShieldCheck;
    const bg =
      tone === 'danger'
        ? 'bg-destructive/15 text-destructive'
        : tone === 'warning'
          ? 'bg-warning/15 text-warning'
          : 'bg-success/15 text-success';
    return (
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Analytics & Insights</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="w-3.5 h-3.5" />
            Engine
          </div>
          <div className="w-[220px]">
            <Select value={selectedEngineId} onValueChange={setSelectedEngineId}>
              <SelectTrigger className="h-9 rounded-xl bg-white/[0.03] border-white/10 text-xs">
                <SelectValue placeholder="Select engine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All engines</SelectItem>
                {accessibleEngines.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.esn} ({e.model})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/10 w-full overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-b from-[#f4d03f] to-[#d4af37] text-black shadow-lg shadow-amber-500/25 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Row 1–3: tab layouts + risk */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(272px,320px)] gap-5 items-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              role="tabpanel"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
            {activeTab === 'assessmentLogistics' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="glass-card-glow rounded-2xl p-5 border border-white/10 min-h-[168px] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,192,0,0.18),transparent_55%)]" />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        Current location
                      </div>
                      <p className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-tight">
                        {leadLogisticsEngine?.currentLocation ?? 'No active leg'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {leadLogisticsEngine?.esn ?? '—'} · {leadLogisticsShipment?.mode ?? '—'} · {leadLogisticsShipment?.carrier ?? '—'}
                      </p>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">Live track</span>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">
                          → {leadLogisticsShipment?.toLocation ?? 'Next hub'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="glass-card-glow rounded-2xl p-5 border border-warning/25 flex flex-col items-center justify-center text-center"
                  >
                    <Clock className="w-9 h-9 text-warning mb-2" />
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">ETA countdown</span>
                    <div className="font-heading text-[clamp(2.5rem,7vw,3.75rem)] font-bold text-foreground leading-none mt-2 flex items-baseline justify-center gap-1">
                      <AnimatedNumber
                        target={etaHoursToArrival}
                        format={(n) => `${Math.round(n)}`}
                        className="font-heading text-[clamp(2.5rem,7vw,3.75rem)] font-bold text-foreground"
                      />
                      <span className="text-lg font-semibold text-muted-foreground">hrs</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Arrival {leadLogisticsShipment ? formatShortDate(leadLogisticsShipment.eta) : '—'}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="glass-card-glow rounded-2xl p-5 border border-white/10 flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Shipment timeline
                    </div>
                    <div className="font-heading text-4xl font-bold text-foreground mb-3">{avgLegCompletion}%</div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${clamp(avgLegCompletion, 0, 100)}%` }}
                        transition={{ duration: 0.85, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Leg completion across active shipments</p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="glass-card-glow rounded-2xl p-6 md:p-8 border border-white/10"
                >
                  <h3 className="font-heading text-base font-bold text-foreground mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Lifecycle — Pickup → Transit → Arrival → Inspection
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {assessmentLifecycleStages.map((st) => {
                      const Icon = st.Icon;
                      return (
                        <div
                          key={st.label}
                          className={cn(
                            'rounded-2xl p-4 border transition-all duration-300',
                            st.current
                              ? 'border-primary ring-2 ring-primary/35 bg-primary/10 shadow-lg shadow-primary/10'
                              : 'border-white/10 bg-white/[0.04]'
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={cn(
                                'w-11 h-11 rounded-xl flex items-center justify-center',
                                st.current ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'
                              )}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            {st.current && (
                              <span className="text-[10px] font-bold uppercase text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-foreground">{st.label}</div>
                          <div className="font-heading text-2xl font-bold text-foreground mt-2">{st.pct}%</div>
                          <div className="text-[11px] text-muted-foreground mt-1">fleet at gate</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.18 }}
                    className="rounded-xl p-4 border border-destructive/35 bg-destructive/10"
                  >
                    <div className="text-[11px] font-bold text-destructive uppercase tracking-wide">Surprises vs expectation</div>
                    <div className="font-heading text-2xl font-bold text-foreground mt-1">{surpriseFlagCount} flags</div>
                    <p className="text-xs text-muted-foreground mt-2">Variance vs inbound plan</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.22 }}
                    className="rounded-xl p-4 border border-warning/35 bg-warning/10"
                  >
                    <div className="text-[11px] font-bold text-warning uppercase tracking-wide">Expectation</div>
                    <div className="font-heading text-xl font-bold text-foreground mt-1">{delayInsight.title}</div>
                    <p className="text-xs text-muted-foreground mt-2">Transit window signal</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Borescope delivery
                    </div>
                    <div className="font-heading text-3xl font-bold text-foreground">48</div>
                    <div className="text-sm text-muted-foreground">hours avg. to client</div>
                  </motion.div>
                </div>
              </>
            )}

            {activeTab === 'teardown' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-glow rounded-2xl p-8 border border-white/10 flex flex-col items-center justify-center"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-4 flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-primary" />
                      Disassembly progress
                    </div>
                    <BigRing value={Math.min(98, avgProgress)} label="Modules disassembled vs plan" size={220} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="glass-card-glow rounded-2xl p-6 border border-white/10 flex flex-col"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Parts inventoried
                    </div>
                    <div className="flex-1 min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: 'Inventoried',
                                value: Math.max(1, parts.filter((p) => p.stockLocation || p.saleStatus).length),
                              },
                              {
                                name: 'Open queue',
                                value: Math.max(
                                  1,
                                  parts.length -
                                    parts.filter((p) => p.stockLocation || p.saleStatus).length
                                ),
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={92}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            <Cell fill="hsl(213,94%,68%)" stroke="transparent" />
                            <Cell fill="rgba(255,255,255,0.12)" stroke="transparent" />
                          </Pie>
                          <Tooltip contentStyle={CHART_STYLE} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="glass-card-glow rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Damage analysis (fleet disposition)
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-4 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Severe
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-warning" /> Moderate
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-success" /> Minor
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={damageAnalysisStack} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} width={48} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="severe" stackId="d" fill="#ef4444" name="Severe" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="moderate" stackId="d" fill="#f59e0b" name="Moderate" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="minor" stackId="d" fill="#22c55e" name="Minor" radius={[0, 4, 4, 0]} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="glass-card rounded-2xl p-5 border border-white/10"
                >
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-4">TAT — planned vs actual (weeks)</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={teardownTatTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} name="Planned" />
                      <Line type="monotone" dataKey="actual" stroke="#F5C000" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </>
            )}

            {activeTab === 'cleaningTagging' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-glow rounded-2xl p-6 border border-white/10"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-4 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      Tagging complete
                    </div>
                    <div className="font-heading text-4xl font-bold text-foreground mb-3">{taggedPartsShare}%</div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${clamp(taggedPartsShare, 0, 100)}%` }}
                        transition={{ duration: 0.85, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Tagged / documented vs total in scope</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="glass-card-glow rounded-2xl p-6 border border-white/10"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">Scrap vs serviceable</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Scrap', value: scrapCount },
                            { name: 'Serviceable', value: Math.max(1, serviceableCount) },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={88}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#ef4444" stroke="transparent" />
                          <Cell fill="#48bb78" stroke="transparent" />
                        </Pie>
                        <Tooltip contentStyle={CHART_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card-glow rounded-2xl p-8 border border-destructive/25 bg-gradient-to-br from-destructive/10 to-transparent"
                  >
                    <div className="text-xs uppercase tracking-wide text-destructive font-bold mb-2">Scrap value crystallised</div>
                    <div className="font-heading text-3xl sm:text-4xl font-bold text-foreground">{formatCompactMoney(scrapValueNum)}</div>
                    <p className="text-xs text-muted-foreground mt-3">Booked scrap disposition (mock ledger)</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.14 }}
                    className="glass-card-glow rounded-2xl p-8 border border-success/25 bg-gradient-to-br from-success/10 to-transparent"
                  >
                    <div className="text-xs uppercase tracking-wide text-success font-bold mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Est. USM value
                    </div>
                    <div className="font-heading text-3xl sm:text-4xl font-bold text-foreground">{formatCompactMoney(usmValueNum)}</div>
                    <p className="text-xs text-muted-foreground mt-3">Sell pool uplift (sellable × 1.12)</p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="glass-card rounded-2xl border border-white/10 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span className="font-heading text-sm font-bold text-foreground">Missing parts</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-white/10">
                          <th className="px-5 py-3 font-medium">Part #</th>
                          <th className="px-3 py-3 font-medium">Engine</th>
                          <th className="px-3 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium text-right">Days open</th>
                        </tr>
                      </thead>
                      <tbody>
                        {missingPartsRows.map((row) => (
                          <tr
                            key={row.pn}
                            className={cn(
                              'border-b border-white/5 transition-colors',
                              row.highlight ? 'bg-warning/15 hover:bg-warning/20' : 'hover:bg-white/[0.03]'
                            )}
                          >
                            <td className="px-5 py-3 font-mono text-xs">{row.pn}</td>
                            <td className="px-3 py-3 text-muted-foreground">{row.engine}</td>
                            <td className="px-3 py-3">{row.status}</td>
                            <td className="px-5 py-3 text-right tabular-nums">{row.daysOpen}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}

            {activeTab === 'repair' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-glow rounded-2xl p-6 border border-white/10"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      Parts in repair
                    </div>
                    <div className="font-heading text-[clamp(2.5rem,6vw,3.5rem)] font-bold text-foreground">{repairPartsCount}</div>
                    <p className="text-xs text-muted-foreground mt-2">Active shop / vendor work orders</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass-card-glow rounded-2xl p-6 border border-amber-500/25 bg-amber-500/5"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      Repair cost (aggregate)
                    </div>
                    <div className="font-heading text-3xl font-bold text-foreground">{formatCompactMoney(repairCostTotalAggregate)}</div>
                    <p className="text-xs text-muted-foreground mt-2">Rolling cost for in-scope repairs</p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="glass-card-glow rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="font-heading text-sm font-bold text-foreground mb-4">Repair cost vs post-repair value ($M)</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={postRepairByEngine}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`$${v}M`]} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="repair" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Repair cost" />
                      <Bar dataKey="postValue" fill="#48bb78" radius={[4, 4, 0, 0]} name="Post-repair value" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="glass-card rounded-2xl p-5 border border-white/10"
                >
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-4">TAT per part (days)</div>
                  <div className="space-y-4">
                    {repairTatBars.length === 0 && (
                      <p className="text-sm text-muted-foreground">No parts in repair for this scope.</p>
                    )}
                    {repairTatBars.map((row, i) => (
                      <div key={row.id}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-foreground font-medium truncate pr-2">{row.label}</span>
                          <span className="text-muted-foreground tabular-nums">{row.days}d / {row.max}d</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${clamp((row.days / row.max) * 100, 0, 100)}%` }}
                            transition={{ duration: 0.7, delay: 0.05 * i, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-amber-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {activeTab === 'warehouse' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card-glow rounded-2xl p-6 border border-white/10 max-w-md"
                >
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-primary" />
                    Storage utilisation
                  </div>
                  <Gauge value={storageUtilPct} label="Capacity used vs target band" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="glass-card-glow rounded-2xl p-5 border border-white/10 overflow-hidden"
                >
                  <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Asset photo gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {engines.slice(0, 6).map((e, i) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.04 * i }}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-white/5"
                      >
                        <img
                          src={WAREHOUSE_GALLERY_SRC[i % WAREHOUSE_GALLERY_SRC.length]}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-[11px] font-semibold text-white drop-shadow-md">
                          {e.esn}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="xl:col-span-2 glass-card rounded-2xl p-5 border border-white/10"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-4 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-primary" />
                      Environment log (°C / RH %)
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={envLogTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={CHART_STYLE} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="temp" stroke="#F5C000" strokeWidth={2} dot={false} name="Temp °C" />
                        <Line type="monotone" dataKey="hum" stroke="#63b3ed" strokeWidth={2} dot={false} name="Humidity %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="glass-card-glow rounded-2xl p-6 border border-warning/25 flex flex-col justify-center"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-3">Pending pickups</div>
                    <div className="font-heading text-4xl font-bold text-foreground">{warehousePendingPickups.lots}</div>
                    <div className="text-sm text-muted-foreground mt-1">lots scheduled</div>
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Aggregate value</div>
                      <div className="font-heading text-2xl font-bold text-primary mt-1">
                        {formatCompactMoney(warehousePendingPickups.value)}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}

            {activeTab === 'technicalRecords' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-5 border border-white/10"
                  >
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Pack completeness</div>
                    <div className="font-heading text-3xl font-bold text-foreground mt-2">92%</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 }}
                    className="glass-card rounded-2xl p-5 border border-white/10"
                  >
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Engines in scope</div>
                    <div className="font-heading text-3xl font-bold text-foreground mt-2">{engines.length}</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="glass-card rounded-2xl p-5 border border-white/10"
                  >
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Evercore bridge</div>
                    <div className="font-heading text-xl font-bold text-success mt-2">Live</div>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="glass-card-glow rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="font-heading text-sm font-bold text-foreground mb-4">Records completeness trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={recordsLineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[70, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`${v}%`, 'Score']} />
                      <Line type="monotone" dataKey="score" stroke="#F5C000" strokeWidth={2} dot={{ r: 4, fill: '#F5C000' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-5 border border-white/10 flex flex-wrap gap-6 items-center justify-between"
                >
                  <div>
                    <div className="text-xs text-muted-foreground">Release pack</div>
                    <div className="text-sm font-semibold text-foreground mt-1">2 docs awaiting KAM approval</div>
                  </div>
                  <div className="text-xs text-muted-foreground max-w-md">
                    Supporting compliance: immutable audit trail for regulated parts; link mirrors Evercore workspace (placeholder).
                  </div>
                </motion.div>
              </>
            )}

            {activeTab === 'globalSales' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-glow rounded-2xl p-8 border border-primary/30 bg-gradient-to-br from-primary/15 via-transparent to-transparent"
                  >
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Revenue realised
                    </div>
                    <div className="font-heading text-[clamp(2.25rem,8vw,3.75rem)] font-bold text-foreground leading-none">
                      {formatCompactMoney(totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Programme-wide gross (selected scope)</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="glass-card-glow rounded-2xl p-8 border border-white/10 flex flex-col justify-center"
                  >
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      Sell-through rate
                    </div>
                    <div className="font-heading text-[clamp(2.25rem,8vw,3.25rem)] font-bold text-foreground">{sellThroughPct}%</div>
                    <div className="h-3 mt-6 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${clamp(sellThroughPct, 0, 100)}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-success to-emerald-300"
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="glass-card-glow rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="font-heading text-sm font-bold text-foreground mb-4">Revenue trend ($M)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueTrendMonths}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`$${v}M`]} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#F5C000"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#F5C000' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="font-heading text-sm font-bold text-foreground mb-4">LLP vs non-LLP sold value ($M)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={llpStackedByEngine}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`$${v}M`]} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="llp" stackId="s" fill="#a855f7" name="LLP" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="nonLlp" stackId="s" fill="hsl(213,94%,68%)" name="Non-LLP" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 }}
                  className="glass-card rounded-2xl border border-destructive/30 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2 bg-destructive/10">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="font-heading text-sm font-bold text-foreground">Unsold over 90 days</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-white/10">
                          <th className="px-5 py-3 font-medium">Part #</th>
                          <th className="px-3 py-3 font-medium">Engine</th>
                          <th className="px-3 py-3 font-medium">Days listed</th>
                          <th className="px-5 py-3 font-medium text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unsoldOver90Rows
                          .filter((r) => r.days > 90)
                          .map((row) => (
                            <tr
                              key={row.pn}
                              className={cn(
                                'border-b border-white/5',
                                row.flag ? 'bg-destructive/15' : 'hover:bg-white/[0.03]'
                              )}
                            >
                              <td className="px-5 py-3 font-mono text-xs">{row.pn}</td>
                              <td className="px-3 py-3 text-muted-foreground">{row.engine}</td>
                              <td className="px-3 py-3 tabular-nums">{row.days}</td>
                              <td className="px-5 py-3 text-right tabular-nums">{formatCompactMoney(row.value)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}

            </motion.div>
          </AnimatePresence>

          {/* ⚠️ Risk & Alert Panel (Right Side) */}
          <div className="lg:sticky lg:top-5 h-fit">
            <div className="glass-card-glow p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-foreground">⚠️ Risk & Alerts</h3>
                </div>
                <div className="text-xs text-muted-foreground text-right leading-tight">
                  AI Insights
                  <span className="block text-[10px] opacity-80 mt-0.5">{TABS.find((t) => t.key === activeTab)?.label}</span>
                </div>
              </div>

              <div className="space-y-3">
                {riskInsightsForTab.map((row, i) => (
                  <div key={`${activeTab}-risk-${i}`} className="flex items-start gap-3 rounded-xl p-3 border border-white/10 bg-white/[0.03]">
                    <RiskPillIcon tone={row.tone} />
                    <div>
                      <div className="text-sm font-semibold text-foreground">{row.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{row.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Confidence</span>
                  <span className="font-semibold text-foreground">High</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '86%' }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full bg-success"
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Recommendations update based on your current engine state.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineAnalytics;
