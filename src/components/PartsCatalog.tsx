import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Mail, Package, Search, Filter } from 'lucide-react';
import { mockParts, mockEngines } from '@/data/mockData';
import type { Part } from '@/data/mockData';

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
    if (!cart.find(c => c.id === part.id)) {
      setCart(prev => [...prev, part]);
    }
  };

  const removeFromCart = (partId: string) => {
    setCart(prev => prev.filter(p => p.id !== partId));
  };

  const contactKAM = () => {
    const partsList = cart.map(p =>
      `• ${p.partNumber} (${p.serialNumber}) - ${getDescription(p.partNumber)} - $${p.price?.toLocaleString()}`
    ).join('%0A');
    const total = cart.reduce((s, p) => s + (p.price || 0), 0);
    const subject = encodeURIComponent(`Parts Inquiry - ${cart.length} parts`);
    const body = `Hi Priya,%0A%0AI am interested in the following parts:%0A%0A${partsList}%0A%0ATotal Quoted: $${total.toLocaleString()}%0A%0APlease share availability and next steps.%0A%0ARegards`;
    window.open(`mailto:kam@gemindia.com?subject=${subject}&body=${body}`, '_self');
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed inset-4 sm:inset-8 z-50 glass-card-glow rounded-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/30 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-lg neon-text tracking-wider">PARTS CATALOG</h2>
              <span className="text-xs font-body text-muted-foreground">({filtered.length} parts available)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCart(!showCart)}
                className="btn-neon py-2 px-3 text-xs flex items-center gap-2 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-heading flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-border/20 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search parts by number or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
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
                      className="glass-card rounded-xl overflow-hidden group hover:shadow-[0_0_20px_hsl(200,100%,50%,0.15)] transition-shadow"
                    >
                      <div className="h-36 overflow-hidden relative">
                        <img
                          src={getImage(part.id)}
                          alt={getDescription(part.partNumber)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-heading uppercase tracking-wider ${
                          part.condition === 'Serviceable' ? 'bg-success/20 text-success' :
                          part.condition === 'Overhauled' ? 'bg-primary/20 neon-text' :
                          'bg-warning/20 text-warning'
                        }`}>
                          {part.condition}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="font-heading text-sm neon-text tracking-wider">{part.partNumber}</p>
                        <p className="text-xs font-body text-muted-foreground">{getDescription(part.partNumber)}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-heading text-lg neon-text-cyan">${part.price?.toLocaleString()}</p>
                        </div>
                        <div className="text-[10px] font-body text-muted-foreground space-y-0.5">
                          <p>SN: {part.serialNumber}</p>
                          <p>From: {engine?.esn}</p>
                          <p>Cert: {part.certification}</p>
                        </div>
                        <button
                          onClick={() => inCart ? removeFromCart(part.id) : addToCart(part)}
                          className={`w-full py-2 rounded-lg text-xs font-heading tracking-wider uppercase transition-all ${
                            inCart ? 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30' : 'btn-neon-solid'
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
                  className="border-l border-border/30 flex flex-col overflow-hidden flex-shrink-0"
                >
                  <div className="p-4 border-b border-border/30">
                    <h3 className="font-heading text-sm neon-text tracking-wider">CART ({cart.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                      <p className="text-xs font-body text-muted-foreground text-center py-8">Your cart is empty</p>
                    ) : (
                      cart.map(p => (
                        <div key={p.id} className="glass-card p-3 rounded-lg flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-heading neon-text truncate">{p.partNumber}</p>
                            <p className="text-[10px] font-body text-muted-foreground truncate">{getDescription(p.partNumber)}</p>
                            <p className="text-xs font-heading neon-text-cyan">${p.price?.toLocaleString()}</p>
                          </div>
                          <button onClick={() => removeFromCart(p.id)} className="p-1 hover:bg-destructive/20 rounded transition-colors">
                            <X className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {cart.length > 0 && (
                    <div className="p-4 border-t border-border/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-body text-muted-foreground">Total Quoted</span>
                        <span className="font-heading text-sm neon-text">${cart.reduce((s, p) => s + (p.price || 0), 0).toLocaleString()}</span>
                      </div>
                      <button onClick={contactKAM} className="btn-neon-solid w-full py-3 text-xs flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" /> Contact KAM
                      </button>
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
