
export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack',
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: number;
}

export interface FoodLog {
  id: string;
  timestamp: number;
  meal: MealType;
  items: FoodItem[];
  totalCalories: number;
  transcript: string;
  notes?: string;
  method: 'voice' | 'manual';
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:mm
  enabled: boolean;
}

export interface HealthTip {
  date: string;
  tip: string;
  category: 'nutrition' | 'hydration' | 'general';
}

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type WeightGoal = 'lose' | 'maintain' | 'gain';

export interface UserSettings {
  isOnboardingComplete: boolean;
  name: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goal: WeightGoal;
  dailyCalorieTarget: number;
  dietaryPreference?: string; // e.g., Vegetarian, Non-Veg
}

// Gemini Response Types
export interface GeminiNLUResponse {
  intent: 'add_food' | 'query_stats' | 'create_reminder' | 'unknown';
  entities?: {
    meal?: string;
    items?: Array<{
      name: string;
      quantity: string | number;
      unit: string;
    }>;
    time?: string;
  };
  transcript: string;
}
