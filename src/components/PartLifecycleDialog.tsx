import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, MapPin, Plane, Ship, Car, CheckCircle, Clock, Circle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Part } from '@/data/mockData';

interface PartLifecycleDialogProps {
  part: Part | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock timeline data generators
const getRepairTimeline = () => [
  { stage: 'Removed from Engine', date: '2024-09-15', status: 'Completed' as const },
  { stage: 'Inspected at GEM', date: '2024-09-22', status: 'Completed' as const },
  { stage: 'Classified as Repairable', date: '2024-09-25', status: 'Completed' as const },
  { stage: 'Sent to MRO', date: '2024-10-02', status: 'Completed' as const },
  { stage: 'At MRO', date: '2024-10-10', status: 'Completed' as const },
  { stage: 'Repair In Progress', date: '2024-11-01', status: 'Active' as const },
  { stage: 'Repair Completed', date: null, status: 'Pending' as const },
  { stage: 'Quality Inspection', date: null, status: 'Pending' as const },
  { stage: 'Ready for Return', date: null, status: 'Pending' as const },
];

const getSellTimeline = (sold: boolean) => [
  { stage: 'Removed from Engine', date: '2024-09-15', status: 'Completed' as const },
  { stage: 'Inspected', date: '2024-09-22', status: 'Completed' as const },
  { stage: 'Certified', date: '2024-10-01', status: 'Completed' as const },
  { stage: 'Listed in Inventory', date: '2024-10-05', status: 'Completed' as const },
  { stage: 'Reserved', date: sold ? '2024-11-10' : null, status: sold ? 'Completed' as const : 'Pending' as const },
  { stage: 'Sold', date: sold ? '2024-11-15' : null, status: sold ? 'Completed' as const : 'Pending' as const },
  { stage: 'Dispatched to Buyer', date: sold ? '2024-11-20' : null, status: sold ? 'Completed' as const : 'Pending' as const },
  { stage: 'Delivered', date: sold ? '2024-12-01' : null, status: sold ? 'Active' as const : 'Pending' as const },
];

const repairDocs = [
  { name: 'Initial Inspection Report', date: '2024-09-22' },
  { name: 'NDT Report', date: '2024-09-25' },
  { name: 'Repair Workscope', date: '2024-10-05' },
  { name: 'Repair Completion Certificate', date: null },
  { name: 'Logistics Documents', date: '2024-10-02' },
];

const sellDocs = [
  { name: 'FAA 8130-3', date: '2024-10-01' },
  { name: 'EASA Form 1', date: '2024-10-01' },
  { name: 'Traceability Report', date: '2024-09-28' },
  { name: 'Shop Release Certificate', date: '2024-10-03' },
  { name: 'Sale Invoice', date: '2024-11-15' },
];

const StatusIcon = ({ status }: { status: 'Completed' | 'Active' | 'Pending' }) => {
  if (status === 'Completed') return <CheckCircle className="w-5 h-5 text-success" />;
  if (status === 'Active') return <Clock className="w-5 h-5 text-primary animate-pulse" />;
  return <Circle className="w-5 h-5 text-muted-foreground/40" />;
};

const TimelineSection = ({ stages }: { stages: ReturnType<typeof getRepairTimeline> }) => (
  <div className="relative pl-8">
    <div className="absolute left-[9px] top-3 bottom-3 w-px bg-border/50" />
    {stages.map((s, i) => (
      <motion.div
        key={s.stage}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.08 }}
        className={`relative flex items-start gap-4 py-3 ${s.status === 'Active' ? 'drop-shadow-[0_0_8px_hsl(200,100%,50%,0.4)]' : ''}`}
      >
        <div className="absolute left-[-23px]">
          <StatusIcon status={s.status} />
        </div>
        <div className="flex-1">
          <p className={`font-heading text-sm tracking-wide ${s.status === 'Active' ? 'neon-text' : s.status === 'Completed' ? 'text-foreground' : 'text-muted-foreground/60'}`}>
            {s.stage}
          </p>
          <p className="text-xs font-body text-muted-foreground mt-0.5">{s.date ?? '—'}</p>
        </div>
        <span className={`text-[10px] font-heading uppercase tracking-widest px-2 py-0.5 rounded ${
          s.status === 'Completed' ? 'bg-success/15 text-success' : s.status === 'Active' ? 'bg-primary/20 neon-text' : 'bg-secondary text-muted-foreground/50'
        }`}>
          {s.status}
        </span>
      </motion.div>
    ))}
  </div>
);

const DocumentGrid = ({ docs }: { docs: typeof repairDocs }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {docs.map((d, i) => (
      <motion.div
        key={d.name}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.06 }}
        className="glass-card p-3 rounded-lg flex items-center gap-3 hover:shadow-[0_0_12px_hsl(200,100%,50%,0.15)] transition-shadow cursor-pointer group"
      >
        <FileText className="w-5 h-5 text-primary group-hover:text-accent transition-colors flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-heading truncate">{d.name}</p>
          <p className="text-[10px] text-muted-foreground font-body">{d.date ?? 'Pending'}</p>
        </div>
        <button className="btn-neon py-1 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">View</button>
      </motion.div>
    ))}
  </div>
);

const InfoPill = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="glass-card p-3 rounded-lg">
    <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={`text-sm font-heading mt-0.5 ${highlight ? 'neon-text' : ''}`}>{value}</p>
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-heading text-xs neon-text-cyan tracking-[0.2em] uppercase mb-4 mt-6 border-b border-border/30 pb-2">{children}</h4>
);

const PartLifecycleDialog = ({ part, open, onOpenChange }: PartLifecycleDialogProps) => {
  if (!part) return null;

  const isSold = part.saleStatus === 'Sold';
  const transitProgress = Math.floor(Math.random() * 40) + 50;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 border-0 bg-transparent shadow-none overflow-hidden sm:rounded-xl">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-[hsl(var(--card))]/95 backdrop-blur-xl border border-primary/30 rounded-xl shadow-[0_0_40px_hsl(200,100%,50%,0.12)]"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/30">
            <DialogTitle className="font-heading text-base tracking-wider neon-text pr-8">
              {part.category === 'Repair' ? `Repair Lifecycle – ${part.partNumber}` : `Sales & Certification – ${part.partNumber}`}
            </DialogTitle>
          </div>

          <ScrollArea className="max-h-[65vh] overflow-y-auto">
            <div className="p-5 space-y-1">
              {part.category === 'Repair' ? (
                <RepairContent part={part} transitProgress={transitProgress} />
              ) : (
                <SellContent part={part} isSold={isSold} />
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── REPAIR ─── */
const RepairContent = ({ part, transitProgress }: { part: Part; transitProgress: number }) => (
  <>
    {/* Summary */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <InfoPill label="Part Number" value={part.partNumber} highlight />
      <InfoPill label="Serial Number" value={part.serialNumber} />
      <InfoPill label="Current Location" value={part.currentLocation} />
      <InfoPill label="Repair Status" value="In Progress" />
      <InfoPill label="Repair Cost" value={`$${part.repairCost?.toLocaleString() ?? '—'}`} />
      <InfoPill label="Est. Completion" value={part.eta ?? '—'} />
    </div>

    {/* Transport */}
    <SectionHeading>Transport Details</SectionHeading>
    <div className="glass-card-glow p-4 rounded-xl space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-body">
        <div><p className="text-muted-foreground">From</p><p>Chennai, India</p></div>
        <div><p className="text-muted-foreground">To</p><p>Singapore MRO</p></div>
        <div><p className="text-muted-foreground">Mode</p><div className="flex items-center gap-1"><Plane className="w-3 h-3" /> Air</div></div>
        <div><p className="text-muted-foreground">Carrier</p><p>Emirates SkyCargo</p></div>
        <div><p className="text-muted-foreground">Shipment ID</p><p className="neon-text">SHP-RP-0042</p></div>
        <div><p className="text-muted-foreground">Dispatch</p><p>2024-10-02</p></div>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground">Currently at MRO – SG Aero Services</span>
        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${transitProgress}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full progress-glow" />
        </div>
        <span className="text-xs neon-text font-heading">{transitProgress}%</span>
      </div>
    </div>

    {/* Timeline */}
    <SectionHeading>Repair Process Timeline</SectionHeading>
    <TimelineSection stages={getRepairTimeline()} />

    {/* Documents */}
    <SectionHeading>Repair Documents</SectionHeading>
    <DocumentGrid docs={repairDocs} />
  </>
);

/* ─── SELL ─── */
const SellContent = ({ part, isSold }: { part: Part; isSold: boolean }) => (
  <>
    {/* Summary */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <InfoPill label="Part Number" value={part.partNumber} highlight />
      <InfoPill label="Serial Number" value={part.serialNumber} />
      <InfoPill label="Condition" value={part.condition} />
      <InfoPill label="LLP Status" value={part.llpStatus ?? '—'} />
      <InfoPill label="Certification" value={part.certification ?? '—'} />
      <InfoPill label="Stock Location" value={part.stockLocation ?? '—'} />
      <InfoPill label="Availability" value={part.saleStatus ?? '—'} />
      <InfoPill label="Price" value={`$${part.price?.toLocaleString() ?? '—'}`} />
      {isSold && <InfoPill label="Buyer" value="AeroParts Global Ltd" />}
    </div>

    {/* Sale Timeline */}
    <SectionHeading>Sale Process Timeline</SectionHeading>
    <TimelineSection stages={getSellTimeline(isSold)} />

    {/* Cert Docs */}
    <SectionHeading>Certification Documents</SectionHeading>
    <DocumentGrid docs={sellDocs} />

    {/* Commercial */}
    <SectionHeading>Commercial Details</SectionHeading>
    <div className="glass-card-glow p-4 rounded-xl">
      {isSold ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-body">
          <div><p className="text-muted-foreground">Sale Price</p><p className="neon-text font-heading">${part.price?.toLocaleString()}</p></div>
          <div><p className="text-muted-foreground">Sale Date</p><p>2024-11-15</p></div>
          <div><p className="text-muted-foreground">Buyer</p><p>AeroParts Global Ltd</p></div>
          <div><p className="text-muted-foreground">Logistics</p><div className="flex items-center gap-1"><Ship className="w-3 h-3" /> Sea</div></div>
          <div><p className="text-muted-foreground">Delivery</p><p className="text-success">Confirmed</p></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-body">
          <div><p className="text-muted-foreground">Asking Price</p><p className="neon-text font-heading">${part.price?.toLocaleString()}</p></div>
          <div><p className="text-muted-foreground">Last Inspection</p><p>2024-10-01</p></div>
          <div><p className="text-muted-foreground">Est. Dispatch</p><p>5–7 business days</p></div>
        </div>
      )}
    </div>
  </>
);

export default PartLifecycleDialog;
export { PartLifecycleDialog };
