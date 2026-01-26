
import { FoodLog, Reminder, HealthTip, UserSettings, MealType } from "../types";

const KEYS = {
  LOGS: 'nutrivoice_logs',
  REMINDERS: 'nutrivoice_reminders',
  TIP: 'nutrivoice_daily_tip',
  SETTINGS: 'nutrivoice_settings'
};

// Initial Data
const DEFAULT_SETTINGS: UserSettings = {
  isOnboardingComplete: false,
  name: '',
  age: 30,
  gender: 'male',
  height: 170,
  weight: 70,
  activityLevel: 'moderate',
  goal: 'maintain',
  dailyCalorieTarget: 2200,
  dietaryPreference: 'South Indian'
};

export const Storage = {
  getLogs: (): FoodLog[] => {
    try {
      const logs = localStorage.getItem(KEYS.LOGS);
      return logs ? JSON.parse(logs) : [];
    } catch { return []; }
  },

  addLog: (log: FoodLog) => {
    const logs = Storage.getLogs();
    const newLogs = [log, ...logs];
    localStorage.setItem(KEYS.LOGS, JSON.stringify(newLogs));
    return newLogs;
  },

  updateLog: (updatedLog: FoodLog) => {
    const logs = Storage.getLogs();
    const newLogs = logs.map(l => l.id === updatedLog.id ? updatedLog : l);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(newLogs));
    return newLogs;
  },

  deleteLog: (id: string) => {
    const logs = Storage.getLogs();
    const newLogs = logs.filter(l => l.id !== id);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(newLogs));
    return newLogs;
  },

  getReminders: (): Reminder[] => {
    try {
      const reminders = localStorage.getItem(KEYS.REMINDERS);
      return reminders ? JSON.parse(reminders) : [];
    } catch { return []; }
  },

  saveReminders: (reminders: Reminder[]) => {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  },

  getHealthTip: (): HealthTip | null => {
    try {
      const tip = localStorage.getItem(KEYS.TIP);
      return tip ? JSON.parse(tip) : null;
    } catch { return null; }
  },

  saveHealthTip: (tip: HealthTip) => {
    localStorage.setItem(KEYS.TIP, JSON.stringify(tip));
  },

  getSettings: (): UserSettings => {
    try {
      const s = localStorage.getItem(KEYS.SETTINGS);
      return s ? JSON.parse(s) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  },
  
  saveSettings: (s: UserSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
  }
};
