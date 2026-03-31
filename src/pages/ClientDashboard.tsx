import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockEngines, mockParts } from '@/data/mockData';
import EngineCard from '@/components/EngineCard';
import { Search, Filter, X, AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { buildAttentionItems } from '@/lib/engineIntelligence';
import { useNavigate } from 'react-router-dom';

const statusOptions = ['All', 'In Transit', 'In Repair', 'In Storage', 'Disassembly', 'Inspection', 'Completed', 'Preservation Active', 'Ready for Release'];
const serviceOptions = ['All', 'Teardown & Return', 'Teardown, Repair & Sell', 'Lease Storage'];

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

  const clientEngines = mockEngines.filter(e =>
    user?.role === 'client' ? e.clientEmail === user.email : true
  );

  const filtered = clientEngines.filter(e => {
    const matchSearch = e.esn.toLowerCase().includes(search.toLowerCase()) ||
      e.workOrder.toLowerCase().includes(search.toLowerCase()) ||
      e.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchService = serviceFilter === 'All' || e.serviceType === serviceFilter;
    return matchSearch && matchStatus && matchService;
  });

  const activeFilters = (statusFilter !== 'All' ? 1 : 0) + (serviceFilter !== 'All' ? 1 : 0);
  const attention = buildAttentionItems({ engines: clientEngines, parts: mockParts, limit: 6 });

  return (
    <AppLayout>
      <div className="min-h-full">
        <div className="pt-1">
            <div className="max-w-[1800px] mx-auto px-6 pt-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-glow rounded-2xl overflow-hidden mb-8"
            >
              <div className="relative h-48 md:h-56">
                <div className="relative z-10 h-full flex items-center px-8">
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="font-heading text-2xl md:text-3xl font-bold mb-2 text-foreground"
                    >
                      <h5 className="text-4xl font-bold mb-2 text-foreground">
                        Hi, {user?.name.split(' ')[0]}!
                      </h5>
                    </motion.h2>
                    <p className="font-body text-sm text-muted-foreground">
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

            {/* Needs Attention */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card-glow rounded-2xl overflow-hidden mb-8"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-foreground">What needs attention</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Prioritized items that impact schedule, risk, and recovery value.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFilters(true)}
                    className="btn-secondary py-2 px-4 text-xs rounded-xl flex items-center gap-2"
                  >
                    Review filters <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {attention.length === 0 ? (
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-5">
                    <p className="text-sm font-heading font-semibold text-foreground">All clear</p>
                    <p className="text-xs font-body text-muted-foreground mt-1">No urgent items detected for your engines.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {attention.map((item) => {
                      const icon =
                        item.severity === 'critical' ? AlertTriangle : item.severity === 'warning' ? AlertCircle : Info;
                      const badge =
                        item.severity === 'critical'
                          ? 'bg-destructive/15 text-destructive border border-destructive/25'
                          : item.severity === 'warning'
                          ? 'bg-warning/15 text-warning border border-warning/25'
                          : 'bg-primary/10 text-primary border border-primary/20';

                      const Icon = icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => item.ctaHref ? navigate(item.ctaHref) : undefined}
                          className="w-full text-left rounded-2xl border border-border/50 bg-muted/10 hover:bg-muted/20 transition-colors p-4 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${badge}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-heading font-semibold text-foreground">{item.title}</p>
                                {item.engineLabel && (
                                  <span className="text-[10px] font-body text-muted-foreground/70 truncate">
                                    {item.engineLabel}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-body text-muted-foreground mt-1 leading-relaxed">
                                {item.description}
                              </p>
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs font-heading font-semibold text-primary">
                                  {item.ctaLabel}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by ESN, Work Order, or Client..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-card border-0 focus:ring-2 focus:ring-primary/20 outline-none font-body transition-all text-sm bg-muted/30 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  showFilters || activeFilters > 0
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'glass-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilters > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl p-5 mb-6 border bg-card/60 border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-sm text-foreground">Filter Engines</h3>
                  {activeFilters > 0 && (
                    <button
                      onClick={() => { setStatusFilter('All'); setServiceFilter('All'); }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium mb-2 block text-muted-foreground">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setStatusFilter(opt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            statusFilter === opt
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-2 block text-muted-foreground">Service Type</label>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setServiceFilter(opt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            serviceFilter === opt
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Engine Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
              {filtered.map((engine, i) => (
                <EngineCard key={engine.id} engine={engine} index={i} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <p className="text-lg font-heading">No engines found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
