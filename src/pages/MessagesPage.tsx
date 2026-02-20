import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, HelpCircle, Mail, Phone, Send, ThumbsUp, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How is revenue calculated?', a: 'Revenue comes from parts sold after teardown. Net payable = Total Revenue − Repair Costs − Logistics − Storage − Commission (8%). Lease storage engines earn revenue from daily storage fees.' },
  { q: 'What is the difference between Teardown & Return vs Teardown, Repair & Sell?', a: 'Teardown & Return: The engine is disassembled and serviceable parts are returned to the client. Teardown, Repair & Sell: Parts are categorized as Scrap, Repair, or Sell.' },
  { q: 'What does Lease Storage include?', a: 'Lease Storage covers engine preservation in climate-controlled bays. The engine is maintained in ready-for-lease condition with active preservation protocols.' },
  { q: 'How do I track my engine\'s location?', a: 'Go to the engine detail page and open the Logistics tab. You\'ll see real-time shipment tracking with carrier info, ETA, and transit progress.' },
  { q: 'What certifications do parts receive?', a: 'Sellable parts are certified with FAA 8130-3, EASA Form 1, traceability reports, and shop release certificates before being listed for sale.' },
];

interface MessagesPageProps {
  onClose: () => void;
}

const MessagesPage = ({ onClose }: MessagesPageProps) => {
  const [tab, setTab] = useState<'help' | 'feedback'>('help');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature'>('general');
  const [sent, setSent] = useState(false);

  const sendFeedback = () => {
    if (!feedback.trim()) return;
    setSent(true);
    setFeedback('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        transition={{ type: 'spring', damping: 28 }}
        className="relative z-10 w-full max-w-lg h-full flex flex-col overflow-hidden"
        style={{ background: 'rgba(10, 12, 22, 0.92)', backdropFilter: 'blur(32px)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/08 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading text-base font-bold text-foreground">Help & Feedback</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/08 flex-shrink-0">
          {[{ key: 'help', label: 'Help & FAQs', icon: HelpCircle }, { key: 'feedback', label: 'Send Feedback', icon: ThumbsUp }].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-3 text-xs font-heading font-semibold flex items-center justify-center gap-2 transition-colors ${
                tab === t.key ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'help' ? (
            <div className="p-5 space-y-6">
              {/* FAQs */}
              <div>
                <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">Frequently Asked Questions</h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border border-white/10 rounded-xl px-4">
                      <AccordionTrigger className="font-heading text-xs font-semibold text-foreground hover:text-primary hover:no-underline py-3">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="font-body text-xs text-muted-foreground leading-relaxed pb-3">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Contact KAM */}
              <div>
                <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Your KAM</h3>
                <div className="glass-card p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 flex items-center justify-center">
                      <span className="font-heading text-sm font-bold text-primary">PS</span>
                    </div>
                    <div>
                      <p className="text-sm font-heading font-semibold text-foreground">Priya Sharma</p>
                      <p className="text-xs font-body text-muted-foreground">Key Account Manager</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <a href="mailto:kam@globalengine-india.com" className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-xs font-body text-primary">kam@globalengine-india.com</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-white/05 border border-white/10">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-body text-muted-foreground">+91 98765 43210</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {sent && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-success/15 border border-success/30">
                  <ThumbsUp className="w-4 h-4 text-success" />
                  <p className="text-sm font-heading font-semibold text-success">Thank you! Your feedback has been sent.</p>
                </motion.div>
              )}

              <div>
                <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Feedback Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['general', 'bug', 'feature'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFeedbackType(type)}
                      className={`py-2 rounded-xl border text-xs font-heading font-semibold capitalize transition-all ${
                        feedbackType === type ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      {type === 'bug' ? '🐛 Bug' : type === 'feature' ? '✨ Feature' : '💬 General'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Your Message</label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Describe your issue, suggestion, or feedback..."
                  rows={6}
                  className="w-full bg-white/05 border border-white/10 rounded-xl p-4 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <button
                onClick={sendFeedback}
                disabled={!feedback.trim()}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" /> Send Feedback
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MessagesPage;
