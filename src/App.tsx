import { useState } from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { LogIn, GraduationCap, LayoutDashboard, MessageSquare, BrainCircuit, LogOut, Loader2, Book, ArrowRight, ArrowLeft } from "lucide-react";
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
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-quest flex flex-col font-sans" id="app-container">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-ink/10 bg-quest/90 backdrop-blur-sm px-4 py-4 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl font-bold tracking-tight">Code Quest AI Bot</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <NavButton 
              active={activeTab === "dashboard"} 
              onClick={() => setActiveTab("dashboard")}
              label="DASHBOARD"
            />
            <NavButton 
              active={activeTab === "chat"} 
              onClick={() => setActiveTab("chat")}
              label="CHAT"
            />
            <NavButton 
              active={activeTab === "quiz"} 
              onClick={() => setActiveTab("quiz")}
              label="QUIZ"
            />

          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold">{profile?.displayName}</span>
            </div>
            <button 
              onClick={() => signOut(auth)} 
              className="border border-ink px-4 py-1.5 font-mono text-[10px] hover:bg-ink hover:text-white transition-all uppercase tracking-widest font-bold"
            >
              Sign Out
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-auto"
            >
              <Dashboard onNavigateChat={() => setActiveTab("chat")} />
            </motion.div>
          )}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ChatInterface />
            </motion.div>
          )}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-auto"
            >
              <QuizMode />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs font-bold tracking-[0.2em] transition-all relative py-1 ${
        active ? "text-ink" : "text-ink/40 hover:text-ink"
      }`}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-ink"
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
    <div className="min-h-screen bg-quest flex flex-col overflow-hidden relative selection:bg-brand selection:text-white">
      {/* Header */}
      <nav className="w-full border-b border-ink/10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl font-bold">Code Quest AI Bot</h1>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => setAuthMode("login")} className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60 hover:text-ink">SIGN IN</button>
          <button onClick={() => setAuthMode("signup")} className="quest-btn bg-brand border-brand">
            BEGIN 
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 pt-20 pb-12 flex flex-col">
        <AnimatePresence mode="wait">
          {authMode === "landing" ? (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              <div className="lg:col-span-8 space-y-8">
                <span className="quest-label">LEVEL I · CODE EXPEDITION</span>
                <h2 className="text-7xl sm:text-9xl font-serif leading-[0.9] text-ink">
                  A tutor that <i className="font-normal italic">masters</i> your <span className="text-brand">learning quest.</span>
                </h2>
                <p className="text-xl text-ink/70 font-serif max-w-xl leading-relaxed">
                  Embark on a personal coding journey. We track your progress, identify weak spots, and guide you through challenges — one quest at a time.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button onClick={() => setAuthMode("signup")} className="quest-btn h-14 px-8 text-sm">START YOUR QUEST</button>
                  <button onClick={() => setAuthMode("login")} className="quest-btn-outline h-14 px-8 text-sm">RESUME JOURNEY</button>
                </div>
              </div>

              <div className="lg:col-span-4 mt-12 lg:mt-0">
                <div className="folio-card p-8 space-y-6">
                  <span className="quest-label">QUEST CATEGORIES</span>
                  <div className="space-y-6">
                    <SpecimenItem num="01" code="PY-03" title="Python Mastery" desc="logic - syntax - algorithms" />
                    <SpecimenItem num="02" code="JS-07" title="Web Wizardy" desc="dom - events - async - react" />
                    <SpecimenItem num="03" code="OO-02" title="Architectural Craft" desc="patterns - design - scalability" />
                    <SpecimenItem num="04" code="DB-05" title="Data Sanctum" desc="sql - nosql - optimization" />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto w-full py-12"
            >
              <div className="folio-card p-8 space-y-8">
                <div className="space-y-2 text-center">
                  <span className="quest-label">{authMode === "signup" ? "NEW RECRUIT" : "RETURNING AGENT"}</span>
                  <h3 className="text-4xl font-serif font-bold">
                    {authMode === "signup" ? "Create Account" : "Welcome Back"}
                  </h3>
                </div>

                {error && (
                  <div className="p-4 bg-brand/10 border border-brand/20 text-brand space-y-2">
                    <p className="text-xs font-mono font-bold uppercase">System Error:</p>
                    <p className="text-[11px] font-sans leading-relaxed">{error}</p>
                    {error.includes("operation-not-allowed") && (
                      <div className="mt-2 text-[10px] text-ink/60 border-t border-brand/20 pt-2 space-y-1">
                        <p className="font-bold">How to fix:</p>
                        <p>1. Go to Firebase Console &gt; Authentication</p>
                        <p>2. Enable "Google" and "Email/Password" providers.</p>
                      </div>
                    )}
                    {error.includes("unauthorized-domain") && (
                      <div className="mt-2 text-[10px] text-ink/60 border-t border-brand/20 pt-2 space-y-1">
                        <p className="font-bold">How to fix:</p>
                        <p>1. Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</p>
                        <p>2. Add this domain to the list: <code className="bg-brand/5 px-1">{window.location.hostname}</code></p>
                      </div>
                    )}
                    {error.includes("popup-closed-by-user") && (
                      <div className="mt-2 text-[10px] text-ink/60 border-t border-brand/20 pt-2 space-y-1">
                        <p>It looks like you closed the login window before completing the quest.</p>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {authMode === "signup" && (
                    <div className="space-y-1">
                      <label className="quest-label !text-[9px]">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-quest border-2 border-ink/10 p-3 font-sans focus:border-brand focus:outline-none transition-colors"
                        placeholder="Ada Lovelace"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="quest-label !text-[9px]">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-quest border-2 border-ink/10 p-3 font-sans focus:border-brand focus:outline-none transition-colors"
                      placeholder="ada@quest.io"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="quest-label !text-[9px]">Security Cipher (Password)</label>
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-quest border-2 border-ink/10 p-3 font-sans focus:border-brand focus:outline-none transition-colors"
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="quest-btn w-full h-12 mt-4 disabled:opacity-50"
                    type="submit"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      authMode === "signup" ? "INITIALIZE ACCOUNT" : "ACCESS SYSTEM"
                    )}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink/10"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono bg-white px-4 text-ink/40">OR</div>
                </div>

                <button 
                  onClick={handleGoogleLogin} 
                  className="w-full border-2 border-ink/10 p-3 flex items-center justify-center gap-3 hover:bg-ink/5 transition-colors font-mono text-[10px] font-bold tracking-widest"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  AUTHENTICATE WITH GOOGLE
                </button>

                <div className="text-center pt-4">
                  <button 
                    onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                    className="font-mono text-[10px] text-ink/60 hover:text-ink underline decoration-brand underline-offset-4"
                  >
                    {authMode === "signup" ? "ALREADY HAS ACCESS? LOGIN" : "NEED NEW ACCESS? SIGN UP"}
                  </button>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={() => setAuthMode("landing")}
                    className="font-mono text-[9px] text-ink/40 hover:text-ink flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-3 h-3" /> BACK TO SURFACE
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {authMode === "landing" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-auto pt-20"
          >
            <div className="quest-divider" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
              <Benefit 
                num="I."
                label="PHASE 1"
                title="Interactive Guidance"
                desc="Our AI analyzes your messages to provide personalized explanations and code snippets tailored to your current knowledge."
              />
              <Benefit 
                num="II."
                label="PHASE 2"
                title="Memory Loop"
                desc="Code Quest remembers your past mistakes and successes, ensuring you never repeat common errors and always face relevant challenges."
              />
              <Benefit 
                num="III."
                label="PHASE 3"
                title="Adaptive Challenges"
                desc="Quizzes adjust in real-time. If you're excelling, we push your boundaries. If you're struggling, we reinforce the foundations."
              />
            </div>
          </motion.div>
        )}
      </main>

      <footer className="border-t border-ink/10 px-8 py-8 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold">© 2026 · CODE QUEST AI BOT</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">FILED UNDER: EDUCATION / NLP / PROMPTING</span>
      </footer>
    </div>
  );
}

function SpecimenItem({ num, code, title, desc }: { num: string, code: string, title: string, desc: string }) {
  return (
    <div className="space-y-1 relative pb-4 border-b border-ink/5 last:border-0 last:pb-0">
      <div className="flex items-baseline gap-3">
        <span className="font-serif italic text-brand text-sm">{num}</span>
        <span className="font-mono text-[10px] font-bold text-ink/40 tracking-wider ">{code}</span>
        <h4 className="font-serif text-xl font-bold">{title}</h4>
      </div>
      <p className="font-mono text-[10px] text-ink/60 pl-8 lowercase">{desc}</p>
    </div>
  );
}

function Benefit({ num, label, title, desc }: { num: string, label: string, title: string, desc: string }) {
  return (
    <div className="space-y-4">
      <span className="text-4xl font-serif italic text-brand">{num}</span>
      <div className="space-y-2">
        <span className="quest-label">{label}</span>
        <h4 className="text-2xl font-bold">{title}</h4>
        <p className="text-ink/60 text-sm leading-relaxed">{desc}</p>
      </div>
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
