import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  Search,
  Download,
  Table as TableIcon
} from 'lucide-react';
import { extractOrderDetails, OrderData } from './services/gemini';
import { exportToExcel } from './utils/excel';

interface ProcessedFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  results?: OrderData[];
  error?: string;
}

export default function App() {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startingOrderNum, setStartingOrderNum] = useState<number>(133169);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newProcessedFiles: ProcessedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending'
    }));

    setProcessedFiles(prev => [...prev, ...newProcessedFiles]);
  };

  const processImages = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const pending = processedFiles.filter(f => f.status === 'pending');
    let currentOrderNum = startingOrderNum;

    // If there are existing orders, start from the next number
    if (orders.length > 0) {
      const lastNum = parseInt(orders[orders.length - 1].orderNumber);
      if (!isNaN(lastNum)) {
        currentOrderNum = lastNum + 1;
      }
    }

    for (const item of pending) {
      setProcessedFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing' } : f));

      try {
        const base64 = await fileToBase64(item.file);
        const results = await extractOrderDetails(base64, item.file.type);
        
        // Apply sequential order numbers to extracted results
        const sequentiallyNumberedResults = results.map(res => {
          const updated = { ...res, orderNumber: currentOrderNum.toString() };
          currentOrderNum++;
          return updated;
        });

        setProcessedFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'completed', results: sequentiallyNumberedResults } : f));
        setOrders(prev => [...prev, ...sequentiallyNumberedResults]);
      } catch (error) {
        console.error(error);
        setProcessedFiles(prev => prev.map(f => f.id === item.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } : f));
      }
    }

    setIsProcessing(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (id: string) => {
    setProcessedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setProcessedFiles([]);
    setOrders([]);
  };

  const handleCellEdit = (index: number, key: keyof OrderData, value: string) => {
    setOrders(prev => {
      const newOrders = [...prev];
      newOrders[index] = { ...newOrders[index], [key]: value.toUpperCase() };
      return newOrders;
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans selection:bg-emerald-500/30">
      <div className="flex h-screen overflow-hidden">
        
        {/* Left Control Panel (Dark) */}
        <div className="w-[400px] border-r border-white/10 flex flex-col bg-[#111111] shadow-2xl z-20">
          <header className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Camera className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">SAHASRA</h1>
                <p className="text-[10px] opacity-40 font-mono tracking-widest mt-1">BATCH PROCESSING UNIT</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Seq Settings */}
            <section className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h2 className="text-[10px] font-mono text-emerald-500 mb-3 tracking-[0.2em] uppercase font-bold">Sequence Engine</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] opacity-40 uppercase mb-1 block">Start Order ID</label>
                  <input 
                    type="number"
                    value={startingOrderNum}
                    onChange={(e) => setStartingOrderNum(parseInt(e.target.value) || 0)}
                    className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm font-mono focus:border-emerald-500 transition-colors outline-none"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-mono text-emerald-500 mb-4 tracking-[0.2em] uppercase font-bold">Input Matrix</h2>
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-emerald-500/10', 'border-emerald-500'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('bg-emerald-500/10', 'border-emerald-500'); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-emerald-500/10', 'border-emerald-500');
                  const files = Array.from(e.dataTransfer.files);
                  setProcessedFiles(prev => [...prev, ...files.map(file => ({
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    status: 'pending' as const
                  }))]);
                }}
                className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-emerald-500/50 transition-all group"
              >
                <Upload className="w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:text-emerald-500 transition-all mb-4" />
                <p className="text-xs font-bold tracking-widest text-center">INGEST ASSETS</p>
                <p className="text-[10px] opacity-40 mt-2 uppercase font-mono">SUPPORTED: JPG, PNG, WEBP</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <h2 className="text-[10px] font-mono text-emerald-500 tracking-[0.2em] uppercase font-bold">Queue</h2>
                <span className="text-[10px] font-mono opacity-40">{processedFiles.length} NODES</span>
              </div>
              
              <div className="space-y-1">
                {processedFiles.map((pf) => (
                  <div key={pf.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${pf.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 opacity-50'}`}>
                        {pf.status === 'processing' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                      </div>
                      <span className="truncate text-[10px] font-mono opacity-70">{pf.file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pf.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {pf.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                      <button onClick={() => removeFile(pf.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <footer className="p-8 border-t border-white/5 space-y-3 bg-black/20">
            <button 
              disabled={isProcessing || processedFiles.filter(f => f.status === 'pending').length === 0}
              onClick={processImages}
              className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  PROCESSING BATCH...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  INITIATE EXTRACTION
                </>
              )}
            </button>
            <button 
              onClick={clearAll}
              className="w-full border border-white/10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-white/5 transition-all text-white"
            >
              PURGE ARCHIVE
            </button>
          </footer>
        </div>

        {/* Right Data Grid (Dark) */}
        <div className="flex-1 flex flex-col bg-[#0F0F0F] overflow-hidden relative">
          <div className="p-8 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-xl z-10">
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">Extracted Metadata</h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-[10px] font-mono text-emerald-500/60 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEM ACTIVE
                </p>
                <div className="h-3 w-px bg-white/10" />
                <p className="text-[10px] font-mono opacity-30 uppercase">TOTAL RECORDS: {orders.length}</p>
              </div>
            </div>
            {orders.length > 0 && (
              <button 
                onClick={() => exportToExcel(orders)}
                className="bg-white text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl"
              >
                <Download className="w-4 h-4" />
                EXCEL EXPORT (.XLSX)
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm shadow-2xl">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    {['#', 'Order Num', 'Customer Name', 'Address', 'Description', 'Phone 1', 'Phone 2', 'COD Amount'].map((h, i) => (
                      <th key={i} className="p-5 text-[9px] uppercase font-mono tracking-widest text-emerald-500/60 font-bold border-r border-white/5 last:border-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px] font-mono">
                  <AnimatePresence mode='popLayout'>
                    {orders.map((order, idx) => (
                      <motion.tr 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border-b border-white/5 hover:bg-emerald-500/5 group/row transition-all"
                      >
                        <td className="p-5 border-r border-white/5 text-center opacity-20 group-hover/row:opacity-100 group-hover/row:text-emerald-500 transition-all font-bold">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="p-5 border-r border-white/5">
                          <input 
                            value={order.orderNumber} 
                            onChange={(e) => handleCellEdit(idx, 'orderNumber', e.target.value)}
                            className="bg-transparent w-full outline-none focus:text-emerald-500 transition-colors uppercase font-bold"
                          />
                        </td>
                        <td className="p-5 border-r border-white/5">
                          <input 
                            value={order.customerName} 
                            onChange={(e) => handleCellEdit(idx, 'customerName', e.target.value)}
                            className="bg-transparent w-full outline-none focus:text-emerald-500 transition-colors uppercase"
                          />
                        </td>
                        <td className="p-5 border-r border-white/5">
                          <input 
                            value={order.address} 
                            onChange={(e) => handleCellEdit(idx, 'address', e.target.value)}
                            className="bg-transparent w-full outline-none focus:text-emerald-500 transition-colors uppercase"
                          />
                        </td>
                        <td className="p-5 border-r border-white/5 text-center">
                          <span className="bg-white/5 px-2 py-1 rounded text-[8px] uppercase tracking-tighter opacity-50 group-hover/row:opacity-100 group-hover/row:bg-emerald-500/20 group-hover/row:text-emerald-500 transition-all">
                            {order.orderDescription}
                          </span>
                        </td>
                        <td className="p-5 border-r border-white/5 text-center">
                          <input 
                            value={order.phone1} 
                            onChange={(e) => handleCellEdit(idx, 'phone1', e.target.value)}
                            className="bg-transparent w-full text-center outline-none focus:text-emerald-500 transition-colors"
                          />
                        </td>
                        <td className="p-5 border-r border-white/5 text-center">
                          <input 
                            value={order.phone2} 
                            onChange={(e) => handleCellEdit(idx, 'phone2', e.target.value)}
                            className="bg-transparent w-full text-center outline-none focus:text-emerald-500 transition-colors"
                          />
                        </td>
                        <td className="p-5 text-right bg-emerald-500/5 group-hover/row:bg-emerald-500/20 transition-all">
                          <input 
                            value={order.codAmount} 
                            onChange={(e) => handleCellEdit(idx, 'codAmount', e.target.value)}
                            className="bg-transparent w-full text-right outline-none focus:text-emerald-400 transition-colors font-black text-xs"
                          />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-32 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-10 grayscale">
                          <div className="w-24 h-24 rounded-full border-4 border-dashed border-white flex items-center justify-center animate-[spin_20s_linear_infinite]">
                            <FileSpreadsheet className="w-10 h-10" />
                          </div>
                          <p className="text-xs tracking-[0.5em] font-mono">IDLE_STATE: AWAITING_INPUT</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Decorative background grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
      </div>
    </div>
  );
}

