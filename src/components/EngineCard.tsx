import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Engine } from '@/data/mockData';
import { MapPin, Truck, Clock, ArrowRight } from 'lucide-react';
import { getEngineHealth } from '@/lib/engineIntelligence';

const statusConfig: Record<string, { label: string; cls: string }> = {
  'In Transit': { label: 'In Transit', cls: 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-[0_0_0_1px_rgba(245,158,11,0.08)]' },
  'In Repair': { label: 'In Repair', cls: 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-[0_0_0_1px_rgba(56,189,248,0.08)]' },
  'In Storage': { label: 'In Storage', cls: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-[0_0_0_1px_rgba(52,211,153,0.08)]' },
  'Disassembly': { label: 'Disassembly', cls: 'bg-violet-500/20 text-white-200 border border-violet-400/40 shadow-[0_0_0_1px_rgba(167,139,250,0.08)]' },
  'Inspection': { label: 'Inspection', cls: 'bg-orange-500/20 text-orange-200 border border-orange-400/40 shadow-[0_0_0_1px_rgba(251,146,60,0.08)]' },
  'Ready for Release': { label: 'Ready', cls: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-[0_0_0_1px_rgba(52,211,153,0.08)]' },
  'Completed': { label: 'Completed', cls: 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-[0_0_0_1px_rgba(56,189,248,0.08)]' },
  'Preservation Active': { label: 'Preservation', cls: 'bg-teal-500/20 text-teal-200 border border-teal-400/40 shadow-[0_0_0_1px_rgba(45,212,191,0.08)]' },
};

const EngineCard = ({ engine, index }: { engine: Engine; index: number }) => {
  const navigate = useNavigate();
  const status = statusConfig[engine.status] || { label: engine.status, cls: 'bg-muted/50 text-foreground border border-border' };
  const health = getEngineHealth(engine);
  const healthColor =
    health.score >= 80 ? 'text-success' : health.score >= 70 ? 'text-warning' : 'text-destructive';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/engine/${engine.workOrder}-${engine.esn}`)}
      className="glass-card-glow p-5 rounded-2xl cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-heading text-sm font-bold text-primary mt-0.5">{engine.esn}</p>
        </div>
        <div className="flex items-start gap-2">
          {/* Health score mini-ring */}
          <div className="flex flex-col items-end">

            <span className={`mt-2 text-xs font-heading font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {[
          { label: 'Work Order', value: engine.workOrder },
          { label: 'Client', value: engine.clientName },
        ].map(row => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="font-body text-muted-foreground">{row.label}</span>
            <span className="font-body font-medium text-foreground">{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm">
          <span className="font-body text-muted-foreground">Service</span>
          <span className="text-primary text-xs font-heading font-semibold">{engine.serviceType}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs mb-4 font-body rounded-xl px-3 py-2 bg-muted/40 text-muted-foreground">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{engine.currentLocation}</span>
        <Truck className="w-3 h-3 ml-auto flex-shrink-0" />
        <span>{engine.modeOfTransport}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-body text-muted-foreground">Progress</span>
          <span className="text-primary font-heading font-semibold">{engine.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${engine.progress}%` }}
            transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
            className="h-full rounded-full progress-glow"
          />
        </div>
      </div>


    </motion.div>
  );
};

export default EngineCard;
