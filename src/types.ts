export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  currentLevel: number;
  totalXp: number;
  programmingInterests: string[];
  createdAt: any;
  updatedAt: any;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: any;
  userId: string;
}

export interface QuizResult {
  id?: string;
  userId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
  timestamp: any;
  feedback?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}
