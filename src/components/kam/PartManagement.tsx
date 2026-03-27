import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Search, X, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { mockParts, mockEngines } from '@/data/mockData';
import { toast } from 'sonner';

const PartManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [addForm, setAddForm] = useState({ partNumber: '', description: '', esn: '', price: '', condition: 'Serviceable', image: '' });

  const sellParts = mockParts.filter(p => p.category === 'Sell' && p.saleStatus === 'Available');

  const filtered = sellParts.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    const eng = mockEngines.find(e => e.id === p.engineId);
    return p.partNumber.toLowerCase().includes(q) || eng?.esn.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q);
  });

  const handleAddPart = () => {
    if (!addForm.partNumber || !addForm.esn || !addForm.price) {
      toast.error('Please fill Part Number, ESN, and Price');
      return;
    }
    toast.success(`Part ${addForm.partNumber} added to catalog`);
    setAddForm({ partNumber: '', description: '', esn: '', price: '', condition: 'Serviceable', image: '' });
    setShowAddForm(false);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const labelCls = "text-xs font-medium text-muted-foreground block mb-1.5";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Parts Catalog Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search parts..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 w-56" />
          </div>
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add New Part
          </button>
        </div>
      </div>

      {/* Part Cards */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 30).map((part, i) => {
            const eng = mockEngines.find(e => e.id === part.engineId);
            return (
              <motion.div key={part.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card-glow p-4 rounded-2xl space-y-3">
                {/* Image placeholder */}
                <div className="w-full h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-primary">{part.partNumber}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">SN: {part.serialNumber}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{eng?.esn} · {part.condition}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${part.certification === 'EASA' ? 'bg-success/15 text-success' : part.certification === 'FAA' ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
                    {part.certification}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <p className="font-heading text-lg font-bold text-foreground">${part.price?.toLocaleString()}</p>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-all">
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No parts found matching your search.</div>
        )}
      </div>

      {/* Add Part Dialog */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg rounded-2xl p-6 border border-white/10 glass-card-glow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-base font-bold text-foreground">Add New Part</h3>
                <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Part Number *</label><input className={inputCls} placeholder="PN-XXXXXX" value={addForm.partNumber} onChange={e => setAddForm(p => ({ ...p, partNumber: e.target.value }))} /></div>
                  <div><label className={labelCls}>ESN *</label><input className={inputCls} placeholder="ESN-XXXXXX" value={addForm.esn} onChange={e => setAddForm(p => ({ ...p, esn: e.target.value }))} /></div>
                  <div><label className={labelCls}>Price (USD) *</label><input className={inputCls} type="number" placeholder="50000" value={addForm.price} onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))} /></div>
                  <div><label className={labelCls}>Condition</label>
                    <select className={inputCls} value={addForm.condition} onChange={e => setAddForm(p => ({ ...p, condition: e.target.value }))}>
                      {['Serviceable', 'As-Removed', 'Overhauled', 'New', 'Inspected'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className={labelCls}>Description</label><textarea className={inputCls + ' resize-none'} rows={2} placeholder="Part description..." value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div>
                  <label className={labelCls}>Image (optional)</label>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/20 hover:border-primary/50 cursor-pointer transition-all">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Click to upload image</span>
                  </div>
                </div>
                <button onClick={handleAddPart} className="w-full py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
                  Add Part to Catalog
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartManagement;
