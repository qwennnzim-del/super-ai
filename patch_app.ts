import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new imports
const importTarget = `import { GoogleGenAI } from "@google/genai";
import { Plus, Sparkles, Mic, ChevronDown, Menu, Frame, SquareArrowUpRight, Bot, Check, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";`;

const importReplacement = `import { GoogleGenAI } from "@google/genai";
import { Plus, Sparkles, Mic, ChevronDown, Menu, Frame, SquareArrowUpRight, Bot, Check, Copy, MessageSquare, Trash2, LogOut, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, setDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from "motion/react";`;

content = content.replace(importTarget, importReplacement);

// 2. Add Chat type and adjust Message type
const typeTarget = `type Message = {
  id: string;
  role: "user" | "model";
  text: string;
};`;

const typeReplacement = `type Message = {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  createdAt?: any;
};

type Chat = {
  id: string;
  title: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
};`;

content = content.replace(typeTarget, typeReplacement);

// 3. Update App State and useEffects (from export default function App to handleSendMessage)
const stateTargetRegex = /export default function App\(\) \{[\s\S]*?const handleInput = \(e: React.ChangeEvent<HTMLTextAreaElement>\) => \{[\s\S]*? \};/m;

const stateReplacement = `export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auth & Chat State
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    const q = query(collection(db, "chats"), where("userId", "==", user.uid), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Chat));
      setChats(chatList);
      if (chatList.length > 0 && !currentChatId) {
        // optionally auto select first chat, but we leave it empty for a new chat
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, "chats"));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!currentChatId || !user) {
      if (!currentChatId) setMessages([]);
      return;
    }
    const q = query(collection(db, \`chats/\${currentChatId}/messages\`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Message));
      setMessages(msgList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, \`chats/\${currentChatId}/messages\`));
    return () => unsubscribe();
  }, [currentChatId, user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
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
       handleFirestoreError(error, OperationType.DELETE, \`chats/\${id}\`);
    }
  };

  // Handle auto-resizing of textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = \`\${Math.min(textareaRef.current.scrollHeight, 120)}px\`;
    }
  };`;

content = content.replace(stateTargetRegex, stateReplacement);

// 4. Update handleSendMessage to handle Firestore logic
const sendTargetRegex = /const handleSendMessage = async \(\) => \{[\s\S]*?const handleKeyDown = /m;

const sendReplacement = `const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    if (!user) {
      handleLogin();
      return;
    }

    const newMessageText = inputValue.trim();
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    let chatId = currentChatId;
    
    try {
      if (!chatId) {
        // Create new chat
        const newChatRef = doc(collection(db, "chats"));
        chatId = newChatRef.id;
        await setDoc(newChatRef, {
          title: newMessageText.substring(0, 40) + (newMessageText.length > 40 ? "..." : ""),
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setCurrentChatId(chatId);
      } else {
        await setDoc(doc(db, "chats", chatId), { updatedAt: serverTimestamp() }, { merge: true });
      }

      // Optimistic update locally? Since snapshot listener handles updates, we don't strictly need it.
      // But we will save to firestore directly.
      const userMsgRef = doc(collection(db, \`chats/\${chatId}/messages\`));
      await setDoc(userMsgRef, {
        chatId: chatId,
        userId: user.uid,
        role: "user",
        text: newMessageText,
        createdAt: serverTimestamp()
      });

      // Build chat history for API
      const contents = messages.map(m => ({
        role: m.role === "system" ? "user" : m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: "user", parts: [{ text: newMessageText }] });

      const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        systemInstruction: "You are SuperAI, an intelligent and helpful AI assistant.",
        contents: contents,
      });

      let fullResponse = "";
      
      const modelMsgRef = doc(collection(db, \`chats/\${chatId}/messages\`));
      // Save placeholder first so snapshot adds it.
      await setDoc(modelMsgRef, {
        chatId: chatId,
        userId: user.uid,
        role: "model",
        text: "",
        createdAt: serverTimestamp()
      });

      for await (const chunk of response) {
        const textToAppend = chunk.text;
        fullResponse += textToAppend;
      }
      
      await setDoc(modelMsgRef, {
          text: fullResponse,
          updatedAt: serverTimestamp() 
      }, { merge: true });

    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = `;

content = content.replace(sendTargetRegex, sendReplacement);

// 5. Build Header and Sidebar JSX
const uiHeaderRegex = /<div className="flex flex-col h-\[100dvh\][\s\S]*?<main className="flex-1 overflow-y-auto/m;

const uiHeaderReplacement = `
   <div className="flex flex-col h-[100dvh] bg-[#f4f7fb] text-gray-900 font-sans relative overflow-hidden">
      
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
          <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-200/60 shrink-0">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Riwayat Chat</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200/50 text-gray-500">
               <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
             {chats.map(chat => (
                <div 
                  key={chat.id} 
                  onClick={() => { setCurrentChatId(chat.id); setIsSidebarOpen(false); }}
                  className={\`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group transition-colors \${currentChatId === chat.id ? 'bg-slate-200/60 font-medium' : 'hover:bg-slate-200/40'}\`}
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
             {chats.length === 0 && <div className="text-center text-sm text-gray-400 pt-8">Belum ada riwayat</div>}
          </div>
          <div className="p-4 border-t border-slate-200/60 shrink-0 space-y-2">
            {!user ? (
               <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition">
                 Login Akun
               </button>
            ) : (
               <>
                 <div className="flex items-center gap-2 px-2 pb-2">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <Bot size={16} />}
                   </div>
                   <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">{user.displayName || 'User'}</span>
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
               onClick={() => setIsSidebarOpen(true)}
               className="w-[34px] h-[34px] ml-1 rounded-full overflow-hidden cursor-pointer border border-[#cbd5e1]"
             >
               {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover border border-[#cbd5e1] rounded-full" /> : <Bot size={20} />}
             </motion.div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto`;

content = content.replace(uiHeaderRegex, uiHeaderReplacement);

// Fix trailing tags
const endingReplacementRegex = /<\/main>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)$/m;

const endingReplacement = `</main>
      
      {/* Input Dock */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#f4f7fb] via-[#f4f7fb] to-transparent pt-10 pb-6 px-4 sm:px-6 z-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200/60 p-2 sm:p-3 pb-3 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Tanya Super"
              rows={1}
              className="w-full bg-transparent resize-none outline-none px-4 pt-3 pb-2 text-[1.05rem] text-gray-900 placeholder:text-gray-500 overflow-hidden"
            />
            
            <div className="flex items-center justify-between px-2 pt-2 mt-1 select-none">
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <Plus className="w-[22px] h-[22px]" strokeWidth={1.75} />
                </motion.button>
               <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <GripHorizontalIcon className="w-[22px] h-[22px]" strokeWidth={1.75} />
                </motion.button>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 text-sm font-medium"
                >
                  Cepat
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.button>
                <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
                <div className="relative flex items-center justify-center w-11 h-11">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {inputValue.trim() ? (
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
    </div>
  );`;

content = content.replace(endingReplacementRegex, endingReplacement);

fs.writeFileSync(path, content, 'utf8');
