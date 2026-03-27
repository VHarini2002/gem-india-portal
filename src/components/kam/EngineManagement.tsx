import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Shield, ShieldOff, Search, ChevronRight, Plane, X, Check } from 'lucide-react';
import { mockEngines, mockUsers, Engine } from '@/data/mockData';
import { toast } from 'sonner';

type Tab = 'register' | 'access';

const engineModels = ['CFM56-5B', 'CFM56-7B', 'V2500-A5', 'PW1100G', 'LEAP-1A', 'CF34-10E'];
const serviceTypes = ['Teardown & Return', 'Teardown, Repair & Sell', 'Lease Storage'];
const locations = ['Chennai, India', 'Singapore', 'Dubai, UAE', 'London, UK', 'Miami, USA', 'Frankfurt, Germany'];

const clients = mockUsers.filter(u => u.role === 'client');

const EngineManagement = () => {
  const [tab, setTab] = useState<Tab>('register');

  // Register Engine state
  const [regForm, setRegForm] = useState({
    esn: '', model: engineModels[0], clientEmail: clients[0]?.email || '',
    serviceType: serviceTypes[0], location: locations[0], workOrder: '',
  });

  // Access Management state
  const [accessTab, setAccessTab] = useState<'grant' | 'remove'>('grant');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [grantEngines, setGrantEngines] = useState<string[]>([]);
  const [accessGrants, setAccessGrants] = useState<Record<string, string[]>>(() => {
    // Init: each client has access to their own engines
    const grants: Record<string, string[]> = {};
    clients.forEach(c => {
      grants[c.email] = mockEngines.filter(e => e.clientEmail === c.email).map(e => e.id);
    });
    return grants;
  });

  const handleRegister = () => {
    if (!regForm.esn || !regForm.workOrder) {
      toast.error('Please fill ESN and Work Order');
      return;
    }
    toast.success(`Engine ${regForm.esn} registered successfully`);
    setRegForm({ esn: '', model: engineModels[0], clientEmail: clients[0]?.email || '', serviceType: serviceTypes[0], location: locations[0], workOrder: '' });
  };

  const companyClients = clients.filter(c => c.email === selectedCompany);
  const selectedClient = clients.find(c => c.email === selectedCompany);

  const clientAccessibleEngines = selectedCompany ? (accessGrants[selectedCompany] || []) : [];
  const clientInaccessibleEngines = selectedCompany
    ? mockEngines.filter(e => !clientAccessibleEngines.includes(e.id))
    : [];

  const handleGrantAccess = () => {
    if (!selectedCompany || grantEngines.length === 0) return;
    setAccessGrants(prev => ({
      ...prev,
      [selectedCompany]: [...(prev[selectedCompany] || []), ...grantEngines],
    }));
    toast.success(`Granted access to ${grantEngines.length} engine(s) for ${selectedClient?.company || selectedCompany}`);
    setGrantEngines([]);
  };

  const handleRemoveAccess = (engineId: string) => {
    if (!selectedCompany) return;
    setAccessGrants(prev => ({
      ...prev,
      [selectedCompany]: (prev[selectedCompany] || []).filter(id => id !== engineId),
    }));
    const eng = mockEngines.find(e => e.id === engineId);
    toast.success(`Removed access to ${eng?.esn} from ${selectedClient?.company || selectedCompany}`);
  };

  const toggleGrantEngine = (id: string) => {
    setGrantEngines(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const labelCls = "text-xs font-medium text-muted-foreground block mb-1.5";

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'register' as Tab, label: 'Register Engine', icon: Plus },
          { key: 'access' as Tab, label: 'Engine Access Management', icon: Shield },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground glass-card hover:bg-white/5'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
              <div className="glass-card-glow p-6 rounded-2xl space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-primary/15"><Plane className="w-5 h-5 text-primary" /></div>
                  <h3 className="font-heading text-base font-bold text-foreground">Register New Engine</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>ESN (Engine Serial Number)</label><input className={inputCls} placeholder="ESN-XXXXXX" value={regForm.esn} onChange={e => setRegForm(p => ({ ...p, esn: e.target.value }))} /></div>
                  <div><label className={labelCls}>Work Order</label><input className={inputCls} placeholder="WO-2025-XXX" value={regForm.workOrder} onChange={e => setRegForm(p => ({ ...p, workOrder: e.target.value }))} /></div>
                  <div><label className={labelCls}>Engine Model</label><select className={inputCls} value={regForm.model} onChange={e => setRegForm(p => ({ ...p, model: e.target.value }))}>{engineModels.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                  <div><label className={labelCls}>Assign Client</label><select className={inputCls} value={regForm.clientEmail} onChange={e => setRegForm(p => ({ ...p, clientEmail: e.target.value }))}>{clients.map(c => <option key={c.email} value={c.email}>{c.name} ({c.company})</option>)}</select></div>
                  <div><label className={labelCls}>Service Type</label><select className={inputCls} value={regForm.serviceType} onChange={e => setRegForm(p => ({ ...p, serviceType: e.target.value }))}>{serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className={labelCls}>Current Location</label><select className={inputCls} value={regForm.location} onChange={e => setRegForm(p => ({ ...p, location: e.target.value }))}>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                </div>
                <button onClick={handleRegister} className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
                  Register Engine
                </button>
              </div>
            </motion.div>
          )}

          {tab === 'access' && (
            <motion.div key="access" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Sub tabs */}
              <div className="flex gap-2 mb-5">
                <button onClick={() => setAccessTab('grant')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${accessTab === 'grant' ? 'bg-success/20 text-success' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Shield className="w-3.5 h-3.5" /> Grant Access
                </button>
                <button onClick={() => setAccessTab('remove')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${accessTab === 'remove' ? 'bg-destructive/20 text-destructive' : 'text-muted-foreground hover:text-foreground'}`}>
                  <ShieldOff className="w-3.5 h-3.5" /> Remove Access
                </button>
              </div>

              {/* Select Company */}
              <div className="glass-card-glow p-5 rounded-2xl mb-5">
                <label className={labelCls}>Select Client Company</label>
                <select className={inputCls} value={selectedCompany} onChange={e => { setSelectedCompany(e.target.value); setGrantEngines([]); }}>
                  <option value="">-- Select Company --</option>
                  {clients.map(c => <option key={c.email} value={c.email}>{c.company} — {c.name}</option>)}
                </select>
              </div>

              {selectedCompany && accessTab === 'grant' && (
                <div className="glass-card-glow p-5 rounded-2xl space-y-4">
                  <h4 className="font-heading text-sm font-bold text-foreground">Engines Available to Grant</h4>
                  {clientInaccessibleEngines.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">This client already has access to all engines.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {clientInaccessibleEngines.map(eng => (
                          <button key={eng.id} onClick={() => toggleGrantEngine(eng.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              grantEngines.includes(eng.id) ? 'border-success/50 bg-success/10' : 'border-white/10 hover:bg-white/5'
                            }`}>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${grantEngines.includes(eng.id) ? 'bg-success border-success' : 'border-white/20'}`}>
                              {grantEngines.includes(eng.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{eng.esn}</p>
                              <p className="text-[10px] text-muted-foreground">{eng.model} · {eng.clientName}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button onClick={handleGrantAccess} disabled={grantEngines.length === 0}
                        className="w-full py-2.5 rounded-xl bg-success text-white font-medium text-sm hover:bg-success/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        Grant Access to {grantEngines.length} Engine(s)
                      </button>
                    </>
                  )}
                </div>
              )}

              {selectedCompany && accessTab === 'remove' && (
                <div className="glass-card-glow p-5 rounded-2xl space-y-4">
                  <h4 className="font-heading text-sm font-bold text-foreground">Current Engine Access</h4>
                  {clientAccessibleEngines.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No engines assigned to this client.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {clientAccessibleEngines.map(eid => {
                        const eng = mockEngines.find(e => e.id === eid);
                        if (!eng) return null;
                        return (
                          <div key={eid} className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-3">
                              <Plane className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{eng.esn}</p>
                                <p className="text-[10px] text-muted-foreground">{eng.model} · {eng.status}</p>
                              </div>
                            </div>
                            <button onClick={() => handleRemoveAccess(eid)} className="px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive text-xs font-medium hover:bg-destructive/25 transition-all">
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EngineManagement;
