import { motion } from 'framer-motion';
import { BarChart3, X, TrendingUp, DollarSign, Plane, Package } from 'lucide-react';
import { mockEngines, mockFinancials, mockParts } from '@/data/mockData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

const CHART = {
  background: 'rgba(10, 14, 26, 0)',
  border: '1px solid rgba(255, 255, 255, 0)',
  borderRadius: '10px',
  fontFamily: 'Inter',
  fontSize: '11px',
  color: '#9ca3af',
};

interface AnalyticsPageProps {
  onClose: () => void;
}

const AnalyticsPage = ({ onClose }: AnalyticsPageProps) => {
  const totalEngines = mockEngines.length;
  const totalRevenue = mockFinancials.reduce((s, f) => s + f.totalRevenue, 0);
  const totalParts = mockParts.filter(p => p.category === 'Sell' && p.saleStatus === 'Available').length;
  const avgProgress = Math.round(mockEngines.reduce((s, e) => s + e.progress, 0) / totalEngines);

  const statusDist = [
    { name: 'In Transit', value: mockEngines.filter(e => e.status === 'In Transit').length, color: '#f59e0b' },
    { name: 'In Repair', value: mockEngines.filter(e => ['In Repair', 'Disassembly', 'Inspection'].includes(e.status)).length, color: '#63b3ed' },
    { name: 'In Storage', value: mockEngines.filter(e => ['In Storage', 'Preservation Active'].includes(e.status)).length, color: '#48bb78' },
    { name: 'Completed', value: mockEngines.filter(e => e.status === 'Completed').length, color: '#9f7aea' },
    { name: 'Ready', value: mockEngines.filter(e => e.status === 'Ready for Release').length, color: '#4fd1c5' },
  ];

  const serviceTypeDist = [
    { name: 'Teardown & Return', value: mockEngines.filter(e => e.serviceType === 'Teardown & Return').length },
    { name: 'Repair & Sell', value: mockEngines.filter(e => e.serviceType === 'Teardown, Repair & Sell').length },
    { name: 'Lease Storage', value: mockEngines.filter(e => e.serviceType === 'Lease Storage').length },
  ];

  const revenueByEngine = mockFinancials.slice(0, 6).map(f => {
    const engine = mockEngines.find(e => e.id === f.engineId);
    return {
      name: engine?.esn?.split('-')[1] || f.engineId,
      revenue: +(f.totalRevenue / 1000000).toFixed(2),
      netPayable: +(f.netPayable / 1000000).toFixed(2),
    };
  });

  const partsBreakdown = [
    { name: 'Scrap', value: mockParts.filter(p => p.category === 'Scrap').length, color: '#ef4444' },
    { name: 'Repair', value: mockParts.filter(p => p.category === 'Repair').length, color: '#63b3ed' },
    { name: 'Sell', value: mockParts.filter(p => p.category === 'Sell').length, color: '#48bb78' },
  ];

  const progressData = mockEngines.map(e => ({
    name: e.esn.split('-')[1],
    progress: e.progress,
  }));

  const summaryCards = [
    { label: 'Total Engines', value: totalEngines, icon: Plane, color: 'text-primary bg-primary/15' },
    { label: 'Total Revenue', value: `$${(totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-success bg-success/15' },
    { label: 'Parts Available', value: totalParts, icon: Package, color: 'text-warning bg-warning/15' },
    { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-purple-400 bg-purple-500/15' },
  ];

  return (
    <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative z-10 m-auto w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden rounded-2xl"
        style={{ background: 'rgba(10, 12, 22, 0.95)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/08 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading text-base font-bold text-foreground">Analytics & Insights</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass-card p-4 rounded-xl flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-body text-muted-foreground">{c.label}</p>
                  <p className="font-heading text-xl font-bold text-foreground">{c.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Engine Status */}
            <div className="glass-card p-5 rounded-xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Engine Status Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={CHART} />
                  <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '11px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Engine */}
            <div className="glass-card p-5 rounded-xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Revenue & Net Payable ($M)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByEngine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontFamily: 'Inter', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontFamily: 'Inter', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART} formatter={(v: number) => [`$${v}M`]} />
                  <Bar dataKey="revenue" fill="hsl(213,94%,68%)" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="netPayable" fill="hsl(158,64%,52%)" radius={[4, 4, 0, 0]} name="Net Payable" />
                  <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '11px', color: '#9ca3af' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Parts Breakdown */}
            <div className="glass-card p-5 rounded-xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Parts Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={partsBreakdown} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                    {partsBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={CHART} />
                  <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '11px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Engine Progress */}
            <div className="glass-card p-5 rounded-xl">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">Engine Progress Overview (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(213,94%,68%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(213,94%,68%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontFamily: 'Inter', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontFamily: 'Inter', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART} formatter={(v: number) => [`${v}%`, 'Progress']} />
                  <Area type="monotone" dataKey="progress" stroke="hsl(213,94%,68%)" fill="url(#progressGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Type Summary Table */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-heading text-sm font-bold text-foreground mb-4">Service Type Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {serviceTypeDist.map((s, i) => (
                <div key={s.name} className="text-center p-4 rounded-xl border border-white/08 bg-white/02">
                  <p className="font-heading text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs font-body text-muted-foreground mt-1">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;
