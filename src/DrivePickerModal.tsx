import React, { useState, useEffect } from 'react';
import { X, Search, FileText, Image as ImageIcon, Loader2, CloudSun, CheckCircle2 } from 'lucide-react';
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
  onSelectFile: (name: string, dataUrl: string, mimeType: string) => void;
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

  useEffect(() => {
    if (isOpen && workspaceToken) {
      fetchFiles();
    }
  }, [isOpen, workspaceToken]);

  const fetchFiles = async (searchQuery: string = '') => {
    if (!workspaceToken) return;
    setLoading(true);
    try {
      let q = "mimeType!='application/vnd.google-apps.folder' and trashed=false";
      if (searchQuery) {
         q += ` and name contains '${searchQuery}'`;
      }
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)&pageSize=50`, {
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

  const handleSelect = async (file: DriveFile) => {
    setDownloadingId(file.id);
    try {
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
         onSelectFile(file.name, reader.result as string, blob.type || mimeTypeToUse);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[70vh] max-h-[600px]"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
               <CloudSun className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-semibold text-gray-800">Google Drive</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50">
           {!workspaceToken ? (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm text-blue-500">
                   <CloudSun className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Hubungkan Drive</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm">Anda perlu menghubungkan akun Google Workspace Anda untuk memilih file dari Google Drive.</p>
                <button 
                  onClick={onConnectWorkspace}
                  className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm"
                >
                   Hubungkan Sekarang
                </button>
             </div>
           ) : (
             <>
               <div className="p-4 bg-white border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Cari file Anda..." 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-2">
                 {loading ? (
                   <div className="flex items-center justify-center h-full space-x-2 text-gray-500">
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span className="text-sm font-medium">Memuat file...</span>
                   </div>
                 ) : files.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                     <FileText className="w-10 h-10 text-gray-300" />
                     <span className="text-sm">Tidak ada file yang ditemukan.</span>
                   </div>
                 ) : (
                   <div className="grid gap-1">
                     {files.map(file => (
                       <button
                         key={file.id}
                         onClick={() => handleSelect(file)}
                         disabled={downloadingId !== null}
                         className={`w-full flex items-center text-left p-3 rounded-xl transition-colors ${downloadingId === file.id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                       >
                         <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-100 mr-4 shadow-sm text-gray-500">
                           {file.mimeType.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-indigo-500" /> : <FileText className="w-5 h-5 text-emerald-500" />}
                         </div>
                         <div className="flex-1 overflow-hidden">
                           <h4 className="text-sm font-medium text-gray-800 truncate">{file.name}</h4>
                           <p className="text-xs text-gray-500 truncate">{file.mimeType}</p>
                         </div>
                         {downloadingId === file.id && (
                           <Loader2 className="w-5 h-5 animate-spin text-blue-500 ml-3" />
                         )}
                       </button>
                     ))}
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
