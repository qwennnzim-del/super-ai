import React, { useState } from 'react';
import { Download, Copy, Search, ArrowUpDown, ChevronDown, Check, Columns, Maximize2, X, PlusCircle, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleSheetsIcon } from './GoogleIcons';

interface SheetData {
  title?: string;
  columns?: string[];
  rows?: { cells: string[] }[];
}

interface InteractiveTableProps {
  data: SheetData;
  onCopy: () => void;
  onDownload: () => void;
  copiedId: string | null;
  messageId: string;
}

export const InteractiveTable: React.FC<InteractiveTableProps> = ({ data, onCopy, onDownload, copiedId, messageId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editableCells, setEditableCells] = useState<{ [key: string]: string }>({});

  const columns = data.columns || [];
  const rawRows = data.rows || [];

  // Filter and sort
  const filteredRows = rawRows.filter(row => 
    row.cells.some(cell => String(cell || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sortCol === null) return 0;
    const aVal = String(a.cells[sortCol] || '');
    const bVal = String(b.cells[sortCol] || '');
    const comparison = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
    return sortAsc ? comparison : -comparison;
  });

  const handleSort = (colIndex: number) => {
    if (sortCol === colIndex) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colIndex);
      setSortAsc(true);
    }
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, val: string) => {
     setEditableCells({ ...editableCells, [`${rowIndex}-${colIndex}`]: val });
  };

  const getCellValue = (rowIndex: number, colIndex: number, originalValue: string) => {
     const key = `${rowIndex}-${colIndex}`;
     return editableCells[key] !== undefined ? editableCells[key] : originalValue;
  };

  const renderedTable = (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden font-sans">
       {/* Toolbar */}
       <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 gap-4 shrink-0">
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-50/50 flex items-center justify-center shrink-0">
               <GoogleSheetsIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
               <h3 className="font-semibold text-gray-800 truncate">{data.title || 'Data Sheet'}</h3>
               <p className="text-xs text-gray-500 font-medium">
                  {columns.length} Kolom &middot; {rawRows.length} Baris
               </p>
            </div>
         </div>
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Cari data..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
               />
            </div>
            {!isFullscreen && (
              <button 
                onClick={() => setIsFullscreen(true)}
                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100 focus:outline-none"
                title="Layar Penuh"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
         </div>
       </div>

       {/* Table Area */}
       <div className="flex-1 overflow-auto bg-white relative w-full" style={{ minHeight: isFullscreen ? '0' : '300px', maxHeight: isFullscreen ? 'none' : '500px' }}>
         <table className="w-full text-sm text-left border-collapse">
           <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
             <tr>
               <th className="w-12 bg-gray-50 border-r border-b border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-400 select-none">#</th>
               {columns.map((col, i) => (
                 <th 
                   key={i} 
                   className="bg-white border-r border-b border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer select-none transition-colors group whitespace-nowrap"
                   onClick={() => handleSort(i)}
                 >
                   <div className="flex items-center justify-between gap-4">
                      <span>{col}</span>
                      <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortCol === i ? 'text-emerald-500' : 'text-gray-300 group-hover:text-gray-400'}`} />
                   </div>
                 </th>
               ))}
               {!isFullscreen && <th className="bg-white border-b border-gray-200 w-full"></th>}
             </tr>
           </thead>
           <tbody>
             {sortedRows.length > 0 ? (
               sortedRows.map((row, rowIndex) => {
                 // Get absolute index for stable editing state regardless of sort/filter
                 const absIndex = rawRows.findIndex(r => r === row);
                 
                 return (
                 <tr key={absIndex} className="hover:bg-blue-50/30 group">
                   <td className="w-12 border-r border-b border-gray-100 bg-gray-50 text-center text-xs font-medium text-gray-400 select-none">
                     {absIndex + 1}
                   </td>
                   {row.cells.map((cell, colIndex) => {
                      const displayVal = getCellValue(absIndex, colIndex, String(cell || ''));
                      return (
                        <td key={colIndex} className="border-r border-b border-gray-100 relative group/cell min-w-[120px] p-0">
                           <input 
                             type="text"
                             value={displayVal}
                             onChange={(e) => handleCellEdit(absIndex, colIndex, e.target.value)}
                             className="w-full h-full min-h-[44px] px-4 py-3 bg-transparent focus:outline-none focus:bg-emerald-50/50 focus:ring-inset focus:ring-2 focus:ring-emerald-500 text-gray-700 truncate whitespace-nowrap overflow-hidden"
                           />
                           <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 pointer-events-none text-emerald-600">
                             <PenLine className="w-3.5 h-3.5" />
                           </div>
                        </td>
                      )
                   })}
                   {!isFullscreen && <td className="border-b border-gray-100 w-full"></td>}
                 </tr>
               )})
             ) : (
               <tr>
                 <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-500">
                   <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-300 mb-3" />
                      <p>Tidak ada data yang sesuai dengan pencarian Anda.</p>
                   </div>
                 </td>
               </tr>
             )}
           </tbody>
         </table>
       </div>

       {/* Footer actions */}
       <div className="flex items-center justify-end p-3 border-t border-gray-100 bg-gray-50 gap-2 shrink-0">
         <button 
           onClick={onCopy}
           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm focus:outline-none"
         >
           {copiedId === messageId + "-table" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
           {copiedId === messageId + "-table" ? "Tersalin!" : "Salin"}
         </button>
         <button 
           onClick={onDownload}
           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-500/20 focus:outline-none"
         >
           <Download className="w-4 h-4" />
           Unduh CSV
         </button>
       </div>
    </div>
  );

  return (
    <>
      {renderedTable}
      
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-[2px] p-4 sm:p-8 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col pt-1"
            >
              <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-50/50 flex items-center justify-center">
                     <GoogleSheetsIcon className="w-5 h-5" />
                   </div>
                   <h2 className="font-bold text-gray-800 text-lg">Mode Layar Penuh</h2>
                </div>
                <button 
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-0 sm:p-4 bg-gray-50/50">
                 {renderedTable}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
