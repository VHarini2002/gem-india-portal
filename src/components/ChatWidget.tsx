import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { mockEngines, mockParts, mockFinancials, mockShipments } from '@/data/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

const getAnswer = (q: string): string => {
  const lower = q.toLowerCase();

  // Engine counts
  const leaseEngines = mockEngines.filter(e => e.serviceType === 'Lease Storage');
  const transitEngines = mockEngines.filter(e => e.status === 'In Transit');
  const storageEngines = mockEngines.filter(e => e.status === 'In Storage' || e.status === 'Preservation Active');
  const repairEngines = mockEngines.filter(e => e.status === 'In Repair');

  if (lower.includes('how many engines') && lower.includes('lease'))
    return `There are ${leaseEngines.length} engines under Lease Storage: ${leaseEngines.map(e => e.esn).join(', ')}.`;
  if (lower.includes('how many') && lower.includes('transit'))
    return `${transitEngines.length} engines are currently In Transit: ${transitEngines.map(e => e.esn).join(', ')}.`;
  if (lower.includes('how many') && lower.includes('storage'))
    return `${storageEngines.length} engines are in storage: ${storageEngines.map(e => e.esn).join(', ')}.`;
  if (lower.includes('how many') && lower.includes('repair'))
    return `${repairEngines.length} engines are In Repair: ${repairEngines.map(e => e.esn).join(', ')}.`;
  if (lower.includes('total engines') || (lower.includes('how many') && lower.includes('engine')))
    return `GEM India is currently managing ${mockEngines.length} engines across all clients.`;

  // Profit / revenue for specific engine
  const esnMatch = lower.match(/(?:esn[- ]?)?(\d{6})/);
  if (esnMatch) {
    const esn = `ESN-${esnMatch[1]}`;
    const engine = mockEngines.find(e => e.esn === esn);
    if (engine) {
      const fin = mockFinancials.find(f => f.engineId === engine.id);
      if (fin) {
        return `Engine ${esn} (${engine.model}, ${engine.serviceType}):\n• Total Revenue: $${fin.totalRevenue.toLocaleString()}\n• Repair Cost: $${fin.repairCost.toLocaleString()}\n• Logistics: $${fin.logisticsCost.toLocaleString()}\n• Net Payable: $${fin.netPayable.toLocaleString()}\n• Payment: ${fin.paymentStatus}`;
      }
      if (engine.serviceType === 'Lease Storage') {
        return `Engine ${esn} is a Lease Storage engine. Revenue is based on storage cost ($150/day) and logistics. No teardown financials.`;
      }
      return `Engine ${esn} found (${engine.model}), but no financial data is available yet.`;
    }
  }

  if (lower.includes('profit') || lower.includes('revenue'))
    return `Total revenue across all teardown engines: $${mockFinancials.reduce((s, f) => s + f.totalRevenue, 0).toLocaleString()}. Net payable to clients: $${mockFinancials.reduce((s, f) => s + f.netPayable, 0).toLocaleString()}.`;

  if (lower.includes('revenue') && lower.includes('calculat'))
    return 'Revenue is calculated from parts sold. Net payable = Total Revenue - Repair Costs - Logistics - Storage - Commission (8%).';

  // Parts
  if (lower.includes('parts') || lower.includes('part'))
    return `Total parts tracked: ${mockParts.length}. Scrap: ${mockParts.filter(p => p.category === 'Scrap').length}, Repair: ${mockParts.filter(p => p.category === 'Repair').length}, Sell: ${mockParts.filter(p => p.category === 'Sell').length}.`;

  // Help
  if (lower.includes('help') || lower.includes('what can'))
    return 'I can answer questions about:\n• Engine counts (transit, repair, storage, lease)\n• Financial data per engine (mention ESN)\n• Parts distribution\n• Revenue calculations\n• General portal navigation\n\nTry: "How many engines are in transit?" or "Profit for 726481"';

  if (lower.includes('hello') || lower.includes('hi'))
    return 'Hello! I\'m the GEM India assistant. Ask me about engines, parts, financials, or logistics. Type "help" for options.';

  return 'I can help with engine status, parts data, financials, and more. Try asking "How many engines are in transit?" or "Profit for engine 726481". Type "help" for all options.';
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'bot', text: 'Welcome to GEM India Assistant! Ask me about engines, parts, financials, or type "help" for options.' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const answer = getAnswer(userMsg.text);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: answer }]);
    }, 400);
  };

  return (
    <>
      {/* Floating bubble */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_hsl(200,100%,50%,0.3)]"
            style={{
              background: 'linear-gradient(135deg, hsl(200,100%,50%), hsl(185,100%,50%))',
            }}
          >
            <MessageCircle className="w-6 h-6 text-background" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-96 flex flex-col border-l"
            style={{
              background: 'linear-gradient(180deg, hsl(225,40%,10%,0.98), hsl(225,54%,8%,0.98))',
              backdropFilter: 'blur(30px)',
              borderColor: 'hsl(200,60%,25%,0.4)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-heading text-sm neon-text tracking-wider">GEM ASSISTANT</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-secondary/50 transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'hsl(200,100%,50%,0.2)' }}>
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm font-body whitespace-pre-line ${
                      m.role === 'user'
                        ? 'bg-primary/20 text-foreground border border-primary/30'
                        : 'glass-card text-foreground/90'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-secondary">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/30">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask about engines, parts, revenue..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-body outline-none transition-all border focus:ring-1 focus:ring-primary"
                  style={{
                    background: 'hsl(225,30%,14%)',
                    borderColor: 'hsl(200,40%,20%)',
                    color: 'hsl(210,40%,92%)',
                  }}
                />
                <button onClick={send} className="btn-neon-solid px-3 py-2.5 rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
