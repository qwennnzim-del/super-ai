import { GoogleGenAI } from "@google/genai";
import { Info, Shield, Layers, HelpCircle, ChevronRight, ArrowLeft, Sparkles, Mic, ChevronDown, Menu, Frame, SquareArrowUpRight, Bot, Check, Copy, MessageSquare, Trash2, LogOut, X, Search, Mail, Lock, Eye, Globe, Camera, Image as ImageIcon, FileText, Paperclip, Plus, Crown, ThumbsUp, Share2, Palette, BookOpen, MonitorPlay, Table, Briefcase, Download, Square, Loader2, Map as MapIcon, CloudSun, Calendar, Clock, SlidersHorizontal, LayoutTemplate, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, setDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import html2pdf from 'html2pdf.js';
import pptxgen from "pptxgenjs";
import { CVPreview } from './components/CVPreview';

const TextAlignStartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 5H3"/><path d="M15 12H3"/><path d="M17 19H3"/></svg>
);

const CircleFadingPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 8v8"/><path d="M16 12H8"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/></svg>
);

const AudioLinesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>
);

const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
);

const GripHorizontalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/></svg>
);

const TRANSLATIONS = {
  id: {
    hello: "Hii,",
    howCanIHelp: "Ada yang bisa saya bantu?",
    myProfile: "Profil Saya",
    settings: "Pengaturan",
    dearUser: "User yang terhormat",
    currentCredit: "Kredit saat ini",
    freeCredit: "Kredit gratis",
    dailyCredit: "Kredit harian",
    resetCreditInfo: "Kredit direset pada 00:00 setiap hari",
    upgradePremiumInfo: "Tingkatkan ke Premium untuk mendapatkan fitur lebih!",
    personaDetails: "Persona Details",
    manageAccount: "Manage Account",
    logoutTitle: "Logout",
    logoutDesc: "Keluar dari akun Anda saat ini di perangkat ini.",
    deleteAccountTitle: "Hapus Akun",
    deleteAccountDesc: "Hapus secara permanen data profil dan riwayat percakapan.",
    save: "Simpan",
    cancel: "Batal",
    typeMessage: "Tanya Super",
    insufficientCredit: "Kredit Anda tidak mencukupi untuk menggunakan model Pro. Silakan gunakan model Standar, atau tingkatkan kredit Anda.",
    modelStandardDesc: "Model ringan dengan respons lebih cepat, cocok untuk tugas-tugas sederhana.",
    modelProDesc: "Model cerdas, lebih detail dalam penalaran kompleks. Membutuhkan waktu lebih lama. Menggunakan kredit.",
    chatHistory: "Riwayat Chat",
    loginWithGoogle: "Login dengan Google",
    welcomeText: "Selamat datang! Silakan login untuk memulai.",
    emptyHistory: "Belum ada riwayat",
    searchPlaceholder: "Cari riwayat...",
    stopGenerating: "Hentikan",
    languageTitle: "Bahasa",
    languageDesc: "Pilih bahasa antarmuka aplikasi",
    aboutTitle: "Tentang",
    aboutDesc: "Informasi mengenai aplikasi SuperAI.",
    privacyTitle: "Kebijakan & Privasi",
    privacyDesc: "Bagaimana kami mengelola data Anda.",
    helpTitle: "Bantuan",
    helpDesc: "Panduan menggunakan aplikasi SuperAI.",
    aboutContent: "SuperAI adalah asisten kecerdasan buatan komprehensif yang dikembangkan secara eksklusif oleh SuperRinz. Tujuan diciptakannya aplikasi ini adalah untuk merevolusi cara pengguna berinteraksi dengan AI—menyediakan antarmuka intuitif dan mulus yang tidak hanya membantu dalam tugas-tugas penulisan dan pencarian informasi biasa, tetapi juga dalam pembuatan slide presentasi dan percakapan dinamis. Kami berkomitmen dalam mengintegrasikan teknologi terdepan untuk menghadirkan kualitas terbaik secara real-time demi produktivitas Anda.",
    privacyContent: "Kami di SuperAI menganggap privasi pengguna sebagai landasan utama layanan kami.\n\nKeamanan Data Pribadi:\nKami hanya mengumpulkan informasi minimum yang diperlukan agar aplikasi ini dapat beroperasi (seperti alamat email untuk autentikasi dan riwayat obrolan pribadi Anda). Semua data ini disimpan dalam infrastruktur terenkripsi dan tidak dipublikasikan ke pihak ketiga.\n\nKendali Pengguna:\nAnda memegang kendali sepenuhnya terhadap data Anda. Melalui menu profil, Anda dilengkapi dengan tombol untuk melihat, mengedit nama profil, hingga menghapus akun Anda secara permanen beserta seluruh rekam jejak obrolan di server kami.\n\nPenggunaan AI:\nInformasi dan pertanyaan yang dikirim kepada asisten akan diolah ke pihak ketiga (sistem penyedia model bahasa AI) dengan sistem transien untuk menghasilkan jawaban yang Anda butuhkan, namun tidak disalahgunakan untuk melatih model tanpa konsen publik.",
    helpContent: "Panduan Penggunaan SuperAI\n\n1. Memulai Obrolan\nAnda dapat mengetik pertanyaan apa saja di kotak input bawah dan asisten kami akan langsung bertindak menangani logika bahasa, pemrograman, matematika, maupun ilmu pengetahuan umum.\n\n2. Pemilihan Model (Standar vs Pro)\nGunakan model Standar untuk tugas ringan harian (gratis dan tanpa batas) dan model Pro (dengan kredit/premium) untuk tugas analitis atau kreatif kompleks agar AI berpikir lebih dalam mendeskripsikan step-by-step keputusannya (Chain-of-thought).\n\n3. Fitur Lanjutan\nAnda bisa menekan ikon klip/plus di samping kotak teks untuk mengeksplor modalitas lanjutan, misalnya meminta asisten mencari referensi gambar web, meracik ide promt gambar, atau bahkan menyusun dokumen presentasi (Slides) otomatis.",
    premiumAccess: "Premium Access",
    freeAccess: "Free Access",
    newChat: "Mulai Chat Baru",
    smartSearch: "Pencarian Pintar",
    pleaseLogin: "Silahkan Login",
    mustLogin: "Anda harus login untuk menggunakan aplikasi ini.",
    starting: "Memulai...",
    fast: "Standar",
    pro: "Pro",
    profileIncomplete: "Profil belum lengkap",
    searchNotFound: "Pencarian tidak ditemukan",
    dataTitle: "Data & Privasi",
    clearHistoryTitle: "Hapus Semua Riwayat",
    clearHistoryDesc: "Hapus semua riwayat percakapan Anda secara permanen dari server.",
    exportDataTitle: "Ekspor Data",
    exportDataDesc: "Unduh semua riwayat chat Anda secara offline sebagai file JSON.",
    appVersion: "Versi Aplikasi",
    themeTitle: "Tema Tampilan",
    themeDesc: "Berganti tampilan aplikasi ke mode Gelap.",
    textSizeTitle: "Ukuran Teks Obrolan",
    textSizeDesc: "Ubah ukuran huruf pada chat.",
    textSizeSmall: "Kecil",
    textSizeNormal: "Normal",
    textSizeLarge: "Besar",
    defaultModelTitle: "Model Default",
    defaultModelDesc: "Pilih model kecerdasan buatan default saat aplikasi dibuka.",
    defaultModeTitle: "Mode Default",
    defaultModeDesc: "Pilih mode default (Chat, Gambar, dll) saat aplikasi dibuka.",
    customInstructionsTitle: "Instruksi Khusus (Custom Instructions)",
    customInstructionsDesc: "Beri tahu AI bagaimana Anda ingin dilayani (misalnya memanggil dengan panggilan tertentu, gaya bahasa).",
    customInstructionsPlaceholder: "Contoh: Panggil saya Boss, gunakan bahasa yang santai...",
    exportFormatTitle: "Format Data Ekspor",
    exportFormatDesc: "Pilih format file untuk mengunduh riwayat obrolan Anda.",
    soundTitle: "Notifikasi Suara",
    soundDesc: "Putar suara kecil ketika AI selesai menjawab.",
    hapticsTitle: "Notifikasi Getaran",
    hapticsDesc: "Gunakan getaran perangkat jika tersedia.",
    personalizationTitle: "Personalisasi & Profil AI",
    notificationsTitle: "Suara & Getaran",
    confirmClear: "Apakah Anda yakin ingin menghapus SEMUA riwayat chat Anda? Tindakan ini tidak dapat dibatalkan.",
    clearSuccess: "Semua riwayat chat Anda berhasil dihapus.",
  },
  en: {
    hello: "Hii,",
    howCanIHelp: "How can I help you?",
    myProfile: "My Profile",
    settings: "Settings",
    dearUser: "Dear user",
    currentCredit: "Current credits",
    freeCredit: "Free credits",
    dailyCredit: "Daily credits",
    resetCreditInfo: "Credits reset at 00:00 every day",
    upgradePremiumInfo: "Upgrade to Premium to get more features!",
    personaDetails: "Persona Details",
    manageAccount: "Manage Account",
    logoutTitle: "Logout",
    logoutDesc: "Log out of your current account on this device.",
    deleteAccountTitle: "Delete Account",
    deleteAccountDesc: "Permanently delete profile data and conversation history.",
    save: "Save",
    cancel: "Cancel",
    typeMessage: "Ask Super",
    insufficientCredit: "Insufficient credits to use Pro model. Please use the Standard model, or upgrade your credits.",
    modelStandardDesc: "Lightweight model with faster response, suitable for simple tasks.",
    modelProDesc: "Smart model, more detailed in complex reasoning. Takes more time. Uses credits.",
    chatHistory: "Chat History",
    loginWithGoogle: "Login with Google",
    welcomeText: "Welcome! Please login to start.",
    emptyHistory: "No history yet",
    searchPlaceholder: "Search history...",
    stopGenerating: "Stop",
    languageTitle: "Language",
    languageDesc: "Select app interface language",
    aboutTitle: "About",
    aboutDesc: "Information about the SuperAI application.",
    privacyTitle: "Privacy & Policy",
    privacyDesc: "How we manage your data.",
    helpTitle: "Help",
    helpDesc: "Guide on using the SuperAI application.",
    aboutContent: "SuperAI is a comprehensive artificial intelligence assistant developed exclusively by SuperRinz. The purpose of creating this application is to revolutionize how users interact with AI—providing an intuitive and seamless interface that not only assists in regular writing and information search tasks but also in automatic slide rendering and dynamic conversations. We are committed to integrating the latest models to deliver top-tier real-time quality for your productivity.",
    privacyContent: "We at SuperAI consider user privacy as the cornerstone of our service.\n\nPersonal Data Security:\nWe only collect the absolute minimum information required for this application to operate (such as your email address for authentication and your personal chat history). All data is stored in encrypted infrastructure and is not shared with third parties.\n\nUser Control:\nYou hold complete control over your data. Through the profile menu, you are equipped with options to view, edit your profile name, and even permanently delete your account along with the entire chat history from our servers.\n\nAI Usage:\nInformation and queries sent to the assistant are processed to third parties (AI providers) transiently to generate the answers you need. Your data will not be inappropriately used or fed to train foundational models without public consent.",
    helpContent: "SuperAI Usage Guide\n\n1. Starting a Chat\nYou can type any question in the bottom input box and our assistant will act comprehensively on language logic, coding, mathematics, or general science.\n\n2. Model Selection (Standard vs Pro)\nUse the Standard model for light daily tasks (free and unlimited) and the Pro model (with premium credits) for complex analytical or creative work so that the AI thinks deeply and details its step-by-step reasoning (Chain-of-thought).\n\n3. Advanced Features\nYou can click the clip/plus icon next to the text input to explore advanced modalities. You can let the assistant scrape visual web images, craft image prompt generation ideas, or even autonomously layout slide presentations.",
    premiumAccess: "Premium Access",
    freeAccess: "Free Access",
    newChat: "New Chat",
    smartSearch: "Smart Search",
    pleaseLogin: "Please Login",
    mustLogin: "You must login to use this app.",
    starting: "Starting...",
    fast: "Standard",
    pro: "Pro",
    profileIncomplete: "Profile incomplete",
    searchNotFound: "Search not found",
    dataTitle: "Data & Privacy",
    clearHistoryTitle: "Clear All History",
    clearHistoryDesc: "Permanently delete all your chat history from the servers.",
    exportDataTitle: "Export Data",
    exportDataDesc: "Download all your chat history offline as a JSON file.",
    appVersion: "App Version",
    themeTitle: "Theme",
    themeDesc: "Switch application appearance to Dark mode.",
    textSizeTitle: "Chat Text Size",
    textSizeDesc: "Change text size in chat.",
    textSizeSmall: "Small",
    textSizeNormal: "Normal",
    textSizeLarge: "Large",
    defaultModelTitle: "Default Model",
    defaultModelDesc: "Select the default AI model when the app opens.",
    defaultModeTitle: "Default Mode",
    defaultModeDesc: "Select the default mode (Chat, Image, etc.) when the app opens.",
    customInstructionsTitle: "Custom Instructions",
    customInstructionsDesc: "Tell the AI how you want to be served (e.g., tone of voice).",
    customInstructionsPlaceholder: "Example: Call me Boss, use a casual tone...",
    exportFormatTitle: "Export Data Format",
    exportFormatDesc: "Choose a file format to download your chat history.",
    soundTitle: "Sound Notifications",
    soundDesc: "Play a short sound when the AI finishes replying.",
    hapticsTitle: "Haptics & Vibrations",
    hapticsDesc: "Use device vibration if available.",
    personalizationTitle: "Personalization & AI Profile",
    notificationsTitle: "Sound & Haptics",
    confirmClear: "Are you sure you want to delete ALL your chat history? This action cannot be undone.",
    clearSuccess: "All your chat history has been deleted successfully.",
  }
};

const CircleUserRoundIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.925 20.056a6 6 0 0 0-11.851.001"/><circle cx="12" cy="11" r="4"/><circle cx="12" cy="12" r="10"/></svg>
);

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (match && match[1] === 'jsoncv') {
    return <CVPreview data={String(children)} />;
  }

  return !inline && match ? (
    <div className="relative group rounded-xl overflow-hidden my-5 border border-gray-700/30">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1f2937] text-gray-300 text-xs font-sans">
        <span className="font-mono">{match[1]}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors select-none"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Berhasil disalin!" : "Salin Kode"}
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        style={oneDark}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0 0 0.75rem 0.75rem', fontSize: '0.9rem' }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code {...props} className={className}>
      {children}
    </code>
  );
};

// Initialize Gemini API
const getGeminiApiKey = () => {
  // Try Vite env first (for Vercel deployment), fallback to process.env (for AI Studio)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }
  return process.env.GEMINI_API_KEY;
};

const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

type Attachment = {
  name: string;
  mimeType: string;
};

type Message = {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  createdAt?: any;
  groundingChunks?: any[];
  attachments?: Attachment[];
  slideData?: any;
  slideMedia?: 'ai' | 'search';
  sheetData?: any;
};

type Chat = {
  id: string;
  title: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
};

const LoginScreen = ({ onClose, onLoginWithGoogle }: { onClose: () => void, onLoginWithGoogle: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f4f7fb] font-sans">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500">
        <X size={20} />
      </button>
      <div className="bg-white rounded-[2rem] w-full max-w-[360px] p-8 shadow-sm">
        <h2 className="text-[26px] font-bold text-black mb-1">Sign in</h2>
        <p className="text-[13px] text-gray-500 mb-8">
          New user? <a href="#" className="font-bold text-black hover:underline cursor-pointer">Create an account</a>
        </p>

        <div className="space-y-4 mb-6">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <Mail className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
             </div>
             <input type="email" placeholder="Email Address" className="w-full bg-[#f8f9fa] border-none rounded-xl py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-black/5 outline-none transition-all" />
          </div>
          
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <Lock className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
             </div>
             <input type="password" placeholder="Password" className="w-full bg-[#f8f9fa] border-none rounded-xl py-3.5 pl-11 pr-11 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-black/5 outline-none transition-all" />
             <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                <Eye className="w-4 h-4" strokeWidth={2} />
             </button>
          </div>

          <div className="flex justify-start">
             <a href="#" className="text-[12px] text-black font-semibold hover:underline mt-1 cursor-pointer">Forgot password?</a>
          </div>
        </div>

        <button className="w-full bg-black text-white rounded-full py-3.5 text-sm font-semibold mb-8 hover:bg-gray-900 transition-colors shadow-md">
          Login
        </button>
        
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative bg-white px-4 text-[11px] text-gray-400 uppercase tracking-wider">or</div>
        </div>

        <button 
          onClick={onLoginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-full py-3 text-sm font-medium hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
             <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
             <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
             <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
             <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          </svg>
          Continue with Google
        </button>
        
        <div className="mt-8 text-center px-4">
           <p className="text-[10px] text-gray-400 leading-relaxed">
             By signing in with an account, you agree to SO's<br/>
             <a href="#" className="font-semibold text-gray-500 hover:text-black hover:underline cursor-pointer">Terms of Service</a> and <a href="#" className="font-semibold text-gray-500 hover:text-black hover:underline cursor-pointer">Privacy Policy</a>.
           </p>
        </div>
        
      </div>
    </div>
  );
};

export default function App() {
  const handleDownloadPdf = () => {
    const element = document.getElementById('slide-print-area');
    if (element && slidePreviewData) {
      const filename = (slidePreviewData.title || 'Presentasi').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
      const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'px' as const, format: [1920, 1080] as [number, number], orientation: 'landscape' as const, hotfixes: ["px_scaling"] }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const handleDownloadPptx = () => {
    if (!slidePreviewData) return;
    
    let pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    // Title Slide
    let slide = pres.addSlide();
    slide.background = { color: "F3E8FF" }; // Lighter purple background
    slide.addText(slidePreviewData.title || "Presentasi Anda", {
      x: 1, y: 2, w: '80%', h: 1.5,
      fontSize: 48,
      bold: true,
      color: "6B21A8", // Purple 800
      align: "center",
      valign: "middle"
    });
    slide.addText("Dibuat oleh AI SuperAI", {
      x: 1, y: 3.5, w: '80%', h: 1,
      fontSize: 24,
      color: "6B7280",
      align: "center",
      valign: "middle"
    });

    // Content Slides
    if (slidePreviewData.slides && Array.isArray(slidePreviewData.slides)) {
      slidePreviewData.slides.forEach((slideData: any) => {
        let presSlide = pres.addSlide();
        presSlide.background = { color: "FFFFFF" };

        presSlide.addText(slideData.title, {
          x: 0.5, y: 0.5, w: '90%', h: 1,
          fontSize: 32,
          bold: true,
          color: "1F2937",
        });

        if (slideData.content && Array.isArray(slideData.content)) {
          const bulletPoints = slideData.content.map((pt: string) => ({ text: pt }));
          presSlide.addText(bulletPoints, {
            x: 0.5, y: 1.8, w: '55%', h: 3.5,
            fontSize: 20,
            color: "4B5563",
            bullet: { type: 'number' },
            valign: "top"
          });
        }

        if (slideData.imagePrompt) {
          const promptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(slideData.imagePrompt)}?width=800&height=1200&nologo=true`;
          presSlide.addImage({
            path: promptUrl,
            x: '55%', y: 1, w: '40%', h: '80%',
            sizing: { type: 'cover', w: '40%', h: '80%' }
          });
        }
      });
    }

    const filename = (slidePreviewData.title || 'Presentasi').replace(/[^a-zA-Z0-9]/g, '_') + '.pptx';
    pres.writeFile({ fileName: filename });
  };

  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAutoScrollPausedRef = useRef(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Auth & Chat State
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);

  type AppNotification = {
    id: string;
    title: string;
    description: string;
    creatorName: string;
    creatorPhoto: string;
    createdAt: any;
  };

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastSeenNotification, setLastSeenNotification] = useState<string>(() => {
    return localStorage.getItem("app_last_seen_notification") || new Date(0).toISOString();
  });
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);
  const [newNotifTitle, setNewNotifTitle] = useState("");
  const [newNotifDesc, setNewNotifDesc] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingText, setLoadingText] = useState("Berfikir...");
  const [loadingIconType, setLoadingIconType] = useState<"none" | "map" | "calendar" | "weather" | "time" | "google">("none");
  const [pendingMediaTask, setPendingMediaTask] = useState<'generate_image' | 'search_image' | null>(null);
  const [appMode, setAppMode] = useState<"chat" | "generate_image" | "search_image" | "learn" | "slide" | "sheet" | "cv">(() => {
    return (localStorage.getItem("app_mode") as "chat" | "generate_image" | "search_image" | "learn" | "slide" | "sheet" | "cv") || "chat";
  });
  const [slideCount, setSlideCount] = useState<number>(5);
  const [slideImageMedia, setSlideImageMedia] = useState<'ai' | 'search'>('ai');
  const [slideTaskState, setSlideTaskState] = useState<'idle' | 'outline' | 'composing' | 'rendering' | 'done'>('idle');
  const [slidePreviewData, setSlidePreviewData] = useState<any | null>(null);
  const [slidePreviewMedia, setSlidePreviewMedia] = useState<'ai' | 'search'>('ai');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [aiModel, setAiModel] = useState<"gemini-2.5-flash" | "gemini-2.5-pro">(() => {
    return (localStorage.getItem("app_ai_model") as "gemini-2.5-flash" | "gemini-2.5-pro") || "gemini-2.5-flash";
  });
  const [customInstructions, setCustomInstructions] = useState<string>(() => {
    return localStorage.getItem("app_custom_instructions") || "";
  });
  const [exportFormat, setExportFormat] = useState<"json" | "txt" | "md">(() => {
    return (localStorage.getItem("app_export_format") as "json" | "txt" | "md") || "json";
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("app_sound_enabled");
    return val !== null ? val === "true" : true;
  });
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("app_haptics_enabled");
    return val !== null ? val === "true" : true;
  });
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "settings">("profile");
  const [activeSettingsPage, setActiveSettingsPage] = useState<'main' | 'about' | 'privacy' | 'help'>('main');
  const [language, setLanguage] = useState<"id" | "en">(() => {
    return (localStorage.getItem("app_language") as "id" | "en") || "id";
  });
  const [textSize, setTextSize] = useState<"small" | "normal" | "large">(() => {
    return (localStorage.getItem("app_text_size") as "small" | "normal" | "large") || "normal";
  });
  
  useEffect(() => {
    localStorage.setItem("app_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("app_text_size", textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem("app_ai_model", aiModel);
  }, [aiModel]);

  useEffect(() => {
    localStorage.setItem("app_custom_instructions", customInstructions);
  }, [customInstructions]);

  useEffect(() => {
    localStorage.setItem("app_export_format", exportFormat);
  }, [exportFormat]);

  useEffect(() => {
    localStorage.setItem("app_sound_enabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("app_haptics_enabled", hapticsEnabled.toString());
  }, [hapticsEnabled]);

  useEffect(() => {
    localStorage.setItem("app_mode", appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem("app_last_seen_notification", lastSeenNotification);
  }, [lastSeenNotification]);
  
  const t = TRANSLATIONS[language];

  const [customPhotoURL, setCustomPhotoURL] = useState<string | null>(null);
  const [customDisplayName, setCustomDisplayName] = useState<string | null>(null);
  const [userBio, setUserBio] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(300);
  const [userFreeCredits, setUserFreeCredits] = useState<number>(200);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioValue, setEditBioValue] = useState("");
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Attachments State
  const [currentAttachments, setCurrentAttachments] = useState<{file: File, name: string, dataUrl: string, mimeType: string}[]>([]);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [featureMenuOpen, setFeatureMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentAttachments(prev => [...prev, {
            file,
            name: file.name,
            dataUrl: reader.result as string,
            mimeType: file.type
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
    setAttachmentMenuOpen(false);
    if (e.target) e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setCurrentAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!user) {
      setCustomPhotoURL(null);
      setCustomDisplayName(null);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      const today = new Date().toDateString();
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.photoURL) setCustomPhotoURL(data.photoURL);
        if (data.displayName) setCustomDisplayName(data.displayName);
        if (data.bio) setUserBio(data.bio);
        
        let shouldUpdate = false;
        let pCredits = data.credits !== undefined ? data.credits : 50;
        let pFreeCredits = data.freeCredits !== undefined ? data.freeCredits : 20;
        let pLastReset = data.lastResetDate;

        if (data.credits === undefined) shouldUpdate = true;
        if (data.freeCredits === undefined) shouldUpdate = true;

        if (pLastReset !== today) {
           pFreeCredits = 20;
           pLastReset = today;
           shouldUpdate = true;
        }

        setUserCredits(pCredits);
        setUserFreeCredits(pFreeCredits);

        if (shouldUpdate && user.email !== 'cipaonly08@gmail.com') {
           setDoc(doc(db, "users", user.uid), { credits: pCredits, freeCredits: pFreeCredits, lastResetDate: pLastReset }, { merge: true });
        }
      } else {
        if (user.email !== 'cipaonly08@gmail.com') {
          setDoc(doc(db, "users", user.uid), { credits: 50, freeCredits: 20, lastResetDate: today }, { merge: true });
        } else {
          setUserCredits(300);
          setUserFreeCredits(200);
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "users"));
    return () => unsubscribe();
  }, [user]);

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await setDoc(doc(db, "users", user.uid), {
            photoURL: reader.result
          }, { merge: true });
        } catch (error) {
          console.error("Error updating profile photo", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = async () => {
    if (!user || !editNameValue.trim()) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: editNameValue.trim()
      }, { merge: true });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating display name", error);
    }
  };

  const handleSaveBio = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        bio: editBioValue.trim()
      }, { merge: true });
      setIsEditingBio(false);
    } catch (error) {
      console.error("Error updating bio", error);
    }
  };

  const displayPhotoURL = customPhotoURL || user?.photoURL;
  const displayDisplayName = customDisplayName || user?.displayName || 'User';

  const scrollToBottom = (force = false) => {
    if (force || !isAutoScrollPausedRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: force ? "smooth" : "auto" });
      if (force) {
        isAutoScrollPausedRef.current = false;
        setShowScrollButton(false);
      }
    }
  };

  useEffect(() => {
    // When messages array length changes (new message), force smooth scroll
    scrollToBottom(true);
  }, [messages.length]);

  useEffect(() => {
    // When streaming text changes, auto scroll without forcing
    scrollToBottom(false);
  }, [streamingText, isLoading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
      if (!u) {
        setChats([]);
        setCurrentChatId(null);
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "chats"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Chat));
      chatList.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });
      setChats(chatList);
      if (chatList.length > 0 && !currentChatId) {
        // optionally auto select first chat, but we leave it empty for a new chat
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, "chats"));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "system_notifications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as AppNotification));
      notifList.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA; // Descending
      });
      setNotifications(notifList);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentChatId || !user) {
      if (!currentChatId) setMessages([]);
      return;
    }
    const q = query(collection(db, `chats/${currentChatId}/messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Message));
      setMessages(msgList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chats/${currentChatId}/messages`));
    return () => unsubscribe();
  }, [currentChatId, user]);

  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("app_theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("app_theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("app_theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const confirmClearAllHistory = () => setShowClearConfirm(true);

  const handleCreateNotification = async () => {
    if (!user || user.email !== 'cipaonly08@gmail.com' || !newNotifTitle || !newNotifDesc) return;
    try {
      await setDoc(doc(collection(db, "system_notifications")), {
        title: newNotifTitle,
        description: newNotifDesc,
        creatorName: displayDisplayName,
        creatorPhoto: displayPhotoURL,
        createdAt: serverTimestamp()
      });
      setIsCreatingNotification(false);
      setNewNotifTitle("");
      setNewNotifDesc("");
    } catch (e) {
      console.error("Created notification failed", e);
    }
  };

  const handleClearAllHistory = async () => {
    if (!user) return;
    setShowClearConfirm(false);
    
    setIsClearingHistory(true);
    try {
      // Create concurrent deletions via a batched approach or normal requests
      const deletePromises = chats.map(chat => deleteDoc(doc(db, "chats", chat.id)));
      await Promise.all(deletePromises);
      setCurrentChatId(null);
      setMessages([]);
      setShowClearSuccess(true);
    } catch (e: any) {
      console.error("Failed to clear history", e);
      alert("Error: " + e.message);
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    try {
      const exportObject = {
        user: { name: displayDisplayName, email: user.email },
        chats: chats.map(c => ({
          title: c.title,
          createdAt: c.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          messages: messages[c.id] || []
        }))
      };

      let content = "";
      let mimeType = "";
      let fileExt = "";

      if (exportFormat === "json") {
        content = JSON.stringify(exportObject, null, 2);
        mimeType = "application/json";
        fileExt = "json";
      } else if (exportFormat === "txt") {
        content = `User: ${exportObject.user.name} (${exportObject.user.email})\n\n`;
        exportObject.chats.forEach(chat => {
          content += `--- Chat: ${chat.title} (${chat.createdAt}) ---\n`;
          chat.messages.forEach(msg => {
            content += `${msg.role.toUpperCase()}: ${msg.text}\n\n`;
          });
        });
        mimeType = "text/plain";
        fileExt = "txt";
      } else if (exportFormat === "md") {
        content = `# User: ${exportObject.user.name} (${exportObject.user.email})\n\n`;
        exportObject.chats.forEach(chat => {
          content += `## Chat: ${chat.title} (${chat.createdAt})\n\n`;
          chat.messages.forEach(msg => {
            content += `**${msg.role.toUpperCase()}**:\n${msg.text}\n\n`;
          });
        });
        mimeType = "text/markdown";
        fileExt = "md";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `superai_export_${new Date().toISOString().split("T")[0]}.${fileExt}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) {
      console.error("Export error", e);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      setShowLoginScreen(false);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogin = () => {
    setShowLoginScreen(true);
  };

  const createNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const deleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      if (id === currentChatId) {
        setCurrentChatId(null);
      }
      await deleteDoc(doc(db, "chats", id));
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `chats/${id}`);
    }
  };

  // Handle auto-resizing of textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 300);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = async (textOverride?: string | React.MouseEvent | React.FormEvent) => {
    const overrideString = typeof textOverride === 'string' ? textOverride : undefined;
    const isOverride = typeof textOverride === 'string';
    const currentInput = isOverride ? overrideString! : inputValue.trim();
    if ((!currentInput && currentAttachments.length === 0) || isLoading) return;
    if (!user) {
      handleLogin();
      return;
    }

    const newMessageText = currentInput;
    
    // Credit Logic
    const isDeveloper = user.email === 'cipaonly08@gmail.com';
    let cost = 0;
    if (!isDeveloper) {
      if (appMode !== 'chat') cost += 2; // Feature usages cost
      if (aiModel === "gemini-2.5-pro") cost += 5; // Pro model cost
      
      const totalCredits = userCredits + userFreeCredits;
      if (totalCredits < cost) {
        alert("Poin Anda tidak mencukupi.\n\nJika menggunakan model Pro, silakan ganti ke model SuperAI-V5. Jika Anda menggunakan fitur khusus (Slide, CV, dll), fitur tersebut membutuhkan Poin dan sudah habis.");
        return;
      }
    }

    const attachmentsToSend = [...currentAttachments];
    setCurrentAttachments([]);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    let chatId = currentChatId;
    
    try {
      if (!chatId) {
        // Create new chat
        const newChatRef = doc(collection(db, "chats"));
        chatId = newChatRef.id;
        const titleText = newMessageText || (attachmentsToSend.length > 0 ? "Attachment" : "New Chat");
        await setDoc(newChatRef, {
          title: titleText.substring(0, 40) + (titleText.length > 40 ? "..." : ""),
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setCurrentChatId(chatId);
      } else {
        await setDoc(doc(db, "chats", chatId), { updatedAt: serverTimestamp() }, { merge: true });
      }

      // Deduct credits if applicable
      if (cost > 0) {
         let remainingCost = cost;
         let newFree = userFreeCredits;
         let newCredits = userCredits;

         if (newFree >= remainingCost) {
            newFree -= remainingCost;
            remainingCost = 0;
         } else {
            remainingCost -= newFree;
            newFree = 0;
         }
         
         if (remainingCost > 0) {
            newCredits -= remainingCost;
         }

         await setDoc(doc(db, "users", user.uid), {
            credits: newCredits,
            freeCredits: newFree
         }, { merge: true });
      }

      // Optimistic update locally? Since snapshot listener handles updates, we don't strictly need it.
      // But we will save to firestore directly.
      const userMsgRef = doc(collection(db, `chats/${chatId}/messages`));
      await setDoc(userMsgRef, {
        chatId: chatId,
        userId: user.uid,
        role: "user",
        text: newMessageText,
        attachments: attachmentsToSend.map(a => ({ name: a.name, mimeType: a.mimeType })),
        createdAt: serverTimestamp()
      });

      // Build chat history for API
      const contents = messages.map(m => ({
        role: m.role === "system" ? "user" : m.role,
        parts: [{ text: m.text }]
      }));
      
      const newParts: any[] = [];
      if (newMessageText) newParts.push({ text: newMessageText });
      for (const attachment of attachmentsToSend) {
        const base64Data = attachment.dataUrl.split(',')[1];
        newParts.push({
          inlineData: {
            data: base64Data,
            mimeType: attachment.mimeType
          }
        });
      }
      contents.push({ role: "user", parts: newParts });

      let toolsConfig: any = undefined;
      let locationContext = "";
      const shouldSearch = /cari|carikan|hari ini|saat ini|sekarang|berita|siapa|apa itu|cuaca|rute|lokasi|peta|maps|dimana|jarak|tempat|jadwal|kalender|calendar|acara|event|ingatkan|jam|waktu|tanggal|suhu|hujan|panas/i.test(newMessageText);
      const isMapRequest = /rute|lokasi|peta|maps|dimana|jarak|tempat/i.test(newMessageText);
      const isCalendarRequest = /jadwal|kalender|calendar|acara|event|ingatkan/i.test(newMessageText);
      const isTimeRequest = /jam berapa|waktu|hari apa|tanggal|jam|sekarang/i.test(newMessageText);
      const isWeatherRequest = /cuaca|suhu|hujan|panas|cerah|mendung|iklim/i.test(newMessageText);

      setLoadingIconType("none");
      if (shouldSearch && appMode === 'chat') {
          setIsSearching(true);
          setLoadingText("Berfikir...");
          setTimeout(() => setLoadingText("Menghubungkan ke Google..."), 1000);
          
          toolsConfig = [{ googleSearch: {} }];
          if (isMapRequest) {
              setLoadingIconType("map");
              setTimeout(() => setLoadingText("Menghubungkan ke Google Maps..."), 2500);
              const mapInstruction = `[SISTEM TAMPILAN PETA: Pengguna menanyakan lokasi/peta. Anda **WAJIB** menyertakan satu blok kode JSON di akhir pesan Anda dengan koordinat lokasi yang tepat agar sistem dapat merender peta interaktif. Formatnya HARUS persis seperti berikut ini (dalam markdown code block):\n\`\`\`json\n{ "type": "map", "lat": <latitude>, "lng": <longitude>, "title": "Nama Tempat", "zoom": 15 }\n\`\`\`\nPastikan koordinat lat dan lng AKURAT berdasarkan pertanyaan pengguna atau lokasi terdekat. Jangan berikan teks sebelum atau sesudah blok \`\`\`json ini yang bukan bagian dari jawaban. Anda harus merespon dengan penjelasan terlebih dahulu, lalu diakhiri dengan blok JSON ini.]\n\n`;
              try {
                  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                  });
                  locationContext = `[SISTEM: Pengguna saat ini berada di Latitude ${position.coords.latitude}, Longitude ${position.coords.longitude}. Gunakan lokasi ini dalam pencarian area sekitar atau navigasi Anda jika relevan.]\n\n` + mapInstruction;
              } catch (e) {
                  console.warn("Geolocation denied or unavailable", e);
                  locationContext = mapInstruction;
              }
          } else if (isCalendarRequest) {
              setLoadingIconType("calendar");
              setTimeout(() => setLoadingText("Menghubungkan ke Google Calendar..."), 2500);
              const now = new Date();
              const dateContext = `[SISTEM TANGGAL: Saat ini adalah ${now.toLocaleString('id-ID', { timeZoneName: 'short' })}]\n\n`;
              const calInstruction = `[SISTEM GOOGLE CALENDAR: Pengguna ingin membuat pengingat/jadwal/acara. Anda **WAJIB** menyertakan satu blok kode JSON di akhir pesan Anda yang berisi detail acara agar sistem dapat merender tombol interaktif "Tambahkan ke Kalender". Formatnya HARUS persis seperti berikut ini (dalam markdown code block):\n\`\`\`json\n{ "type": "calendar", "title": "Nama Acara", "details": "Deskripsi singkat", "location": "Lokasi acara (opsional)", "date": "YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ" }\n\`\`\`\nGunakan tanggal dan waktu yang sesuai dengan permintaan pengguna dalam format UTC khusus Google Calendar (\`YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ\`, start/end time). Jangan berikan teks sebelum atau sesudah blok \`\`\`json ini yang bukan bagian dari jawaban. Anda harus merespon dengan penjelasan terlebih dahulu, lalu diakhiri dengan blok JSON ini.]\n\n`;
              locationContext = dateContext + calInstruction;
          } else if (isWeatherRequest) {
              setLoadingIconType("weather");
              setTimeout(() => setLoadingText("Mengecek Info Cuaca..."), 2500);
              const weatherInstruction = `[SISTEM INFO CUACA: Pengguna menanyakan cuaca. Anda **WAJIB** menampilkan JSON blok untuk widget cuaca di akhir pesan. Formatnya:\n\`\`\`json\n{ "type": "weather", "city": "Nama Kota", "temp": "28", "condition": "Kondisi cuaca", "humidity": "75" }\n\`\`\`\nJangan berikan teks JSON ini di luar code block. Berikan penjelasan text biasa terlebih dahulu.]\n\n`;
              try {
                  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                  });
                  locationContext = `[SISTEM: Lokasi pengguna saat ini - Latitude ${position.coords.latitude}, Longitude ${position.coords.longitude}.]\n\n` + weatherInstruction;
              } catch (e) {
                  locationContext = weatherInstruction;
              }
          } else if (isTimeRequest) {
              setLoadingIconType("time");
              setTimeout(() => setLoadingText("Mengecek Waktu Real Time..."), 2500);
              const now = new Date();
              const timeContext = `[SISTEM WAKTU REAL-TIME: Saat ini adalah jam ${now.toLocaleTimeString('id-ID')} pada tanggal ${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, Zona Waktu: ${now.toLocaleDateString('id-ID', { timeZoneName: 'long' }).split(' ').pop()}]. Beritahukan informasi ini kepada pengguna dengan ramah.]\n\n`;
              const timeInstruction = `[SISTEM WIDGET WAKTU: Pengguna menanyakan waktu. Anda **WAJIB** menampilkan JSON blok untuk widget waktu di akhir pesan. Formatnya:\n\`\`\`json\n{ "type": "time", "time": "${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}", "date": "${now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}", "timezone": "WIB/WITA/WIT/GMT" }\n\`\`\`\n]\n\n`;
              locationContext = timeContext + timeInstruction;
          } else {
              setLoadingIconType("google");
          }
      }

      if (appMode === 'generate_image') {
         try {
           setPendingMediaTask('generate_image');
           
           // Ask Gemini to enhance the prompt
           const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: [
                { role: 'user', parts: [{ text: `Create a highly detailed, descriptive, and conceptual english prompt for an image generation AI based on this user request: "${newMessageText}". Just output the prompt directly without any conversational filler or quotes.` }] }
             ]
           });
           
           const enhancedPrompt = response.candidates?.[0]?.content?.parts?.[0]?.text || newMessageText;
           const seed = Math.floor(Math.random() * 1000000);
           
           const promptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt.trim())}?width=1024&height=1024&nologo=true&seed=${seed}`;
           const generatedMarkdown = `Berikut adalah gambar yang telah saya buat untuk Anda:\n\n![Gambar Buatan AI](${promptUrl})`;

           const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
           await setDoc(modelMsgRef, {
             chatId: chatId,
             userId: user.uid,
             role: "model",
             text: generatedMarkdown,
             createdAt: serverTimestamp()
           });
         } catch (error) {
           console.error("Error generating image", error);
           const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
           await setDoc(modelMsgRef, {
             chatId: chatId,
             userId: user.uid,
             role: "model",
             text: "_Error saat memproses permintaan pembuatan gambar. Coba lagi dengan prompt yang berbeda._",
             createdAt: serverTimestamp()
           });
         } finally {
           setPendingMediaTask(null);
         }
      } else if (appMode === 'search_image') {
         try {
           setPendingMediaTask('search_image'); // Re-use the shimmering loader
           
           const serperKey = (import.meta as any).env.VITE_SERPER_API_KEY;
           
           if (!serperKey) {
              const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
              await setDoc(modelMsgRef, {
                chatId: chatId,
                userId: user.uid,
                role: "model",
                text: "Untuk menggunakan fitur *Cari Gambar*, Anda memerlukan API Key dari Serper.dev.\n\n1. Daftar di [Serper.dev](https://serper.dev/) dan dapatkan API Key Anda.\n2. Buka menu **⚙️ Settings -> Secrets** di aplikasi ini.\n3. Tambahkan secret dengan nama `VITE_SERPER_API_KEY` beserta isinya.\n\n_Catatan: Serper.dev memberikan 2.500 pencarian gratis saat pendaftaran!_",
                createdAt: serverTimestamp()
              });
           } else {
              const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: [{ role: 'user', parts: [{ text: `Extract the main visual search keyword from this request: "${newMessageText}". Output only 1-3 english words best for a Google Images search engine. Output only the words.` }] }]
              });
              const keyword = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "image";
              
              const searchRes = await fetch('https://google.serper.dev/images', {
                 method: 'POST',
                 headers: {
                    'X-API-KEY': serperKey,
                    'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ q: keyword }),
                 signal: abortControllerRef.current?.signal
              });
              const searchData = await searchRes.json();
              
              let generatedMarkdown;
              if (searchData.images && searchData.images.length > 0) {
                  const img = searchData.images[0];
                  generatedMarkdown = `Berikut adalah gambar yang saya temukan untuk pencarian "${keyword}":\n\n![${img.title || 'Gambar Pencarian'}](${img.imageUrl})\n_Sumber: [${img.source}](${img.link})_`;
              } else {
                  generatedMarkdown = `Maaf, saya tidak dapat menemukan gambar yang sesuai untuk pencarian "${keyword}".`;
              }
              const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
              await setDoc(modelMsgRef, {
                chatId: chatId,
                userId: user.uid,
                role: "model",
                text: generatedMarkdown,
                createdAt: serverTimestamp()
              });
           }
         } catch (error) {
           console.error("Error searching image", error);
           const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
           await setDoc(modelMsgRef, {
             chatId: chatId,
             userId: user.uid,
             role: "model",
             text: "_Error saat mengambil hasil pencarian dari server. Silakan coba lagi nanti._",
             createdAt: serverTimestamp()
           });
         } finally {
           setPendingMediaTask(null);
         }
      } else {

      if (appMode === 'slide') {
         try {
           setSlideTaskState('outline');
           
           let sysInstruction = `Anda adalah pembuat presentasi JSON. Buat presentasi dengan TEGAS tepat ${slideCount} slide. Output HANYA MERUPAKAN JSON JAWABAN VALID dengan format:
{
  "title": "Judul Presentasi",
  "slides": [
    {
      "title": "Judul Slide",
      "content": ["Poin 1", "Poin 2"],
      "imagePrompt": "prompt spesifik untuk mencari/membuat gambar dalam bahasa inggris"
    }
  ]
}`;

          // we mock delay to show stepper to user
          setTimeout(() => setSlideTaskState('composing'), 2000);
          
          const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: contents, // User prompt
             config: {
               systemInstruction: sysInstruction,
               responseMimeType: "application/json"
             }
          });

          setSlideTaskState('rendering');
          setTimeout(() => setSlideTaskState('idle'), 1500);

          let slideDataStr = response.text || "";
          let slideDataObj = null;
          let isValidJson = false;
          try {
             const jsonMatch = slideDataStr.match(/\{[\s\S]*\}/);
             if (jsonMatch) {
               slideDataObj = JSON.parse(jsonMatch[0]);
             } else {
               slideDataObj = JSON.parse(slideDataStr.replace(/```json/gi, '').replace(/```/g, '').trim());
             }
             isValidJson = true;
          } catch(e) {
             console.error("Failed to parse slide JSON", e);
             slideDataObj = null;
          }

          const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
          if (isValidJson && slideDataObj) {
            await setDoc(modelMsgRef, {
               chatId: chatId,
               userId: user.uid,
               role: "model",
               text: "Berikut adalah presentasi yang saya buat untuk Anda.",
               createdAt: serverTimestamp(),
               slideData: slideDataObj,
               slideMedia: slideImageMedia
            });
          } else {
            await setDoc(modelMsgRef, {
               chatId: chatId,
               userId: user.uid,
               role: "model",
               text: "Maaf, terjadi kesalahan saat membuat presentasi. API tidak mengembalikan format yang valid.\n\n```text\n" + slideDataStr.substring(0, 200) + "...\n```",
               createdAt: serverTimestamp()
            });
          }
          
         } catch (error: any) {
           console.error("Slide Gen Error:", error);
           const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
           await setDoc(modelMsgRef, {
             chatId: chatId,
             userId: user.uid,
             role: "model",
             text: `Maaf, terjadi kesalahan tak terduga:\n\n${error?.message || "Unknown error"}`,
             createdAt: serverTimestamp()
           });
           setSlideTaskState('idle');
         } finally {
           setIsLoading(false);
           setSlideTaskState('idle');
         }
         return; // We skip the streaming part below
      } else if (appMode === 'sheet') {
         try {
           let sysInstruction = `Anda adalah asisten pembuat tabel data. Buatlah data tabel yang diinginkan pengguna dalam format JSON. Output HANYA MERUPAKAN JSON JAWABAN VALID dengan format:
{
  "title": "Judul Tabel",
  "columns": ["Kolom 1", "Kolom 2", "Kolom 3"],
  "rows": [
    { "cells": ["Baris 1 Kolom 1", "Baris 1 Kolom 2", "Baris 1 Kolom 3"] },
    { "cells": ["Baris 2 Kolom 1", "Baris 2 Kolom 2", "Baris 2 Kolom 3"] }
  ]
}`;

          setLoadingText("Membuat Sheet...");
          
          const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: contents, // User prompt
             config: {
               systemInstruction: sysInstruction,
               responseMimeType: "application/json"
             }
          });

          let sheetDataStr = response.text || "";
          let sheetDataObj = null;
          let isValidJson = false;
          try {
             const jsonMatch = sheetDataStr.match(/\{[\s\S]*\}/);
             if (jsonMatch) {
               sheetDataObj = JSON.parse(jsonMatch[0]);
             } else {
               sheetDataObj = JSON.parse(sheetDataStr.replace(/```json/gi, '').replace(/```/g, '').trim());
             }
             isValidJson = true;
          } catch(e) {
             console.error("Failed to parse sheet JSON", e);
             sheetDataObj = null;
          }

          const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
          if (isValidJson && sheetDataObj) {
            await setDoc(modelMsgRef, {
               chatId: chatId,
               userId: user.uid,
               role: "model",
               text: "Berikut adalah data tabel yang saya buat untuk Anda.",
               createdAt: serverTimestamp(),
               sheetData: sheetDataObj
            });
          } else {
            await setDoc(modelMsgRef, {
               chatId: chatId,
               userId: user.uid,
               role: "model",
               text: "Maaf, terjadi kesalahan saat membuat tabel. API tidak mengembalikan format yang valid.\n\n```text\n" + sheetDataStr.substring(0, 200) + "...\n```",
               createdAt: serverTimestamp()
            });
          }
          
         } catch (error: any) {
           console.error("Sheet Gen Error:", error);
           const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
           await setDoc(modelMsgRef, {
             chatId: chatId,
             userId: user.uid,
             role: "model",
             text: `Maaf, terjadi kesalahan tak terduga:\n\n${error?.message || "Unknown error"}`,
             createdAt: serverTimestamp()
           });
         } finally {
           setIsLoading(false);
         }
         return;
      }

      let shouldMentionOrigin = contents.filter(c => c.role === "user").length <= 1; // Only mention in early conversation easily or when asked explicitly
      
      let sysInstruction = locationContext + `You are SuperAI, an intelligent and helpful AI assistant. Your name is SuperAI. ${shouldMentionOrigin ? "You were created and developed by SuperRinz." : ""} Selalu tanyakan balik ke user mengenai topik pembicaraan agar obrolan panjang dan mengalir alami.\n\nIMPORTANT: You must respond in the ${language === "id" ? "Indonesian" : "English"} language.`;

      if (appMode === 'learn') {
         sysInstruction = locationContext + "Anda adalah seorang guru profesional yang cerdas, interaktif, dan menyenangkan. Pengguna akan memberikan topik yang ingin mereka pelajari. Tugas Anda: 1. Menjelaskan materi dengan singkat, padat, dan seru. 2. Memberikan kuis pilihan ganda (A, B, C, D) untuk menguji pemahaman pengguna. 3. Bereaksi secara interaktif terhadap jawaban pengguna (memberikan pujian/poin jika benar, koreksi dan penjelasan jika salah). 4. Menyediakan tugas harian atau latihan tambahan asyik untuk dikerjakan. 5. Selalu gunakan format markdown dengan blok kutipan atau formatting yang rapi. 6. Pastikan opsi kuis A, B, C, D mudah diidentifikasi (gunakan list markdown). Jangan selalu mengulang instruksi, langsung mulai pelajaran atau permainan/kuis pilihan ganda ketika ada input. Jadikan simulasi belajar ini seperti game seru!";
      } else if (appMode === 'cv') {
         sysInstruction = locationContext + "Anda adalah seorang asisten pembuat Curriculum Vitae (CV) dan resume profesional yang terampil (ATS Friendly). Tugas pertama Anda adalah memandu pengguna menyusun CV jika data mereka belum lengkap. Tanyakan secara proaktif namun bertahap (jangan sekaligus banyak) informasi seperti: Nama lengkap, kontak, profil/summary singkat, riwayat pendidikan, pengalaman kerja, keahlian, dan proyek. Jika pengguna kebingungan, berikan contoh singkat. Jika data sudah dirasa cukup untuk dibuatkan CV ATAU pengguna meminta untuk langsung dibuatkan dengan data seadanya, Tugas Anda selanjutnya: 1. Susun dokumen CV profesional untuk pengguna menggunakan format JSON yang valid. 2. Output HANYA code box JSON (```jsoncv\n...\n```) yang memuat skema untuk CVPreview. Berikut struktur JSON yang wajib ditaati: {\n\"personalInfo\": { \"name\": \"\", \"email\": \"\", \"phone\": \"\", \"location\": \"\", \"linkedin\": \"\", \"portfolio\": \"\", \"summary\": \"\" },\n\"experience\": [{ \"role\": \"\", \"company\": \"\", \"location\": \"\", \"startDate\": \"\", \"endDate\": \"\", \"description\": [\"\"] }],\n\"education\": [{ \"degree\": \"\", \"institution\": \"\", \"location\": \"\", \"startDate\": \"\", \"endDate\": \"\", \"gpa\": \"\" }],\n\"skills\": [{ \"category\": \"\", \"items\": [\"\"] }],\n\"projects\": [{ \"name\": \"\", \"description\": \"\", \"technologies\": [\"\"], \"link\": \"\" }]\n}. Anda juga boleh menyertakan teks panduan atau saran di luar kode JSON tersebut untuk membantu pengguna menyempurnakannya.";
      } else if (aiModel === 'gemini-2.5-pro') {
         sysInstruction += " Kamu harus MENGKOMUNIKASIKAN proses berpikirmu sebelum menjawab pertanyaan. Untuk melakukan hal ini, selalu awali responmu dengan TAG <thinking> dan tutup dengan </thinking> dan isi didalamnya dengan analisis, penalaran, atau rencana kamu. Pastikan untuk MENGGUNAKAN format markdown di dalam tag thinking.";
      }

      if (customInstructions.trim() !== '') {
         sysInstruction += "\n\nInstruksi Tambahan dari Pengguna untuk Kamu (Penting! Patuhi apapun kondisinya):\n" + customInstructions.trim();
      }

      const response = await ai.models.generateContentStream({
        model: aiModel,
        config: { 
          systemInstruction: sysInstruction,
          tools: toolsConfig 
        },
        contents: contents,
      });

      let fullResponse = "";
      let chunksList: any[] = [];
      
      const modelMsgRef = doc(collection(db, `chats/${chatId}/messages`));
      
      setStreamingMessageId(modelMsgRef.id);
      setStreamingText("");

      // Save placeholder first so snapshot adds it.
      await setDoc(modelMsgRef, {
        chatId: chatId,
        userId: user.uid,
        role: "model",
        text: "",
        createdAt: serverTimestamp()
      });

      for await (const chunk of response) {
        if (abortControllerRef.current?.signal.aborted) {
           break;
        }
        const textToAppend = chunk.text;
        fullResponse += textToAppend;
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          chunksList.push(...chunk.candidates[0].groundingMetadata.groundingChunks);
        }
        setStreamingText(fullResponse);
      }
      
      const distinctChunks = Array.from(new Map(chunksList.map(item => [item.web?.uri, item])).values());

      await setDoc(modelMsgRef, {
          text: fullResponse,
          groundingChunks: distinctChunks.length > 0 ? distinctChunks : null
      }, { merge: true });

      }

      setStreamingMessageId(null);
      setStreamingText(null);

      // Play sound notification if enabled
      if (soundEnabled) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            // A gentle, high pitch "ting" sound
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            // Quick attack
            gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
            // Smooth decay
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
          }
        } catch (e) {
          console.error("Audio playback failed", e);
        }
      }

      // Vibrate if haptics enabled
      if (hapticsEnabled && navigator.vibrate) {
        try {
          navigator.vibrate(50); // Small buzz
        } catch (e) {
          console.error("Haptics failed", e);
        }
      }

    } catch (error: any) {
      console.error("Error generating response:", error);
      if (error.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        alert("Terjadi kesalahan: " + (error.message || String(error)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isQuizTime = appMode === 'learn' && 
    messages.length > 0 && 
    messages[messages.length - 1].role === 'model' && 
    !isLoading && 
    /(?:^|\n)\s*(?:[-*]\s*)?A[\.)]\s/i.test(messages[messages.length - 1].text) && 
    /(?:^|\n)\s*(?:[-*]\s*)?B[\.)]\s/i.test(messages[messages.length - 1].text);

  return (
    
   <div className="flex flex-col h-[100dvh] bg-[#f4f7fb] text-gray-900 font-sans relative overflow-hidden">
      
      {showLoginScreen && !user && (
        <LoginScreen 
          onClose={() => setShowLoginScreen(false)} 
          onLoginWithGoogle={handleLoginWithGoogle} 
        />
      )}

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Layout Layer */}
      <div className="flex h-[100dvh] relative">
        <motion.aside
          initial={false}
          animate={{ x: isSidebarOpen ? 0 : "-100%", opacity: isSidebarOpen ? 1 : 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute z-50 left-0 top-0 bottom-0 w-72 bg-[#f4f7fb] border-r border-slate-200/60 flex flex-col pt-6"
        >
          <div className="flex items-center justify-between px-4 pb-4 shrink-0">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t.chatHistory}</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200/50 text-gray-500">
               <X size={18} />
            </button>
          </div>
          <div className="px-4 pb-4 border-b border-slate-200/60 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
             {chats.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase())).map(chat => (
                <div 
                  key={chat.id} 
                  onClick={() => { setCurrentChatId(chat.id); setIsSidebarOpen(false); }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group transition-colors ${currentChatId === chat.id ? 'bg-slate-200/60 font-medium' : 'hover:bg-slate-200/40'}`}
                >
                   <div className="flex items-center gap-2.5 overflow-hidden">
                      <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate text-[0.95rem] text-slate-700">{chat.title}</span>
                   </div>
                   <button onClick={(e) => deleteChat(e, chat.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-300 rounded text-slate-500 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                   </button>
                </div>
             ))}
             {chats.length === 0 && !searchQuery && <div className="text-center text-sm text-gray-400 pt-8">{t.emptyHistory}</div>}
             {chats.length > 0 && chats.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && <div className="text-center text-sm text-gray-400 pt-8">{t.searchNotFound}</div>}
          </div>
          <div className="p-4 border-t border-slate-200/60 shrink-0 space-y-2">
            {!user ? (
               <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition">
                 {t.loginWithGoogle}
               </button>
            ) : (
               <>
                 <div 
                   onClick={() => { setShowProfile(true); setIsSidebarOpen(false); }}
                   className="flex items-center gap-2 px-2 pb-2 cursor-pointer hover:bg-slate-100/50 rounded-xl transition-colors py-1.5"
                 >
                   <div className={`w-8 h-8 rounded-full shrink-0 relative flex items-center justify-center ${user.email === 'cipaonly08@gmail.com' ? 'p-[2px]' : 'bg-slate-200 overflow-hidden'}`}>
                     {user.email === 'cipaonly08@gmail.com' && (
                       <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 via-pink-500 to-orange-500 animate-[spin_3s_linear_infinite]" />
                     )}
                     <div className={`w-full h-full rounded-full overflow-hidden z-10 relative ${user.email === 'cipaonly08@gmail.com' ? 'bg-white' : ''}`}>
                       {displayPhotoURL ? <img src={displayPhotoURL} className="w-full h-full object-cover rounded-full" /> : <Bot size={16} />}
                     </div>
                   </div>
                   <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">{displayDisplayName}</span>
                      <span className="text-[10px] text-gray-500 truncate">{user.email}</span>
                   </div>
                 </div>
                 <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-medium transition">
                   <LogOut size={16} /> Logout
                 </button>
               </>
            )}
          </div>
        </motion.aside>

        {/* Main Interface Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300" style={{ paddingLeft: typeof window !== "undefined" && window.innerWidth >= 640 && isSidebarOpen ? '18rem' : '0' }}>
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 pt-6 z-10 shrink-0 select-none">
        <div className="flex items-center gap-4 text-gray-700">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-200/50 transition-colors"
          >
            <TextAlignStartIcon className="w-[22px] h-[22px]" strokeWidth={1.75} />
          </motion.button>
          <span className="text-xl font-medium tracking-tight">SuperAI</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowNotifications(true);
                if (notifications.length > 0) {
                  setLastSeenNotification(notifications[0].createdAt?.toDate?.()?.toISOString() || new Date().toISOString());
                }
              }}
              className="p-2 rounded-full hover:bg-gray-200/50 transition-colors text-gray-600 hover:text-gray-900"
            >
              <Bell className="w-[22px] h-[22px]" strokeWidth={1.75} />
            </motion.button>
            {notifications.length > 0 && notifications[0].createdAt?.toMillis && notifications[0].createdAt.toMillis() > new Date(lastSeenNotification).getTime() && (
              <span className="absolute top-[6px] right-[8px] w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createNewChat}
            className="p-2 rounded-full hover:bg-gray-200/50 transition-colors text-gray-600 hover:text-gray-900"
          >
            <CircleFadingPlusIcon className="w-[22px] h-[22px]" strokeWidth={1.75} />
          </motion.button>
          {!user ? (
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleLogin}
               className="p-2 rounded-full hover:bg-gray-200/50 transition-colors text-gray-600 hover:text-gray-900"
             >
               <CircleUserRoundIcon className="w-[22px] h-[22px]" strokeWidth={1.75} />
             </motion.button>
          ) : (
             <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setShowProfile(true)}
               className={`w-[34px] h-[34px] ml-1 rounded-full relative cursor-pointer ${user.email === 'cipaonly08@gmail.com' ? 'p-[2px]' : ''}`}
             >
               {user.email === 'cipaonly08@gmail.com' && (
                 <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 via-pink-500 to-orange-500 animate-[spin_3s_linear_infinite]" />
               )}
               <div className={`w-full h-full rounded-full overflow-hidden z-10 relative ${user.email === 'cipaonly08@gmail.com' ? 'bg-white border text-[#cbd5e1]' : 'border border-[#cbd5e1]'}`}>
                 {displayPhotoURL ? <img src={displayPhotoURL} className="w-full h-full object-cover rounded-full" /> : <Bot size={20} />}
               </div>
             </motion.div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main 
        ref={mainRef}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
          isAutoScrollPausedRef.current = !isAtBottom;
          if (!isAtBottom && !showScrollButton) {
            setShowScrollButton(true);
          } else if (isAtBottom && showScrollButton) {
            setShowScrollButton(false);
          }
        }}
        className="flex-1 overflow-y-auto px-4 sm:px-6 pb-48"
      >
        <div className="max-w-3xl mx-auto min-h-full flex flex-col">
          {messages.length === 0 ? (
            // Greeting State
            <div className="flex-1 flex flex-col justify-center pb-20">
              <AnimatePresence mode="wait">
                {appMode === 'slide' ? (
                  <motion.div
                    key="slide-greeting"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                    className="flex flex-col items-center justify-center space-y-8 w-full"
                  >
                     <img src="/logo.png" alt="Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-2xl" />
                     
                     <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl px-4">
                       {/* Card 1: Jumlah Slide */}
                       <div className="flex-1 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col items-center gap-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                          <h3 className="font-semibold text-gray-800 text-lg">Jumlah Slide</h3>
                          <div className="flex items-center gap-4 bg-gray-50/80 p-2 rounded-2xl w-full justify-between">
                            <button onClick={() => setSlideCount(Math.max(5, slideCount - 1))} disabled={slideCount <= 5} className={`w-12 h-12 flex flex-col items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] text-xl font-medium transition-colors ${slideCount <= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>-</button>
                            <span className="font-bold text-2xl text-gray-800">{slideCount}</span>
                            <button onClick={() => setSlideCount(Math.min(7, slideCount + 1))} disabled={slideCount >= 7} className={`w-12 h-12 flex flex-col items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] text-xl font-medium transition-colors ${slideCount >= 7 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>+</button>
                          </div>
                       </div>
                       
                       {/* Card 2: Sumber Gambar */}
                       <div className="flex-1 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col items-center gap-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                          <h3 className="font-semibold text-gray-800 text-lg">Gambar Generator</h3>
                          <div className="flex bg-gray-50/80 p-2 rounded-2xl w-full">
                            <button onClick={() => setSlideImageMedia('ai')} className={`flex flex-col items-center justify-center flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${slideImageMedia === 'ai' ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>AI Model</button>
                            <button onClick={() => setSlideImageMedia('search')} className={`flex flex-col items-center justify-center flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${slideImageMedia === 'search' ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Web Search</button>
                          </div>
                       </div>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="normal-greeting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 select-none"
                  >
                    <img src="/logo.png" alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
                    <div className="space-y-1">
                      <h1 className="text-[1.75rem] sm:text-3xl font-medium text-gray-800">
                        {t.hello} <span className="gradient-text-animated">{displayDisplayName.split(' ')[0]}</span>
                      </h1>
                      <h2 className="text-[2.5rem] sm:text-[3.6rem] leading-[1.1] font-medium tracking-tight text-gray-900 mt-1">
                        {t.howCanIHelp}
                      </h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Chat History
            <div className="flex-1 pb-10 space-y-8 pt-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex w-full ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="flex flex-col items-end max-w-[85%]">
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-2 mb-2">
                             {message.attachments.map((att, i) => (
                               <div key={i} className="flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-xl border border-gray-200/60">
                                  {att.mimeType?.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-gray-500" /> : <FileText className="w-4 h-4 text-gray-500" />}
                                  <span className="text-xs text-gray-700 font-medium truncate max-w-[150px]">{att.name}</span>
                               </div>
                             ))}
                          </div>
                        )}
                        <div 
                          className={`bg-gray-100 text-gray-900 px-5 py-3.5 rounded-3xl rounded-tr-md leading-relaxed text-left whitespace-pre-wrap font-medium select-text max-w-full overflow-hidden shadow-sm border border-gray-200/50 ${textSize === 'small' ? 'text-[0.95rem]' : textSize === 'large' ? 'text-[1.25rem]' : 'text-[1.1rem] sm:text-[1.15rem]'}`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start w-fit max-w-full mt-1">
                        {message.id === streamingMessageId && streamingText === "" ? (
                           <div className="flex items-center gap-3 mt-1 mb-2 px-2">
                             <div className="flex items-center">
                               <div className="w-[35px] h-[35px] flex items-center justify-center shrink-0 relative z-10">
                                   <div className="loader">
                                     <svg width="100" height="100" viewBox="0 0 100 100">
                                       <defs>
                                         <mask id="clipping">
                                           <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
                                           <polygon points="25,25 75,25 50,75" fill="white"></polygon>
                                           <polygon points="50,25 75,75 25,75" fill="white"></polygon>
                                           <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                                         </mask>
                                       </defs>
                                     </svg>
                                     <div className="box"></div>
                                   </div>
                               </div>
                               <AnimatePresence>
                                  {isSearching && loadingIconType !== "none" && (
                                     <motion.div
                                       initial={{ opacity: 0, scale: 0.5, x: -20 }}
                                       animate={{ opacity: 1, scale: 1, x: -5 }}
                                       exit={{ opacity: 0, scale: 0.5, x: -20 }}
                                       transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                       className="w-[30px] h-[30px] flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 z-0"
                                     >
                                        {loadingIconType === "google" && <Search className="w-4 h-4 text-blue-500" />}
                                        {loadingIconType === "map" && <MapIcon className="w-4 h-4 text-green-500" />}
                                        {loadingIconType === "calendar" && <Calendar className="w-4 h-4 text-blue-500" />}
                                        {loadingIconType === "weather" && <CloudSun className="w-4 h-4 text-yellow-500" />}
                                        {loadingIconType === "time" && <Clock className="w-4 h-4 text-purple-500" />}
                                     </motion.div>
                                  )}
                               </AnimatePresence>
                             </div>
                             <span className={`text-[0.95rem] font-medium tracking-wide animate-pulse ml-1 ${isSearching ? 'bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]' : 'text-gray-500'}`}>
                                {loadingText}
                             </span>
                           </div>
                        ) : message.sheetData ? (
                          <div className="flex flex-col w-full">
                            <div className="flex items-center gap-3 mb-2 px-1">
                              <img src="/logo.png" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
                              <span className="font-semibold text-gray-800 text-[1.05rem]">SuperAI</span>
                            </div>
                            <div className="pl-11 w-full max-w-full">
                               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
                                  <Table className="w-12 h-12 text-emerald-500" />
                                  <h3 className="font-semibold text-gray-800 text-lg text-center">{message.sheetData.title || "Data Sheet Anda"}</h3>
                                  <p className="text-sm text-gray-500 text-center -mt-2 mb-4">{message.sheetData.rows?.length || 0} Baris Data</p>
                                  
                                  <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-sm text-left">
                                      <thead className="text-xs text-gray-700 bg-gray-50 uppercase">
                                        <tr>
                                          {message.sheetData.columns?.map((col: string, i: number) => (
                                            <th key={i} className="px-6 py-3 font-semibold whitespace-nowrap">{col}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {message.sheetData.rows?.map((rowObj: any, i: number) => (
                                          <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                            {rowObj.cells?.map((val: string, j: number) => (
                                              <td key={j} className="px-6 py-4 whitespace-nowrap">{val}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <p className="text-xs text-gray-500 w-full text-left mt-1">
                                    💡 <span className="font-medium text-gray-600">Tips:</span> Anda bisa klik Download CSV lalu langsung membukanya di Excel/Google Sheets, atau Salin Tabel dan Paste (Ctrl+V / Cmd+V) langsung ke cell pertama di Excel/Sheet Anda.
                                  </p>

                                  <div className="flex w-full justify-end mt-2 gap-3 flex-wrap">
                                     <button 
                                        onClick={() => {
                                          const tsvContent = message.sheetData.columns.join("\t") + "\n"
                                              + message.sheetData.rows.map((rowObj: any) => (rowObj.cells || []).join("\t")).join("\n");
                                          
                                          if (navigator.clipboard && window.isSecureContext) {
                                            navigator.clipboard.writeText(tsvContent);
                                            setCopiedId(message.id + "-table");
                                            setTimeout(() => setCopiedId(null), 2000);
                                          } else {
                                            const textArea = document.createElement("textarea");
                                            textArea.value = tsvContent;
                                            textArea.style.position = "absolute";
                                            textArea.style.left = "-999999px";
                                            document.body.prepend(textArea);
                                            textArea.select();
                                            try {
                                              document.execCommand('copy');
                                              setCopiedId(message.id + "-table");
                                              setTimeout(() => setCopiedId(null), 2000);
                                            } catch (error) {
                                              console.error(error);
                                            } finally {
                                              textArea.remove();
                                            }
                                          }
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-medium transition-colors w-full sm:w-auto"
                                     >
                                        {copiedId === message.id + "-table" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        {copiedId === message.id + "-table" ? "Tersalin!" : "Salin Tabel"}
                                     </button>
                                     <button 
                                        onClick={() => {
                                          const csvContent = "data:text/csv;charset=utf-8," 
                                              + message.sheetData.columns.map((e: string) => `"${e.toString().replace(/"/g, '""')}"`).join(",") + "\n"
                                              + message.sheetData.rows.map((rowObj: any) => (rowObj.cells || []).map((v: any) => `"${(v || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
                                          const encodedUri = encodeURI(csvContent);
                                          const link = document.createElement("a");
                                          link.setAttribute("href", encodedUri);
                                          link.setAttribute("download", (message.sheetData.title || "sheet") + ".csv");
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors w-full sm:w-auto shadow-md shadow-emerald-500/20"
                                     >
                                        <Download className="w-4 h-4" />
                                        Download CSV
                                     </button>
                                  </div>
                               </div>
                            </div>
                          </div>
                        ) : message.slideData ? (
                          <div className="flex flex-col w-full">
                            <div className="flex items-center gap-3 mb-2 px-1">
                              <img src="/logo.png" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
                              <span className="font-semibold text-gray-800 text-[1.05rem]">SuperAI</span>
                            </div>
                            <div className="pl-11 w-full max-w-full">
                               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
                                  <MonitorPlay className="w-12 h-12 text-purple-500" />
                                  <h3 className="font-semibold text-gray-800 text-lg text-center">{message.slideData.title || "Presentasi Anda"}</h3>
                                  <p className="text-sm text-gray-500 text-center -mt-2 mb-2">{message.slideData.slides?.length || 0} Slide • Dibuat menggunakan {message.slideMedia === 'ai' ? 'AI Generator' : 'Web Search'}</p>
                                  
                                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                                     <button 
                                        onClick={() => {
                                            setSlidePreviewData(message.slideData);
                                            setSlidePreviewMedia(message.slideMedia || 'ai');
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium transition-colors w-full sm:w-auto"
                                     >
                                        <Eye className="w-4 h-4" />
                                        Lihat Preview
                                     </button>
                                     <button 
                                        onClick={() => {
                                            setSlidePreviewData(message.slideData);
                                            setSlidePreviewMedia(message.slideMedia || 'ai');
                                            setTimeout(() => handleDownloadPdf(), 500);
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors w-full sm:w-auto shadow-md shadow-purple-600/20"
                                     >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                     </button>
                                     <button 
                                        onClick={() => {
                                            setSlidePreviewData(message.slideData);
                                            setSlidePreviewMedia(message.slideMedia || 'ai');
                                            setTimeout(() => handleDownloadPptx(), 100);
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors w-full sm:w-auto shadow-md shadow-orange-500/20"
                                     >
                                        <Download className="w-4 h-4" />
                                        Download PPTX
                                     </button>
                                  </div>
                               </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col w-full">
                            <div className="flex items-center gap-3 mb-2 px-1">
                              <img src="/logo.png" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
                              <span className="font-semibold text-gray-800 text-[1.05rem]">SuperAI</span>
                            </div>
                            <div 
                              className="markdown-body w-full max-w-full overflow-x-auto text-gray-800 pl-11"
                              style={{ fontSize: textSize === 'small' ? '0.9rem' : textSize === 'large' ? '1.25rem' : '1.05rem' }}
                            >
                               {(() => {
                                 const rawText = message.id === streamingMessageId && streamingText !== null ? streamingText : message.text;
                                 let textToRender = rawText;
                                 let thinkingText = "";
                                 
                                 const thinkingMatch = rawText.match(/<thinking>([\s\S]*?)<\/thinking>/);
                                 if (thinkingMatch) {
                                   thinkingText = thinkingMatch[1].trim();
                                   textToRender = rawText.replace(thinkingMatch[0], '').trim();
                                 } else if (rawText.startsWith('<thinking>')) {
                                   thinkingText = rawText.replace('<thinking>', '').trim();
                                   textToRender = "";
                                 }

                                 const mapRegex = /```(?:json)?\s*(\{\s*"type"\s*:\s*"map"[\s\S]*?\})\s*```/i;
                                 const mapDataMatch = textToRender.match(mapRegex);
                                 let parsedMapData: any = null;
                                 if (mapDataMatch) {
                                   try {
                                     parsedMapData = JSON.parse(mapDataMatch[1]);
                                     textToRender = textToRender.replace(mapRegex, "").trim();
                                   } catch(e) {}
                                 }

                                 const calRegex = /```(?:json)?\s*(\{\s*"type"\s*:\s*"calendar"[\s\S]*?\})\s*```/i;
                                 const calDataMatch = textToRender.match(calRegex);
                                 let parsedCalData: any = null;
                                 if (calDataMatch) {
                                   try {
                                     parsedCalData = JSON.parse(calDataMatch[1]);
                                     textToRender = textToRender.replace(calRegex, "").trim();
                                   } catch(e) {}
                                 }

                                 const weatherRegex = /```(?:json)?\s*(\{\s*"type"\s*:\s*"weather"[\s\S]*?\})\s*```/i;
                                 const weatherDataMatch = textToRender.match(weatherRegex);
                                 let parsedWeatherData: any = null;
                                 if (weatherDataMatch) {
                                   try {
                                     parsedWeatherData = JSON.parse(weatherDataMatch[1]);
                                     textToRender = textToRender.replace(weatherRegex, "").trim();
                                   } catch(e) {}
                                 }

                                 const timeRegex = /```(?:json)?\s*(\{\s*"type"\s*:\s*"time"[\s\S]*?\})\s*```/i;
                                 const timeDataMatch = textToRender.match(timeRegex);
                                 let parsedTimeData: any = null;
                                 if (timeDataMatch) {
                                   try {
                                     parsedTimeData = JSON.parse(timeDataMatch[1]);
                                     textToRender = textToRender.replace(timeRegex, "").trim();
                                   } catch(e) {}
                                 }

                                 return (
                                   <>
                                     {thinkingText && (
                                       <details className="mb-4 bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden group">
                                          <summary className="px-4 py-3 cursor-pointer font-medium text-gray-500 hover:text-gray-700 transition-colors list-none select-none flex items-center justify-between">
                                             <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                                   <div className="loader scale-[0.6]">
                                                     <svg width="100" height="100" viewBox="0 0 100 100">
                                                       <defs>
                                                         <mask id="clipping">
                                                           <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
                                                           <polygon points="25,25 75,25 50,75" fill="white"></polygon>
                                                           <polygon points="50,25 75,75 25,75" fill="white"></polygon>
                                                           <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                                                         </mask>
                                                       </defs>
                                                     </svg>
                                                     <div className="box"></div>
                                                   </div>
                                                </div>
                                                <span className="text-sm">Proses Berpikir</span>
                                             </div>
                                             <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                                          </summary>
                                          <div className="p-4 pt-1 text-[0.9rem] text-gray-600 bg-gray-50/50 markdown-body prose-sm prose-gray max-w-none">
                                            <Markdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{thinkingText}</Markdown>
                                          </div>
                                       </details>
                                     )}
                                     {textToRender && (
                                       <Markdown 
                                         remarkPlugins={[remarkGfm]}
                                         components={{ 
                                           hr: ({node, ...props}) => <hr className="w-full h-[3px] bg-gradient-to-r from-transparent via-purple-300 to-transparent my-10 border-0 rounded-full" />,
                                           code: CodeBlock,
                                           a: ({node, ...props}) => {
                                             if (props.href && props.href.includes('vertexaisearch')) return null;
                                             return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (props.href) window.open(props.href, "_blank", "noopener,noreferrer"); }} />;
                                           },
                                           img: ({node, ...props}) => {
                                             if (!props.src) return null;
                                             return (
                                               <span className="relative group inline-block max-w-full">
                                                 <img {...props} className="max-w-full rounded-lg my-2 shadow-sm" />
                                                 <button
                                                   onClick={(e) => {
                                                     e.preventDefault();
                                                     e.stopPropagation();
                                                     const downloadImage = async () => {
                                                       try {
                                                         const response = await fetch(props.src!);
                                                         const blob = await response.blob();
                                                         const url = window.URL.createObjectURL(blob);
                                                         const a = document.createElement('a');
                                                         a.style.display = 'none';
                                                         a.href = url;
                                                         a.download = `image-${Date.now()}.png`;
                                                         document.body.appendChild(a);
                                                         a.click();
                                                         window.URL.revokeObjectURL(url);
                                                       } catch (err) {
                                                         console.error('Download failed', err);
                                                         window.open(props.src, '_blank');
                                                       }
                                                     };
                                                     downloadImage();
                                                   }}
                                                   className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                                   title="Download Image"
                                                 >
                                                   <Download className="w-4 h-4" />
                                                 </button>
                                               </span>
                                             )
                                           }
                                         }}
                                       >
                                         {textToRender}
                                       </Markdown>
                                     )}
                                     {parsedMapData && (
                                        <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-200" style={{ width: '100%', maxWidth: '600px', height: '300px' }}>
                                           <iframe
                                             width="100%"
                                             height="100%"
                                             style={{ border: 0 }}
                                             loading="lazy"
                                             allowFullScreen
                                             referrerPolicy="no-referrer-when-downgrade"
                                             src={`https://maps.google.com/maps?q=${parsedMapData.lat},${parsedMapData.lng}&hl=id&z=${parsedMapData.zoom || 15}&output=embed`}
                                           ></iframe>
                                        </div>
                                     )}
                                     {parsedCalData && (
                                        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-xl max-w-sm flex flex-col gap-2 shadow-sm">
                                           <div className="font-semibold text-blue-800">{parsedCalData.title}</div>
                                           <div className="text-sm text-blue-700 font-medium">📅 {parsedCalData.date?.split('T')[0] || "Acara Terjadwal"}</div>
                                           {parsedCalData.location && <div className="text-sm text-blue-600">{parsedCalData.location}</div>}
                                           <div className="flex flex-col gap-2 mt-2">
                                             <a 
                                               href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(parsedCalData.title)}&dates=${parsedCalData.date}&details=${encodeURIComponent(parsedCalData.details || '')}&location=${encodeURIComponent(parsedCalData.location || '')}`}
                                               target="_blank"
                                               rel="noopener noreferrer"
                                               className="text-center text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                             >
                                                Buka di Google Calendar
                                             </a>
                                             <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const dates = parsedCalData.date?.split('/') || [];
                                                const start = dates[0] || '';
                                                const end = dates[1] || start;
                                                const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SuperAI//ID\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${parsedCalData.title || 'Acara'}\nDESCRIPTION:${parsedCalData.details || ''}\nLOCATION:${parsedCalData.location || ''}\nEND:VEVENT\nEND:VCALENDAR`;
                                                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${(parsedCalData.title || 'Acara').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                window.URL.revokeObjectURL(url);
                                              }}
                                              className="text-center text-sm font-medium bg-white text-blue-700 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                                             >
                                                Buka di Kalender Bawaan (Samsung/Apple)
                                             </button>
                                           </div>
                                        </div>
                                     )}
                                     {parsedWeatherData && (
                                        <div className="mb-4 p-5 rounded-2xl max-w-sm text-white shadow-lg overflow-hidden relative bg-gradient-to-br from-blue-400 to-blue-600">
                                            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20">
                                                <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                   <path d="M6.012 18H21V16H6.012C5.55 16 5.147 15.694 5.027 15.244L3.102 8H17V6H2.56L4.973 15.044C5.168 15.782 5.827 16 6.012 16Z"/>
                                                   <path d="M12 14c2.206 0 4-1.794 4-4s-1.794-4-4-4S8 7.794 8 10s1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z"/>
                                                </svg>
                                            </div>
                                            <div className="relative z-10 flex flex-col gap-1">
                                                <div className="text-lg font-medium opacity-90">{parsedWeatherData.city}</div>
                                                <div className="text-5xl font-bold tracking-tighter my-1">{parsedWeatherData.temp}°C</div>
                                                <div className="text-lg font-medium">{parsedWeatherData.condition}</div>
                                                {parsedWeatherData.humidity && <div className="text-sm opacity-80 mt-2">Kelembapan: {parsedWeatherData.humidity}</div>}
                                            </div>
                                        </div>
                                     )}
                                     {parsedTimeData && (
                                        <div className="mb-4 p-6 border border-gray-200 bg-white rounded-2xl max-w-sm flex flex-col items-center justify-center gap-1 shadow-sm">
                                            <div className="text-5xl font-mono tracking-tight font-bold text-gray-800">{parsedTimeData.time}</div>
                                            <div className="text-md font-medium text-gray-500">{parsedTimeData.date}</div>
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">{parsedTimeData.timezone}</div>
                                        </div>
                                     )}
                                   </>
                                 );
                               })()}
                            </div>
                          </div>
                        )}
                        {message.groundingChunks && message.groundingChunks.length > 0 && (
                           <div className="mt-3 w-full max-w-full">
                             <div className="flex overflow-x-auto gap-2 py-2 hide-scrollbar items-center">
                               {
                                 (() => {
                                   const seenUris = new Set();
                                   return message.groundingChunks.map((chunk: any, idx: number) => {
                                     if (!chunk.web?.uri) return null;
                                     let targetUri = chunk.web.uri;
                                     let hostname = "Sumber";
                                     try {
                                        const parsedUri = new URL(chunk.web.uri);
                                        if (chunk.web.uri.includes('vertexaisearch')) {
                                           const actualUrl = parsedUri.searchParams.get('url') || parsedUri.searchParams.get('q');
                                           if (actualUrl) {
                                             targetUri = actualUrl;
                                           }
                                        }
                                        hostname = new URL(targetUri).hostname.replace('www.', '');
                                     } catch(e) {}
                                     
                                     if (seenUris.has(targetUri)) return null;
                                     seenUris.add(targetUri);

                                     return (
                                       <a 
                                         key={idx}
                                         href={targetUri}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         onClick={(e) => { 
                                           e.preventDefault(); 
                                           e.stopPropagation(); 
                                           window.open(targetUri, "_blank", "noopener,noreferrer"); 
                                         }}
                                         className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 text-xs text-gray-700 transition-colors shadow-sm cursor-pointer relative z-10"
                                       >
                                         <Globe className="w-3.5 h-3.5 text-gray-400" />
                                         <span className="font-medium truncate max-w-[150px]">
                                           {chunk.web.title || hostname}
                                         </span>
                                       </a>
                                     );
                                   });
                                 })()
                               }
                             </div>
                           </div>
                        )}

                        {message.role === "model" && message.id !== streamingMessageId && (
                          <div className="flex items-center gap-2 mt-4 pl-11 text-gray-500">
                             <motion.button
                               whileHover={{ scale: 1.1 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => {
                                 if (likedIds.includes(message.id)) {
                                   setLikedIds(likedIds.filter(id => id !== message.id));
                                 } else {
                                   setLikedIds([...likedIds, message.id]);
                                 }
                               }}
                               className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${likedIds.includes(message.id) ? 'text-blue-500 bg-blue-50' : ''}`}
                               title="Suka"
                             >
                                <ThumbsUp className="w-4 h-4" strokeWidth={2} />
                             </motion.button>
                             
                             <motion.button
                               whileHover={{ scale: 1.1 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={async () => {
                                 try {
                                   await navigator.clipboard.writeText(message.text);
                                   setCopiedId(message.id);
                                   setTimeout(() => setCopiedId(null), 2000);
                                 } catch (err) {
                                   const textArea = document.createElement("textarea");
                                   textArea.value = message.text;
                                   document.body.appendChild(textArea);
                                   textArea.select();
                                   try {
                                     document.execCommand('copy');
                                     setCopiedId(message.id);
                                     setTimeout(() => setCopiedId(null), 2000);
                                   } catch (e) {
                                     console.error('Copy fallback failed', e);
                                   }
                                   document.body.removeChild(textArea);
                                 }
                               }}
                               className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                               title="Salin"
                             >
                                {copiedId === message.id ? <Check className="w-4 h-4 text-green-500" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
                             </motion.button>

                             <motion.button
                               whileHover={{ scale: 1.1 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={async () => {
                                 if (navigator.share) {
                                   try {
                                     await navigator.share({
                                       title: 'Jawaban dari SuperAI',
                                       text: message.text
                                     });
                                   } catch (err) {
                                     console.error(err);
                                   }
                                 } else {
                                   try {
                                     await navigator.clipboard.writeText(message.text);
                                     alert("Teks disalin ke clipboard karena browser tidak mendukung fitur share.");
                                   } catch (err) {
                                     const textArea = document.createElement("textarea");
                                     textArea.value = message.text;
                                     document.body.appendChild(textArea);
                                     textArea.select();
                                     try {
                                       document.execCommand('copy');
                                       alert("Teks disalin ke clipboard karena browser tidak mendukung fitur share.");
                                     } catch (e) {
                                       console.error('Copy fallback failed', e);
                                     }
                                     document.body.removeChild(textArea);
                                   }
                                 }
                               }}
                               className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                               title="Bagikan"
                             >
                                <Share2 className="w-4 h-4" strokeWidth={2} />
                             </motion.button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex justify-start w-full mt-2 mb-2"
                  >
                     {slideTaskState !== 'idle' ? (
                        <div className="flex flex-col items-start w-full pl-1">
                          <div className="flex items-center gap-3 mb-2">
                             <img src="/logo.png" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
                             <span className="font-semibold text-gray-800 text-[1.05rem]">SuperAI</span>
                          </div>
                          <div className="pl-11 w-full max-w-sm">
                             <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                               <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${slideTaskState === 'outline' ? 'border-purple-500 border-t-transparent animate-spin' : 'border-green-500 bg-green-500'}`}>
                                     {slideTaskState !== 'outline' && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  <span className={`text-sm font-medium ${slideTaskState === 'outline' ? 'text-gray-900' : 'text-gray-500'}`}>Membuat kerangka presentasi</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${slideTaskState === 'composing' ? 'border-purple-500 border-t-transparent animate-spin' : slideTaskState === 'rendering' ? 'border-green-500 bg-green-500' : 'border-gray-200'}`}>
                                     {slideTaskState === 'rendering' && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  <span className={`text-sm font-medium ${slideTaskState === 'composing' ? 'text-gray-900' : slideTaskState === 'rendering' ? 'text-gray-500' : 'text-gray-400'}`}>Menyusun slide presentasi</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${slideTaskState === 'rendering' ? 'border-purple-500 border-t-transparent animate-spin' : 'border-gray-200'}`}></div>
                                  <span className={`text-sm font-medium ${slideTaskState === 'rendering' ? 'text-gray-900' : 'text-gray-400'}`}>Merender hasil PDF</span>
                               </div>
                             </div>
                          </div>
                        </div>
                     ) : pendingMediaTask ? (
                        <div className="flex flex-col items-start w-full pl-1">
                          <div className="flex items-center gap-3 mb-2">
                             <img src="/logo.png" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
                             <span className="font-semibold text-gray-800 text-[1.05rem]">SuperAI</span>
                          </div>
                          <div className="pl-11 w-full max-w-sm">
                             <div className="relative w-full aspect-[4/3] bg-gray-200/50 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3 border border-gray-100 shadow-sm">
                                <style>
                                  {`
                                    @keyframes shimmer-loader {
                                      0% { transform: translateX(-100%); }
                                      100% { transform: translateX(100%); }
                                    }
                                  `}
                                </style>
                                <div 
                                  className="absolute top-0 left-0 w-full h-full z-0"
                                  style={{
                                    background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                                    animation: 'shimmer-loader 1.5s infinite'
                                  }}
                                ></div>
                                {pendingMediaTask === 'generate_image' ? (
                                    <>
                                       <Palette className="w-10 h-10 text-gray-400 rotate-12 relative z-10" />
                                       <span className="text-sm font-medium text-gray-500 relative z-10 animate-pulse tracking-wide">Menghasilkan Gambar...</span>
                                    </>
                                ) : (
                                    <>
                                       <Search className="w-10 h-10 text-gray-400 relative z-10" />
                                       <span className="text-sm font-medium text-gray-500 relative z-10 animate-pulse tracking-wide">Mencari Gambar...</span>
                                    </>
                                )}
                             </div>
                          </div>
                        </div>
                     ) : (
                       <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <div className="w-[35px] h-[35px] flex items-center justify-center shrink-0 relative z-10">
                                   <div className="loader">
                                     <svg width="100" height="100" viewBox="0 0 100 100">
                                       <defs>
                                         <mask id="clipping">
                                           <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
                                           <polygon points="25,25 75,25 50,75" fill="white"></polygon>
                                           <polygon points="50,25 75,75 25,75" fill="white"></polygon>
                                           <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                                         </mask>
                                       </defs>
                                     </svg>
                                     <div className="box"></div>
                                   </div>
                            </div>
                            <AnimatePresence>
                               {isSearching && loadingIconType !== "none" && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.5, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: -5 }}
                                    exit={{ opacity: 0, scale: 0.5, x: -20 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="w-[30px] h-[30px] flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 z-0"
                                  >
                                     {loadingIconType === "google" && <Search className="w-4 h-4 text-blue-500" />}
                                     {loadingIconType === "map" && <MapIcon className="w-4 h-4 text-green-500" />}
                                     {loadingIconType === "calendar" && <Calendar className="w-4 h-4 text-blue-500" />}
                                     {loadingIconType === "weather" && <CloudSun className="w-4 h-4 text-yellow-500" />}
                                     {loadingIconType === "time" && <Clock className="w-4 h-4 text-purple-500" />}
                                  </motion.div>
                               )}
                            </AnimatePresence>
                          </div>
                          <span className={`text-[0.95rem] font-medium tracking-wide animate-pulse ml-1 ${isSearching ? 'bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]' : 'text-gray-500'}`}>
                            {loadingText}
                          </span>
                       </div>
                     )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-24 sm:h-32" />
            </div>
          )}
        </div>
      </main>

      {/* Floating Scroll Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-30 right-4 sm:right-8 bottom-[110px] sm:bottom-[120px] transition-all"
          >
            <button
              onClick={() => scrollToBottom(true)}
              className="bg-white/90 backdrop-blur border border-gray-200 text-gray-700 shadow-lg rounded-full p-2.5 hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center group"
            >
              <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Dock */}
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t pt-10 pb-6 px-4 sm:px-6 z-20 ${isDarkMode ? 'from-[#121212] via-[#121212] to-transparent' : 'from-[#f4f7fb] via-[#f4f7fb] to-transparent'}`}>
        <div className="max-w-3xl mx-auto relative group">
          {/* Border Glow Layer */}
          <div className="absolute -inset-1 blur-md rounded-[2.1rem] overflow-hidden z-0 opacity-30 group-focus-within:opacity-60 transition-opacity duration-500 pointer-events-none">
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_160deg,#a855f7_220deg,#ec4899_290deg,#f97316_360deg)] animate-[spin_4s_linear_infinite] transition-opacity duration-300 ${isTyping ? 'opacity-0' : 'opacity-100'}`} />
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_160deg,#a855f7_220deg,#ec4899_290deg,#f97316_360deg)] animate-[spin_0.8s_linear_infinite] transition-opacity duration-300 ${isTyping ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          {/* Sharp Border Layer */}
          <div className="absolute inset-0 rounded-[2rem] z-0 overflow-hidden bg-transparent transition-colors duration-300 pointer-events-none">
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_160deg,#a855f7_220deg,#ec4899_290deg,#f97316_360deg)] animate-[spin_4s_linear_infinite] transition-opacity duration-300 ${isTyping ? 'opacity-0' : 'opacity-100'}`} />
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_160deg,#a855f7_220deg,#ec4899_290deg,#f97316_360deg)] animate-[spin_0.8s_linear_infinite] transition-opacity duration-300 ${isTyping ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          <div className="bg-white rounded-[calc(2rem-1.5px)] shadow-sm p-2 sm:p-3 pb-3 relative z-10 m-[1.5px] focus-within:ring-4 focus-within:ring-purple-100/50 transition-all duration-300">
            
            {/* Attachment preview */}
            {currentAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pt-2 pb-1">
                {currentAttachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                    {att.file.type.startsWith('image/') ? (
                      <div className="w-5 h-5 rounded overflow-hidden shrink-0">
                         <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <FileText className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{att.name}</span>
                    <button onClick={() => removeAttachment(idx)} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isQuizTime && (
              <div className="flex gap-2 px-4 pt-2 -mb-1 pb-1 overflow-x-auto scrollbar-hide">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => {
                       handleSendMessage(opt);
                    }}
                    className="px-4 py-1.5 rounded-full bg-green-50 hover:bg-green-100 text-green-600 font-medium text-sm transition-colors border border-green-100"
                  >
                    Jawaban {opt}
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              placeholder={appMode === 'learn' ? "Apa yang ingin dipelajari hari ini?" : appMode === 'generate_image' ? "Deskripsikan gambar yang ingin dibuat..." : appMode === 'search_image' ? "Apa yang ingin Anda cari..." : appMode === 'slide' ? "Topik presentasi apa yang ingin dibuat..." : appMode === 'sheet' ? "Data tabel apa yang ingin dibuat..." : appMode === 'cv' ? "Siapa nama dan data diri untuk CV ini..." : t.typeMessage}
              rows={1}
              className="w-full bg-transparent resize-none outline-none px-4 pt-3 pb-2 text-[1.05rem] text-gray-900 placeholder:text-gray-500 overflow-hidden"
            />
            
            <div className="flex items-center justify-between px-2 pt-2 mt-1 select-none">
              <div className="flex items-center gap-2 relative">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <Plus className={`w-[22px] h-[22px] transition-transform ${attachmentMenuOpen ? 'rotate-45' : ''}`} strokeWidth={1.75} />
                </motion.button>
                
                {attachmentMenuOpen && (
                  <div className="absolute bottom-12 left-0 bg-white shadow-lg border border-gray-100 rounded-2xl py-2 w-48 flex flex-col z-50">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                    <input type="file" accept="image/*" ref={imageInputRef} onChange={handleFileChange} className="hidden" multiple />
                    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                       <Camera className="w-4 h-4 text-gray-500" /> Kamera
                    </button>
                    <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                       <ImageIcon className="w-4 h-4 text-gray-500" /> Gambar
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                       <FileText className="w-4 h-4 text-gray-500" /> File
                    </button>
                  </div>
                )}

               <div className="relative">
                 <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFeatureMenuOpen(!featureMenuOpen)}
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <GripHorizontalIcon className={`w-[22px] h-[22px] transition-transform ${featureMenuOpen ? 'rotate-90' : ''}`} strokeWidth={1.75} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {featureMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-12 left-0 bg-white shadow-xl shadow-black/5 border border-gray-100 rounded-3xl p-3 w-[260px] grid grid-cols-3 gap-2 z-50 origin-bottom-left"
                      >
                         <button onClick={() => { setFeatureMenuOpen(false); setAppMode(appMode === 'generate_image' ? 'chat' : 'generate_image'); }} className={`flex flex-col items-center justify-start gap-2 p-2 rounded-2xl transition-colors group ${appMode === 'generate_image' ? 'bg-blue-100/50' : 'hover:bg-gray-50'}`}>
                           <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-colors ${appMode === 'generate_image' ? 'bg-blue-500 text-white' : 'bg-blue-50/80 text-blue-500 group-hover:bg-blue-100'}`}><Palette className="w-5 h-5"/></div>
                           <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 text-center leading-[1.2]">Buat Gambar</span>
                         </button>
                         <button onClick={() => { setFeatureMenuOpen(false); setAppMode(appMode === 'search_image' ? 'chat' : 'search_image'); }} className={`flex flex-col items-center justify-start gap-2 p-2 rounded-2xl transition-colors group ${appMode === 'search_image' ? 'bg-orange-100/50' : 'hover:bg-gray-50'}`}>
                           <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-colors ${appMode === 'search_image' ? 'bg-orange-500 text-white' : 'bg-orange-50/80 text-orange-500 group-hover:bg-orange-100'}`}><Search className="w-5 h-5"/></div>
                           <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 text-center leading-[1.2]">Cari Gambar</span>
                         </button>
                         <button onClick={() => { setFeatureMenuOpen(false); setAppMode(appMode === 'learn' ? 'chat' : 'learn'); }} className={`flex flex-col items-center justify-start gap-2 p-2 rounded-2xl transition-colors group ${appMode === 'learn' ? 'bg-green-100/50' : 'hover:bg-gray-50'}`}>
                           <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-colors ${appMode === 'learn' ? 'bg-green-500 text-white' : 'bg-green-50/80 text-green-500 group-hover:bg-green-100'}`}><BookOpen className="w-5 h-5"/></div>
                           <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 text-center leading-[1.2]">Terpandu</span>
                         </button>
                         <button onClick={() => { setFeatureMenuOpen(false); setAppMode(appMode === 'slide' ? 'chat' : 'slide'); }} className={`flex flex-col items-center justify-start gap-2 p-2 rounded-2xl transition-colors group ${appMode === 'slide' ? 'bg-purple-100/50' : 'hover:bg-gray-50'}`}>
                           <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-colors ${appMode === 'slide' ? 'bg-purple-500 text-white' : 'bg-purple-50/80 text-purple-500 group-hover:bg-purple-100'}`}><MonitorPlay className="w-5 h-5"/></div>
                           <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 text-center leading-[1.2]">Slide</span>
                         </button>
                         <button onClick={() => { setFeatureMenuOpen(false); setAppMode(appMode === 'sheet' ? 'chat' : 'sheet'); }} className={`flex flex-col items-center justify-start gap-2 p-2 rounded-2xl transition-colors group ${appMode === 'sheet' ? 'bg-emerald-100/50' : 'hover:bg-gray-50'}`}>
                           <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-colors ${appMode === 'sheet' ? 'bg-emerald-500 text-white' : 'bg-emerald-50/80 text-emerald-500 group-hover:bg-emerald-100'}`}><Table className="w-5 h-5"/></div>
                           <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 text-center leading-[1.2]">Sheet</span>
                         </button>
                         <button onClick={() => { setFeatureMenuOpen(false); setAppMode(appMode === 'cv' ? 'chat' : 'cv'); }} className={`flex flex-col items-center justify-start gap-2 p-2 rounded-2xl transition-colors group ${appMode === 'cv' ? 'bg-pink-100/50' : 'hover:bg-gray-50'}`}>
                           <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-colors ${appMode === 'cv' ? 'bg-pink-500 text-white' : 'bg-pink-50/80 text-pink-500 group-hover:bg-pink-100'}`}><Briefcase className="w-5 h-5"/></div>
                           <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 text-center leading-[1.2]">Buat CV</span>
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModelMenuOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 text-sm font-medium"
                >
                  {aiModel === "gemini-2.5-flash" ? t.fast : t.pro}
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.button>
                <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
                <div className="relative flex items-center justify-center w-11 h-11">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isLoading ? (
                      <motion.button 
                        key="stop"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => {
                           if (abortControllerRef.current) {
                             abortControllerRef.current.abort();
                           }
                           setIsLoading(false);
                           setIsSearching(false);
                           setLoadingText("Dibatalkan...");
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-white flex items-center justify-center inset-0"
                      >
                        <Loader2 className="w-[24px] h-[24px] animate-spin absolute" />
                        <Square className="w-2.5 h-2.5 fill-current" />
                      </motion.button>
                    ) : inputValue.trim() || currentAttachments.length > 0 ? (
                      <motion.button 
                        key="send"
                        initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 30 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleSendMessage}
                        disabled={isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-white disabled:opacity-50 flex items-center justify-center inset-0"
                      >
                        <ArrowUpIcon className="w-[22px] h-[22px]" strokeWidth={1.75} />
                      </motion.button>
                    ) : (
                      <motion.button 
                        key="mic"
                        initial={{ opacity: 0, scale: 0.8, rotate: 30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: -30 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 flex items-center justify-center inset-0"
                      >
                        <AudioLinesIcon className="w-[22px] h-[22px]" strokeWidth={1.75} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
     </div>

     {/* Profile Overlay */}
     <AnimatePresence>
       {showProfile && user && (
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           transition={{ duration: 0.2 }}
           className="fixed inset-0 z-[110] bg-white flex flex-col font-sans"
         >
           <header className="flex items-center px-4 py-4 border-b border-gray-100 shrink-0 bg-white relative justify-center">
             <button onClick={() => setShowProfile(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 absolute left-4 z-10">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
             </button>
             <div className="flex gap-6 text-sm sm:text-base font-semibold cursor-pointer select-none">
               <div 
                 className={`py-1 border-b-2 transition-colors ${profileTab === 'profile' ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                 onClick={() => setProfileTab('profile')}
               >
                 {t.myProfile}
               </div>
               <div 
                 className={`py-1 border-b-2 transition-colors ${profileTab === 'settings' ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                 onClick={() => setProfileTab('settings')}
               >
                 {t.settings}
               </div>
             </div>
           </header>
           <div className="flex-1 overflow-hidden relative bg-[#f4f7fb]">
             <div 
               className="flex w-[200%] h-full transition-transform duration-300 ease-in-out" 
               style={{ transform: `translateX(${profileTab === 'profile' ? '0' : '-50%'})` }}
             >
               {/* Profile Tab */}
               <div className="w-1/2 h-full overflow-y-auto pb-20">
                 <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
               <div className="flex flex-col items-center mb-10 mt-2">
                 <div className={`relative group mb-5 rounded-full ${user.email === 'cipaonly08@gmail.com' ? 'p-1' : ''}`}>
                   {user.email === 'cipaonly08@gmail.com' && (
                     <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 via-pink-500 to-orange-500 animate-[spin_3s_linear_infinite]" />
                   )}
                   <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden ${user.email === 'cipaonly08@gmail.com' ? 'border-[4px] border-white' : 'border-4 border-white shadow-md'} relative transition-transform group-hover:scale-[1.02] z-10 bg-white`}>
                     {displayPhotoURL ? (
                        <img src={displayPhotoURL} className="w-full h-full object-cover" />
                     ) : (
                        <Bot className="w-full h-full text-gray-400 p-8 bg-white" />
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-8 h-8 text-white" />
                     </div>
                   </div>
                   <input type="file" accept="image/*" onChange={handleProfileUpload} className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-pointer" />
                 </div>
                 {isEditingName ? (
                   <div className="flex flex-col items-center gap-2 w-full mt-2">
                     <input
                       type="text"
                       value={editNameValue}
                       onChange={(e) => setEditNameValue(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') handleSaveName();
                         if (e.key === 'Escape') setIsEditingName(false);
                       }}
                       autoFocus
                       className="text-center px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 w-full max-w-[200px]"
                     />
                     <div className="flex items-center gap-2">
                       <button onClick={handleSaveName} className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium">Simpan</button>
                       <button onClick={() => setIsEditingName(false)} className="text-sm bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-300 font-medium">Batal</button>
                     </div>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center group/name cursor-pointer mt-1 relative" onClick={() => { setEditNameValue(displayDisplayName); setIsEditingName(true); }}>
                     <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{displayDisplayName}</h3>
                     <div className="opacity-0 group-hover/name:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 absolute -right-10">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                     </div>
                   </div>
                 )}
                 <p className="text-sm sm:text-base text-gray-500 mt-1.5 font-medium tracking-wide">{t.dearUser}</p>
                 
                 {isEditingBio ? (
                   <div className="flex flex-col items-center gap-2 w-full mt-4">
                     <textarea
                       value={editBioValue}
                       onChange={(e) => setEditBioValue(e.target.value)}
                       className="w-full max-w-[300px] text-center px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 resize-none h-20"
                       placeholder={language === 'en' ? 'Write a short bio...' : 'Tulis bio singkat...'}
                       autoFocus
                     />
                     <div className="flex items-center gap-2">
                       <button onClick={handleSaveBio} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium">{language === 'en' ? 'Save' : 'Simpan'}</button>
                       <button onClick={() => setIsEditingBio(false)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 font-medium">{language === 'en' ? 'Cancel' : 'Batal'}</button>
                     </div>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center group/bio cursor-pointer mt-3 relative max-w-[300px] text-center" onClick={() => { setEditBioValue(userBio || ''); setIsEditingBio(true); }}>
                     <p className={`text-sm ${userBio ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                       {userBio || (language === 'en' ? 'Add a short bio...' : 'Tambahkan bio singkat...')}
                     </p>
                     <div className="opacity-0 group-hover/bio:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 absolute -right-8 top-1/2 -translate-y-1/2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                     </div>
                   </div>
                 )}
               </div>

               {/* Activity Stats */}
               <div className="grid grid-cols-2 gap-4 mb-6 sm:mb-8">
                 <div className="bg-white border border-gray-100/80 rounded-[2rem] p-5 shadow-sm flex flex-col items-center justify-center text-center">
                   <MessageSquare className="w-6 h-6 text-blue-500 mb-2" />
                   <span className="text-2xl font-bold text-gray-800">{chats.length}</span>
                   <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{language === 'en' ? 'Total Chats' : 'Total Obrolan'}</span>
                 </div>
                 <div className="bg-white border border-gray-100/80 rounded-[2rem] p-5 shadow-sm flex flex-col items-center justify-center text-center">
                   <Sparkles className="w-6 h-6 text-amber-500 mb-2" />
                   <span className="text-2xl font-bold text-gray-800">{userCredits}</span>
                   <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{language === 'en' ? 'Credits Left' : 'Kredit Tersisa'}</span>
                 </div>
               </div>

               {/* Premium/Free Card */}
               {user.email === 'cipaonly08@gmail.com' ? (
                 <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-[2rem] p-6 sm:p-8 shadow-xl mb-6 sm:mb-8 text-white relative overflow-hidden">
                   <div className="absolute -top-6 -right-6 p-4 opacity-10 rotate-12">
                     <Crown className="w-48 h-48" />
                   </div>
                   <div className="relative z-10">
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 transition-colors rounded-full text-xs font-semibold tracking-wide uppercase mb-6 sm:mb-8 backdrop-blur-sm cursor-default">
                       <Crown className="w-3.5 h-3.5" /> {t.premiumAccess}
                     </div>
                     
                     <div className="grid grid-cols-2 gap-6 sm:gap-8">
                       <div>
                         <div className="text-indigo-100 text-sm font-medium mb-1">{t.currentCredit}</div>
                         <div className="text-4xl sm:text-5xl font-bold tracking-tight">999</div>
                         <div className="text-indigo-200/80 text-[11px] sm:text-xs mt-1.5 uppercase tracking-wider font-semibold">{t.freeCredit}: 999</div>
                       </div>
                       <div>
                         <div className="text-indigo-100 text-sm font-medium mb-1">{t.dailyCredit}</div>
                         <div className="text-4xl sm:text-5xl font-bold tracking-tight">300</div>
                         <div className="text-indigo-200/80 text-[11px] sm:text-xs mt-1.5 leading-snug pr-2">{t.resetCreditInfo}</div>
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl mb-6 sm:mb-8 text-white relative overflow-hidden">
                   <div className="absolute -top-6 -right-6 p-4 opacity-5 rotate-12">
                     <Bot className="w-48 h-48" />
                   </div>
                   <div className="relative z-10">
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-xs font-semibold tracking-wide uppercase mb-6 sm:mb-8 backdrop-blur-sm cursor-default">
                       <Bot className="w-3.5 h-3.5" /> {t.freeAccess}
                     </div>
                     
                     <div className="grid grid-cols-2 gap-6 sm:gap-8">
                       <div>
                         <div className="text-slate-300 text-sm font-medium mb-1">{t.currentCredit}</div>
                         <div className="text-4xl sm:text-5xl font-bold tracking-tight">{userCredits}</div>
                         <div className="text-slate-400 text-[11px] sm:text-xs mt-1.5 uppercase tracking-wider font-semibold opacity-70">{t.freeCredit}: {userFreeCredits}</div>
                       </div>
                       <div>
                         <div className="text-slate-300 text-sm font-medium mb-1">{t.dailyCredit}</div>
                         <div className="text-4xl sm:text-5xl font-bold tracking-tight">0</div>
                         <div className="text-slate-400 text-[11px] sm:text-xs mt-1.5 leading-snug pr-2 opacity-70">{t.upgradePremiumInfo}</div>
                       </div>
                     </div>
                   </div>
                 </div>
               )}

               {/* Persona Details */}
               <div className="bg-white border border-gray-100/80 rounded-[2rem] p-6 sm:p-8 shadow-sm mb-6 sm:mb-8">
                 <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5">{t.personaDetails}</h4>
                 <div className="space-y-4 sm:space-y-5">
                   <div>
                     <label className="text-xs text-gray-500 font-medium ml-1">Email</label>
                     <div className="mt-1.5 px-4 py-3.5 bg-gray-50/80 rounded-2xl text-gray-800 font-medium text-sm border border-gray-100/50">
                       {user.email}
                     </div>
                   </div>
                   <div>
                     <label className="text-xs text-gray-500 font-medium ml-1">User ID</label>
                     <div className="mt-1.5 flex items-center justify-between px-4 py-3 bg-gray-50/80 rounded-2xl border border-gray-100/50 group">
                       <span className="text-gray-700 font-mono text-sm truncate mr-4">{user.uid}</span>
                       <button onClick={() => {
                         navigator.clipboard.writeText(user.uid);
                       }} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm opacity-60 hover:opacity-100 text-gray-500">
                         <Copy className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Manage Account */}
               <div className="bg-white border border-gray-100/80 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                 <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5">{t.manageAccount}</h4>
                 <div className="space-y-3 sm:space-y-4">
                   <button onClick={() => { signOut(auth); setShowProfile(false); }} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-orange-50 hover:border-orange-100 active:scale-[0.98] transition-all group text-left">
                     <div className="p-3 bg-orange-100/80 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                       <LogOut className="w-5 h-5" />
                     </div>
                     <div>
                       <div className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors text-sm sm:text-base">{t.logoutTitle}</div>
                       <div className="text-xs text-gray-500 mt-0.5">{t.logoutDesc}</div>
                     </div>
                   </button>

                   <button className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-red-50 hover:border-red-100 active:scale-[0.98] transition-all group text-left">
                     <div className="p-3 bg-red-100/80 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                       <Trash2 className="w-5 h-5" />
                     </div>
                     <div>
                       <div className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors text-sm sm:text-base">{t.deleteAccountTitle}</div>
                       <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.deleteAccountDesc}</div>
                     </div>
                   </button>
                 </div>
               </div>

              </div>
            </div>

              {/* Settings Tab */}
              <div className="w-1/2 h-full overflow-y-auto pb-20 relative">
                <AnimatePresence mode="wait">
                  {activeSettingsPage === 'main' && (
                    <motion.div 
                      key="main"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
                    >
                      <div className="bg-white border border-gray-100/80 rounded-[2rem] p-6 sm:p-8 shadow-sm mb-6 sm:mb-8">
                         <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5">
                           <Globe className="w-4 h-4" /> {t.languageTitle}
                         </h4>
                         <div className="flex flex-col gap-3 mb-8">
                           <div className="text-sm text-gray-500 mb-2">{t.languageDesc}</div>
                           <button 
                             onClick={() => setLanguage('id')} 
                             className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${language === 'id' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:bg-gray-50'}`}
                           >
                             <div className="flex items-center gap-3">
                               <Globe className={`w-5 h-5 ${language === 'id' ? 'text-blue-500' : 'text-gray-400'}`} />
                               <span className={`font-semibold ${language === 'id' ? 'text-blue-700' : 'text-gray-800'}`}>Indonesia</span>
                             </div>
                             {language === 'id' && <Check className="w-5 h-5 text-blue-600" />}
                           </button>
                           <button 
                             onClick={() => setLanguage('en')} 
                             className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${language === 'en' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:bg-gray-50'}`}
                           >
                             <div className="flex items-center gap-3">
                               <Globe className={`w-5 h-5 ${language === 'en' ? 'text-blue-500' : 'text-gray-400'}`} />
                               <span className={`font-semibold ${language === 'en' ? 'text-blue-700' : 'text-gray-800'}`}>English</span>
                             </div>
                             {language === 'en' && <Check className="w-5 h-5 text-blue-600" />}
                           </button>
                         </div>

                         <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5 mt-8">
                           <SlidersHorizontal className="w-4 h-4" /> {(t as any).personalizationTitle}
                         </h4>
                         <div className="flex flex-col gap-3 mb-8">
                            <div className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 mt-2">
                              <div className="flex flex-col gap-1 mb-4 select-none">
                                <span className="font-semibold text-gray-800">{(t as any).customInstructionsTitle}</span>
                                <span className="text-sm text-gray-500">{(t as any).customInstructionsDesc}</span>
                              </div>
                              <textarea
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder={(t as any).customInstructionsPlaceholder}
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                            </div>
                         </div>

                         <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5 mt-8">
                           <Sparkles className="w-4 h-4" /> {(t as any).notificationsTitle}
                         </h4>
                         <div className="flex flex-col gap-3 mb-8">
                            <div 
                              onClick={() => setSoundEnabled(!soundEnabled)}
                              className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex flex-col gap-1 select-none">
                                <span className="font-semibold text-gray-800">{(t as any).soundTitle}</span>
                                <span className="text-sm text-gray-500">{(t as any).soundDesc}</span>
                              </div>
                              <div className={`w-14 h-7 rounded-full flex items-center p-1 transition-colors duration-300 ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${soundEnabled ? 'translate-x-[26px]' : 'translate-x-0'}`}></div>
                              </div>
                            </div>
                            <div 
                              onClick={() => setHapticsEnabled(!hapticsEnabled)}
                              className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors mt-2"
                            >
                              <div className="flex flex-col gap-1 select-none">
                                <span className="font-semibold text-gray-800">{(t as any).hapticsTitle}</span>
                                <span className="text-sm text-gray-500">{(t as any).hapticsDesc}</span>
                              </div>
                              <div className={`w-14 h-7 rounded-full flex items-center p-1 transition-colors duration-300 ${hapticsEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${hapticsEnabled ? 'translate-x-[26px]' : 'translate-x-0'}`}></div>
                              </div>
                            </div>
                         </div>

                         <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5">
                           <Layers className="w-4 h-4" /> {language === 'en' ? 'Data & Storage' : 'Data & Penyimpanan'}
                         </h4>
                         <div className="flex flex-col gap-3 mb-8">
                            <div className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 mt-2">
                              <div className="flex flex-col gap-1 mb-4 select-none">
                                <span className="font-semibold text-gray-800">{(t as any).exportFormatTitle}</span>
                                <span className="text-sm text-gray-500">{(t as any).exportFormatDesc}</span>
                              </div>
                              <div className="flex bg-gray-200/60 p-1.5 rounded-xl text-sm font-medium">
                                <button 
                                  onClick={() => setExportFormat('json')}
                                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${exportFormat === 'json' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                  JSON
                                </button>
                                <button 
                                  onClick={() => setExportFormat('txt')}
                                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${exportFormat === 'txt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                  TXT
                                </button>
                                <button 
                                  onClick={() => setExportFormat('md')}
                                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${exportFormat === 'md' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                  Markdown
                                </button>
                              </div>
                            </div>

                            <button onClick={handleExportData} className="w-full text-left flex items-center gap-4 hover:bg-gray-50 p-4 rounded-2xl transition-colors border border-gray-100 group">
                              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Download className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{t.exportDataTitle}</div>
                                <div className="text-[13px] text-gray-500 mt-0.5">{t.exportDataDesc}</div>
                              </div>
                            </button>
                            <button onClick={confirmClearAllHistory} disabled={isClearingHistory} className="w-full text-left flex items-center gap-4 hover:bg-red-50 p-4 rounded-2xl transition-colors border border-gray-100 group disabled:opacity-50 disabled:cursor-not-allowed">
                              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                                {isClearingHistory ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors">{t.clearHistoryTitle}</div>
                                <div className="text-[13px] text-gray-500 mt-0.5">{t.clearHistoryDesc}</div>
                              </div>
                            </button>
                         </div>

                         <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5">
                           <Info className="w-4 h-4" /> {language === 'en' ? 'Information & Help' : 'Tentang & Bantuan'}
                         </h4>
                         <div className="flex flex-col gap-3 mb-8">
                            <button onClick={() => setActiveSettingsPage('about')} className="w-full text-left flex flex-col gap-1 hover:bg-gray-50 p-4 rounded-2xl transition-colors border border-gray-100 group">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{t.aboutTitle}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-500">{t.aboutDesc}</span>
                            </button>
                            <button onClick={() => setActiveSettingsPage('privacy')} className="w-full text-left flex flex-col gap-1 hover:bg-gray-50 p-4 rounded-2xl transition-colors border border-gray-100 group">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{t.privacyTitle}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-500">{t.privacyDesc}</span>
                            </button>
                            <button onClick={() => setActiveSettingsPage('help')} className="w-full text-left flex flex-col gap-1 hover:bg-gray-50 p-4 rounded-2xl transition-colors border border-gray-100 group">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{t.helpTitle}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-500">{t.helpDesc}</span>
                            </button>
                         </div>

                         <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5">
                           <Layers className="w-4 h-4" /> {(t as any).themeTitle || "Tema Tampilan"}
                         </h4>
                         <div className="flex flex-col gap-3 mb-8">
                            <div 
                              onClick={toggleTheme}
                              className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex flex-col gap-1 select-none">
                                <span className="font-semibold text-gray-800">{language === 'en' ? 'Dark Mode' : 'Mode Gelap'}</span>
                                <span className="text-sm text-gray-500">{(t as any).themeDesc}</span>
                              </div>
                              <div className={`w-14 h-7 rounded-full flex items-center p-1 transition-colors duration-300 ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-[26px]' : 'translate-x-0'}`}></div>
                              </div>
                            </div>

                            <div className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 mt-2">
                              <div className="flex flex-col gap-1 mb-4 select-none">
                                <span className="font-semibold text-gray-800">{(t as any).textSizeTitle}</span>
                                <span className="text-sm text-gray-500">{(t as any).textSizeDesc}</span>
                              </div>
                              <div className="flex bg-gray-200/60 p-1.5 rounded-xl text-sm font-medium">
                                <button 
                                  onClick={() => setTextSize('small')}
                                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${textSize === 'small' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                  {(t as any).textSizeSmall}
                                </button>
                                <button 
                                  onClick={() => setTextSize('normal')}
                                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${textSize === 'normal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                  {(t as any).textSizeNormal}
                                </button>
                                <button 
                                  onClick={() => setTextSize('large')}
                                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${textSize === 'large' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                  {(t as any).textSizeLarge}
                                </button>
                              </div>
                            </div>
                         </div>

                         <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-5 mt-8">
                           <SlidersHorizontal className="w-4 h-4" /> {language === 'en' ? 'Default Preferences' : 'Preferensi Default'}
                         </h4>
                         <div className="flex flex-col gap-3 mb-8">
                            <div className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50">
                              <div className="flex items-center gap-3 mb-4 select-none">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                  <Bot className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-gray-800 text-sm">{(t as any).defaultModelTitle}</span>
                                  <span className="text-[13px] text-gray-500 max-w-[200px] leading-tight">{(t as any).defaultModelDesc}</span>
                                </div>
                              </div>
                              <div className="flex bg-gray-200/60 p-1.5 rounded-xl text-sm font-medium">
                                <button 
                                  onClick={() => setAiModel('gemini-2.5-flash')}
                                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${aiModel === 'gemini-2.5-flash' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                  SuperAI-Fast
                                </button>
                                <button 
                                  onClick={() => setAiModel('gemini-2.5-pro')}
                                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${aiModel === 'gemini-2.5-pro' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                  SuperAI-V5
                                </button>
                              </div>
                            </div>
                            <div className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 mt-2">
                              <div className="flex items-center gap-3 mb-4 select-none">
                                <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                                  <LayoutTemplate className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-gray-800 text-sm">{(t as any).defaultModeTitle}</span>
                                  <span className="text-[13px] text-gray-500 max-w-[200px] leading-tight">{(t as any).defaultModeDesc}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                                {/* Using available app modes */}
                                {[
                                  { id: 'chat', label: 'Chat' },
                                  { id: 'generate_image', label: language === 'en' ? 'Generate Image' : 'Buat Gambar' },
                                  { id: 'search_image', label: language === 'en' ? 'Search Image' : 'Cari Gambar' },
                                  { id: 'learn', label: language === 'en' ? 'Learn' : 'Belajar' },
                                  { id: 'slide', label: 'Slide' },
                                  { id: 'sheet', label: 'Sheet' },
                                  { id: 'cv', label: 'CV' }
                                ].map((mode) => (
                                  <button 
                                    key={mode.id}
                                    onClick={() => setAppMode(mode.id as any)}
                                    className={`py-2 px-3 rounded-lg border transition-all text-left flex justify-between items-center ${appMode === mode.id ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                                  >
                                    <span className="capitalize">{mode.label}</span>
                                    {appMode === mode.id && <Check className="w-4 h-4 text-blue-600" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                         </div>
                         
                         <div className="pt-6 border-t border-gray-100 flex flex-col items-center justify-center gap-2">
                            <span className="text-sm text-gray-400 font-medium tracking-wide">{(t as any).appVersion || "App Version"} 1.2.0</span>
                            <span className="text-xs text-gray-300">© 2026 SuperRinz | SuperAI Inc.</span>
                         </div>
                      </div>
                    </motion.div>
                  )}
                  {activeSettingsPage !== 'main' && (
                    <motion.div 
                      key="subpage"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
                    >
                      <button 
                        onClick={() => setActiveSettingsPage('main')} 
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> {language === 'en' ? 'Back' : 'Kembali'}
                      </button>
                      
                      <div className="bg-white border border-gray-100/80 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                         <h2 className="text-2xl font-bold text-gray-800 mb-6">
                           {activeSettingsPage === 'about' ? t.aboutTitle : activeSettingsPage === 'privacy' ? t.privacyTitle : t.helpTitle}
                         </h2>
                         <div className="markdown-body text-gray-700 whitespace-pre-wrap leading-relaxed">
                           <Markdown remarkPlugins={[remarkGfm]}>
                             {activeSettingsPage === 'about' ? t.aboutContent : activeSettingsPage === 'privacy' ? t.privacyContent : t.helpContent}
                           </Markdown>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

             </div>
           </div>
         </motion.div>
       )}
     </AnimatePresence>

     {/* Model Selection Bottom Sheet */}
     <AnimatePresence>
       {modelMenuOpen && (
         <>
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setModelMenuOpen(false)}
             className="fixed inset-0 bg-black/30 z-[100]"
           />
           <motion.div
             initial={{ opacity: 0, y: "100%" }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: "100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 w-full sm:w-[400px] bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-xl z-[101] overflow-hidden flex flex-col"
           >
             <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
               <h3 className="font-semibold px-2 text-gray-800">Model SuperAI-V5</h3>
               <button onClick={() => setModelMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                 <X size={20} />
               </button>
             </div>
             <div className="p-3 space-y-2 mb-2">
                <button 
                  onClick={() => { setAiModel("gemini-2.5-flash"); setModelMenuOpen(false); }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${aiModel === "gemini-2.5-flash" ? "bg-blue-50/50 border-blue-200" : "bg-white border-transparent hover:bg-gray-50"} relative`}
                >
                   <div className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-full ${aiModel === "gemini-2.5-flash" ? "bg-blue-100/50 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                        <Sparkles size={20} />
                     </div>
                     <div className="flex-1">
                       <div className={`font-semibold text-[15px] flex items-center gap-2 ${aiModel === "gemini-2.5-flash" ? "text-blue-700" : "text-gray-800"}`}>
                         {t.fast}
                       </div>
                       <div className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">{t.modelStandardDesc}</div>
                     </div>
                   </div>
                </button>
                <button 
                  onClick={() => { setAiModel("gemini-2.5-pro"); setModelMenuOpen(false); }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${aiModel === "gemini-2.5-pro" ? "bg-blue-50/50 border-blue-200" : "bg-white border-transparent hover:bg-gray-50"} relative`}
                >
                   <div className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-full ${aiModel === "gemini-2.5-pro" ? "bg-blue-100/50 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                        <Bot size={20} />
                     </div>
                     <div className="flex-1">
                       <div className={`font-semibold text-[15px] flex items-center gap-2 ${aiModel === "gemini-2.5-pro" ? "text-blue-700" : "text-gray-800"}`}>
                         {t.pro} <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                       </div>
                       <div className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">{t.modelProDesc}</div>
                     </div>
                   </div>
                </button>
             </div>
           </motion.div>
         </>
       )}
     </AnimatePresence>

      {/* Slide Preview Overlay */}
      <AnimatePresence>
        {slidePreviewData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-gray-100 z-[200] flex flex-col overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between border-b border-gray-200/50 z-50 shadow-sm print:hidden">
              <div className="flex flex-col">
                <h2 className="font-bold text-lg sm:text-xl text-gray-800 line-clamp-1">{slidePreviewData.title || "Presentasi Anda"}</h2>
                <span className="text-[13px] font-medium text-gray-500">{slidePreviewData.slides?.length || 0} Slide</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => handleDownloadPdf()} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-md shadow-purple-600/20 text-sm">
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export PDF</span>
                </button>
                <button onClick={() => handleDownloadPptx()} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-md shadow-orange-500/20 text-sm">
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export PPTX</span>
                </button>
                <button onClick={() => setSlidePreviewData(null)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 text-gray-600 rounded-full transition-colors flex-shrink-0 bg-gray-100">
                  <X className="w-5 h-5"/>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-10 pb-32 flex flex-col items-center gap-10 sm:gap-16 w-full" id="slide-print-area">
              <style>
                {`
                  @media print {
                    @page { size: 1920px 1080px landscape !important; margin: 0 !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; margin: 0; padding: 0; }
                    body * { visibility: hidden; }
                    #slide-print-area, #slide-print-area * { visibility: visible; }
                    #slide-print-area { position: absolute; left: 0; top: 0; width: 100vw; background: white; padding: 0 !important; gap: 0 !important; margin: 0 !important; }
                    .slide-page { 
                       width: 1920px !important; 
                       height: 1080px !important; 
                       max-width: none !important; 
                       max-height: none !important; 
                       border: none !important; 
                       border-radius: 0 !important; 
                       box-shadow: none !important; 
                       page-break-after: always; 
                       page-break-inside: avoid;
                       display: flex !important; 
                       margin: 0 !important; 
                       padding: 0 !important;
                       transform: scale(1) !important;
                    }
                  }
                `}
              </style>
              
              {/* Title Slide */}
              <div className="slide-page w-full max-w-[1100px] aspect-video bg-white sm:rounded-3xl shadow-xl overflow-hidden flex flex-col items-center justify-center p-12 sm:p-24 relative outline outline-1 outline-gray-200/50 print:outline-none print:shadow-none mx-auto shrink-0 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-50 via-white to-pink-50 opacity-60"></div>
                <h1 className="text-5xl sm:text-[5rem] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600 text-center leading-[1.1] mb-8 relative z-10 tracking-tight">{slidePreviewData.title}</h1>
                <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative z-10 mb-8"></div>
                <p className="text-xl sm:text-2xl text-gray-500 font-medium relative z-10 text-center tracking-wide">Dibuat oleh AI SuperAI</p>
              </div>

              {/* Content Slides */}
              {slidePreviewData.slides?.map((slide: any, idx: number) => (
                <div key={idx} className="slide-page w-full max-w-[1100px] aspect-video bg-white sm:rounded-3xl shadow-xl overflow-hidden flex flex-col sm:flex-row relative outline outline-1 outline-gray-200/50 print:outline-none print:shadow-none mx-auto shrink-0">
                  <div className="flex-1 p-8 sm:p-16 flex flex-col justify-start">
                    <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 leading-tight mb-8 sm:mb-12 relative inline-block self-start">
                       {slide.title}
                       <div className="absolute -bottom-4 left-0 w-16 h-1.5 bg-purple-500 rounded-full"></div>
                    </h2>
                    <ul className="space-y-5 sm:space-y-8 flex-1 flex flex-col justify-center mb-6">
                       {slide.content?.map((point: string, i: number) => (
                         <li key={i} className="flex items-start gap-4 sm:gap-5 text-lg sm:text-[1.65rem] text-gray-600 leading-[1.4] font-medium">
                           <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shrink-0 mt-[0.6rem] shadow-sm" />
                           <span className="flex-1">{point}</span>
                         </li>
                       ))}
                    </ul>
                    <div className="text-gray-400 font-bold font-mono tracking-widest uppercase text-xs sm:text-sm mt-auto select-none pt-6 border-t border-gray-100 flex items-center justify-between">
                      <span>SuperAI</span>
                      <span>{idx + 1}</span>
                    </div>
                  </div>
                  {slide.imagePrompt && (
                    <div className="w-full sm:w-[45%] h-64 sm:h-auto shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                       <img 
                         src={`https://image.pollinations.ai/prompt/${encodeURIComponent(slide.imagePrompt)}?width=800&height=1200&nologo=true`} 
                         alt={slide.imagePrompt} 
                         className="w-full h-full object-cover" 
                         referrerPolicy="no-referrer"
                         crossOrigin="anonymous"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                       <div className="absolute bottom-4 right-5 sm:bottom-6 sm:right-6 bg-black/40 backdrop-blur-md text-white/90 text-[11px] px-3 py-1.5 rounded-full font-medium tracking-wide border border-white/10 shadow-lg">AI Generated</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={`backdrop-blur-xl border shadow-2xl rounded-[32px] p-6 w-full max-w-sm flex flex-col items-center text-center ${isDarkMode ? 'bg-slate-900/80 border-white/10 text-white' : 'bg-white/80 border-white/40 text-gray-900'}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <Trash2 className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">{(t as any).clearHistoryTitle || 'Hapus Semua Riwayat'}</h3>
              <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {t.confirmClear}
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleClearAllHistory}
                  disabled={isClearingHistory}
                  className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold tracking-wide transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isClearingHistory ? <Loader2 className="w-5 h-5 animate-spin" /> : (t as any).clearHistoryTitle || 'Hapus Semua Riwayat'}
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isClearingHistory}
                  className={`w-full py-3.5 rounded-2xl font-bold tracking-wide transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200/60 hover:bg-gray-300/60 text-gray-800'}`}
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={`backdrop-blur-xl border shadow-2xl rounded-[32px] p-8 w-full max-w-sm flex flex-col items-center text-center ${isDarkMode ? 'bg-slate-900/80 border-white/10 text-white' : 'bg-white/80 border-white/40 text-gray-900'}`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${isDarkMode ? 'bg-green-500/20 shadow-green-500/10' : 'bg-green-100 shadow-green-200'}`}>
                <Check className={`w-10 h-10 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Berhasil</h3>
              <p className={`text-base mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {t.clearSuccess}
              </p>
              
              <button
                onClick={() => setShowClearSuccess(false)}
                className="w-full py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold tracking-wide transition-colors"
              >
                Selesai
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[10px]"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`backdrop-blur-2xl border shadow-2xl rounded-[32px] w-full max-w-md h-[80vh] flex flex-col overflow-hidden relative ${isDarkMode ? 'bg-slate-900/60 border-white/10 text-white' : 'bg-white/60 border-white/40 text-gray-900'}`}
            >
              <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                <h3 className="text-xl font-bold tracking-tight">Notifikasi</h3>
                <button onClick={() => setShowNotifications(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-500/10 flex items-center justify-center">
                      <Bell className="w-8 h-8" />
                    </div>
                    <p className="font-medium text-lg mb-1">Belum Ada Notifikasi</p>
                    <p className="text-sm">Notifikasi sistem akan muncul di sini.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 rounded-2xl border flex flex-col gap-3 transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-black/5 hover:bg-white/60 shadow-sm'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <img src={notif.creatorPhoto || '/default-avatar.png'} alt="Admin" className="w-8 h-8 rounded-full border border-gray-200/20 object-cover" />
                           <span className={`text-sm font-semibold tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{notif.creatorName || "Tim SuperAI"}</span>
                        </div>
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-50 px-2 py-1 rounded bg-black/5">
                          {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : 'Baru'}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-base mb-1">{notif.title}</h4>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notif.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {user?.email === 'cipaonly08@gmail.com' && (
                <div className={`p-5 border-t backdrop-blur-md pb-6 ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white/40 border-black/5'}`}>
                  {isCreatingNotification ? (
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="Judul Fitur/Notifikasi" 
                        value={newNotifTitle} 
                        onChange={e => setNewNotifTitle(e.target.value)}
                        className={`w-full p-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-gray-400' : 'bg-white/50 border-black/10 text-gray-900 placeholder-gray-500'}`}
                      />
                      <textarea
                         placeholder="Deskripsi..."
                         value={newNotifDesc}
                         onChange={e => setNewNotifDesc(e.target.value)}
                         className={`w-full p-3 rounded-xl border text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-gray-400' : 'bg-white/50 border-black/10 text-gray-900 placeholder-gray-500'}`}
                      ></textarea>
                      <div className="flex gap-2">
                        <button onClick={handleCreateNotification} className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all text-sm">Kirim</button>
                        <button onClick={() => setIsCreatingNotification(false)} className={`flex-1 font-semibold py-2.5 rounded-xl border hover:opacity-80 active:scale-95 transition-all text-sm ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/50 border-black/10 text-gray-900'}`}>Batal</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setIsCreatingNotification(true)} className={`w-full font-bold py-3 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 text-sm ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-black/5 hover:bg-gray-50 text-gray-800 shadow-sm'}`}>
                      <Plus className="w-4 h-4" /> Buat Notifikasi (Admin)
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

     </div>
    </div>
  );
}
