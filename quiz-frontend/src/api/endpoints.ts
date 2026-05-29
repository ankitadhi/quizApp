import client from "./client";
import Cookies from "js-cookie";

export interface User {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  bio: string;
  total_score: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  quiz_count: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: Category;
  difficulty: "easy" | "medium" | "hard";
  time_limit: number;
  max_score: number;
  question_count: number;
  created_at: string;
}

export interface QuizDetail extends Quiz {
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  type: "mcq" | "true_false" | "multi";
  points: number;
  order: number;
  image?: string;
  choices: Choice[];
  explanation?: string;
}

export interface Choice {
  id: number;
  text: string;
  is_correct?: boolean;
}

export interface UserAnswer {
  question_id: number;
  choice_ids: number[];
}

export interface QuizSubmission {
  started_at: string;
  answers: UserAnswer[];
}

export interface QuizResult {
  id: number;
  score: number;
  max_score: number;
  time_taken: number;
  percentage: number;
  is_passed: boolean;
  completed_at: string;
  answers: {
    question: Question;
    chosen_choices: Choice[];
    is_correct: boolean;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  total_score: number;
  attempts_count: number;
}

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    client.post("/login/", { email, password }),

  signup: (email: string, username: string, password: string) =>
    client.post("/register/", { email, username, password, password2: password }),

  refreshToken: (refreshToken: string) =>
    client.post("/token/refresh/", { refresh: refreshToken }),

  logout: (refreshToken?: string) =>
    client
      .post("/logout/", { refresh: refreshToken })
      .catch(() => null)
      .finally(() => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
      }),

  getCurrentUser: () => client.get<User>("/me/"),

  updateProfile: (data: Partial<User>) => client.patch<User>("/me/", data),
};

// Quiz endpoints
export const quizAPI = {
  getCategories: () => client.get<Category[]>("/categories/"),

  getQuizzes: (params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    ordering?: string;
  }) => client.get<Quiz[]>("/quizzes/", { params }),

  getQuizDetail: (id: number) => client.get<QuizDetail>(`/quizzes/${id}/`),

  submitQuiz: (quizId: number, data: QuizSubmission) =>
    client.post<QuizResult>(`/quizzes/${quizId}/submit/`, data),

  getAttemptHistory: () => client.get("/attempts/"),

  getAttemptDetail: (attemptId: number) =>
    client.get<QuizResult>(`/attempts/${attemptId}/`),
};

// Leaderboard endpoints
export const leaderboardAPI = {
  getLeaderboard: (params?: { limit?: number; offset?: number }) =>
    client.get<LeaderboardEntry[]>("/leaderboard/", { params }),

  getUserStats: (userId: number) => client.get(`/leaderboard/user/${userId}/`),
};
