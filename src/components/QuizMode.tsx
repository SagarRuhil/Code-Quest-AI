import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { generateQuiz } from "../services/geminiService";
import { QuizQuestion, QuizResult } from "../types";
import { Loader2, ArrowLeft, Trophy, ArrowRight, Book } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";

export function QuizMode() {
  const { user, profile, refreshProfile } = useAuth();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<"setup" | "loading" | "testing" | "results">("setup");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Languages" | "Web & Mobile" | "CS & DSA" | "Systems & Cloud">("All");

  const getTopicCategory = (spec: string): string => {
    const s = spec.replace("SPECIMEN · ", "");
    if (["PYTHON", "RUST", "GO", "CPP", "JAVA", "ANDROID", "IOS"].includes(s)) {
      return "Languages";
    }
    if (["WEB", "MOBILE"].includes(s)) {
      return "Web & Mobile";
    }
    if (["DSA", "FP", "DATA"].includes(s)) {
      return "CS & DSA";
    }
    return "Systems & Cloud";
  };

  const predefinedTopics = [
    { title: "Python Basics", spec: "SPECIMEN · PYTHON", questions: 10 },
    { title: "Advanced Python", spec: "SPECIMEN · PYTHON", questions: 10 },
    { title: "Data Structures", spec: "SPECIMEN · DSA", questions: 12 },
    { title: "Algorithms", spec: "SPECIMEN · DSA", questions: 12 },
    { title: "React Fundamentals", spec: "SPECIMEN · WEB", questions: 10 },
    { title: "TypeScript Mastery", spec: "SPECIMEN · WEB", questions: 10 },
    { title: "CSS Architecture", spec: "SPECIMEN · WEB", questions: 8 },
    { title: "Node.js Backend", spec: "SPECIMEN · WEB", questions: 10 },
    { title: "SQL & Databases", spec: "SPECIMEN · DB", questions: 10 },
    { title: "Machine Learning Concepts", spec: "SPECIMEN · AI", questions: 8 },
    { title: "Docker & Devops", spec: "SPECIMEN · OPS", questions: 8 },
    { title: "Rust for Systems", spec: "SPECIMEN · RUST", questions: 6 },
    { title: "Go Programming", spec: "SPECIMEN · GO", questions: 8 },
    { title: "C++ Memory Management", spec: "SPECIMEN · CPP", questions: 10 },
    { title: "Java OOP", spec: "SPECIMEN · JAVA", questions: 12 },
    { title: "Software Design Patterns", spec: "SPECIMEN · ARCH", questions: 15 },
    { title: "Security Best Practices", spec: "SPECIMEN · SEC", questions: 10 },
    { title: "API Design (REST/GraphQL)", spec: "SPECIMEN · API", questions: 10 },
    { title: "Testing & QA", spec: "SPECIMEN · TEST", questions: 8 },
    { title: "Git Version Control", spec: "SPECIMEN · GIT", questions: 6 },
    { title: "Vite & Modern Tooling", spec: "SPECIMEN · TOOL", questions: 6 },
    { title: "Regular Expressions", spec: "SPECIMEN · REGEX", questions: 5 },
    { title: "Cloud Computing (AWS/GCP)", spec: "SPECIMEN · CLOUD", questions: 10 },
    { title: "Functional Programming", spec: "SPECIMEN · FP", questions: 8 },
    { title: "Mobile Dev (React Native)", spec: "SPECIMEN · MOBILE", questions: 10 },
    { title: "Swift for iOS", spec: "SPECIMEN · IOS", questions: 8 },
    { title: "Kotlin for Android", spec: "SPECIMEN · ANDROID", questions: 8 },
    { title: "Big Data Processing", spec: "SPECIMEN · DATA", questions: 8 },
    { title: "Web Accessibility (A11y)", spec: "SPECIMEN · WEB", questions: 6 },
    { title: "E-Commerce Architecture", spec: "SPECIMEN · ARCH", questions: 10 },
  ];

  const handleStartQuiz = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic.trim()) return;
    setTopic(finalTopic);
    setCurrentStep("loading");
    try {
      const generatedQuestions = await generateQuiz(finalTopic, difficulty);
      setQuestions(generatedQuestions);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setCurrentStep("testing");
    } catch (error) {
      console.error("Failed to generate quiz", error);
      setCurrentStep("setup");
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 500);
    } else {
      setTimeout(() => completeQuiz(newAnswers), 800);
    }
  };

  const completeQuiz = async (finalAnswers: number[]) => {
    let score = 0;
    questions.forEach((q, i) => {
      if (q.correctAnswerIndex === finalAnswers[i]) {
        score++;
      }
    });

    const result: QuizResult = {
      userId: user!.uid,
      topic,
      difficulty,
      score,
      totalQuestions: questions.length,
      timestamp: serverTimestamp(),
    };

    try {
      const resDoc = await addDoc(collection(db, `users/${user!.uid}/quizzes`), result);
      setQuizResult({ ...result, id: resDoc.id });

      const xpGained = score * 100 + (difficulty === "Intermediate" ? 50 : difficulty === "Advanced" ? 100 : 0);
      const totalXp = (profile?.totalXp || 0) + xpGained;
      const currentLevel = Math.floor(totalXp / 1000) + 1;

      await updateDoc(doc(db, "users", user!.uid), {
        totalXp,
        currentLevel,
        updatedAt: serverTimestamp(),
      });

      await refreshProfile();
      setCurrentStep("results");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user!.uid}/quizzes`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full py-0 min-h-0">
      <AnimatePresence mode="wait">
        {currentStep === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12 pb-20"
          >
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  <Book className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="quest-label">MISSION · TESTING</span>
                  <h2 className="text-5xl font-serif font-bold">Field Assessments.</h2>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white/40 backdrop-blur-sm p-2 rounded-[24px] border border-white/60 max-w-fit shadow-sm">
              {(["All", "Languages", "Web & Mobile", "CS & DSA", "Systems & Cloud"] as const).map((cat) => {
                const em = cat === "All" ? "🌟" : cat === "Languages" ? "🐍" : cat === "Web & Mobile" ? "⚛️" : cat === "CS & DSA" ? "⚙️" : "☁️";
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs font-sans font-bold rounded-2xl cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-brand text-white shadow-md shadow-brand/10 scale-[1.03]" 
                        : "text-ink/80 hover:text-ink hover:bg-white/50"
                    }`}
                  >
                    <span className="mr-1.5">{em}</span>
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {predefinedTopics
                .filter(pt => selectedCategory === "All" || getTopicCategory(pt.spec) === selectedCategory)
                .map((pt, i) => (
                  <motion.div 
                    layout
                    key={pt.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
                    className="folio-card p-10 space-y-6 group hover:translate-y-[-4px] transition-all cursor-pointer bg-white/50 border-white/40 flex flex-col justify-between" 
                    onClick={() => handleStartQuiz(pt.title)}
                  >
                    <div className="space-y-6">
                      <span className="quest-label">{pt.spec}</span>
                      <h3 className="text-3xl font-serif font-bold group-hover:text-brand transition-colors leading-tight">{pt.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-brand/10 border-2 border-white" />
                          <div className="w-6 h-6 rounded-full bg-accent/10 border-2 border-white" />
                        </div>
                        <p className="font-mono text-[9px] text-ink/65 font-bold uppercase tracking-widest">{pt.questions} concepts identified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-brand uppercase tracking-widest pt-4 border-t border-ink/5 mt-auto">
                      ENGAGE 
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
            </div>

            <div className="folio-card p-12 space-y-10 bg-ink text-white relative overflow-hidden">
               {/* Accent */}
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-brand/20 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative space-y-8">
                <span className="quest-label !bg-white/20 !text-white border-white/25 uppercase tracking-[0.2em]">CUSTOM OBJECTIVE</span>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/70">TARGET TOPIC</label>
                    <input 
                      className="w-full h-16 bg-white/5 border border-white/20 rounded-2xl px-8 text-2xl font-serif focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-white/40"
                      placeholder="e.g. Memory profiling in Python..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/20">
                      {["Beginner", "Intermediate", "Advanced"].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d as any)}
                          className={`font-sans text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${
                            difficulty === d ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-white/70 hover:text-white/90"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleStartQuiz()}
                      disabled={!topic.trim()}
                      className="quest-btn !bg-brand !text-white h-14 px-10 flex-1 sm:flex-none !rounded-2xl shadow-xl shadow-brand/20 disabled:scale-100 disabled:bg-white/10 text-sm"
                    >
                      CALIBRATE SEQUENCE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-40 text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-brand mb-6" />
            <h3 className="text-4xl font-serif font-bold text-ink mb-4">Drafting your specimen...</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-ink/75 font-bold">PLEASE WAIT WHILE THE TUTOR PREPARES THE INQUIRY</p>
          </motion.div>
        )}

        {currentStep === "testing" && (
          <motion.div
            key="testing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <div className="flex items-baseline justify-between border-b border-ink/10 pb-4">
              <div className="flex items-center gap-6">
                <button onClick={() => setCurrentStep("setup")} className="text-ink/75 hover:text-ink"><ArrowLeft className="w-5 h-5"/></button>
                <div className="space-y-1">
                  <span className="quest-label">SPECIMEN {currentQuestionIndex + 1} / {questions.length}</span>
                  <h4 className="font-serif text-2xl font-bold">{topic}</h4>
                </div>
              </div>
              <div className="px-3 py-1 border border-ink text-xs font-mono font-bold uppercase tracking-widest">
                {difficulty} · VERIFICATION
              </div>
            </div>

            <div className="folio-card p-12 space-y-12 bg-white">
              <h2 className="text-4xl sm:text-5xl font-serif leading-tight text-ink font-bold">
                {questions[currentQuestionIndex].question}
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestionIndex].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={answers[currentQuestionIndex] !== undefined}
                    className={`p-6 border-2 flex items-center gap-8 text-left transition-all group ${
                      answers[currentQuestionIndex] === i
                        ? i === questions[currentQuestionIndex].correctAnswerIndex
                           ? "bg-green-50 border-green-600"
                          : "bg-brand/5 border-brand"
                        : "bg-white border-ink/10 hover:border-ink"
                    }`}
                  >
                    <span className={`font-serif italic text-2xl ${
                      answers[currentQuestionIndex] === i ? "text-brand" : "text-ink/50 group-hover:text-ink"
                    }`}>
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="font-serif text-xl font-bold">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === "results" && quizResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <span className="quest-label">QUEST COMPLETE</span>
              <h2 className="text-7xl font-serif font-bold text-ink">Victory Achieved.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="folio-card p-12 text-center space-y-4">
                <span className="quest-label">PRECISION RATING</span>
                <h3 className="text-9xl font-serif font-bold text-brand">
                  {Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%
                </h3>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70">{quizResult.score} out of {quizResult.totalQuestions} variables secured</p>
              </div>

              <div className="folio-card p-12 text-center space-y-4 flex flex-col justify-center">
                <span className="quest-label">QUEST REWARDS</span>
                <h3 className="text-6xl font-serif font-bold">+{quizResult.score * 100} XP</h3>
                <div className="pt-8">
                  <div className="bg-ink text-white px-6 py-2 font-mono text-xs font-bold inline-block uppercase tracking-widest">LEVEL {profile?.currentLevel} VANGUARD</div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-ink pb-2">
                <h4 className="text-3xl font-serif font-bold">Post-Quest Briefing</h4>
              </div>
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={i} className={`folio-card p-8 space-y-6 bg-white border-l-8 ${
                    answers[i] === q.correctAnswerIndex ? "border-l-green-600" : "border-l-brand"
                  }`}>
                    <h5 className="text-2xl font-serif font-bold leading-relaxed">{q.question}</h5>
                    <div className="space-y-4 pt-4 border-t border-ink/5">
                      <div className="flex items-baseline gap-4">
                        <span className="quest-label text-[9px] text-green-600">VALID SOLUTION</span>
                        <p className="font-serif font-bold text-lg">{q.options[q.correctAnswerIndex]}</p>
                      </div>
                      {answers[i] !== q.correctAnswerIndex && (
                        <div className="flex items-baseline gap-4">
                          <span className="quest-label text-[9px] text-brand">USER INPUT</span>
                          <p className="font-serif font-bold text-lg text-ink/80">{q.options[answers[i]]}</p>
                        </div>
                      )}
                      <p className="font-serif italic text-ink/85 text-sm pl-4 border-l border-ink/20">{q.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setCurrentStep("setup")} className="quest-btn w-full h-16 text-lg uppercase tracking-widest">RETURN TO MISSION CONTROL</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
