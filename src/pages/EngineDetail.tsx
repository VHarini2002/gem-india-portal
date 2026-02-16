import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockEngines, mockShipments, mockParts, mockFinancials, getPhases } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/ParticleBackground';
import AnimatedCounter from '@/components/AnimatedCounter';
import { ArrowLeft, LogOut, Package, Truck, Settings, Wrench, FileText, DollarSign, BarChart3, Clock, MapPin, Plane, Ship, Car } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Package },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'service', label: 'Service Process', icon: Settings },
  { id: 'parts', label: 'Parts', icon: Wrench },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
];

const EngineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [partsFilter, setPartsFilter] = useState<'all' | 'Scrap' | 'Repair' | 'Sell'>('all');

  // Parse WO-XXXX-XXX-ESN-XXXXXX from URL
  const engine = mockEngines.find(e => `${e.workOrder}-${e.esn}` === id);
  if (!engine) return <div className="min-h-screen flex items-center justify-center font-heading neon-text">Engine not found</div>;

  const shipments = mockShipments.filter(s => s.engineId === engine.id);
  const parts = mockParts.filter(p => p.engineId === engine.id);
  const financial = mockFinancials.find(f => f.engineId === engine.id);
  const phases = getPhases(engine.serviceType);
  const currentPhaseIndex = phases.indexOf(engine.currentPhase);

  const filteredParts = partsFilter === 'all' ? parts : parts.filter(p => p.category === partsFilter);

  const scrapCount = parts.filter(p => p.category === 'Scrap').length;
  const repairCount = parts.filter(p => p.category === 'Repair').length;
  const sellCount = parts.filter(p => p.category === 'Sell').length;
  const llpCount = parts.filter(p => p.llpStatus === 'LLP').length;

  const handleLogout = () => { logout(); navigate('/'); };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
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
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 rounded-lg">
                  <p className="font-body text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-heading text-sm neon-text mt-1">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Lifecycle Timeline */}
            <div className="glass-card-glow p-6 rounded-xl">
              <h3 className="font-heading text-sm neon-text tracking-wider mb-6">LIFECYCLE TIMELINE</h3>
              <div className="relative">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-secondary" />
                  <div className="absolute top-4 left-0 h-0.5 progress-glow" style={{ width: `${(currentPhaseIndex / (phases.length - 1)) * 100}%` }} />
                  {phases.map((phase, i) => (
                    <div key={phase} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / phases.length}%` }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading ${
                          i <= currentPhaseIndex
                            ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(200,100%,50%,0.5)]'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </motion.div>
                      <p className={`mt-2 text-xs font-body text-center ${i <= currentPhaseIndex ? 'neon-text' : 'text-muted-foreground'}`}>
                        {phase}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {engine.status === 'In Transit' && (
              <div className="glass-card-glow p-6 rounded-xl">
                <h3 className="font-heading text-sm status-transit tracking-wider mb-3">ETA PROGRESS</h3>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${engine.progress}%` }} transition={{ duration: 1.5 }} className="h-full rounded-full bg-gradient-to-r from-warning to-primary" style={{ boxShadow: '0 0 10px hsl(40, 95%, 55%, 0.5)' }} />
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
              <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-glow p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-heading text-sm neon-text tracking-wider">{s.shipmentId}</p>
                    <p className="font-body text-xs text-muted-foreground">{s.carrier}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                    {s.mode === 'Air' && <Plane className="w-3 h-3" />}
                    {s.mode === 'Sea' && <Ship className="w-3 h-3" />}
                    {s.mode === 'Road' && <Car className="w-3 h-3" />}
                    {s.mode}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div><p className="text-xs text-muted-foreground font-body">From</p><p className="text-sm font-body">{s.fromLocation}</p></div>
                  <div><p className="text-xs text-muted-foreground font-body">To</p><p className="text-sm font-body">{s.toLocation}</p></div>
                  <div><p className="text-xs text-muted-foreground font-body">Dispatch</p><p className="text-sm font-body">{s.dispatchDate}</p></div>
                  <div><p className="text-xs text-muted-foreground font-body">ETA</p><p className="text-sm font-body">{s.eta}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="text-xs font-body text-muted-foreground">{s.currentPosition}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.etaCompleted}%` }} transition={{ duration: 1 }} className="h-full rounded-full progress-glow" />
                  </div>
                  <span className="text-xs neon-text font-heading">{s.etaCompleted}%</span>
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
                  <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-lg">
                    <p className="font-body text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-heading text-lg neon-text-cyan mt-1">{item.value}</p>
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
                  <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-lg">
                    <p className="font-body text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-heading text-lg neon-text mt-1">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            )}
            {engine.serviceType === 'Teardown, Repair & Sell' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Parts', value: parts.length, color: 'neon-text' },
                  { label: 'Scrap', value: scrapCount, color: 'text-destructive' },
                  { label: 'Repairable', value: repairCount, color: 'status-transit' },
                  { label: 'Sellable', value: sellCount, color: 'status-active' },
                  { label: 'LLP Parts', value: llpCount, color: 'neon-text-cyan' },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-lg">
                    <p className="font-body text-xs text-muted-foreground">{item.label}</p>
                    <AnimatedCounter target={item.value} className={`font-heading text-2xl ${item.color}`} />
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
                <button key={f} onClick={() => setPartsFilter(f)} className={`px-4 py-2 rounded-lg font-heading text-xs tracking-wider uppercase transition-all ${partsFilter === f ? 'btn-neon-solid' : 'btn-neon'}`}>
                  {f === 'all' ? `All (${parts.length})` : `${f} (${parts.filter(p => p.category === f).length})`}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-3 font-heading text-xs text-muted-foreground tracking-wider">PART #</th>
                    <th className="text-left py-3 px-3 font-heading text-xs text-muted-foreground tracking-wider">SERIAL</th>
                    <th className="text-left py-3 px-3 font-heading text-xs text-muted-foreground tracking-wider">CATEGORY</th>
                    <th className="text-left py-3 px-3 font-heading text-xs text-muted-foreground tracking-wider">LOCATION</th>
                    <th className="text-left py-3 px-3 font-heading text-xs text-muted-foreground tracking-wider">DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.slice(0, 20).map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/20 hover:bg-primary/5">
                      <td className="py-3 px-3 neon-text">{p.partNumber}</td>
                      <td className="py-3 px-3 text-foreground/80">{p.serialNumber}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${p.category === 'Scrap' ? 'bg-destructive/20 text-destructive' : p.category === 'Repair' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{p.currentLocation}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">
                        {p.category === 'Repair' && `Cost: $${p.repairCost?.toLocaleString()}`}
                        {p.category === 'Sell' && `$${p.price?.toLocaleString()} • ${p.saleStatus}`}
                        {p.category === 'Scrap' && p.scrapReason}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredParts.length > 20 && (
                <p className="text-center text-xs text-muted-foreground mt-4 font-body">Showing 20 of {filteredParts.length} parts</p>
              )}
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Engine Documents', 'Logistics Documents', 'Part Certifications', 'Repair Reports', 'Financial Documents'].map((cat, i) => (
              <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-glow p-5 rounded-xl">
                <h4 className="font-heading text-sm neon-text tracking-wider mb-3">{cat.toUpperCase()}</h4>
                <div className="space-y-2">
                  {[`${cat.split(' ')[0]}_Report_${engine.esn}.pdf`, `${cat.split(' ')[0]}_Summary_${engine.workOrder}.pdf`, `${cat.split(' ')[0]}_Certificate.pdf`].map(doc => (
                    <div key={doc} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm font-body">{doc}</span>
                      </div>
                      <button className="btn-neon py-1 px-3 text-xs">View</button>
                    </div>
                  ))}
                </div>
                <button className="mt-3 btn-neon py-2 px-4 text-xs w-full">Upload Document</button>
              </motion.div>
            ))}
          </div>
        );

      case 'financial':
        if (!financial) return <p className="text-muted-foreground font-body">No financial data for storage engines.</p>;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: financial.totalRevenue, prefix: '$', color: 'status-active' },
              { label: 'Repair Cost', value: financial.repairCost, prefix: '$', color: 'status-transit' },
              { label: 'Logistics Cost', value: financial.logisticsCost, prefix: '$', color: 'neon-text' },
              { label: 'Storage Cost', value: financial.storageCost, prefix: '$', color: 'neon-text-cyan' },
              { label: 'Commission %', value: financial.commissionPercent, suffix: '%', color: 'neon-text' },
              { label: 'Commission Amount', value: financial.commissionAmount, prefix: '$', color: 'neon-text' },
              { label: 'Net Payable', value: financial.netPayable, prefix: '$', color: 'status-active' },
              { label: 'Payment Status', value: 0, color: financial.paymentStatus === 'Paid' ? 'status-active' : 'status-transit' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="glass-card-glow p-4 rounded-lg">
                <p className="font-body text-xs text-muted-foreground">{item.label}</p>
                {item.label === 'Payment Status' ? (
                  <p className={`font-heading text-lg mt-1 ${item.color}`}>{financial.paymentStatus}</p>
                ) : (
                  <AnimatedCounter target={item.value} prefix={item.prefix} suffix={item.suffix} className={`font-heading text-lg ${item.color}`} />
                )}
              </motion.div>
            ))}
          </div>
        );

      case 'analysis':
        const pieData = [
          { name: 'Scrap', value: scrapCount, color: 'hsl(0, 84%, 60%)' },
          { name: 'Repair', value: repairCount, color: 'hsl(40, 95%, 55%)' },
          { name: 'Sell', value: sellCount, color: 'hsl(150, 80%, 45%)' },
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card-glow p-6 rounded-xl">
              <h3 className="font-heading text-sm neon-text tracking-wider mb-4">PARTS DISTRIBUTION</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(225, 40%, 11%)', border: '1px solid hsl(200, 60%, 25%)', borderRadius: '8px', fontFamily: 'Rajdhani' }} />
                  <Legend wrapperStyle={{ fontFamily: 'Rajdhani', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card-glow p-6 rounded-xl">
              <h3 className="font-heading text-sm neon-text tracking-wider mb-4">REVENUE BREAKDOWN ($K)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 40%, 15%)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 55%)', fontFamily: 'Rajdhani', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontFamily: 'Rajdhani', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(225, 40%, 11%)', border: '1px solid hsl(200, 60%, 25%)', borderRadius: '8px', fontFamily: 'Rajdhani' }} />
                  <Bar dataKey="value" fill="hsl(200, 100%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {engine.serviceType === 'Lease Storage' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card-glow p-6 rounded-xl lg:col-span-2">
                <h3 className="font-heading text-sm neon-text-cyan tracking-wider mb-4">STORAGE COST ACCUMULATION</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={storageLine}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 40%, 15%)" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 55%)', fontFamily: 'Rajdhani', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontFamily: 'Rajdhani', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'hsl(225, 40%, 11%)', border: '1px solid hsl(200, 60%, 25%)', borderRadius: '8px', fontFamily: 'Rajdhani' }} />
                    <Line type="monotone" dataKey="cost" stroke="hsl(185, 100%, 55%)" strokeWidth={2} dot={{ fill: 'hsl(185, 100%, 55%)', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card-glow p-6 rounded-xl">
              <h3 className="font-heading text-sm neon-text tracking-wider mb-4">ENGINE LIFECYCLE PROGRESS</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(225, 30%, 18%)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none" stroke="hsl(200, 100%, 50%)"
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - engine.progress / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      style={{ filter: 'drop-shadow(0 0 6px hsl(200, 100%, 50%, 0.5))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatedCounter target={engine.progress} suffix="%" className="font-heading text-xl neon-text" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <header className="relative z-10 glass-card border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-heading text-xl neon-text tracking-wider">GEM INDIA</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-foreground/80">{user?.name}</span>
            <button onClick={handleLogout} className="btn-neon py-2 px-3 text-xs flex items-center gap-1">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-12">
        {/* Engine Header */}
        <div className="glass-card-glow p-6 rounded-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl neon-text tracking-wider">{engine.esn}</h2>
              <p className="font-body text-muted-foreground">{engine.model} • {engine.workOrder} • {engine.clientName}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-heading tracking-wider glow-border ${
                engine.status === 'In Transit' ? 'status-transit' : engine.status === 'Completed' ? 'status-completed' : 'neon-text'
              }`}>
                {engine.status}
              </span>
              <div className="flex items-center gap-1 text-sm font-body text-muted-foreground">
                <Clock className="w-3 h-3" />
                {engine.lastUpdated}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-heading text-xs tracking-wider uppercase whitespace-nowrap transition-all duration-300 ${
                activeTab === t.id
                  ? 'glass-card-glow neon-text'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EngineDetail;
