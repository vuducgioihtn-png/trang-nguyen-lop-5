export type QuestionType = 'FILL_BLANK' | 'REARRANGE' | 'LISTEN_CHOICE' | 'MATCHING';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  grade: number;
  unit: string;
  type: QuestionType;
  question_text: string;
  audio_script: string | null;
  options?: string[];
  segments?: string[];
  pairs?: MatchingPair[];
  correct_answer: string;
  explanation: string;
  userAnswer?: string | string[] | { [key: string]: string };
  isCorrect?: boolean;
}

export interface VocabWord {
  id: string;
  testId: number;
  orderNumber?: number;
  english: string;
  vietnamese: string;
  phonetic?: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'idiom';
  exampleEn?: string;
  exampleVi?: string;
  tip?: string;
}

export interface MockExam {
  id: string;
  title: string;
  subtitle: string;
  grade: number;
  testSetNumber?: number;
  totalQuestions: number;
  durationMinutes: number;
  questions: Question[];
  difficulty: 'Cơ Bản' | 'Cấp Huyện' | 'Cấp Tỉnh' | 'Cấp Quốc Gia';
  isAiGenerated?: boolean;
  createdAt?: string;
}

export interface UserStats {
  points: number;
  testsCompleted: number;
  vocabLearned: string[];
  streakDays: number;
  lastActiveDate: string;
  achievements: string[];
  examHistory: {
    examId: string;
    title: string;
    score: number;
    total: number;
    percentage: number;
    durationSeconds: number;
    date: string;
  }[];
}
