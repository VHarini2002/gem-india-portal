import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockEngines, mockFinancials, mockParts } from '@/data/mockData';
import ParticleBackground from '@/components/ParticleBackground';
import AnimatedCounter from '@/components/AnimatedCounter';
import EngineCard from '@/components/EngineCard';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plane, Wrench, Warehouse, DollarSign, FileQuestion, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const KAMDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  const totalEngines = mockEngines.length;
  const inTransit = mockEngines.filter(e => e.status === 'In Transit').length;
  const inRepair = mockEngines.filter(e => ['In Repair', 'Disassembly', 'Inspection'].includes(e.status)).length;
  const inStorage = mockEngines.filter(e => ['In Storage', 'Preservation Active'].includes(e.status)).length;
  const totalRevenue = mockFinancials.reduce((s, f) => s + f.totalRevenue, 0);

  const metrics = [
    { label: 'Total Engines', value: totalEngines, icon: Plane, color: 'neon-text' },
    { label: 'In Transit', value: inTransit, icon: TrendingUp, color: 'status-transit' },
    { label: 'In Repair', value: inRepair, icon: Wrench, color: 'neon-text' },
    { label: 'In Storage', value: inStorage, icon: Warehouse, color: 'neon-text-cyan' },
  ];

  const statusData = [
    { name: 'Transit', value: inTransit, color: 'hsl(40, 95%, 55%)' },
    { name: 'Repair', value: inRepair, color: 'hsl(200, 100%, 50%)' },
    { name: 'Storage', value: inStorage, color: 'hsl(185, 100%, 55%)' },
    { name: 'Completed', value: mockEngines.filter(e => e.status === 'Completed').length, color: 'hsl(150, 80%, 45%)' },
    { name: 'Other', value: mockEngines.filter(e => e.status === 'Ready for Release').length, color: 'hsl(270, 80%, 60%)' },
  ];

  const clients = ['AeroLease Corp', 'Global Lessors Inc', 'TechJet Aviation'];
  const revenueByClient = clients.map(c => ({
    name: c.split(' ')[0],
    revenue: mockFinancials
      .filter(f => mockEngines.find(e => e.id === f.engineId)?.clientName === c)
      .reduce((s, f) => s + f.totalRevenue, 0) / 1000000,
  }));

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <header className="relative z-10 glass-card border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-xl neon-text tracking-wider">GEM INDIA</h1>
            <span className="hidden sm:block h-6 w-px bg-border/50" />
            <span className="hidden sm:block font-body text-sm text-muted-foreground">KAM Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-foreground/80">{user?.name}</span>
            <button onClick={handleLogout} className="btn-neon py-2 px-3 text-xs flex items-center gap-1">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-12">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-glow p-5 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-body text-sm text-muted-foreground">{m.label}</span>
              </div>
              <AnimatedCounter target={m.value} className={`font-heading text-3xl ${m.color}`} />
            </motion.div>
          ))}
        </div>

        {/* Revenue Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-glow p-6 rounded-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 animate-pulse-glow">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-muted-foreground">Total Revenue Generated</p>
              <AnimatedCounter target={totalRevenue} prefix="$" className="font-heading text-2xl neon-text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <FileQuestion className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-body text-sm text-muted-foreground">Pending RFQs</p>
              <AnimatedCounter target={7} className="font-heading text-2xl neon-text-cyan" />
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-card-glow p-6 rounded-xl"
          >
            <h3 className="font-heading text-sm neon-text tracking-wider mb-4">ENGINE STATUS DISTRIBUTION</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(225, 40%, 11%)', border: '1px solid hsl(200, 60%, 25%)', borderRadius: '8px', fontFamily: 'Rajdhani' }}
                  itemStyle={{ color: 'hsl(210, 40%, 92%)' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'Rajdhani', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-card-glow p-6 rounded-xl"
          >
            <h3 className="font-heading text-sm neon-text tracking-wider mb-4">REVENUE PER CLIENT ($M)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByClient}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 40%, 15%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 55%)', fontFamily: 'Rajdhani', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontFamily: 'Rajdhani', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(225, 40%, 11%)', border: '1px solid hsl(200, 60%, 25%)', borderRadius: '8px', fontFamily: 'Rajdhani' }}
                  itemStyle={{ color: 'hsl(210, 40%, 92%)' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}M`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(200, 100%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Engine List */}
        <h3 className="font-heading text-sm neon-text tracking-wider mb-4">ALL ENGINES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockEngines.map((engine, i) => (
            <EngineCard key={engine.id} engine={engine} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KAMDashboard;
