import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { chatWithTutor } from "../services/geminiService";
import { ChatMessage } from "../types";
import { ArrowRight, Loader2, Volume2, VolumeX, Sparkles, SendHorizontal, Book } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { speak, stopSpeaking } from "../services/speechService";

export function ChatInterface() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [narratingId, setNarratingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/messages`;
    const q = query(collection(db, path), orderBy("timestamp", "asc"), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || isTyping) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      userId: user.uid,
      timestamp: serverTimestamp(),
    };

    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      await addDoc(collection(db, `users/${user.uid}/messages`), userMessage);
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: currentInput });
      
      const aiResponseContent = await chatWithTutor(history, profile);

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: aiResponseContent || "I encountered an error. Could you repeat that?",
        userId: user.uid,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, `users/${user.uid}/messages`), aiMessage);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleNarration = (id: string, text: string) => {
    if (narratingId === id) {
      stopSpeaking();
      setNarratingId(null);
    } else {
      setNarratingId(id);
      // Clean markdown for better speech
      const cleanText = text.replace(/[*#`_~]/g, "");
      speak(cleanText, () => setNarratingId(null));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Playful background element */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand/5 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-accent/20 blur-3xl rounded-full -z-10" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <span className="quest-label">MISSION · COMMS</span>
          <h2 className="text-4xl font-serif font-bold text-ink flex items-center gap-3">
            Learning Terminal
            <Sparkles className="w-6 h-6 text-brand" />
          </h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/50 shadow-inner" viewportRef={scrollRef}>
        <div className="space-y-12 max-w-4xl mx-auto py-10">
          {messages.length === 0 && !isTyping && (
            <div className="text-center py-24 px-6 folio-card bg-quest/50 border-dashed border-ink/20">
              <Book className="w-12 h-12 text-ink/30 mx-auto mb-4" />
              <h3 className="text-2xl font-serif italic text-ink/65 font-medium leading-relaxed">
                "The threshold of discovery awaits. <br/>Speak and the quest begins."
              </h3>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message, i) => (
              <motion.div
                key={message.id || i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                tabIndex={0}
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                {message.role === "user" ? (
                  <div className="chat-bubble-user font-sans text-[15px] leading-relaxed max-w-[85%] bg-brand shadow-lg shadow-brand/20">
                    {message.content}
                  </div>
                ) : (
                  <div className="folio-card p-6 md:p-8 space-y-4 max-w-[95%] md:max-w-[90%] bg-white/90 backdrop-blur-md relative overflow-hidden group">
                    {/* Creative accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-[100px] -z-10 transition-all duration-500 group-hover:w-32 group-hover:h-32" />
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink/5 pb-4 mb-4">
                      <MetaTag label="AGENT" value="GEMINI-QUEST" />
                      <MetaTag label="FOCUS" value={profile?.programmingInterests?.[0] || "GENERAL"} />
                      <div className="ml-auto">
                        <button 
                          onClick={() => message.id && toggleNarration(message.id, message.content)}
                          className={`p-2 rounded-full transition-all duration-300 ${narratingId === message.id ? "bg-accent text-white scale-110" : "hover:bg-quest text-brand/75 hover:text-brand"}`}
                        >
                          {narratingId === message.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="markdown-body">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    
                    <div className="pt-6 border-t border-ink/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <span className="quest-label text-[9.5px] bg-quest text-brand/85 italic leading-none py-2 px-4 shadow-sm">
                        Curiosity fueled progress · {Math.floor(Math.random() * 5 + 1)} min read
                      </span>
                      <div className="flex gap-3">
                        <button className="font-mono text-[9px] font-bold text-ink/65 hover:text-brand bg-quest/50 px-3 py-1 rounded-full transition-colors border border-transparent hover:border-brand/20">HELPFUL</button>
                        <button className="font-mono text-[9px] font-bold text-ink/65 hover:text-ink bg-quest/50 px-3 py-1 rounded-full transition-colors border border-transparent hover:border-ink/10">CONFUSING</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-start"
            >
              <div className="folio-card py-4 px-6 flex items-center gap-4 bg-brand/5 border-brand/10">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce delay-150" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce delay-300" />
                </div>
                <span className="font-mono text-[10px] font-bold text-brand uppercase tracking-wider">AI is weaving code...</span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="pt-6 px-4">
        {/* Suggestion Chips */}
        {messages.length === 0 && (
          <div className="max-w-4xl mx-auto w-full mb-6">
            <p className="font-mono text-[9px] uppercase font-bold text-ink/65 tracking-widest mb-3 text-center sm:text-left">RECOMMENDED INQUIRIES</p>
            <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
              {[
                { text: "Explain Python closures 🐍", val: "Could you explain what Python closures are with a simple example?" },
                { text: "React state vs props ⚛️", val: "What is the difference between React state and props? Give a simple analogy." },
                { text: "What is an API? 🌐", val: "Can you explain what an API is in simple, everyday language?" },
                { text: "Write binary search ⚡", val: "Help me write a clean TypeScript function for Binary Search and explain it." }
              ].map((chip, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setInput(chip.val)}
                  className="px-4 py-2.5 bg-white/60 hover:bg-white text-xs font-sans font-bold text-ink/90 border border-white hover:border-brand/35 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.03]"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {chip.text}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-stretch gap-3">
          <div className="flex-1 relative group">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask your tutor anything...`}
              className="w-full h-16 bg-white border-2 border-brand/5 rounded-3xl px-8 font-sans text-lg focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all shadow-sm"
              disabled={isTyping}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:opacity-0 transition-opacity">
              <span className="font-mono text-[10px] text-brand/75 font-bold uppercase tracking-widest hidden sm:inline">READY FOR INPUT</span>
            </div>
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-brand text-white rounded-3xl w-16 h-16 flex items-center justify-center hover:scale-105 active:scale-95 disabled:bg-ink/20 disabled:scale-100 transition-all shadow-lg shadow-brand/20 group"
          >
            {isTyping ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <SendHorizontal className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function MetaTag({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] text-brand/85 font-bold tracking-wider">{label}</span>
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink">{value}</span>
    </div>
  );
}
