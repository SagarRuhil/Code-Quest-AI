import { useState } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { LogIn, GraduationCap, LayoutDashboard, MessageSquare, BrainCircuit, LogOut, Loader2, Book, ArrowRight, ArrowLeft, Sparkles, Heart } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { ChatInterface } from "./components/ChatInterface";
import { Dashboard } from "./components/Dashboard";
import { QuizMode } from "./components/QuizMode";

function MainApp() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat" | "quiz">("dashboard");

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-quest" id="loading-screen">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-12 h-12 text-brand" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-quest flex flex-col font-sans relative overflow-hidden" id="app-container">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-brand/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-accent/20 blur-[100px] rounded-full -z-10" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md px-6 py-4 sm:px-12 border-b border-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-ink hidden sm:block">Code Quest</h1>
          </div>

          <nav className="flex items-center bg-ink/5 p-1 rounded-2xl">
            <NavButton 
              active={activeTab === "dashboard"} 
              onClick={() => setActiveTab("dashboard")}
              label="Overview"
              icon={<LayoutDashboard className="w-4 h-4" />}
            />
            <NavButton 
              active={activeTab === "chat"} 
              onClick={() => setActiveTab("chat")}
              label="Terminal"
              icon={<MessageSquare className="w-4 h-4" />}
            />
            <NavButton 
              active={activeTab === "quiz"} 
              onClick={() => setActiveTab("quiz")}
              label="Field Test"
              icon={<BrainCircuit className="w-4 h-4" />}
            />
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end">
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-ink/70">Active Agent</span>
              <span className="font-sans text-xs font-bold text-ink">{profile?.displayName}</span>
            </div>
            <button 
              onClick={() => signOut(auth)} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-ink/5 hover:bg-brand/10 hover:text-brand transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-12 overflow-hidden flex flex-col" id="main-content">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="flex-1 overflow-auto"
            >
              <Dashboard onNavigateChat={() => setActiveTab("chat")} onNavigateQuiz={() => setActiveTab("quiz")} />
            </motion.div>
          )}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ChatInterface />
            </motion.div>
          )}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-auto"
            >
              <QuizMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-ink/5 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/30 backdrop-blur-sm">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-mono text-[10px] font-bold text-ink/80 tracking-widest uppercase">© 2026 · CODE QUEST AI BOT</span>
          <span className="font-mono text-[9px] text-ink/65 uppercase tracking-widest font-bold">Encrypted Education Network</span>
        </div>
        
        <div className="flex items-center gap-2 px-6 py-2 bg-white/50 border border-white rounded-full shadow-sm">
          <Heart className="w-3 h-3 text-brand fill-brand" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/80">
            Designed and Developed by{" "}
            <a 
              href="https://v0-sagarruhil.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand hover:text-brand/80 transition-colors underline decoration-brand/20 underline-offset-4"
            >
              Sagar
            </a>
          </span>
        </div>

        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/75">v1.2 · Powered by Gemini</span>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 font-sans text-xs font-bold transition-all rounded-xl relative ${
        active ? "text-ink bg-white shadow-sm" : "text-ink/75 hover:text-ink/90"
      }`}
    >
      {icon}
      <span className="hidden md:block transition-all">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}

function LandingPage() {
  const { signUpWithEmail, signInWithEmail } = useAuth();
  const [authMode, setAuthMode] = useState<"landing" | "login" | "signup">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google login error", err);
      setError(err.message || "Google login failed. Please try again.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (authMode === "signup") {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error("Auth error", err);
      setError(err.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-quest flex flex-col overflow-hidden relative selection:bg-brand/20 selection:text-ink">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-brand/5 to-transparent -z-10" />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[10%] w-96 h-96 bg-accent/20 blur-[100px] rounded-full -z-10" 
      />

      {/* Header */}
      <nav className="w-full px-8 py-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink">Code Quest</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAuthMode("login")} className="px-6 py-2 rounded-full font-sans text-xs font-bold text-ink/80 hover:text-ink transition-colors">Sign In</button>
          <button onClick={() => setAuthMode("signup")} className="quest-btn">
            Begin Journey 
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 pt-12 pb-24 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {authMode === "landing" ? (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center text-center space-y-12"
            >
              <div className="space-y-6 max-w-4xl">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="quest-label"
                >
                  Version 2.0 · Now with AI Narration
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
                  className="text-6xl sm:text-8xl font-serif leading-[1] text-ink font-bold"
                >
                  Learn code with a tutor <br/>
                  <span className="text-brand italic font-medium">that grows with you.</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl text-ink/85 font-sans max-w-2xl mx-auto leading-relaxed"
                >
                  Embark on a personal coding journey. We track your cognitive flow, identify weak spots, and bridge knowledge gaps through AI-driven mentorship.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
                >
                  <button onClick={() => setAuthMode("signup")} className="quest-btn h-14 px-10 text-sm shadow-xl shadow-brand/20">START MY QUEST</button>
                  <button onClick={() => setAuthMode("login")} className="quest-btn-outline h-14 px-10 text-sm bg-white/50 backdrop-blur-sm">RESUME PROGRESS</button>
                </motion.div>
              </div>

              {/* Specs Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-12"
              >
                <SpecimenItem num="01" code="NLP" title="Adaptive Voice" desc="Calm female narration for all AI responses." />
                <SpecimenItem num="02" code="LLM" title="Google Gemini" desc="Powered by next-gen reasoning models." />
                <SpecimenItem num="03" code="SQL" title="Cloud Sync" desc="Your progress follows you everywhere." />
                <SpecimenItem num="04" code="CSS" title="Soft-Pro UI" desc="A playful yet professional aesthetic." />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto w-full py-6"
            >
              <div className="folio-card p-10 space-y-10">
                <div className="space-y-2 text-center">
                  <span className="quest-label">{authMode === "signup" ? "INITIALIZING MISSION" : "RETURNING AGENT"}</span>
                  <h3 className="text-4xl font-serif font-bold">
                    {authMode === "signup" ? "Create Profile" : "Access Console"}
                  </h3>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 bg-brand/5 border border-brand/20 rounded-2xl text-brand space-y-2"
                  >
                    <p className="text-[11px] font-sans leading-relaxed flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                       {error}
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-5">
                  {authMode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="quest-label !bg-transparent !p-0">User Identifier</label>
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-quest border border-ink/10 rounded-2xl p-4 font-sans focus:border-brand focus:ring-4 focus:ring-brand/5 focus:outline-none transition-all placeholder:text-ink/20"
                        placeholder="John Doe"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="quest-label !bg-transparent !p-0">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-quest border border-ink/10 rounded-2xl p-4 font-sans focus:border-brand focus:ring-4 focus:ring-brand/5 focus:outline-none transition-all placeholder:text-ink/20"
                      placeholder="agent@quest.ai"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="quest-label !bg-transparent !p-0">Access Cipher</label>
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-quest border border-ink/10 rounded-2xl p-4 font-sans focus:border-brand focus:ring-4 focus:ring-brand/5 focus:outline-none transition-all placeholder:text-ink/20"
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="quest-btn w-full h-14 mt-4 shadow-xl shadow-brand/20 disabled:scale-100 disabled:bg-ink/50"
                    type="submit"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      authMode === "signup" ? "Create Account" : "Access Terminal"
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-4 text-ink/20">
                  <div className="h-[1px] flex-1 bg-current" />
                  <span className="font-mono text-[9px] font-bold text-ink/65">SECURE LINK</span>
                  <div className="h-[1px] flex-1 bg-current" />
                </div>

                <button 
                  onClick={handleGoogleLogin} 
                  className="w-full border border-ink/10 rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-neutral-50 transition-all font-sans text-xs font-bold"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  Continue with Google
                </button>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                    className="font-mono text-[10px] text-ink/70 hover:text-brand font-bold uppercase tracking-wider transition-colors"
                  >
                    {authMode === "signup" ? "Existing Member? Login" : "New Recruit? Join Today"}
                  </button>
                </div>
                
                <button 
                  onClick={() => setAuthMode("landing")}
                  className="w-full text-center font-mono text-[10px] text-ink/50 hover:text-ink/70 transition-colors uppercase font-bold tracking-widest pt-4"
                >
                  ← Return to Surface
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-ink/5 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/30 backdrop-blur-sm">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-mono text-[10px] font-bold text-ink/80 tracking-widest uppercase">© 2026 · CODE QUEST AI BOT</span>
          <span className="font-mono text-[9px] text-ink/65 uppercase tracking-widest font-bold">Encrypted Education Network</span>
        </div>
        
        <div className="flex items-center gap-2 px-6 py-2 bg-white/50 border border-white rounded-full shadow-sm">
          <Heart className="w-3 h-3 text-brand fill-brand" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/80">
            Designed and Developed by{" "}
            <a 
              href="https://v0-sagarruhil.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand hover:text-brand/80 transition-colors underline decoration-brand/20 underline-offset-4"
            >
              Sagar
            </a>
          </span>
        </div>

        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/75">v1.2 · Powered by Gemini</span>
      </footer>
    </div>
  );
}

function SpecimenItem({ num, code, title, desc }: { num: string, code: string, title: string, desc: string }) {
  return (
    <div className="folio-card p-6 flex flex-col items-center text-center space-y-3 bg-white/50 backdrop-blur-sm group">
      <div className="flex items-baseline gap-2">
        <span className="font-serif italic text-brand font-bold">{num}</span>
        <span className="font-mono text-[9px] font-bold text-brand/70 tracking-widest">{code}</span>
      </div>
      <h4 className="font-serif text-lg font-bold text-ink">{title}</h4>
      <p className="font-sans text-[11px] text-ink/75 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-quest">
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </div>
  );
}
