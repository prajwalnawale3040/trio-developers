export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard'
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizSettings {
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
}

export interface QuizResult {
  totalQuestions: number;
  score: number;
  userAnswers: number[]; // Index of selected answer for each question
  questions: Question[];
}

export enum AppState {
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}