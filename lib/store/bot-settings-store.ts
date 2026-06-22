import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TriggerMode = 
  | 'SPECIFIC_DIGIT' 
  | 'ANY_DIGIT' 
  | 'ODD_STREAK' 
  | 'EVEN_STREAK' 
  | 'XXYYY' 
  | 'XXXYY';

export interface BotSettings {
  // Trading Limits
  stake: number;
  takeProfit: number;
  stopLoss: number;
  maxTrades: number;
  cooldownSeconds: number;
  dailyLossLimit: number;
  dailyProfitTarget: number;
  
  // Strategy
  triggerMode: TriggerMode;
  targetDigit: number; // 0-9 for SPECIFIC_DIGIT
  streakLength: number; // e.g. 3 for XXXYY or ODD_STREAK
}

interface BotSettingsState {
  settings: BotSettings;
  updateSettings: (newSettings: Partial<BotSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: BotSettings = {
  stake: 10,
  takeProfit: 50,
  stopLoss: 50,
  maxTrades: 100,
  cooldownSeconds: 5,
  dailyLossLimit: 100,
  dailyProfitTarget: 100,
  triggerMode: 'EVEN_STREAK',
  targetDigit: 0,
  streakLength: 3,
};

export const useBotSettings = create<BotSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) => 
        set((state) => ({ 
          settings: { ...state.settings, ...newSettings } 
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'thpdtsmrttrdr-bot-settings',
    }
  )
);
