import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mockEngines } from '@/data/mockData';
import EngineCard from '@/components/EngineCard';
import { useNavigate } from 'react-router-dom';
import { Search, HelpCircle, Plane } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { isDarkTheme } = useTheme();
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
      <div className="min-h-full">
        <div className="pt-1">
          {/* Welcome Message from Image */}
          <div className="max-w-8xl mx-auto px-6 pt-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20}}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-glow rounded-2xl overflow-hidden mb-8"
            >
              <div className="relative h-48 md:h-56 opacity-100">

                <div className="absolute inset-0" style={{ background: 'linear-gradient(135]]`deg, rgba(187, 187, 187, 0) 0%, rgba(8, 12, 24, 0) 60%, rgba(8, 12, 24, 0) 100%)' }} />
                <div className="relative z-10 h-full flex items-center px-8">
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`font-heading text-2xl md:text-3xl font-bold mb-2 ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      <h5 className={`text-4xl font-bold mb-2 ${
                        isDarkTheme ? 'text-white' : 'text-gray-900'
                      }`}>
                        Hi, {user?.name.split(' ')[0]}!
                      </h5>
                    </motion.h2>
                    <p className={`font-body text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
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
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by ESN, Work Order, or Client..."
                value={search}
                onChange={e => setSearch(e.target.value)} 
                className={`w-full pl-11 pr-4 py-3 rounded-xl glass-card border-0 focus:ring-2 focus:ring-primary/20 outline-none font-body transition-all text-sm ${
                  isDarkTheme 
                    ? 'bg-white/5 text-white placeholder-gray-500' 
                    : 'bg-white/60 text-gray-900 placeholder-gray-500'
                }`}
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
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
