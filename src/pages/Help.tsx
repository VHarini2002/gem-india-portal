import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail, Phone, MessageSquare, ChevronDown } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How is revenue calculated?', a: 'Revenue comes from parts sold after teardown. Net payable = Total Revenue − Repair Costs − Logistics − Storage − Commission (8%). Lease storage engines earn revenue from daily storage fees and logistics charges.' },
  { q: 'What is the difference between Teardown & Return vs Teardown, Repair & Sell?', a: 'Teardown & Return: The engine is disassembled and serviceable parts are returned to the client. Teardown, Repair & Sell: Parts are categorized as Scrap, Repair, or Sell. Repairable parts go to MROs, sellable parts are certified and marketed.' },
  { q: 'What does Lease Storage include?', a: 'Lease Storage covers engine preservation in climate-controlled bays. Costs are based on a daily rate. The engine is maintained in ready-for-lease condition with active preservation protocols.' },
  { q: 'How do I track my engine\'s location?', a: 'Go to the engine detail page and open the Logistics tab. You\'ll see real-time shipment tracking with carrier info, ETA, and transit progress percentage.' },
  { q: 'What certifications do parts receive?', a: 'Sellable parts are certified with FAA 8130-3, EASA Form 1, traceability reports, and shop release certificates before being listed for sale.' },
  { q: 'How are repair costs determined?', a: 'Repair costs depend on the MRO workscope, which is based on the initial inspection and NDT results. Costs include labor, materials, and logistics to/from the MRO facility.' },
  { q: 'What is an LLP part?', a: 'LLP (Life Limited Parts) are components with a finite number of flight cycles. Their remaining life directly impacts value and certification requirements.' },
  { q: 'How do I contact my KAM?', a: 'Use the Contact KAM section below, or click the chat icon on any page to ask the GEM Assistant for quick answers.' },
];

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <header className="relative z-10 glass-card border-b border-border/30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-heading text-xl neon-text tracking-wider">HELP & SUPPORT</h1>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-glow p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg neon-text tracking-wider">FREQUENTLY ASKED QUESTIONS</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/30">
                <AccordionTrigger className="font-heading text-sm text-foreground/90 hover:neon-text tracking-wide hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact KAM */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card-glow p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-accent" />
            <h2 className="font-heading text-lg neon-text-cyan tracking-wider">CONTACT YOUR KAM</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">KAM Assigned</p>
              <p className="font-heading text-sm mt-1">Priya Sharma</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Role</p>
              <p className="font-heading text-sm mt-1">Key Account Manager</p>
            </div>
            <div className="glass-card p-4 rounded-lg flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="font-body text-xs text-muted-foreground">Email</p>
                <p className="font-heading text-sm neon-text">kam@gemindia.com</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="font-body text-xs text-muted-foreground">Phone</p>
                <p className="font-heading text-sm neon-text">+91 98765 43210</p>
              </div>
            </div>
          </div>
          <button className="mt-4 btn-neon-solid py-3 px-6 text-sm w-full rounded-xl">
            Send Message to KAM
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
