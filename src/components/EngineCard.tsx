import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Engine } from '@/data/mockData';
import { MapPin, Truck, Clock, ArrowRight } from 'lucide-react';

const statusColor: Record<string, string> = {
  'In Transit': 'status-transit',
  'In Repair': 'neon-text',
  'In Storage': 'neon-text-cyan',
  'Disassembly': 'neon-text',
  'Inspection': 'status-transit',
  'Ready for Release': 'status-active',
  'Completed': 'status-completed',
  'Preservation Active': 'neon-text-cyan',
};

const EngineCard = ({ engine, index }: { engine: Engine; index: number }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/engine/${engine.workOrder}-${engine.esn}`)}
      className="glass-card-glow p-5 rounded-xl cursor-pointer group transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-heading text-xs text-muted-foreground tracking-wider">ESN</p>
          <p className="font-heading text-sm neon-text tracking-wide">{engine.esn}</p>
        </div>
        <span className={`text-xs font-heading tracking-wider ${statusColor[engine.status] || 'text-foreground'}`}>
          {engine.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Work Order</span>
          <span className="text-foreground">{engine.workOrder}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Client</span>
          <span className="text-foreground">{engine.clientName}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-muted-foreground">Service</span>
          <span className="text-primary text-xs">{engine.serviceType}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-body">
        <MapPin className="w-3 h-3" />
        <span>{engine.currentLocation}</span>
        <Truck className="w-3 h-3 ml-2" />
        <span>{engine.modeOfTransport}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1 font-body">
          <span className="text-muted-foreground">Progress</span>
          <span className="neon-text">{engine.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${engine.progress}%` }}
            transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
            className="h-full rounded-full progress-glow"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
          <Clock className="w-3 h-3" />
          <span>{engine.lastUpdated}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
};

export default EngineCard;
