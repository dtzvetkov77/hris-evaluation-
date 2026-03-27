export type RatingLevel = "Отличен" | "Добър" | "Задоволителен" | "Слаб";

export interface Candidate {
  id: string;
  number: number;
  name: string;
  position: string;
  groupNumber?: string;
  notes: string;
  createdAt: string;
  evaluatedAt?: string;
  scores?: CategoryScore[];
  totalScore?: number;
  rating?: RatingLevel;
}

export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  score: number; // 0-100
  weight: number; // percentage
}

export interface Question {
  id: string;
  text: string;
  weight: number; // percentage of total
  options: Option[];
}

export interface Option {
  label: string;
  score: number; // 0-100
}

export interface Category {
  id: string;
  name: string;
  weight: number; // percentage of total
  questions: Question[];
}

export const POSITIONS = [
  "Консултант по HRIS",
  "HR Мениджър",
  "HR Специалист",
  "HR Бизнес Партньор",
];

export function getRating(score: number): RatingLevel {
  if (score >= 80) return "Отличен";
  if (score >= 60) return "Добър";
  if (score >= 40) return "Задоволителен";
  return "Слаб";
}

export function getRatingColor(rating: RatingLevel): string {
  switch (rating) {
    case "Отличен": return "text-green-600 bg-green-50 border-green-200";
    case "Добър": return "text-blue-600 bg-blue-50 border-blue-200";
    case "Задоволителен": return "text-orange-500 bg-orange-50 border-orange-200";
    case "Слаб": return "text-red-500 bg-red-50 border-red-200";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#2563eb";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}
