import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { QuizResult } from "../types";
import { Trophy, Star, BookOpen, Clock, ArrowRight, Zap, Target, Award, CheckCircle2, XCircle, MessageSquare, BrainCircuit, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";

export function Dashboard({ onNavigateChat, onNavigateQuiz }: { onNavigateChat: () => void; onNavigateQuiz: () => void }) {
  const { profile } = useAuth();
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>([]);
  
  const totalAttempts = recentQuizzes.length || 0;
  const accuracy = recentQuizzes.length > 0 
    ? Math.round((recentQuizzes.reduce((acc, q) => acc + (q.score / q.totalQuestions), 0) / recentQuizzes.length) * 100)
    : 0;
  
  const xpToNextLevel = (profile?.currentLevel || 1) * 1000;
  const progress = (profile?.totalXp || 0) % xpToNextLevel;
  const progressPercentage = (progress / xpToNextLevel) * 100;

  useEffect(() => {
    if (!profile) return;

    const fetchQuizzes = async () => {
      const q = query(
        collection(db, `users/${profile.uid}/quizzes`),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResult));
      setRecentQuizzes(quizzes);
    };

    fetchQuizzes();
  }, [profile]);

  return (
    <div className="space-y-12 pb-20">
      {/* Header & Level Info */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gradient-to-r from-brand/5 via-accent/5 to-transparent p-8 sm:p-10 rounded-[32px] border border-brand/10 relative overflow-hidden">
        {/* Playful background sparks */}
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-brand/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="space-y-3 relative z-10 flex-1">
          <div className="flex items-center gap-2">
            <span className="quest-label">QUEST LOG · {(profile?.displayName || "Agent").toUpperCase()}</span>
            <span className="font-mono text-[9px] font-bold bg-white text-brand border border-brand/20 px-2 py-0.5 rounded-full inline-block">LEVEL SYNCED</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-ink leading-tight">
            Your coding journey.
          </h2>
          <p className="text-sm text-ink/85 max-w-xl">
            Tackle new field tests, chat with your personal AI mentor, and level up your mastery across {profile?.programmingInterests?.length || "various"} specializations.
          </p>
        </div>

        {/* Cognitive XP Hub */}
        <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm w-full lg:w-80 space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Award className="w-4 h-4" />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-ink/85">Cognitive Tier</span>
            </div>
            <span className="font-sans text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded-lg">
              Lvl {profile?.currentLevel || 1}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-sans text-xs font-bold text-ink/90">Experience Points</span>
              <span className="font-mono text-[10px] font-bold text-ink/70">
                {progress || 0} / {xpToNextLevel} XP
              </span>
            </div>
            {/* Cute progress bar */}
            <div className="h-2.5 bg-ink/10 w-full rounded-full overflow-hidden p-0.5 border border-white shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(4, progressPercentage)}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                className="h-full bg-gradient-to-r from-brand to-brand/80 rounded-full" 
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-ink/70 font-bold uppercase tracking-wider">
            <span>START</span>
            <span>NEXT LEVEL</span>
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="QUESTS" value={totalAttempts} subValue="total mission entries" icon={<Trophy className="w-5 h-5" />} />
        <StatCard label="PRECISION" value={`${accuracy}%`} subValue="accuracy across topics" icon={<Target className="w-5 h-5" />} />
        <StatCard label="TIER" value={profile?.currentLevel ? (profile.currentLevel >= 3 ? "pro" : profile.currentLevel >= 2 ? "mid" : "easy") : "easy"} subValue="adaptive difficulty" icon={<Award className="w-5 h-5" />} />
        <StatCard label="XP TOTAL" value={profile?.totalXp || 0} subValue="cumulative knowledge" icon={<Zap className="w-5 h-5" />} />
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NavCard 
          label="MISSION · COMMS" 
          title="Consult AI Bot" 
          desc="Tactical advice and concept breakdowns." 
          onClick={onNavigateChat} 
          icon={<MessageSquare className="w-8 h-8 text-brand" />}
        />
        <NavCard 
          label="MISSION · PRACTICE" 
          title="Field Testing" 
          desc="Real-time assessment of your current skills." 
          onClick={onNavigateQuiz} 
          icon={<BrainCircuit className="w-8 h-8 text-accent" />}
        />
        <div className="folio-card p-10 flex flex-col justify-between bg-white/50 border-white/40">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="quest-label">TOPIC PRECISION</span>
              <BookOpen className="w-4 h-4 text-ink/50" />
            </div>
            <div className="space-y-6">
              {profile?.programmingInterests?.slice(0, 3).map((interest, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-serif text-lg font-bold">{interest}</h4>
                    <span className="font-mono text-[10px] font-bold text-ink/70">85%</span>
                  </div>
                  <div className="h-1.5 bg-ink/10 w-full rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className="h-full bg-brand rounded-full" 
                    />
                  </div>
                </div>
              )) || <p className="text-sm italic text-ink/70">No data yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Marginalia (Recent Quizzes) */}
      <section className="space-y-8">
        <div className="flex items-baseline justify-between border-b border-ink pb-2">
          <h3 className="text-3xl font-serif font-bold">Mission Logs</h3>
          <span className="quest-label">LAST {recentQuizzes.length} ENTRIES</span>
        </div>
        
        <div className="space-y-4">
          {recentQuizzes.length > 0 ? (
            recentQuizzes.map((quiz, i) => (
              <motion.div
                key={quiz.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="folio-card p-4 flex items-center justify-between group hover:bg-neutral-50 transition-colors"
                id={`quiz-entry-${quiz.id || i}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`px-2 py-1 border font-mono text-[10px] font-bold tracking-widest uppercase ${
                    (quiz.score / quiz.totalQuestions) >= 0.7 ? "border-green-600 text-green-700" : "border-brand text-brand"
                  }`}>
                    {(quiz.score / quiz.totalQuestions) >= 0.7 ? "SECURED" : "BREACHED"}
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-ink/70">{quiz.topic}</span>
                  <h4 className="font-serif text-lg font-bold">{quiz.topic} Verification</h4>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-ink/80">{quiz.score}/{quiz.totalQuestions}</span>
                  <ArrowRight className="w-4 h-4 text-ink/45 group-hover:text-ink transition-colors" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="quest-divider text-center py-12">
              <p className="font-serif italic text-ink/70">No quest logs found. Initiate a sequence to begin documentation.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string, value: string | number, subValue: string, icon?: React.ReactNode }) {
  return (
    <div className="folio-card p-8 space-y-6 bg-white/50 border-white/40 group hover:scale-[1.02] transition-all">
      <div className="flex items-center justify-between">
        <span className="quest-label">{label}</span>
        {icon && <div className="text-brand/80">{icon}</div>}
      </div>
      <div>
        <h3 className="text-4xl font-serif font-bold text-ink group-hover:text-brand transition-colors">{value}</h3>
        <p className="font-mono text-[9px] font-bold text-ink/70 uppercase tracking-widest mt-2">{subValue}</p>
      </div>
    </div>
  );
}

function NavCard({ label, title, desc, onClick, icon }: { label: string, title: string, desc: string, onClick: () => void, icon?: React.ReactNode }) {
  return (
    <div className="folio-card p-10 flex flex-col justify-between hover:bg-white transition-all cursor-pointer group hover:shadow-xl hover:shadow-brand/5 border-white bg-white/30" onClick={onClick}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="quest-label">{label}</span>
          {icon}
        </div>
        <h3 className="text-3xl font-serif font-bold group-hover:text-brand transition-colors leading-tight">{title}</h3>
        <p className="text-sm text-ink/80 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-10 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-brand">
        INITIATE SEQUENCE
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
