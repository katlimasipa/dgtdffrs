import { BotSettings } from '../store/bot-settings-store';

export interface SessionStats {
  totalTrades: number;
  winCount: number;
  lossCount: number;
  sessionPnL: number;
}

export function canTrade(settings: BotSettings, stats: SessionStats): { allowed: boolean; reason?: string } {
  if (stats.totalTrades >= settings.maxTrades) {
    return { allowed: false, reason: 'Max trades limit reached.' };
  }

  if (stats.sessionPnL >= settings.dailyProfitTarget) {
    return { allowed: false, reason: 'Daily profit target reached.' };
  }

  if (stats.sessionPnL <= -settings.dailyLossLimit) {
    return { allowed: false, reason: 'Daily loss limit reached.' };
  }

  return { allowed: true };
}
