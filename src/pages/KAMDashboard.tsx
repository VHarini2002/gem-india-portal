import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockEngines, mockFinancials } from '@/data/mockData';
import AnimatedCounter from '@/components/AnimatedCounter';
import EngineCard from '@/components/EngineCard';
import PartsCatalog from '@/components/PartsCatalog';
import { useNavigate } from 'react-router-dom';
import { Plane, Wrench, Warehouse, DollarSign, FileQuestion, TrendingUp, Package, ShoppingBag } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AppLayout from '@/components/AppLayout';

const KAMDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalogOpen, setCatalogOpen] = useState(false);

  const totalEngines = mockEngines.length;
  const inTransit = mockEngines.filter(e => e.status === 'In Transit').length;
  const inRepair = mockEngines.filter(e => ['In Repair', 'Disassembly', 'Inspection'].includes(e.status)).length;
  const inStorage = mockEngines.filter(e => ['In Storage', 'Preservation Active'].includes(e.status)).length;
  const totalRevenue = mockFinancials.reduce((s, f) => s + f.totalRevenue, 0);

  const metrics = [
    { label: 'Total Engines', value: totalEngines, icon: Plane, iconBg: 'bg-primary/15', iconColor: 'text-primary', accent: 'text-primary' },
    { label: 'In Transit', value: inTransit, icon: TrendingUp, iconBg: 'bg-warning/15', iconColor: 'text-warning', accent: 'text-warning' },
    { label: 'In Repair', value: inRepair, icon: Wrench, iconBg: 'bg-destructive/15', iconColor: 'text-destructive', accent: 'text-destructive' },
    { label: 'In Storage', value: inStorage, icon: Warehouse, iconBg: 'bg-success/15', iconColor: 'text-success', accent: 'text-success' },
  ];

  const statusData = [
    { name: 'Transit', value: inTransit, color: 'hsl(38, 92%, 50%)' },
    { name: 'Repair', value: inRepair, color: 'hsl(252, 60%, 58%)' },
    { name: 'Storage', value: inStorage, color: 'hsl(158, 64%, 42%)' },
    { name: 'Completed', value: mockEngines.filter(e => e.status === 'Completed').length, color: 'hsl(280, 50%, 60%)' },
    { name: 'Other', value: mockEngines.filter(e => e.status === 'Ready for Release').length, color: 'hsl(174, 50%, 50%)' },
  ];

  const clients = ['AeroLease Corp', 'Global Lessors Inc', 'TechJet Aviation'];
  const revenueByClient = clients.map(c => ({
    name: c.split(' ')[0],
    revenue: mockFinancials
      .filter(f => mockEngines.find(e => e.id === f.engineId)?.clientName === c)
      .reduce((s, f) => s + f.totalRevenue, 0) / 1000000,
  }));

  return (
    <AppLayout>
      <div className="min-h-full">
        <div className="pt-4">
          {/* Welcome */}
          <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-foreground">
                Hi, {user?.name.split(' ')[0]}!
              </h1>
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                What are your plans for today?
              </h2>
              <p className="max-w-md text-muted-foreground">
                Managing engines across all clients. Here's your operational overview for today.
              </p>
            </div>
            <button
              onClick={() => setCatalogOpen(true)}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl font-heading font-semibold text-sm bg-primary text-primary-foreground transition-all hover:scale-105 shadow-lg shadow-primary/25"
            >
              <ShoppingBag className="w-5 h-5" />
              Parts Catalog
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Sell</span>
            </button>
          </div>

          <div className="max-w-8xl mx-auto px-6 pt-2 pb-12">
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
                    <div className={`p-2.5 rounded-xl ${m.iconBg}`}>
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
                <div className="p-3 rounded-2xl bg-primary/15">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-body text-sm text-muted-foreground">Total Revenue Generated</p>
                  <AnimatedCounter target={totalRevenue} prefix="$" className="font-heading text-2xl font-bold text-foreground" />
                </div>
              </div>
              <div className="w-px h-10 hidden sm:block bg-border/50" />
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-warning/15">
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card-glow p-6 rounded-2xl">
                <h3 className="font-heading text-sm font-bold text-foreground mb-4">Engine Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                    <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card-glow p-6 rounded-2xl">
                <h3 className="font-heading text-sm font-bold text-foreground mb-4">Revenue per Client ($M)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueByClient}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontFamily: 'Inter', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontFamily: 'Inter', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'hsl(var(--foreground))' }} formatter={(val: number) => [`$${val.toFixed(2)}M`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="hsl(252, 60%, 58%)" radius={[6, 6, 0, 0]} />
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
      </div>
    </AppLayout>
  );
};

export default KAMDashboard;
