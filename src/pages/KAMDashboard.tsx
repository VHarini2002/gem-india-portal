import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mockEngines, mockFinancials } from '@/data/mockData';
import AnimatedCounter from '@/components/AnimatedCounter';
import EngineCard from '@/components/EngineCard';
import PartsCatalog from '@/components/PartsCatalog';
import VideoBackground from '@/components/VideoBackground';
import KAMSidebar, { KAMModule, KAMSidebarAction } from '@/components/kam/KAMSidebar';
import EngineManagement from '@/components/kam/EngineManagement';
import ClientManagement from '@/components/kam/ClientManagement';
import FolderManagement from '@/components/kam/FolderManagement';
import PartManagement from '@/components/kam/PartManagement';
import InlineCalendar from '@/components/InlineCalendar';
import InlineAnalytics from '@/components/InlineAnalytics';
import SettingsPage from '@/pages/SettingsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import { Plane, Wrench, Warehouse, DollarSign, FileQuestion, TrendingUp, ShoppingBag, LayoutDashboard, Calendar, BarChart3, Filter, X, Search, Sun, Moon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createPortal } from 'react-dom';

const KAMDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkTheme, setIsDarkTheme } = useTheme();
  const [activeModule, setActiveModule] = useState<KAMModule>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<'dashboard' | 'calendar' | 'analytics'>('dashboard');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'settings' | 'notifications' | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => sessionStorage.getItem('kam-sidebar-locked') === 'true');
  const [fontSize, setFontSize] = useState('medium');
  const [portalView, setPortalView] = useState('default');
  const [search, setSearch] = useState('');

  const showDashboardUI = activeModule === 'dashboard' || activeModule === 'engine-management' || activeModule === 'client-management';

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterService, setFilterService] = useState<string[]>([]);
  const [filterClient, setFilterClient] = useState<string[]>([]);
  const [filterModel, setFilterModel] = useState<string[]>([]);

  const allStatuses = [...new Set(mockEngines.map(e => e.status))];
  const allServices = [...new Set(mockEngines.map(e => e.serviceType))];
  const allClients = [...new Set(mockEngines.map(e => e.clientName))];
  const allModels = [...new Set(mockEngines.map(e => e.model))];

  // Apply filters
  let filteredEngines = mockEngines;
  if (filterStatus.length) filteredEngines = filteredEngines.filter(e => filterStatus.includes(e.status));
  if (filterService.length) filteredEngines = filteredEngines.filter(e => filterService.includes(e.serviceType));
  if (filterClient.length) filteredEngines = filteredEngines.filter(e => filterClient.includes(e.clientName));
  if (filterModel.length) filteredEngines = filteredEngines.filter(e => filterModel.includes(e.model));
  if (search) {
    const q = search.toLowerCase();
    filteredEngines = filteredEngines.filter(e => e.esn.toLowerCase().includes(q) || e.model.toLowerCase().includes(q) || e.clientName.toLowerCase().includes(q));
  }

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
    revenue: mockFinancials.filter(f => mockEngines.find(e => e.id === f.engineId)?.clientName === c).reduce((s, f) => s + f.totalRevenue, 0) / 1000000,
  }));

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const activeFilterCount = filterStatus.length + filterService.length + filterClient.length + filterModel.length;

  const clearFilters = () => { setFilterStatus([]); setFilterService([]); setFilterClient([]); setFilterModel([]); };
  const handleSidebarAction = (action: KAMSidebarAction) => setActivePanel(action);

  const dashboardPath = (tab: 'dashboard' | 'calendar' | 'analytics') =>
    tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`;

  const modulePath = (module: KAMModule) => {
    switch (module) {
      case 'dashboard':
        return '/dashboard';
      case 'engine-management':
        return '/dashboard/engine-management';
      case 'client-management':
        return '/dashboard/client-management';
      case 'folder-management':
        return '/dashboard/folder-management';
      case 'part-management':
        return '/dashboard/part-management';
      default:
        return '/dashboard';
    }
  };

  const handleDashboardTabChange = (tab: 'dashboard' | 'calendar' | 'analytics') => {
    setDashboardTab(tab);
    setActiveModule('dashboard');
    navigate(dashboardPath(tab));
  };

  const handleSidebarModuleChange = (module: KAMModule) => {
    setActiveModule(module);
    setActivePanel(null);
    setCatalogOpen(false);
    setShowFilters(false);

    navigate(modulePath(module));
    if (module === 'dashboard' || module === 'engine-management' || module === 'client-management') setDashboardTab('dashboard');
  };

  const closeEngineClientDialog = () => {
    setActiveModule('dashboard');
    setActivePanel(null);
    navigate(dashboardPath(dashboardTab));
  };

  useEffect(() => {
    const afterDashboard = location.pathname.startsWith('/dashboard')
      ? location.pathname.slice('/dashboard'.length)
      : '';
    const seg = afterDashboard.split('/').filter(Boolean)[0];

    if (!seg || seg === 'dashboard') {
      setActiveModule('dashboard');
      setDashboardTab('dashboard');
      setActivePanel(null);
      setCatalogOpen(false);
      return;
    }

    if (seg === 'calendar' || seg === 'analytics') {
      setActiveModule('dashboard');
      setDashboardTab(seg);
      setActivePanel(null);
      setCatalogOpen(false);
      return;
    }

    if (seg === 'engine-management' || seg === 'client-management') {
      setActiveModule(seg as KAMModule);
      setDashboardTab('dashboard');
      setActivePanel(null);
      setCatalogOpen(false);
      return;
    }

    if (seg === 'folder-management' || seg === 'part-management') {
      setActiveModule(seg as KAMModule);
      setActivePanel(null);
      setCatalogOpen(false);
    }
  }, [location.pathname]);

  const FilterSection = ({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) => (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} onClick={() => onToggle(opt)}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selected.includes(opt) ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/10'
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen relative">
      <VideoBackground />
      <KAMSidebar
        activeModule={activeModule}
        onModuleChange={handleSidebarModuleChange}
        onAction={handleSidebarAction}
        onExpandedChange={setSidebarExpanded}
      />

      <main
        className={`flex-1 p-8 min-h-screen relative z-10 transition-[margin-left] duration-300 ${
          sidebarExpanded ? 'ml-80' : 'ml-28'
        }`}
      >
        <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-6">
          {/* Header */}
          <header className="flex items-center justify-between backdrop-blur-xl rounded-[2.5rem] px-8 py-4 shadow-sm glass-header border border-border/40">
            <div className="flex items-center gap-6">
              {showDashboardUI && (
                <nav className="flex items-center gap-4">
                  {[
                    { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
                    { key: 'calendar' as const, label: 'Calendar', icon: Calendar },
                    { key: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
                  ].map(t => (
                    <button key={t.key} onClick={() => handleDashboardTabChange(t.key)}
                      className={`font-semibold pb-1 flex items-center gap-2 transition-all text-sm ${
                        dashboardTab === t.key ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}>
                      <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                  ))}
                </nav>
              )}
              {!showDashboardUI && (
                <h2 className="font-heading text-sm font-bold text-foreground capitalize">{activeModule.replace('-', ' ')}</h2>
              )}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="border border-border/50 bg-muted/40 rounded-2xl py-2 pl-12 pr-4 w-52 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {showDashboardUI && dashboardTab === 'dashboard' && (
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-primary text-white' : 'glass-card text-muted-foreground hover:text-foreground'}`}>
                  <Filter className="w-4 h-4" /> Filters {activeFilterCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{activeFilterCount}</span>}
                </button>
              )}
              <button onClick={() => setCatalogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
                <ShoppingBag className="w-4 h-4" /> Parts Catalog
              </button>
              <div className="flex items-center rounded-2xl p-1 gap-1 bg-muted/50">
                <button
                  onClick={() => setIsDarkTheme(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    !isDarkTheme ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button
                  onClick={() => setIsDarkTheme(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    isDarkTheme ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 backdrop-blur-xl rounded-[3rem] p-8 border border-border/40 shadow-sm overflow-auto glass-card-glow">
            {/* Nested breadcrumb for URLs like /dashboard/calendar */}
            <nav className="text-xs text-muted-foreground flex items-center gap-2 mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </button>
              {activeModule === 'dashboard' && dashboardTab !== 'dashboard' && (
                <>
                  <span>/</span>
                  <span className="text-foreground">
                    {dashboardTab === 'calendar' ? 'Calendar' : 'Analytics'}
                  </span>
                </>
              )}
              {activeModule === 'engine-management' && (
                <>
                  <span>/</span>
                  <span className="text-foreground">Engine Management</span>
                </>
              )}
              {activeModule === 'client-management' && (
                <>
                  <span>/</span>
                  <span className="text-foreground">Client Management</span>
                </>
              )}
              {activeModule === 'folder-management' && (
                <>
                  <span>/</span>
                  <span className="text-foreground">Folder Management</span>
                </>
              )}
              {activeModule === 'part-management' && (
                <>
                  <span>/</span>
                  <span className="text-foreground">Part Management</span>
                </>
              )}
            </nav>

            {showDashboardUI && dashboardTab === 'dashboard' && (
              <div>
                {/* Welcome */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-1 text-foreground">Hi, {user?.name.split(' ')[0]}!</h1>
                  <p className="text-muted-foreground text-sm">Managing engines across all clients. Here's your operational overview.</p>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="glass-card p-5 rounded-2xl mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-heading text-sm font-bold text-foreground">Filters</p>
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1">
                          <X className="w-3 h-3" /> Clear All
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FilterSection title="Status" options={allStatuses} selected={filterStatus} onToggle={v => toggleFilter(filterStatus, v, setFilterStatus)} />
                      <FilterSection title="Service Type" options={allServices} selected={filterService} onToggle={v => toggleFilter(filterService, v, setFilterService)} />
                      <FilterSection title="Client" options={allClients} selected={filterClient} onToggle={v => toggleFilter(filterClient, v, setFilterClient)} />
                      <FilterSection title="Model" options={allModels} selected={filterModel} onToggle={v => toggleFilter(filterModel, v, setFilterModel)} />
                    </div>
                  </motion.div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {metrics.map((m, i) => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="glass-card-glow p-5 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl ${m.iconBg}`}><m.icon className={`w-5 h-5 ${m.iconColor}`} /></div>
                        <span className="font-body text-sm text-muted-foreground">{m.label}</span>
                      </div>
                      <AnimatedCounter target={m.value} className={`font-heading text-3xl font-bold ${m.accent}`} />
                    </motion.div>
                  ))}
                </div>

                {/* Revenue + RFQ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="glass-card-glow p-6 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/15"><DollarSign className="w-6 h-6 text-primary" /></div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Total Revenue</p>
                      <AnimatedCounter target={totalRevenue} prefix="$" className="font-heading text-2xl font-bold text-foreground" />
                    </div>
                  </div>
                  <div className="w-px h-10 hidden sm:block bg-border/50" />
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-warning/15"><FileQuestion className="w-6 h-6 text-warning" /></div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Pending RFQs</p>
                      <AnimatedCounter target={7} className="font-heading text-2xl font-bold text-warning" />
                    </div>
                  </div>
                </motion.div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card-glow p-6 rounded-2xl">
                    <h3 className="font-heading text-sm font-bold text-foreground mb-4">Engine Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                          {statusData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontFamily: 'Inter', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                        <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card-glow p-6 rounded-2xl">
                    <h3 className="font-heading text-sm font-bold text-foreground mb-4">Revenue per Client ($M)</h3>
                    <ResponsiveContainer width="100%" height={220}>
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
                <h3 className="font-heading text-sm font-bold text-foreground mb-4">
                  All Engines {activeFilterCount > 0 && <span className="text-muted-foreground font-normal">({filteredEngines.length} of {mockEngines.length})</span>}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredEngines.map((engine, i) => <EngineCard key={engine.id} engine={engine} index={i} />)}
                </div>
                {filteredEngines.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">No engines match the selected filters.</div>
                )}
              </div>
            )}

            {activeModule === 'dashboard' && dashboardTab === 'calendar' && <InlineCalendar />}
            {activeModule === 'dashboard' && dashboardTab === 'analytics' && <InlineAnalytics />}
            {activeModule === 'folder-management' && <FolderManagement />}
            {activeModule === 'part-management' && <PartManagement />}
          </div>
        </div>
      </main>

      <PartsCatalog open={catalogOpen} onClose={() => setCatalogOpen(false)} />
      <AnimatePresence>
        {/* Engine Management as dialog */}
        {activeModule === 'engine-management' && (
          createPortal(
            <motion.div
              key="engine-management-dialog"
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEngineClientDialog}
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: 'spring', damping: 22 }}
                className="relative w-full max-w-5xl h-[82vh] rounded-2xl border border-white/10 glass-card-glow overflow-hidden z-[10001]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center"> </span>
                    <h3 className="font-heading text-base font-bold text-foreground">Engine Management</h3>
                  </div>
                  <button
                    onClick={closeEngineClientDialog}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    aria-label="Close engine management dialog"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="h-[calc(82vh-64px)] overflow-auto p-5">
                  <EngineManagement />
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )
        )}

        {/* Client Management as dialog */}
        {activeModule === 'client-management' && (
          createPortal(
            <motion.div
              key="client-management-dialog"
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEngineClientDialog}
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: 'spring', damping: 22 }}
                className="relative w-full max-w-5xl h-[82vh] rounded-2xl border border-white/10 glass-card-glow overflow-hidden z-[10001]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center"> </span>
                    <h3 className="font-heading text-base font-bold text-foreground">Client Management</h3>
                  </div>
                  <button
                    onClick={closeEngineClientDialog}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    aria-label="Close client management dialog"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="h-[calc(82vh-64px)] overflow-auto p-5">
                  <ClientManagement />
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )
        )}

        {activePanel === 'settings' && (
          <SettingsPage
            onClose={() => setActivePanel(null)}
            fontSize={fontSize}
            setFontSize={setFontSize}
            portalView={portalView}
            setPortalView={setPortalView}
          />
        )}
        {activePanel === 'notifications' && <NotificationsPage onClose={() => setActivePanel(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default KAMDashboard;
