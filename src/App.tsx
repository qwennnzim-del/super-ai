import { GoogleGenAI } from "@google/genai";
import { Plus, Sparkles, Mic, ChevronDown, Menu, Frame, SquareArrowUpRight, Bot, Check, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Message = {
  id: string;
  role: "user" | "model";
  text: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle auto-resizing of textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      // Build chat history for context
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are SuperAI, an intelligent and helpful AI assistant.",
        }
      });

      // Send previous messages to build context
      // Doing a simple generateContent is easier if we don't strictly need persistent chat object
      // But if we want actual history, let's just send the whole thing as contents.
      const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: "user", parts: [{ text: userMessage.text }] });

      const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: contents,
      });

      let fullResponse = "";
      const modelMessageId = (Date.now() + 1).toString();

      // Add a placeholder message for the model
      setMessages((prev) => [
        ...prev,
        { id: modelMessageId, role: "model", text: "" },
      ]);

      for await (const chunk of response) {
        fullResponse += chunk.text;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f4f7fb] text-gray-900 font-sans relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 pt-6 z-10 shrink-0 select-none">
        <div className="flex items-center gap-4 text-gray-700">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 -ml-2 rounded-full hover:bg-gray-200/50 transition-colors"
          >
            <TextAlignStartIcon className="w-6 h-6" />
          </motion.button>
          <span className="text-xl font-medium tracking-tight">SuperAI</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-gray-200/50 transition-colors text-gray-700"
          >
            <CircleFadingPlusIcon className="w-5 h-5" />
          </motion.button>
          <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center font-medium text-sm">
            C
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-48">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {messages.length === 0 ? (
            // Greeting State
            <div className="flex-1 flex flex-col justify-center pb-20">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-1 select-none"
              >
                <h1 className="text-[1.75rem] sm:text-3xl font-normal text-gray-800">
                  Halo cipa
                </h1>
                <h2 className="text-[2.5rem] sm:text-[3.5rem] leading-[1.1] font-medium tracking-tight text-gray-900">
                  Sebaiknya kita mulai<br />dari mana?
                </h2>
              </motion.div>
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
                        <div className="text-[1.1rem] sm:text-[1.15rem] leading-relaxed text-gray-900 text-right whitespace-pre-wrap font-medium select-text">
                          {message.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start w-fit max-w-full mt-1">
                        <div className="markdown-body w-fit max-w-full overflow-x-auto bg-gray-500/10 rounded-[1.5rem] px-5 py-4 sm:px-6 sm:py-5">
                          <Markdown 
                            remarkPlugins={[remarkGfm]}
                            components={{ code: CodeBlock }}
                          >
                            {message.text}
                          </Markdown>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex justify-start w-full mt-2 mb-2"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-[35px] h-[35px] flex items-center justify-center shrink-0">
                           <div className="loader">
                             <svg width="100" height="100" viewBox="0 0 100 100">
                               <defs>
                                 <mask id="clipping">
                                   <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
                                   <polygon points="25,25 75,25 50,75" fill="white"></polygon>
                                   <polygon points="50,25 75,75 25,75" fill="white"></polygon>
                                   <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                                   <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                                   <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                                   <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                                 </mask>
                               </defs>
                             </svg>
                             <div className="box"></div>
                           </div>
                        </div>
                        <span className="shimmer-text text-[0.95rem] font-medium tracking-wide">berfikir...</span>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-24 sm:h-32" />
            </div>
          )}
        </div>
      </main>

      {/* Input Dock */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#f4f7fb] via-[#f4f7fb] to-transparent pt-10 pb-6 px-4 sm:px-6 z-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200/60 p-2 sm:p-3 pb-3 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Minta Gemini"
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
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </motion.button>
               <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <GripHorizontalIcon className="w-5 h-5 stroke-[2]" />
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
                <div className="relative flex items-center justify-center w-10 h-10">
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
                        <ArrowUpIcon className="w-5 h-5" />
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
                        <AudioLinesIcon className="w-5 h-5 stroke-[2]" />
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
  );
}
