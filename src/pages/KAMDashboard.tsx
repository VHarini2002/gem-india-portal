import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockEngines, mockFinancials } from '@/data/mockData';
import AnimatedCounter from '@/components/AnimatedCounter';
import EngineCard from '@/components/EngineCard';
import PartsCatalog from '@/components/PartsCatalog';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plane, Wrench, Warehouse, DollarSign, FileQuestion, TrendingUp, Package } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const KAMDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };

  const totalEngines = mockEngines.length;
  const inTransit = mockEngines.filter(e => e.status === 'In Transit').length;
  const inRepair = mockEngines.filter(e => ['In Repair', 'Disassembly', 'Inspection'].includes(e.status)).length;
  const inStorage = mockEngines.filter(e => ['In Storage', 'Preservation Active'].includes(e.status)).length;
  const totalRevenue = mockFinancials.reduce((s, f) => s + f.totalRevenue, 0);

  const metrics = [
    { label: 'Total Engines', value: totalEngines, icon: Plane, bg: 'bg-blue-50', iconColor: 'text-primary', accent: 'text-primary' },
    { label: 'In Transit', value: inTransit, icon: TrendingUp, bg: 'bg-amber-50', iconColor: 'text-warning', accent: 'text-warning' },
    { label: 'In Repair', value: inRepair, icon: Wrench, bg: 'bg-red-50', iconColor: 'text-destructive', accent: 'text-destructive' },
    { label: 'In Storage', value: inStorage, icon: Warehouse, bg: 'bg-green-50', iconColor: 'text-success', accent: 'text-success' },
  ];

  const statusData = [
    { name: 'Transit', value: inTransit, color: '#f59e0b' },
    { name: 'Repair', value: inRepair, color: '#3b82f6' },
    { name: 'Storage', value: inStorage, color: '#10b981' },
    { name: 'Completed', value: mockEngines.filter(e => e.status === 'Completed').length, color: '#8b5cf6' },
    { name: 'Other', value: mockEngines.filter(e => e.status === 'Ready for Release').length, color: '#06b6d4' },
  ];

  const clients = ['AeroLease Corp', 'Global Lessors Inc', 'TechJet Aviation'];
  const revenueByClient = clients.map(c => ({
    name: c.split(' ')[0],
    revenue: mockFinancials
      .filter(f => mockEngines.find(e => e.id === f.engineId)?.clientName === c)
      .reduce((s, f) => s + f.totalRevenue, 0) / 1000000,
  }));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass-header">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plane className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-base font-bold text-foreground">GEM India</h1>
              <p className="text-xs text-muted-foreground font-body">KAM Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-primary font-heading font-bold text-xs">{user?.name?.[0]}</span>
              </div>
              <span className="font-body text-sm text-foreground/80">{user?.name}</span>
            </div>
            <button onClick={() => setCatalogOpen(true)} className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 rounded-xl">
              <Package className="w-3.5 h-3.5" /> Parts Catalog
            </button>
            <button onClick={handleLogout} className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 rounded-xl">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-glow p-5 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${m.bg}`}>
                  <m.icon className={`w-5 h-5 ${m.iconColor}`} />
                </div>
                <span className="font-body text-sm text-muted-foreground">{m.label}</span>
              </div>
              <AnimatedCounter target={m.value} className={`font-heading text-3xl font-bold ${m.accent}`} />
            </motion.div>
          ))}
        </div>

        {/* Revenue Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card-glow p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-muted-foreground">Total Revenue Generated</p>
              <AnimatedCounter target={totalRevenue} prefix="$" className="font-heading text-2xl font-bold text-foreground" />
            </div>
          </div>
          <div className="w-px h-10 bg-border hidden sm:block" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50">
              <FileQuestion className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="font-body text-sm text-muted-foreground">Pending RFQs</p>
              <AnimatedCounter target={7} className="font-heading text-2xl font-bold text-warning" />
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card-glow p-6 rounded-2xl"
          >
            <h3 className="font-heading text-sm font-bold text-foreground mb-4">Engine Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(200,210,230,0.8)', borderRadius: '12px', fontFamily: 'Inter', fontSize: '13px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-card-glow p-6 rounded-2xl"
          >
            <h3 className="font-heading text-sm font-bold text-foreground mb-4">Revenue per Client ($M)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByClient}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,210,230,0.5)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(220,10%,50%)', fontFamily: 'Inter', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(220,10%,50%)', fontFamily: 'Inter', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(200,210,230,0.8)', borderRadius: '12px', fontFamily: 'Inter', fontSize: '13px', backdropFilter: 'blur(10px)' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}M`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(221,83%,53%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Engine List */}
        <h3 className="font-heading text-sm font-bold text-foreground mb-4">All Engines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockEngines.map((engine, i) => (
            <EngineCard key={engine.id} engine={engine} index={i} />
          ))}
        </div>
      </div>
      <PartsCatalog open={catalogOpen} onClose={() => setCatalogOpen(false)} />
    </div>
  );
};

export default KAMDashboard;
