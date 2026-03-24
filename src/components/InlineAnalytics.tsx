import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Plane, Package, Clock, AlertTriangle } from 'lucide-react';
import { mockEngines, mockFinancials, mockParts, mockShipments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const CHART_STYLE = {
  background: 'rgba(10, 14, 26, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  fontFamily: 'Inter',
  fontSize: '11px',
  color: '#9ca3af',
};

type TabKey = 'overview' | 'parts' | 'revenue' | 'logistics' | 'lifecycle';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'parts', label: 'Parts Analysis', icon: Package },
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
  { key: 'logistics', label: 'Logistics', icon: TrendingUp },
  { key: 'lifecycle', label: 'Lifecycle', icon: Clock },
];

const PIE_COLORS = ['#ef4444', '#63b3ed', '#48bb78', '#f59e0b', '#9f7aea', '#4fd1c5'];

const InlineAnalytics = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const engines = user?.role === 'client'
    ? mockEngines.filter(e => e.clientEmail === user.email)
    : mockEngines;

  const engineIds = new Set(engines.map(e => e.id));
  const parts = mockParts.filter(p => engineIds.has(p.engineId));
  const financials = mockFinancials.filter(f => engineIds.has(f.engineId));
  const shipments = mockShipments.filter(s => engineIds.has(s.engineId));

  const totalRevenue = financials.reduce((s, f) => s + f.totalRevenue, 0);
  const totalParts = parts.length;
  const avgProgress = Math.round(engines.reduce((s, e) => s + e.progress, 0) / (engines.length || 1));

  // Data preparations
  const statusDist = [
    { name: 'In Transit', value: engines.filter(e => e.status === 'In Transit').length, color: '#f59e0b' },
    { name: 'In Repair', value: engines.filter(e => ['In Repair', 'Disassembly', 'Inspection'].includes(e.status)).length, color: '#63b3ed' },
    { name: 'In Storage', value: engines.filter(e => ['In Storage', 'Preservation Active'].includes(e.status)).length, color: '#48bb78' },
    { name: 'Completed', value: engines.filter(e => e.status === 'Completed').length, color: '#9f7aea' },
    { name: 'Ready', value: engines.filter(e => e.status === 'Ready for Release').length, color: '#4fd1c5' },
  ].filter(d => d.value > 0);

  const partsBreakdown = [
    { name: 'Scrap', value: parts.filter(p => p.category === 'Scrap').length, color: '#ef4444' },
    { name: 'Repair', value: parts.filter(p => p.category === 'Repair').length, color: '#63b3ed' },
    { name: 'Sell', value: parts.filter(p => p.category === 'Sell').length, color: '#48bb78' },
  ];

  const revenueByEngine = financials.slice(0, 8).map(f => {
    const eng = engines.find(e => e.id === f.engineId);
    return {
      name: eng?.esn?.split('-')[1] || f.engineId,
      revenue: +(f.totalRevenue / 1e6).toFixed(2),
      netPayable: +(f.netPayable / 1e6).toFixed(2),
      repairCost: +(f.repairCost / 1e6).toFixed(2),
    };
  });

  const progressData = engines.map(e => ({ name: e.esn.split('-')[1], progress: e.progress }));

  const logisticsData = shipments.map(s => {
    const eng = engines.find(e => e.id === s.engineId);
    return { name: eng?.esn.split('-')[1] || s.shipmentId, completion: s.etaCompleted, mode: s.mode };
  });

  const partsSoldVsAvailable = [
    { name: 'Sold', value: parts.filter(p => p.saleStatus === 'Sold').length, color: '#48bb78' },
    { name: 'Available', value: parts.filter(p => p.saleStatus === 'Available').length, color: '#63b3ed' },
  ];

  const repairCostByEngine = financials.map(f => {
    const eng = engines.find(e => e.id === f.engineId);
    return { name: eng?.esn.split('-')[1] || '', repair: +(f.repairCost / 1e6).toFixed(2), logistics: +(f.logisticsCost / 1e6).toFixed(2) };
  });

  const summaryCards = [
    { label: 'Engines', value: engines.length, icon: Plane, accent: 'text-primary bg-primary/15' },
    { label: 'Revenue', value: `$${(totalRevenue / 1e6).toFixed(1)}M`, icon: DollarSign, accent: 'text-success bg-success/15' },
    { label: 'Total Parts', value: totalParts, icon: Package, accent: 'text-warning bg-warning/15' },
    { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, accent: 'text-purple-400 bg-purple-500/15' },
  ];

  const ChartCard = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`glass-card p-5 rounded-xl ${className}`}>
      <h3 className="font-heading text-sm font-bold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );

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
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/10 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4 rounded-xl flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.accent}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="font-heading text-xl font-bold text-foreground">{c.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Content */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Engine Status Distribution">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusDist.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Engine Progress Overview (%)">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(213,94%,68%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(213,94%,68%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`${v}%`, 'Progress']} />
                  <Area type="monotone" dataKey="progress" stroke="hsl(213,94%,68%)" fill="url(#pg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Parts Category Breakdown">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={partsBreakdown} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value">
                    {partsBreakdown.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Revenue & Net Payable ($M)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueByEngine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`$${v}M`]} />
                  <Bar dataKey="revenue" fill="hsl(213,94%,68%)" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="netPayable" fill="hsl(158,64%,52%)" radius={[4, 4, 0, 0]} name="Net Payable" />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'parts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Parts by Category">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={partsBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {partsBreakdown.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Sold vs Available Parts">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={partsSoldVsAvailable}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {partsSoldVsAvailable.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Parts per Engine" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={engines.map(e => ({ name: e.esn.split('-')[1], parts: parts.filter(p => p.engineId === e.id).length }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Bar dataKey="parts" fill="hsl(213,94%,68%)" radius={[4, 4, 0, 0]} name="Parts Count" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Revenue by Engine ($M)" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByEngine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`$${v}M`]} />
                  <Bar dataKey="revenue" fill="hsl(213,94%,68%)" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="repairCost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Repair Cost" />
                  <Bar dataKey="netPayable" fill="hsl(158,64%,52%)" radius={[4, 4, 0, 0]} name="Net Payable" />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Repair vs Logistics Cost ($M)">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={repairCostByEngine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`$${v}M`]} />
                  <Bar dataKey="repair" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Repair" />
                  <Bar dataKey="logistics" fill="#9f7aea" radius={[4, 4, 0, 0]} name="Logistics" />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Payment Status">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={[
                    { name: 'Paid', value: financials.filter(f => f.paymentStatus === 'Paid').length, color: '#48bb78' },
                    { name: 'Pending', value: financials.filter(f => f.paymentStatus === 'Pending').length, color: '#f59e0b' },
                  ]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                    {[{ color: '#48bb78' }, { color: '#f59e0b' }].map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Shipment Completion (%)" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={logisticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`${v}%`, 'Completion']} />
                  <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                    {logisticsData.map((d, i) => <Cell key={i} fill={d.completion > 70 ? '#48bb78' : d.completion > 40 ? '#f59e0b' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Transport Mode Distribution">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={[
                    { name: 'Air', value: shipments.filter(s => s.mode === 'Air').length, color: '#63b3ed' },
                    { name: 'Sea', value: shipments.filter(s => s.mode === 'Sea').length, color: '#4fd1c5' },
                    { name: 'Road', value: shipments.filter(s => s.mode === 'Road').length, color: '#f59e0b' },
                  ]} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value">
                    {[{ color: '#63b3ed' }, { color: '#4fd1c5' }, { color: '#f59e0b' }].map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Delay Risk Indicator">
              <div className="space-y-3">
                {logisticsData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{d.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.completion}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8 }}
                        className={`h-full rounded-full ${d.completion > 70 ? 'bg-success' : d.completion > 40 ? 'bg-warning' : 'bg-destructive'}`}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${d.completion > 70 ? 'text-success' : d.completion > 40 ? 'text-warning' : 'text-destructive'}`}>{d.completion}%</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {activeTab === 'lifecycle' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Engine Lifecycle Progress" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9f7aea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9f7aea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`${v}%`, 'Progress']} />
                  <Area type="monotone" dataKey="progress" stroke="#9f7aea" fill="url(#lcg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Service Type Distribution">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Teardown & Return', value: engines.filter(e => e.serviceType === 'Teardown & Return').length },
                  { name: 'Repair & Sell', value: engines.filter(e => e.serviceType === 'Teardown, Repair & Sell').length },
                  { name: 'Lease Storage', value: engines.filter(e => e.serviceType === 'Lease Storage').length },
                ].map(s => (
                  <div key={s.name} className="text-center p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    <p className="font-heading text-2xl font-bold text-primary">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.name}</p>
                  </div>
                ))}
              </div>
            </ChartCard>
            <ChartCard title="Phase Distribution">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(() => {
                  const phases: Record<string, number> = {};
                  engines.forEach(e => { phases[e.currentPhase] = (phases[e.currentPhase] || 0) + 1; });
                  return Object.entries(phases).map(([name, value]) => ({ name, value }));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Bar dataKey="value" fill="#4fd1c5" radius={[4, 4, 0, 0]} name="Engines" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineAnalytics;
