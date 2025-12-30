
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type Language = 'ja' | 'en';

export type ThemeId = 'pink' | 'blue' | 'green' | 'purple' | 'orange';

export interface Theme {
  id: ThemeId;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}

export interface SubGoal {
  id: string;
  text: string;
  isDone: boolean;
}

export interface BingoItem {
  id: string;
  text: string;
  difficulty: Difficulty;
  isAchieved: boolean;
  position: number; // 0 to 24
  subGoals?: SubGoal[];
}

export interface UserProfile {
  year: number;
  month?: number; // Optional month (1-12)
  theme: ThemeId;
}

export interface BingoBoard {
  id: string;
  profile: UserProfile;
  items: BingoItem[];
  createdAt: number;
  updatedAt: number;
}
