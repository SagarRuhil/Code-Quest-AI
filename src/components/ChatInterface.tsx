import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, getDocs, writeBatch } from "firebase/firestore";
import { chatWithTutor } from "../services/geminiService";
import { ChatMessage } from "../types";
import { Loader2, Volume2, VolumeX, SendHorizontal, Trash2, Terminal, Cpu, HardDrive, ShieldCheck, HelpCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
import { speak, stopSpeaking } from "../services/speechService";
import { CodeBlock } from "./CodeBlock";
import { TypewriterMarkdown } from "./TypewriterMarkdown";

export function ChatInterface() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [narratingId, setNarratingId] = useState<string | null>(null);
  const [newlyAddedMessageId, setNewlyAddedMessageId] = useState<string | null>(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  
  const [focusedLanguage, setFocusedLanguage] = useState(() => {
    return localStorage.getItem("cq_focused_language") || "General Programming";
  });

  // Audio state managed globally for the voice tutor
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("cq_terminal_muted") === "true";
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.programmingInterests?.length && !localStorage.getItem("cq_focused_language")) {
      setFocusedLanguage(profile.programmingInterests[0]);
    }
  }, [profile]);

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

    return () => {
      unsubscribe();
      stopSpeaking();
    };
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
      
      const aiResponseContent = await chatWithTutor(history, { ...profile, currentFocusLanguage: focusedLanguage });

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: aiResponseContent || "I encountered an error. Could you repeat that?",
        userId: user.uid,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, `users/${user.uid}/messages`), aiMessage);
      setNewlyAddedMessageId(docRef.id);

      // Trigger automatic calm voice readout if not muted
      if (!isMuted && aiResponseContent) {
        // Clean markdown characters for pleasant readout
        const cleanText = aiResponseContent.replace(/[*#`_~-]/g, " ").trim();
        setNarratingId(docRef.id);
        speak(cleanText, () => setNarratingId(null));
      }
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
      const cleanText = text.replace(/[*#`_~-]/g, " ").trim();
      speak(cleanText, () => setNarratingId(null));
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem("cq_terminal_muted", String(nextMuted));
    if (nextMuted) {
      stopSpeaking();
      setNarratingId(null);
    }
  };

  const handleClearHistory = () => {
    if (!user) return;
    setShowPurgeConfirm(true);
  };

  const confirmPurgeHistory = async () => {
    if (!user) return;
    try {
      stopSpeaking();
      setNarratingId(null);
      setNewlyAddedMessageId(null);
      setShowPurgeConfirm(false);
      
      const path = `users/${user.uid}/messages`;
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing chat history:", error);
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/messages`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Interactive Cyber Background Details */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-slate-900/10 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-brand/10 blur-3xl rounded-full -z-10" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <span className="quest-label bg-brand/10 text-brand">MISSION · SECURE COMMS</span>
          <h2 className="text-4xl font-serif font-bold text-ink flex items-center gap-3">
            Learning Terminal
            <Terminal className="w-6 h-6 text-brand" />
          </h2>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Programming Language Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">SESSION FOCUS:</span>
            <select
              value={focusedLanguage}
              onChange={(e) => {
                const lang = e.target.value;
                setFocusedLanguage(lang);
                localStorage.setItem("cq_focused_language", lang);
              }}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-brand/30 rounded-2xl px-3 py-2.5 font-mono text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand/10 cursor-pointer shadow-sm min-w-[130px] sm:min-w-[160px]"
            >
              {Array.from(new Set([
                "General Programming",
                ...(profile?.programmingInterests || []),
                "Python", "TypeScript", "JavaScript", "HTML/CSS", "SQL", "Rust", "Go", "Java", "C++"
              ])).map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all border ${
              isMuted 
                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100" 
                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }`}
            title={isMuted ? "Unmute auto-narration" : "Mute auto-narration"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? "VOICE: OFF" : "VOICE: ON (CALM)"}</span>
          </button>

          <button
            onClick={handleClearHistory}
            disabled={messages.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:hover:bg-slate-100 border border-slate-200 rounded-2xl font-mono text-xs font-bold transition-all"
            title="Purge chat history"
          >
            <Trash2 className="w-4 h-4" />
            <span>PURGE HISTORY</span>
          </button>
        </div>
      </div>

      {/* Terminal Window container with simulated cyber glass aesthetics */}
      <div className="flex-1 flex flex-col bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden min-h-0" id="terminal-interface">
        
        {/* Interactive Matrix/Grid scanline atmospheric layer */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-40" />

        {/* Enhanced Telemetry Terminal Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-850 select-none gap-2 z-20">
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90 shadow-sm" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90 shadow-sm" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 shadow-sm" />
            </div>
            <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand" />
              code-quest-terminal ~/tutor - bash
            </span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-5 text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-4 border-r border-slate-800 pr-4">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-brand/80" /> COMPUTE: LOCAL_VIRT</span>
              <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-emerald-500/80" /> DATA_DB: SYNCD</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-indigo-500/80" /> SECURE: SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-wider">ONLINE</span>
            </div>
          </div>
        </div>

        {/* Messages list */}
        <ScrollArea className="flex-1 px-6 bg-slate-950/95 relative z-20" viewportRef={scrollRef}>
          <div className="space-y-8 max-w-4xl mx-auto py-8">
            {messages.length === 0 && !isTyping && (
              <div className="py-12 px-6 font-mono text-xs md:text-sm text-slate-400 space-y-6 max-w-2xl mx-auto border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <div className="text-brand flex justify-center mb-2">
                  <Terminal className="w-10 h-10" />
                </div>
                <p className="text-center font-bold text-slate-300">====================================================</p>
                <p className="text-center font-bold text-emerald-400 tracking-wider">CODE QUEST AI TUTOR TERMINAL v1.5</p>
                <p className="text-center font-bold text-slate-300">====================================================</p>
                <p className="text-slate-400 leading-relaxed text-center">
                  [STATUS] CONNECTED TO LEARNING INTERFACE.<br/>
                  [SPEAKER] {isMuted ? "AUTO-NARRATION MUTED" : "AUTO-NARRATION ACTIVE (CALM VOICE)"}.<br/>
                  [INSTRUCTIONS] INITIALIZE LESSON BY ENTERING YOUR INQUIRY.
                </p>
                <p className="text-slate-500 text-center italic">"Speak, and let the quest begin."</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message, i) => (
                <motion.div
                  key={message.id || i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col space-y-2 ${message.role === "user" ? "items-end" : "items-start"}`}
                >
                  {message.role === "user" ? (
                    <div className="flex flex-col items-end max-w-[85%]">
                      <div className="flex items-center gap-2 font-mono text-[9px] text-brand/80 font-bold mb-1 mr-2 uppercase tracking-wider">
                        <span>user@codequest:~$</span>
                      </div>
                      <div className="bg-brand text-white px-6 py-4 rounded-3xl rounded-tr-none font-sans text-sm md:text-base leading-relaxed shadow-lg shadow-brand/10">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center gap-2 font-mono text-[9px] text-emerald-400 font-bold mb-1 ml-2 uppercase tracking-wider">
                        <span>quest-bot@gemini:~$ cat response.md</span>
                      </div>
                      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl rounded-tl-none p-6 md:p-8 space-y-4 shadow-xl text-slate-100 relative overflow-hidden group">
                        
                        {/* Interactive branding background element */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-[100px] -z-10 transition-all duration-500 group-hover:w-32 group-hover:h-32" />
                        
                        {/* Message Metatags & Speak Controls */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-850 pb-4 mb-4">
                          <MetaTag label="AGENT" value="GEMINI-QUEST" />
                          <MetaTag label="FOCUS" value={focusedLanguage} />
                          <div className="ml-auto flex items-center gap-2">
                            <span className="font-mono text-[9px] text-slate-500 hidden md:inline">INDIVIDUAL NARRATION:</span>
                            <button 
                              onClick={() => message.id && toggleNarration(message.id, message.content)}
                              className={`p-2 rounded-xl transition-all duration-300 border ${
                                narratingId === message.id 
                                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300 scale-105" 
                                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                              }`}
                              title={narratingId === message.id ? "Stop Narrator" : "Narrate with Calm Voice"}
                            >
                              {narratingId === message.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        {/* Code and Text Markdown Content (Fully legible white text on dark colors with high-performance word typewriter) */}
                        <div className="markdown-body text-slate-200">
                          <TypewriterMarkdown
                            content={message.content}
                            isLatest={message.id === newlyAddedMessageId}
                            components={{
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                if (match) {
                                  return (
                                    <CodeBlock className={className}>
                                      {String(children).replace(/\n$/, "")}
                                    </CodeBlock>
                                  );
                                }
                                return (
                                  <code className="bg-slate-800 text-slate-100 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          />
                        </div>
                        
                        {/* Feedback / Read Time bar */}
                        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <span className="font-mono text-[9.5px] text-slate-400 bg-slate-950 px-4 py-2 rounded-full border border-slate-855 tracking-wider">
                            RESOLVED SUITE · AI INSTRUCTOR ENGINE
                          </span>
                          <div className="flex gap-2">
                            <button className="font-mono text-[9px] font-bold text-slate-400 hover:text-emerald-400 bg-slate-850 px-3 py-1.5 rounded-full border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer">HELPFUL</button>
                            <button className="font-mono text-[9px] font-bold text-slate-400 hover:text-rose-400 bg-slate-850 px-3 py-1.5 rounded-full border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer">CONFUSING</button>
                          </div>
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
                className="flex flex-col space-y-1 items-start w-full max-w-4xl mx-auto animate-pulse"
              >
                <div className="flex items-center gap-2 font-mono text-[9px] text-emerald-400 font-bold mb-1 ml-2">
                  <span>quest-bot@gemini:~$ run ai_inference.sh</span>
                </div>
                <div className="py-4 px-6 rounded-2xl rounded-tl-none flex items-center gap-4 bg-slate-900 border border-slate-850 text-slate-300">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce delay-150" />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce delay-300" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-brand uppercase tracking-wider">Tutor is synthesizing code...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Form with Command styling */}
        <div className="p-4 bg-slate-900 border-t border-slate-850 relative z-20">
          
          {/* Suggestion Chips formatted as CLI scripts */}
          {messages.length === 0 && (
            <div className="max-w-4xl mx-auto w-full mb-4">
              <p className="font-mono text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2.5 text-center sm:text-left flex items-center gap-1.5 justify-center sm:justify-start">
                <HelpCircle className="w-3 h-3 text-slate-500" /> SUGGESTED SYSTEM ROUTINES:
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {[
                  { text: "./explain_closures.sh 🐍", val: "Could you explain what Python closures are with a simple example?" },
                  { text: "./state_vs_props.sh ⚛️", val: "What is the difference between React state and props? Give a simple analogy." },
                  { text: "./what_is_an_api.sh 🌐", val: "Can you explain what an API is in simple, everyday language?" },
                  { text: "./binary_search.sh ⚡", val: "Help me write a clean TypeScript function for Binary Search and explain it." }
                ].map((chip, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => setInput(chip.val)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-xs font-mono text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer shadow-inner flex items-center gap-1"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{chip.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-stretch gap-3">
            <div className="flex-1 relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-brand text-sm font-bold pointer-events-none group-focus-within:text-brand transition-colors">
                $
                <span className="text-emerald-500 animate-pulse ml-1">&gt;</span>
              </span>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your tutor anything..."
                className="w-full h-16 bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl pl-16 pr-32 font-mono text-sm focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all shadow-lg placeholder:text-slate-500"
                disabled={isTyping}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:opacity-0 transition-opacity flex items-center gap-2">
                <span className="font-mono text-[9px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">BASH</span>
                <div className="w-2 h-4 bg-emerald-500/80 animate-pulse hidden sm:inline-block" />
              </div>
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-brand text-white rounded-2xl w-16 h-16 flex items-center justify-center hover:scale-105 active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 disabled:scale-100 transition-all shadow-lg shadow-brand/20 group cursor-pointer"
            >
              {isTyping ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <SendHorizontal className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Custom Purge Confirmation Modal Overlay */}
      <AnimatePresence>
        {showPurgeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-100"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-[100px] -z-10" />
              
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mb-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-100">Purge Terminal Session?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  This action is permanent and will completely erase all stored chat records and terminal memories for this learning quest.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPurgeConfirm(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono text-xs font-bold rounded-2xl border border-slate-700 transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={confirmPurgeHistory}
                  className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-2xl shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
                >
                  PURGE SYSTEM
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetaTag({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] text-brand font-bold tracking-wider">{label}</span>
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">{value}</span>
    </div>
  );
}
