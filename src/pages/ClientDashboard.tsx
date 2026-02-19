import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockEngines } from '@/data/mockData';
import EngineCard from '@/components/EngineCard';
import { useNavigate } from 'react-router-dom';
import { Search, HelpCircle, Plane } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const clientEngines = mockEngines.filter(e =>
    user?.role === 'client' ? e.clientEmail === user.email : true
  );

  const filtered = clientEngines.filter(e =>
    e.esn.toLowerCase().includes(search.toLowerCase()) ||
    e.workOrder.toLowerCase().includes(search.toLowerCase()) ||
    e.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="page-wrapper min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-header">
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Plane className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-sm font-bold text-foreground">Engine Portfolio</h1>
                <p className="text-xs text-muted-foreground font-body">{user?.company || 'All Clients'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card border-0">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-heading font-bold text-xs">{user?.name?.[0]}</span>
                </div>
                <span className="font-body text-sm text-foreground/80">{user?.name}</span>
              </div>
              <button onClick={() => navigate('/help')} className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 rounded-xl">
                <HelpCircle className="w-3.5 h-3.5" /> Help
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 pt-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-glow rounded-2xl overflow-hidden mb-8"
          >
            <div className="relative h-48 md:h-56">
              <video
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                src="https://videos.pexels.com/video-files/2098989/2098989-sd_640_360_30fps.mp4"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,12,24,0.9) 0%, rgba(8,12,24,0.6) 60%, rgba(8,12,24,0.2) 100%)' }} />
              <div className="relative z-10 h-full flex items-center px-8">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2"
                  >
                    Engine Portfolio
                  </motion.h2>
                  <p className="font-body text-muted-foreground text-sm">
                    {clientEngines.length} engines under management
                  </p>
                  <div className="flex gap-3 mt-4">
                    {[
                      { label: 'Active', count: clientEngines.filter(e => e.status !== 'Completed').length, color: 'bg-primary/15 text-primary border border-primary/20' },
                      { label: 'In Transit', count: clientEngines.filter(e => e.status === 'In Transit').length, color: 'bg-warning/15 text-warning border border-warning/20' },
                      { label: 'In Storage', count: clientEngines.filter(e => e.status === 'In Storage').length, color: 'bg-success/15 text-success border border-success/20' },
                    ].map(s => (
                      <div key={s.label} className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold ${s.color}`}>
                        {s.count} {s.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ESN, Work Order, or Client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl glass-card border-0 focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-body transition-all text-sm"
            />
          </div>

          {/* Engine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
            {filtered.map((engine, i) => (
              <EngineCard key={engine.id} engine={engine} index={i} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
