import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Engine } from '@/data/mockData';
import { MapPin, Truck, Clock, ArrowRight } from 'lucide-react';
import { getEngineHealth } from '@/lib/engineIntelligence';

const statusConfig: Record<string, { label: string; cls: string }> = {
  'In Transit': { label: 'In Transit', cls: 'bg-warning/15 text-warning border border-warning/25' },
  'In Repair': { label: 'In Repair', cls: 'bg-primary/15 text-primary border border-primary/25' },
  'In Storage': { label: 'In Storage', cls: 'bg-success/15 text-success border border-success/25' },
  'Disassembly': { label: 'Disassembly', cls: 'bg-purple-500/15 text-purple-500 border border-purple-500/25' },
  'Inspection': { label: 'Inspection', cls: 'bg-orange-500/15 text-orange-500 border border-orange-500/25' },
  'Ready for Release': { label: 'Ready', cls: 'bg-success/15 text-success border border-success/25' },
  'Completed': { label: 'Completed', cls: 'bg-primary/15 text-primary border border-primary/25' },
  'Preservation Active': { label: 'Preservation', cls: 'bg-teal-500/15 text-teal-500 border border-teal-500/25' },
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
          <p className="font-body text-xs text-muted-foreground">ESN</p>
          <p className="font-heading text-sm font-bold text-primary mt-0.5">{engine.esn}</p>
        </div>
        <div className="flex items-start gap-2">
          {/* Health score mini-ring */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - health.score / 100)}`}
                    className={`${healthColor} transition-all`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[10px] font-heading font-bold ${healthColor}`}>{health.score}</span>
                </div>
              </div>
              <span className={`text-[10px] font-body ${health.isAtRisk ? 'text-warning' : 'text-muted-foreground'}`}>
                {health.driver}
              </span>
            </div>
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

      <div className="flex justify-between items-center pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{engine.lastUpdated}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
};

export default EngineCard;
