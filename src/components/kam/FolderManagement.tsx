import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, FileText, Upload, ChevronRight, ArrowLeft, Plane, Package, File, Image } from 'lucide-react';
import { mockEngines, mockParts } from '@/data/mockData';
import { toast } from 'sonner';

type BreadcrumbItem = { label: string; level: 'root' | 'engine' | 'category' | 'part' | 'docType' };

interface MockFile {
  name: string;
  type: 'report' | 'document';
  size: string;
  date: string;
  uploadedBy: string;
}

const generateMockFiles = (engineEsn: string, category: string, partNumber?: string): MockFile[] => {
  const base = partNumber || engineEsn;
  return [
    { name: `${base}_Inspection_Report.pdf`, type: 'report', size: '2.4 MB', date: '2024-12-10', uploadedBy: 'KAM' },
    { name: `${base}_Certificate.pdf`, type: 'document', size: '1.1 MB', date: '2024-11-28', uploadedBy: 'Client' },
    { name: `${base}_Teardown_Summary.pdf`, type: 'report', size: '3.8 MB', date: '2024-12-05', uploadedBy: 'KAM' },
    { name: `${base}_Release_Form.pdf`, type: 'document', size: '0.8 MB', date: '2024-12-01', uploadedBy: 'KAM' },
  ];
};

const FolderManagement = () => {
  const [path, setPath] = useState<string[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  const handleUpload = () => {
    toast.success('File upload simulated successfully');
  };

  const goBack = () => {
    if (selectedDocType) setSelectedDocType(null);
    else if (selectedPart) setSelectedPart(null);
    else if (selectedCategory) setSelectedCategory(null);
    else if (selectedEngine) { setSelectedEngine(null); }
  };

  const currentDepth = selectedDocType ? 4 : selectedPart ? 3 : selectedCategory ? 2 : selectedEngine ? 1 : 0;

  const engine = selectedEngine ? mockEngines.find(e => e.id === selectedEngine) : null;
  const engineParts = selectedEngine ? mockParts.filter(p => p.engineId === selectedEngine) : [];

  const folderItemCls = "flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-all group";

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {currentDepth > 0 && (
            <button onClick={goBack} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Folder className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">File Manager</h2>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="hover:text-primary cursor-pointer" onClick={() => { setSelectedEngine(null); setSelectedCategory(null); setSelectedPart(null); setSelectedDocType(null); }}>Root</span>
              {engine && <><ChevronRight className="w-3 h-3" /><span className="hover:text-primary cursor-pointer" onClick={() => { setSelectedCategory(null); setSelectedPart(null); setSelectedDocType(null); }}>{engine.esn}</span></>}
              {selectedCategory && <><ChevronRight className="w-3 h-3" /><span className="hover:text-primary cursor-pointer" onClick={() => { setSelectedPart(null); setSelectedDocType(null); }}>{selectedCategory}</span></>}
              {selectedPart && <><ChevronRight className="w-3 h-3" /><span className="hover:text-primary cursor-pointer" onClick={() => setSelectedDocType(null)}>{selectedPart}</span></>}
              {selectedDocType && <><ChevronRight className="w-3 h-3" /><span>{selectedDocType}</span></>}
            </div>
          </div>
        </div>
        {currentDepth >= 2 && (
          <button onClick={handleUpload} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-all">
            <Upload className="w-4 h-4" /> Upload File
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Level 0: Engine list */}
          {currentDepth === 0 && (
            <motion.div key="engines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mockEngines.map(eng => (
                <div key={eng.id} onClick={() => setSelectedEngine(eng.id)} className={folderItemCls}>
                  <div className="p-2.5 rounded-xl bg-primary/15"><Plane className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{eng.esn}</p>
                    <p className="text-[10px] text-muted-foreground">{eng.model} · {eng.clientName}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                </div>
              ))}
            </motion.div>
          )}

          {/* Level 1: Reports / Documents / Parts */}
          {currentDepth === 1 && engine && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Reports', 'Documents', 'Parts'].map(cat => (
                <div key={cat} onClick={() => setSelectedCategory(cat)} className={folderItemCls + ' flex-col items-start'}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2.5 rounded-xl bg-warning/15"><FolderOpen className="w-5 h-5 text-warning" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{cat}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {cat === 'Parts' ? `${engineParts.length} items` : `${Math.floor(Math.random() * 10) + 3} files`}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Level 2: For Reports/Documents show file list, for Parts show part list */}
          {currentDepth === 2 && selectedCategory && (
            <motion.div key="level2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {selectedCategory === 'Parts' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {engineParts.slice(0, 20).map(part => (
                    <div key={part.id} onClick={() => setSelectedPart(part.partNumber)} className={folderItemCls}>
                      <div className="p-2 rounded-lg bg-primary/10"><Package className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{part.partNumber}</p>
                        <p className="text-[10px] text-muted-foreground">{part.category} · {part.condition}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <FileList files={generateMockFiles(engine!.esn, selectedCategory)} onUpload={handleUpload} />
              )}
            </motion.div>
          )}

          {/* Level 3: Part -> Reports / Documents */}
          {currentDepth === 3 && selectedPart && (
            <motion.div key="partDocs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Reports', 'Documents'].map(docType => (
                <div key={docType} onClick={() => setSelectedDocType(docType)} className={folderItemCls + ' flex-col items-start'}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2.5 rounded-xl bg-success/15"><FolderOpen className="w-5 h-5 text-success" /></div>
                    <p className="text-sm font-medium text-foreground">{docType}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Level 4: File list for part */}
          {currentDepth === 4 && selectedPart && selectedDocType && (
            <motion.div key="partFiles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FileList files={generateMockFiles(engine!.esn, selectedDocType, selectedPart)} onUpload={handleUpload} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FileList = ({ files, onUpload }: { files: MockFile[]; onUpload: () => void }) => (
  <div className="space-y-2">
    {files.map((file, i) => (
      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
        <div className="p-2 rounded-lg bg-destructive/10">
          <FileText className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
          <p className="text-[10px] text-muted-foreground">{file.size} · {file.date} · Uploaded by {file.uploadedBy}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${file.type === 'report' ? 'bg-primary/15 text-primary' : 'bg-success/15 text-success'}`}>
          {file.type}
        </span>
      </motion.div>
    ))}
    <button onClick={onUpload} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all text-sm">
      <Upload className="w-4 h-4" /> Upload New File
    </button>
  </div>
);

export default FolderManagement;
