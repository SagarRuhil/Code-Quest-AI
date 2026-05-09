import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { chatWithTutor } from "../services/geminiService";
import { ChatMessage } from "../types";
import { ArrowRight, Loader2, Book, User as UserIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

export function ChatInterface() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      {/* Header Info */}
      <div className="space-y-1">
        <span className="quest-label">MISSION · COMMS</span>
        <h2 className="text-4xl font-serif font-bold">Encrypted connection established.</h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-1 bg-neutral-50/30 p-2" viewportRef={scrollRef}>
        <div className="space-y-12 max-w-4xl mx-auto py-8">
          {messages.length === 0 && !isTyping && (
            <div className="text-center py-20 border-2 border-dashed border-ink/10">
              <h3 className="text-2xl font-serif italic text-ink/30 font-bold">Communication terminal idle. Initiate contact.</h3>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message, i) => (
              <motion.div
                key={message.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                {message.role === "user" ? (
                  <div className="chat-bubble-user font-serif text-lg bg-ink text-white max-w-[80%]">
                    {message.content}
                  </div>
                ) : (
                  <div className="folio-card p-8 space-y-4 max-w-[90%] bg-white">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink/5 pb-4 mb-4">
                      <MetaTag label="INTENT" value={i % 2 === 0 ? "EXPLANATION" : "CONCEPT_MAP"} />
                      <MetaTag label="TOPIC" value={profile?.programmingInterests?.[0] || "GENERAL"} />
                      <MetaTag label="STREAK" value="3 DAYS" />
                    </div>
                    <div className="markdown-body">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <div className="pt-6 border-t border-ink/5 flex items-center justify-between">
                      <span className="quest-label text-[9px]">QUEST STATUS: YOU'RE UNDER 60% ON PYTHON — TRY A FIELD TEST.</span>
                      <div className="flex gap-4">
                        <button className="font-mono text-[9px] font-bold text-ink/30 hover:text-ink">POSITIVE</button>
                        <button className="font-mono text-[9px] font-bold text-ink/30 hover:text-ink">NEGATIVE</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="folio-card p-6 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-ink animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-ink animate-bounce delay-150" />
                <div className="w-1.5 h-1.5 rounded-full bg-ink animate-bounce delay-300" />
                <span className="font-mono text-[10px] font-bold text-ink/30 ml-2">CATALOGING RESPONSE...</span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="pt-4 border-t border-ink/10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-stretch gap-4">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${profile?.programmingInterests?.join(", ") || "Python, DSA, OOP, or web"}...`}
            className="flex-1 h-14 bg-white border border-ink/20 px-6 font-serif text-lg focus:outline-none focus:border-brand transition-colors"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="quest-btn bg-brand border-brand h-14 px-10 group"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                TRANSMIT 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
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
      <span className="quest-label text-[9px]">{label}</span>
      <span className="font-mono text-[9px] font-bold uppercase tracking-widest">{value}</span>
    </div>
  );
}
