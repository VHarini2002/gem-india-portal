import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Mail, Package, Search } from 'lucide-react';
import { mockParts, mockEngines } from '@/data/mockData';
import type { Part } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';

const partDescriptions: Record<string, string> = {
  'PN-73': 'High Pressure Turbine Blade',
  'PN-56': 'Combustion Chamber Liner',
  'PN-81': 'Fan Blade Assembly',
  'PN-42': 'Compressor Stator Vane',
  'PN-95': 'Bearing Housing Assembly',
  'PN-67': 'Fuel Nozzle Module',
  'PN-38': 'Turbine Disc Segment',
  'PN-14': 'Accessory Gearbox Cover',
};

const partImages = [
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=300&h=200&fit=crop',
];

const getDescription = (partNumber: string) => {
  const prefix = partNumber.substring(0, 5);
  return partDescriptions[prefix] || 'Engine Component';
};

const getImage = (partId: string) => {
  const idx = parseInt(partId) % partImages.length;
  return partImages[idx];
};

interface PartsCatalogProps {
  open: boolean;
  onClose: () => void;
}

const PartsCatalog = ({ open, onClose }: PartsCatalogProps) => {
  const { isDarkTheme } = useTheme();
  const [cart, setCart] = useState<Part[]>([]);
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);

  const sellableParts = useMemo(() =>
    mockParts.filter(p => p.category === 'Sell' && p.saleStatus === 'Available').slice(0, 30),
  []);

  const filtered = useMemo(() =>
    sellableParts.filter(p =>
      p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      getDescription(p.partNumber).toLowerCase().includes(search.toLowerCase())
    ),
  [search, sellableParts]);

  const addToCart = (part: Part) => {
    if (!cart.find(c => c.id === part.id)) setCart(prev => [...prev, part]);
  };

  const removeFromCart = (partId: string) => setCart(prev => prev.filter(p => p.id !== partId));

  const contactKAM = () => {
    const partsList = cart.map(p => `• ${p.partNumber} (${p.serialNumber}) - ${getDescription(p.partNumber)} - $${p.price?.toLocaleString()}`).join('%0A');
    const total = cart.reduce((s, p) => s + (p.price || 0), 0);
    const subject = encodeURIComponent(`Parts Inquiry - ${cart.length} parts`);
    const body = `Hi Priya,%0A%0AI am interested in the following parts:%0A%0A${partsList}%0A%0ATotal Quoted: $${total.toLocaleString()}%0A%0APlease share availability and next steps.%0A%0ARegards`;
    window.open(`mailto:kam@globalengine-india.com?subject=${subject}&body=${body}`, '_self');
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className={`fixed inset-4 sm:inset-8 z-50 rounded-2xl flex flex-col overflow-hidden ${
            isDarkTheme ? 'glass-card-glow bg-slate-900/90' : 'bg-white shadow-2xl'
          }`}
        >
          {/* Header */}
          <div className={`p-5 border-b flex items-center justify-between flex-shrink-0 ${
            isDarkTheme ? 'border-white/10 bg-slate-900/95' : 'border-border/40 bg-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className={`font-heading text-base font-bold ${
                  isDarkTheme ? 'text-white' : 'text-foreground'
                }`}>
                  Parts Catalog
                </h2>
                <span className={`text-xs font-body ${
                  isDarkTheme ? 'text-gray-400' : 'text-muted-foreground'
                }`}>
                  {filtered.length} parts available for sale
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCart(!showCart)}
                className={`py-2 px-3 text-xs flex items-center gap-2 relative rounded-xl border transition-colors ${
                  isDarkTheme
                    ? 'bg-white/5 border-white/10 text-gray-100 hover:bg-white/10'
                    : 'bg-white border-border/40 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShoppingCart className="w-4 h-4" /> Cart
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-heading font-bold flex items-center justify-center">{cart.length}</span>
                )}
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-5 h-5 ${
                  isDarkTheme ? 'text-gray-400' : 'text-muted-foreground'
                }`} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className={`px-5 py-3 border-b flex-shrink-0 ${
            isDarkTheme ? 'border-white/10 bg-slate-900/90' : 'border-border/20 bg-white'
          }`}>
            <div className="relative">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkTheme ? 'text-gray-500' : 'text-muted-foreground'
              }`} />
              <input
                type="text"
                placeholder="Search parts by number or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  isDarkTheme
                    ? 'bg-white/5 border-white/15 text-white placeholder:text-gray-500'
                    : 'bg-white/60 border-border/40 text-foreground placeholder:text-muted-foreground'
                }`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Parts Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((part, i) => {
                  const inCart = cart.some(c => c.id === part.id);
                  const engine = mockEngines.find(e => e.id === part.engineId);
                  return (
                    <motion.div
                      key={part.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`rounded-2xl overflow-hidden group transition-all ${
                        isDarkTheme
                          ? 'bg-slate-900/80 border border-white/10 hover:border-primary/60 hover:shadow-lg'
                          : 'glass-card hover:shadow-lg'
                      }`}
                    >
                      <div className="h-36 overflow-hidden relative">
                        <img src={getImage(part.id)} alt={getDescription(part.partNumber)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${
                          isDarkTheme ? 'from-slate-950/90 to-transparent' : 'from-white/80 to-transparent'
                        }`} />
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-heading font-semibold ${
                          part.condition === 'Serviceable' ? 'bg-green-50 text-success border border-green-200' :
                          part.condition === 'Overhauled' ? 'bg-blue-50 text-primary border border-blue-200' :
                          'bg-amber-50 text-warning border border-amber-200'
                        }`}>{part.condition}</span>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="font-heading text-sm font-bold text-primary">{part.partNumber}</p>
                        <p className={`text-xs font-body ${
                          isDarkTheme ? 'text-gray-400' : 'text-muted-foreground'
                        }`}>x``
                          {getDescription(part.partNumber)}
                        </p>
                        <p className={`font-heading text-lg font-bold ${
                          isDarkTheme ? 'text-white' : 'text-foreground'
                        }`}>
                          ${part.price?.toLocaleString()}
                        </p>
                        <div className={`text-[10px] font-body space-y-0.5 rounded-lg p-2 ${
                          isDarkTheme
                            ? 'bg-white/5 text-gray-300'
                            : 'bg-white/40 text-muted-foreground'
                        }`}>
                          <p>SN: {part.serialNumber}</p>
                          <p>From: {engine?.esn}</p>
                          <p>Cert: {part.certification}</p>
                        </div>
                        <button
                          onClick={() => inCart ? removeFromCart(part.id) : addToCart(part)}
                          className={`w-full py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                            inCart
                              ? 'bg-red-50 text-destructive border border-red-200 hover:bg-red-100'
                              : 'btn-primary'
                          }`}
                        >
                          {inCart ? 'Remove from Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Cart Sidebar */}
            <AnimatePresence>
              {showCart && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className={`border-l flex flex-col overflow-hidden flex-shrink-0 ${
                    isDarkTheme ? 'border-white/10 bg-slate-900/95' : 'border-border/40 bg-white'
                  }`}
                >
                  <div className="p-4 border-b border-border/30 flex items-center justify-between gap-2">
                    <h3 className={`font-heading text-sm font-bold ${
                      isDarkTheme ? 'text-white' : 'text-foreground'
                    }`}>
                      Cart ({cart.length})
                    </h3>
                    {cart.length > 0 && (
                      <button
                        onClick={contactKAM}
                        className={`text-[11px] px-3 py-1.5 rounded-xl font-heading font-semibold flex items-center gap-1.5 ${
                          isDarkTheme
                            ? 'bg-primary/90 text-white hover:bg-primary'
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Contact KAM
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs font-body text-muted-foreground">Your cart is empty</p>
                      </div>
                    ) : (
                      cart.map(p => (
                        <div
                          key={p.id}
                          className={`border p-3 rounded-xl flex items-center gap-3 ${
                            isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/60 border-border/40'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-heading font-bold text-primary truncate">{p.partNumber}</p>
                            <p className={`text-[10px] font-body truncate ${
                              isDarkTheme ? 'text-gray-400' : 'text-muted-foreground'
                            }`}>
                              {getDescription(p.partNumber)}
                            </p>
                            <p className={`text-xs font-heading font-semibold ${
                              isDarkTheme ? 'text-white' : 'text-foreground'
                            }`}>
                              ${p.price?.toLocaleString()}
                            </p>
                          </div>
                          <button onClick={() => removeFromCart(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {cart.length > 0 && (
                    <div className={`p-4 border-t space-y-3 ${
                      isDarkTheme ? 'border-white/10' : 'border-border/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-body ${
                          isDarkTheme ? 'text-gray-400' : 'text-muted-foreground'
                        }`}>
                          Total Quoted
                        </span>
                        <span className={`font-heading text-sm font-bold ${
                          isDarkTheme ? 'text-white' : 'text-foreground'
                        }`}>
                          ${cart.reduce((s, p) => s + (p.price || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PartsCatalog;
