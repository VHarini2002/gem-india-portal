import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockEngines } from '@/data/mockData';
import EngineCard from '@/components/EngineCard';
import ParticleBackground from '@/components/ParticleBackground';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
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

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      {/* Header */}
      <header className="relative z-10 glass-card border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-xl neon-text tracking-wider">GEM INDIA</h1>
            <span className="hidden sm:block h-6 w-px bg-border/50" />
            <span className="hidden sm:block font-body text-sm text-muted-foreground">Engine Asset Lifecycle</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-foreground/80">{user?.name}</span>
            <button onClick={() => navigate('/help')} className="btn-neon py-2 px-3 text-xs flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Help
            </button>
            <button onClick={handleLogout} className="btn-neon py-2 px-3 text-xs flex items-center gap-1">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8">
        <div className="glass-card-glow rounded-2xl overflow-hidden mb-8">
          <div className="relative h-48 md:h-56">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              src="https://videos.pexels.com/video-files/2098989/2098989-sd_640_360_30fps.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
            <div className="relative z-10 h-full flex items-center px-8">
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-heading text-2xl md:text-3xl neon-text tracking-wider mb-2"
                >
                  Engine Portfolio
                </motion.h2>
                <p className="font-body text-muted-foreground">
                  {clientEngines.length} engines under management • {user?.company || 'All Clients'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ESN, Work Order, or Client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl glass-card border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground font-body transition-all"
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
  );
};

export default ClientDashboard;
