import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield, ArrowRightLeft, Check, X, Mail, Eye, EyeOff } from 'lucide-react';
import { mockUsers, mockEngines } from '@/data/mockData';
import { toast } from 'sonner';

type Tab = 'create' | 'access' | 'transfer';

const accessModules = ['Dashboard', 'Engine Details', 'Parts Catalog', 'Analytics', 'Calendar', 'Files & Documents', 'Financials', 'Logistics'];

const ClientManagement = () => {
  const [tab, setTab] = useState<Tab>('create');
  const clients = mockUsers.filter(u => u.role === 'client');

  // Create client
  const [createForm, setCreateForm] = useState({ name: '', email: '', company: '', phone: '' });
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Client access
  const [clientAccess, setClientAccess] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    clients.forEach(c => { init[c.email] = [...accessModules]; });
    return init;
  });

  // Transfer client
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleCreateClient = () => {
    if (!createForm.name || !createForm.email || !createForm.company) {
      toast.error('Please fill all required fields');
      return;
    }
    const pwd = generatePassword();
    setTempPassword(pwd);
    toast.success(`Client ${createForm.name} created. Temporary password generated.`);
  };

  const toggleAccess = (email: string, module: string) => {
    setClientAccess(prev => {
      const current = prev[email] || [];
      return {
        ...prev,
        [email]: current.includes(module) ? current.filter(m => m !== module) : [...current, module],
      };
    });
  };

  const handleTransfer = () => {
    if (!transferFrom || !transferTo || transferFrom === transferTo) {
      toast.error('Please select different source and destination clients');
      return;
    }
    const fromClient = clients.find(c => c.email === transferFrom);
    const toClient = clients.find(c => c.email === transferTo);
    const engineCount = mockEngines.filter(e => e.clientEmail === transferFrom).length;
    toast.success(`${engineCount} engine(s) transferred from ${fromClient?.company} to ${toClient?.company}`);
    setTransferFrom('');
    setTransferTo('');
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const labelCls = "text-xs font-medium text-muted-foreground block mb-1.5";

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 mb-6">
        {[
          { key: 'create' as Tab, label: 'Create Client', icon: UserPlus },
          { key: 'access' as Tab, label: 'Client Access', icon: Shield },
          { key: 'transfer' as Tab, label: 'Transfer Client Data', icon: ArrowRightLeft },
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
          {tab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
              <div className="glass-card-glow p-6 rounded-2xl space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-primary/15"><UserPlus className="w-5 h-5 text-primary" /></div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">Register New Client</h3>
                    <p className="text-xs text-muted-foreground">Client will receive a temporary password and must change it on first login.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Full Name *</label><input className={inputCls} placeholder="John Doe" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div><label className={labelCls}>Email *</label><input className={inputCls} type="email" placeholder="john@company.com" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} /></div>
                  <div><label className={labelCls}>Company *</label><input className={inputCls} placeholder="AeroLease Corp" value={createForm.company} onChange={e => setCreateForm(p => ({ ...p, company: e.target.value }))} /></div>
                  <div><label className={labelCls}>Phone</label><input className={inputCls} placeholder="+91 99999 99999" value={createForm.phone} onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))} /></div>
                </div>
                <button onClick={handleCreateClient} className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
                  <Mail className="w-4 h-4 inline mr-2" /> Create Client & Generate Password
                </button>
                {tempPassword && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-warning/30 bg-warning/10">
                    <p className="text-xs font-medium text-warning mb-2">Temporary Password (share with client):</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-black/30 text-warning font-mono text-sm">
                        {showPassword ? tempPassword : '••••••••••••'}
                      </code>
                      <button onClick={() => setShowPassword(!showPassword)} className="p-2 rounded-lg hover:bg-white/10 text-warning">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(tempPassword); toast.success('Copied!'); }}
                        className="px-3 py-2 rounded-lg bg-warning/20 text-warning text-xs font-medium hover:bg-warning/30">
                        Copy
                      </button>
                    </div>
                    <p className="text-[10px] text-warning/70 mt-2">Client must change this password on first login.</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'access' && (
            <motion.div key="access" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card-glow p-5 rounded-2xl overflow-x-auto">
                <h3 className="font-heading text-sm font-bold text-foreground mb-4">Module Access per Client</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Client</th>
                      {accessModules.map(m => (
                        <th key={m} className="text-center py-3 px-2 text-[10px] font-medium text-muted-foreground">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.email} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <p className="text-sm font-medium text-foreground">{client.name}</p>
                          <p className="text-[10px] text-muted-foreground">{client.company}</p>
                        </td>
                        {accessModules.map(mod => {
                          const hasAccess = (clientAccess[client.email] || []).includes(mod);
                          return (
                            <td key={mod} className="text-center py-3 px-2">
                              <button onClick={() => toggleAccess(client.email, mod)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                  hasAccess ? 'bg-success/20 text-success' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                }`}>
                                {hasAccess ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === 'transfer' && (
            <motion.div key="transfer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
              <div className="glass-card-glow p-6 rounded-2xl space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-warning/15"><ArrowRightLeft className="w-5 h-5 text-warning" /></div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">Transfer Engine Data</h3>
                    <p className="text-xs text-muted-foreground">Move all engine data from one client to another.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>From Client</label>
                    <select className={inputCls} value={transferFrom} onChange={e => setTransferFrom(e.target.value)}>
                      <option value="">-- Select Source --</option>
                      {clients.map(c => <option key={c.email} value={c.email}>{c.company} — {c.name}</option>)}
                    </select>
                    {transferFrom && (
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {mockEngines.filter(e => e.clientEmail === transferFrom).length} engine(s) will be transferred
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>To Client</label>
                    <select className={inputCls} value={transferTo} onChange={e => setTransferTo(e.target.value)}>
                      <option value="">-- Select Destination --</option>
                      {clients.filter(c => c.email !== transferFrom).map(c => <option key={c.email} value={c.email}>{c.company} — {c.name}</option>)}
                    </select>
                  </div>
                </div>
                {transferFrom && transferTo && (
                  <div className="p-4 rounded-xl border border-warning/30 bg-warning/10">
                    <p className="text-xs text-warning">
                      ⚠️ This will transfer {mockEngines.filter(e => e.clientEmail === transferFrom).length} engine(s) and all associated parts, documents, and financial data.
                    </p>
                  </div>
                )}
                <button onClick={handleTransfer} disabled={!transferFrom || !transferTo || transferFrom === transferTo}
                  className="w-full py-3 rounded-xl bg-warning text-white font-medium text-sm hover:bg-warning/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-warning/20">
                  Transfer Data
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientManagement;
