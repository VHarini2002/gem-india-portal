import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Engine } from '@/data/mockData';
import { MapPin, Truck, Clock, ArrowRight } from 'lucide-react';

const statusConfig: Record<string, { label: string; cls: string }> = {
  'In Transit': { label: 'In Transit', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/25' },
  'In Repair': { label: 'In Repair', cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' },
  'In Storage': { label: 'In Storage', cls: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' },
  'Disassembly': { label: 'Disassembly', cls: 'bg-purple-500/15 text-purple-400 border border-purple-500/25' },
  'Inspection': { label: 'Inspection', cls: 'bg-orange-500/15 text-orange-400 border border-orange-500/25' },
  'Ready for Release': { label: 'Ready', cls: 'bg-green-500/15 text-green-400 border border-green-500/25' },
  'Completed': { label: 'Completed', cls: 'bg-primary/15 text-primary border border-primary/25' },
  'Preservation Active': { label: 'Preservation', cls: 'bg-teal-500/15 text-teal-400 border border-teal-500/25' },
};

const EngineCard = ({ engine, index }: { engine: Engine; index: number }) => {
  const navigate = useNavigate();
  const status = statusConfig[engine.status] || { label: engine.status, cls: 'bg-muted/50 text-foreground border border-border' };

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
          <p className="font-body text-xs text-muted-foreground">ESN</p>
          <p className="font-heading text-sm font-bold text-primary mt-0.5">{engine.esn}</p>
        </div>
        <span className={`text-xs font-heading font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {[
          { label: 'Work Order', value: engine.workOrder },
          { label: 'Client', value: engine.clientName },
        ].map(row => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-muted-foreground font-body">{row.label}</span>
            <span className="text-foreground font-body font-medium">{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-body">Service</span>
          <span className="text-primary text-xs font-heading font-semibold">{engine.serviceType}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-body bg-white/5 rounded-xl px-3 py-2">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{engine.currentLocation}</span>
        <Truck className="w-3 h-3 ml-auto flex-shrink-0" />
        <span>{engine.modeOfTransport}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-body">Progress</span>
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

      <div className="flex justify-between items-center pt-3 border-t border-white/8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
          <Clock className="w-3 h-3" />
          <span>{engine.lastUpdated}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
};

export default EngineCard;
