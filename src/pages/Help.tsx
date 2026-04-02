import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Clock3 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How is revenue calculated?', a: 'Revenue comes from parts sold after teardown. Net payable = Total Revenue − Repair Costs − Logistics − Storage − Commission (8%). Lease storage engines earn revenue from daily storage fees and logistics charges.' },
  { q: 'What is the difference between Teardown & Return vs Teardown, Repair & Sell?', a: 'Teardown & Return: The engine is disassembled and serviceable parts are returned to the client. Teardown, Repair & Sell: Parts are categorized as Scrap, Repair, or Sell. Repairable parts go to MROs, sellable parts are certified and marketed.' },
  { q: 'What does Lease Storage include?', a: 'Lease Storage covers engine preservation in climate-controlled bays. Costs are based on a daily rate. The engine is maintained in ready-for-lease condition with active preservation protocols.' },
  { q: 'How do I track my engine\'s location?', a: 'Go to the engine detail page and open the Logistics tab. You\'ll see real-time shipment tracking with carrier info, ETA, and transit progress percentage.' },
  { q: 'What certifications do parts receive?', a: 'Sellable parts are certified with FAA 8130-3, EASA Form 1, traceability reports, and shop release certificates before being listed for sale.' },
  { q: 'How are repair costs determined?', a: 'Repair costs depend on the MRO workscope, which is based on the initial inspection and NDT results. Costs include labor, materials, and logistics to/from the MRO facility.' },
  { q: 'What is an LLP part?', a: 'LLP (Life Limited Parts) are components with a finite number of flight cycles. Their remaining life directly impacts value and certification requirements.' },
  { q: 'How do I contact my KAM?', a: 'Use the Contact KAM section below, or open GEM AI from the footer on any page for quick answers.' },
];

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/25 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <h1 className="font-heading text-base font-bold text-white">Help & Support</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="text-center mb-2">
          <div className="text-[11px] tracking-[0.2em] text-white/30 uppercase">Help & Support</div>
          <h2 className="font-heading text-5xl mt-2">How can we help?</h2>
          <p className="text-sm text-white/45 mt-2">Your customer account manager is your single point of contact.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[#F5C000]/25 bg-[#111113]/80 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-[#F5C000]/15 border border-[#F5C000]/30 flex items-center justify-center text-[#F5C000] font-semibold">
                PS
              </div>
              <div>
                <div className="font-semibold">Priya Sharma</div>
                <div className="text-xs text-white/40">Customer Account Manager</div>
                <div className="text-xs text-emerald-300 mt-1">Available now</div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#F5C000]"><Mail className="w-4 h-4" /> kam@globalengine-india.com</div>
              <div className="flex items-center gap-2 text-white/75"><Phone className="w-4 h-4" /> +91 98765 43210</div>
              <div className="flex items-center gap-2 text-white/50"><Clock3 className="w-4 h-4" /> Mon-Fri, 08:00-18:00 IST</div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="h-10 rounded-full bg-[#F5C000]/10 border border-[#F5C000]/35 text-[#F5C000] text-sm">Send Email</button>
              <button className="h-10 rounded-full bg-white/5 border border-white/15 text-white/70 text-sm">Call Now</button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-white/10 bg-[#111113]/80 p-6">
            <div className="text-[11px] tracking-[0.15em] text-white/40 uppercase mb-3">Send Feedback</div>
            <select className="w-full h-11 rounded-xl bg-white/5 border border-white/15 px-3 text-sm text-white/80 mb-3">
              <option>General Feedback</option>
              <option>Report a Portal Issue</option>
              <option>Request Additional Access</option>
              <option>Escalate to Management</option>
            </select>
            <textarea className="w-full min-h-[130px] rounded-xl bg-white/5 border border-white/15 p-3 text-sm text-white placeholder:text-white/30" placeholder="Describe your feedback or issue..." />
            <button className="mt-4 w-full h-11 rounded-full bg-[#F5C000]/10 border border-[#F5C000]/35 text-[#F5C000] text-sm font-medium">
              Send Message
            </button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/10 bg-[#111113]/80 p-2">
          <Accordion type="single" collapsible className="space-y-1">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-transparent rounded-xl px-4 data-[state=open]:bg-white/[0.04]">
                <AccordionTrigger className="font-heading text-sm font-semibold text-white hover:text-[#F5C000] hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm text-white/50 leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
