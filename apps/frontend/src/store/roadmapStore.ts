import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserResourceProgress {
  userId: string;
  moduleId: string;
  completed: boolean;
  completedAt: string;
}

export interface QuizQuestionReview {
  question: string;
  options: string[];
  userAnswerIndex: number;
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizReviewData {
  moduleId: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  percentage: number;
  answers: QuizQuestionReview[];
  completedAt: string;
}

export interface RoadmapStore {
  modules: any[];
  moduleStates: { [key: string]: 'completed' | 'current' | 'locked' };
  xp: number;
  userResourceProgress: { [moduleId: string]: UserResourceProgress };
  quizReviews: { [moduleId: string]: QuizReviewData };
  addModule: (name: string, description: string, level: 'Beginner' | 'Intermediate' | 'Advanced', points: number) => void;
  updateModule: (moduleId: string, updatedFields: Partial<any>) => void;
  deleteModule: (moduleId: string) => void;
  reorderModule: (moduleId: string, direction: 'up' | 'down') => void;
  completeModule: (moduleId: string, points: number) => void;
  markAsRead: (moduleId: string) => void;
  submitQuizScore: (moduleId: string, score: number, answers: QuizQuestionReview[], xpEarned: number) => void;
  resetProgress: () => void;
}

export const useRoadmapStore = create<RoadmapStore>()(
  persist(
    (set) => ({
      modules: [],
      moduleStates: {},
      xp: 0,
      userResourceProgress: {},
      quizReviews: {},
      
      addModule: (name, description, level, points) => {},
      updateModule: (moduleId, updatedFields) => {},
      deleteModule: (moduleId) => {},
      reorderModule: (moduleId, direction) => {},
      completeModule: (moduleId, points) => {},
      markAsRead: (moduleId) => {},
      submitQuizScore: (moduleId, score, answers, xpEarned) => {},
      resetProgress: () => set({ modules: [], moduleStates: {}, xp: 0, userResourceProgress: {}, quizReviews: {} }),
    }),
    {
      name: 'aws-roadmap-platform-store',
    }
  )
);
