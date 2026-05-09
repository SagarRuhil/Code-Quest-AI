import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { QuizResult } from "../types";
import { Trophy, Star, BookOpen, Clock, ArrowRight, Zap, Target, Award, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";

export function Dashboard({ onNavigateChat }: { onNavigateChat: () => void }) {
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
      {/* Header */}
      <div className="space-y-2">
        <span className="quest-label">QUEST LOG · {profile?.displayName?.toUpperCase()}</span>
        <h2 className="text-5xl font-serif font-bold">Your coding journey.</h2>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="QUESTS" value={totalAttempts} subValue="total mission entries" />
        <StatCard label="PRECISION" value={`${accuracy}%`} subValue="accuracy across topics" />
        <StatCard label="TIER" value={profile?.currentLevel ? (profile.currentLevel >= 3 ? "pro" : profile.currentLevel >= 2 ? "mid" : "easy") : "easy"} subValue="adaptive difficulty" />
        <StatCard label="VULNERABILITIES" value={profile?.programmingInterests?.length || 0} subValue={profile?.programmingInterests?.[0] || "None yet"} />
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NavCard 
          label="MISSION · COMMS" 
          title="Consult AI Bot" 
          desc="Tactical advice and concept breakdowns." 
          onClick={onNavigateChat} 
        />
        <NavCard 
          label="MISSION · PRACTICE" 
          title="Field Testing" 
          desc="Real-time assessment of your current skills." 
          onClick={() => {}} 
        />
        <div className="folio-card p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="quest-label">TOPIC PRECISION</span>
            <div className="space-y-4">
              {profile?.programmingInterests?.slice(0, 3).map((interest, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-serif text-lg font-bold">{interest}</h4>
                    <span className="font-mono text-xs font-bold">85%</span>
                  </div>
                  <div className="h-0.5 bg-ink/10 w-full overflow-hidden">
                    <div className="h-full bg-ink w-[85%]" />
                  </div>
                </div>
              )) || <p className="text-sm italic text-ink/40">No data yet.</p>}
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
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-ink/40">{quiz.topic}</span>
                  <h4 className="font-serif text-lg font-bold">{quiz.topic} Verification</h4>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-ink/60">{quiz.score}/{quiz.totalQuestions}</span>
                  <ArrowRight className="w-4 h-4 text-ink/20 group-hover:text-ink transition-colors" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="quest-divider text-center py-12">
              <p className="font-serif italic text-ink/40">No quest logs found. Initiate a sequence to begin documentation.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, subValue }: { label: string, value: string | number, subValue: string }) {
  return (
    <div className="folio-card p-8 space-y-4">
      <span className="quest-label">{label}</span>
      <div>
        <h3 className="text-4xl font-serif font-bold text-brand">{value}</h3>
        <p className="quest-label text-[9px] mt-1">{subValue}</p>
      </div>
    </div>
  );
}

function NavCard({ label, title, desc, onClick }: { label: string, title: string, desc: string, onClick: () => void }) {
  return (
    <div className="folio-card p-8 flex flex-col justify-between hover:bg-neutral-50 transition-colors cursor-pointer group" onClick={onClick}>
      <div className="space-y-4">
        <span className="quest-label">{label}</span>
        <h3 className="text-3xl font-serif font-bold group-hover:text-brand transition-colors">{title}</h3>
        <p className="text-sm text-ink/60 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-8 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
        INITIATE 
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
