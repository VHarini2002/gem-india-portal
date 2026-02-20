import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, FileCheck, ChevronRight, X, Download, Eye } from 'lucide-react';
import { mockEngines } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

const reportTypes = [
  { label: 'Logistics Report', icon: FileText, color: 'text-primary bg-primary/15' },
  { label: 'Parts Report', icon: FileCheck, color: 'text-success bg-success/15' },
  { label: 'Inspection Report', icon: FileText, color: 'text-warning bg-warning/15' },
  { label: 'Financial Summary', icon: FileCheck, color: 'text-purple-400 bg-purple-500/15' },
];

const documentTypes = [
  { label: 'Airworthiness Certificate', icon: FileCheck, color: 'text-primary bg-primary/15' },
  { label: 'Engine Log Book', icon: FileText, color: 'text-success bg-success/15' },
  { label: 'Maintenance Records', icon: FileText, color: 'text-warning bg-warning/15' },
  { label: 'Customs Declaration', icon: FileCheck, color: 'text-cyan-400 bg-cyan-500/15' },
];

interface FilesPageProps {
  onClose: () => void;
}

const FilesPage = ({ onClose }: FilesPageProps) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'reports' | 'documents'>('reports');
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);

  const engines = mockEngines.filter(e =>
    user?.role === 'client' ? e.clientEmail === user.email : true
  );

  const selected = engines.find(e => e.id === selectedEngine);

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
              <Folder className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading text-base font-bold text-foreground">Files</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/08 flex-shrink-0">
          {(['reports', 'documents'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelectedEngine(null); }}
              className={`flex-1 py-3 text-xs font-heading font-semibold capitalize transition-colors ${
                tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        {selectedEngine && (
          <div className="flex items-center gap-2 px-5 py-2 border-b border-white/06 flex-shrink-0 bg-white/02">
            <button onClick={() => setSelectedEngine(null)} className="text-xs font-body text-primary hover:underline">Engines</button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-body text-foreground">{selected?.esn}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {!selectedEngine ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                <p className="text-xs font-body text-muted-foreground mb-4">Select an engine to view its {tab}</p>
                {engines.map((engine, i) => (
                  <motion.button
                    key={engine.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedEngine(engine.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/08 hover:border-white/15 hover:bg-white/04 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Folder className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-semibold text-foreground">{engine.esn}</p>
                      <p className="text-xs font-body text-muted-foreground truncate">{engine.model} · {engine.serviceType}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-xs font-body text-muted-foreground mb-4">
                  {tab === 'reports' ? reportTypes.length : documentTypes.length} files available for {selected?.esn}
                </p>
                {(tab === 'reports' ? reportTypes : documentTypes).map((file, i) => (
                  <motion.div
                    key={file.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/08 hover:border-white/15 hover:bg-white/04 transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${file.color}`}>
                      <file.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-semibold text-foreground">{file.label}</p>
                      <p className="text-xs font-body text-muted-foreground">{selected?.esn} · {selected?.workOrder}</p>
                      <p className="text-[10px] font-body text-muted-foreground/60 mt-0.5">
                        Last updated: {selected?.lastUpdated}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Preview">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Download">
                        <Download className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilesPage;
