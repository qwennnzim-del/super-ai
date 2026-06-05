import React, { useState, useEffect } from 'react';
import { GoogleDriveIcon } from './GoogleIcons';
import { X, Search, FileText, Image as ImageIcon, Loader2, CheckCircle2, Film, Folder, FileArchive, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceToken: string | null;
  onConnectWorkspace: () => void;
  onSelectFile: (name: string, dataUrl: string, mimeType: string, fileData?: any) => void;
  t: any;
}

export const DrivePickerModal: React.FC<DrivePickerModalProps> = ({
  isOpen,
  onClose,
  workspaceToken,
  onConnectWorkspace,
  onSelectFile,
  t
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [category, setCategory] = useState<'all' | 'documents' | 'images' | 'videos'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    if (isOpen && workspaceToken) {
      fetchFiles(query, category);
    }
  }, [isOpen, workspaceToken, category]);

  const fetchFiles = async (searchQuery: string = '', cat: string = 'all') => {
    if (!workspaceToken) return;
    setLoading(true);
    try {
      let q = "trashed=false and mimeType!='application/vnd.google-apps.folder'";
      
      if (cat === 'documents') {
        q += " and (mimeType contains 'application/pdf' or mimeType contains 'application/vnd.google-apps.document' or mimeType contains 'text/')";
      } else if (cat === 'images') {
        q += " and mimeType contains 'image/'";
      } else if (cat === 'videos') {
        q += " and mimeType contains 'video/'";
      }

      if (searchQuery) {
         q += ` and name contains '${searchQuery}'`;
      }
      
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)&pageSize=50&orderBy=modifiedTime desc`, {
        headers: { Authorization: `Bearer ${workspaceToken}` },
      });
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Failed to fetch files", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchFiles(query);
    }
  };

  const handleSendSelectedFile = async () => {
    if (!selectedFile) return;
    setDownloadingId(selectedFile.id);
    try {
      const file = selectedFile;
      const isExport = file.mimeType.startsWith('application/vnd.google-apps');
      let url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      
      let mimeTypeToUse = file.mimeType;
      
      if (isExport) {
        if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
           mimeTypeToUse = 'text/csv';
        } else {
           mimeTypeToUse = 'text/plain'; // export as string
        }
        url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent(mimeTypeToUse)}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${workspaceToken}` }
      });
      
      const blob = await res.blob();
      
      const reader = new FileReader();
      reader.onloadend = () => {
         const pseudoFile = new File([blob], file.name, { type: blob.type || mimeTypeToUse });
         onSelectFile(file.name, reader.result as string, blob.type || mimeTypeToUse, pseudoFile);
         setSelectedFile(null);
         onClose();
      };
      reader.readAsDataURL(blob);
    } catch (err) {
       console.error("Error downloading file", err);
       alert("Gagal mengunduh file.");
    } finally {
       setDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-indigo-500" />;
    if (mimeType.startsWith('video/')) return <Film className="w-6 h-6 text-rose-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return <FileText className="w-6 h-6 text-green-500" />;
    if (mimeType.includes('presentation')) return <FileText className="w-6 h-6 text-yellow-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return <FileArchive className="w-6 h-6 text-amber-600" />;
    return <FileText className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-5 lg:px-8 border-b border-gray-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-blue-50/50">
               <GoogleDriveIcon className="w-8 h-8" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-800">Google Drive</h2>
               <p className="text-xs text-gray-500 font-medium">Penyimpanan Cloud Anda</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
             <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/50">
           {!workspaceToken ? (
             <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-white">
                <div className="w-20 h-20 rounded-full bg-blue-50/50 flex items-center justify-center mb-6">
                   <GoogleDriveIcon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Akses Penyimpanan Drive</h3>
                <p className="text-gray-500 mb-8 max-w-md text-sm leading-relaxed">
                  Hubungkan akun Google Workspace Anda untuk menelusuri, mencari, dan memilih file secara langsung dari Google Drive Anda.
                </p>
                <button 
                  onClick={onConnectWorkspace}
                  className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg shadow-blue-500/30"
                >
                   Hubungkan Sekarang
                </button>
             </div>
           ) : (
             <>
               {/* Sidebar - Desktop */}
               <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-4 shrink-0">
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Kategori</p>
                   {[
                     { id: 'all', icon: <Folder className="w-5 h-5" />, label: 'Semua File' },
                     { id: 'documents', icon: <FileText className="w-5 h-5" />, label: 'Dokumen' },
                     { id: 'images', icon: <ImageIcon className="w-5 h-5" />, label: 'Gambar' },
                     { id: 'videos', icon: <Film className="w-5 h-5" />, label: 'Video' }
                   ].map(c => (
                     <button
                       key={c.id}
                       onClick={() => setCategory(c.id as any)}
                       className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${category === c.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                     >
                       {React.cloneElement(c.icon as React.ReactElement, { className: `w-5 h-5 ${category === c.id ? 'text-blue-500' : 'text-gray-400'}` })}
                       {c.label}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Main Content Area */}
               <div className="flex-1 flex flex-col h-full overflow-hidden bg-white md:bg-gray-50/30">
                 {/* Top Navigation Bar */}
                 <div className="p-4 lg:px-8 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white shrink-0">
                    <div className="relative w-full sm:w-96">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Telusuri di Drive..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full bg-gray-100/80 border-transparent rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      {/* Mobile Categories Dropdown alternative or horizontal scroll */}
                      <div className="flex md:hidden items-center gap-2 shrink-0">
                        {['all', 'documents', 'images', 'videos'].map(c => (
                          <button
                            key={c}
                            onClick={() => setCategory(c as any)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${category === c ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                          >
                            {c === 'all' ? 'Semua' : c === 'documents' ? 'Dokumen' : c === 'images' ? 'Gambar' : 'Video'}
                          </button>
                        ))}
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                      </div>

                      <div className="flex items-center bg-gray-100 rounded-xl p-1 shrink-0 ml-auto">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                 </div>
                 
                 {/* File List / Grid */}
                 <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                   {loading ? (
                     <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-500">
                       <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                       <span className="text-sm font-medium">Menyinkronkan file...</span>
                     </div>
                   ) : files.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                       <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                         <FileText className="w-10 h-10 text-gray-300" />
                       </div>
                       <div className="text-center">
                         <h4 className="text-gray-800 font-semibold mb-1">Tidak ada file ditemukan</h4>
                         <span className="text-sm">Coba sesuaikan pencarian atau kategori Anda.</span>
                       </div>
                     </div>
                   ) : (
                     <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-2"}>
                       {files.map(file => {
                         const isSelected = selectedFile?.id === file.id;
                         return (
                         <button
                           key={file.id}
                           onClick={() => setSelectedFile(file)}
                           disabled={downloadingId !== null}
                           className={`group relative text-left transition-all overflow-hidden ${
                             viewMode === 'grid' 
                             ? `flex flex-col aspect-square rounded-2xl border ${isSelected ? 'border-gray-800 ring-2 ring-gray-800' : 'border-gray-100'} bg-white hover:border-gray-800 hover:shadow-md` 
                             : `flex items-center p-3 rounded-xl border ${isSelected ? 'bg-gray-800 text-white border-gray-800' : 'border-transparent hover:bg-gray-100/80 hover:border-gray-200'}`
                           } ${downloadingId === file.id ? 'opacity-70 pointer-events-none' : ''}`}
                         >
                           {viewMode === 'grid' ? (
                             <>
                               {/* Grid View Item */}
                               <div className={`flex-1 flex items-center justify-center p-6 border-b transition-colors ${isSelected ? 'bg-gray-800 border-gray-700' : 'bg-gray-50/50 border-gray-50 group-hover:bg-gray-100'}`}>
                                 {getFileIcon(file.mimeType)}
                               </div>
                               <div className={`p-3 ${isSelected ? 'bg-gray-900' : 'bg-white'}`}>
                                 <h4 className={`text-xs font-semibold truncate mb-0.5 ${isSelected ? 'text-white' : 'text-gray-800'}`}>{file.name}</h4>
                                 <p className={`text-[10px] uppercase tracking-wider truncate ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>{file.mimeType.split('/').pop()?.replace('vnd.google-apps.', '')}</p>
                               </div>
                             </>
                           ) : (
                             <>
                               {/* List View Item */}
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all shrink-0 ${isSelected ? 'bg-gray-700' : 'bg-gray-50 border border-transparent group-hover:border-gray-100 group-hover:bg-white group-hover:shadow-sm'}`}>
                                 {getFileIcon(file.mimeType)}
                               </div>
                               <div className="flex-1 min-w-0 pr-4">
                                 <h4 className={`text-sm font-medium truncate mb-0.5 ${isSelected ? 'text-white' : 'text-gray-800'}`}>{file.name}</h4>
                                 <p className={`text-xs truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>{file.mimeType}</p>
                               </div>
                             </>
                           )}

                           {downloadingId === file.id && (
                             <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                               <Loader2 className="w-6 h-6 animate-spin text-white" />
                             </div>
                           )}
                         </button>
                       )})}
                     </div>
                   )}
                 </div>
                 
                 {selectedFile && (
                   <div className="px-5 py-4 border-t border-gray-100 bg-gray-900 flex items-center gap-4 shrink-0 transition-all z-20">
                     <div className="flex-1 min-w-0">
                       <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Memilih</p>
                       <p className="text-sm text-white font-semibold truncate">{selectedFile.name}</p>
                     </div>
                     <div className="flex items-center gap-3 shrink-0">
                       <button onClick={() => setSelectedFile(null)} disabled={downloadingId !== null} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Batal</button>
                       <button onClick={handleSendSelectedFile} disabled={downloadingId !== null} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-wait">
                         {downloadingId !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>}
                         Kirim
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </>
           )}
        </div>
      </motion.div>
    </div>
  );
};
