import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockParts, mockEngines } from '@/data/mockData';
import { Search, ShoppingCart, X, Mail, ArrowLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VideoBackground from '@/components/VideoBackground';

const sellParts = mockParts.filter(p => p.category === 'Sell' && p.saleStatus === 'Available');

const partImages: Record<string, string> = {
  'PN-73': 'https://images.unsplash.com/photo-1540575467063-178a50c8e3b2?w=400&h=300&fit=crop',
  'PN-56': 'https://images.unsplash.com/photo-1565514158740-064f34bd6cfd?w=400&h=300&fit=crop',
  'PN-81': 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=400&h=300&fit=crop',
  'PN-42': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
  'PN-95': 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=300&fit=crop',
  'PN-67': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=300&fit=crop',
  'PN-38': 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&h=300&fit=crop',
  'PN-14': 'https://images.unsplash.com/photo-1540575467063-178a50c8e3b2?w=400&h=300&fit=crop',
};

const getPartImage = (pn: string) => {
  const prefix = pn.substring(0, 5);
  return partImages[prefix] || partImages['PN-73'];
};

const getEngineESN = (engineId: string) => mockEngines.find(e => e.id === engineId)?.esn || '';

const PublicPartsCatalog = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [conditionFilter, setConditionFilter] = useState('All');

  const conditions = ['All', ...new Set(sellParts.map(p => p.condition))];

  const filtered = sellParts.filter(p => {
    const matchSearch = p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      getEngineESN(p.engineId).toLowerCase().includes(search.toLowerCase());
    const matchCondition = conditionFilter === 'All' || p.condition === conditionFilter;
    return matchSearch && matchCondition;
  });

  const toggleCart = (id: string) => {
    setCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const cartParts = sellParts.filter(p => cart.includes(p.id));

  const contactKAM = () => {
    const lines = cartParts.map(p =>
      `• ${p.partNumber} (${p.serialNumber}) - ${p.condition} - $${p.price?.toLocaleString()}`
    ).join('%0A');
    const subject = encodeURIComponent('Parts Inquiry from GEM India Catalog');
    const body = `Hi,%0A%0AI am interested in the following parts:%0A%0A${lines}%0A%0APlease provide availability and pricing details.%0A%0AThank you`;
    window.location.href = `mailto:kam@globalengine-india.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen relative">
      <VideoBackground />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/10 bg-black/30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">GEM India Parts Catalog</h1>
                <p className="text-xs text-gray-400">{sellParts.length} parts available</p>
              </div>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/80 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Search & Filters */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by part number, serial, or engine ESN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/20 outline-none text-sm backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-gray-400" />
            {conditions.map(c => (
              <button
                key={c}
                onClick={() => setConditionFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  conditionFilter === c
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Parts Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((part, i) => (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md hover:border-primary/40 transition-all group"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={getPartImage(part.partNumber)}
                    alt={part.partNumber}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-heading font-bold text-sm">{part.partNumber}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      part.condition === 'Serviceable' ? 'bg-green-500/15 text-green-400' :
                      part.condition === 'Overhauled' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-amber-500/15 text-amber-400'
                    }`}>
                      {part.condition}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-400 mb-3">
                    <p>SN: {part.serialNumber}</p>
                    <p>Engine: {getEngineESN(part.engineId)}</p>
                    <p>Location: {part.stockLocation}</p>
                    <p>Cert: {part.certification}</p>
                    {part.llpStatus && <p>LLP: {part.llpStatus}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-heading font-bold text-lg">${part.price?.toLocaleString()}</span>
                    <button
                      onClick={() => toggleCart(part.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        cart.includes(part.id)
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-primary/20 text-primary hover:bg-primary/30'
                      }`}
                    >
                      {cart.includes(part.id) ? 'Remove' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-heading">No parts found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border-l border-white/10 h-full overflow-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-heading font-bold text-lg">Inquiry Cart ({cart.length})</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cartParts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-12">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cartParts.map(part => (
                      <div key={part.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <img src={getPartImage(part.partNumber)} className="w-14 h-14 rounded-lg object-cover" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{part.partNumber}</p>
                          <p className="text-gray-400 text-xs">{part.condition} · {part.certification}</p>
                          <p className="text-primary text-sm font-bold">${part.price?.toLocaleString()}</p>
                        </div>
                        <button onClick={() => toggleCart(part.id)} className="text-gray-500 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Total ({cartParts.length} parts)</span>
                      <span className="text-white font-bold">${cartParts.reduce((s, p) => s + (p.price || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={contactKAM}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/80 transition-all"
                  >
                    <Mail className="w-4 h-4" /> Contact KAM for Inquiry
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PublicPartsCatalog;
