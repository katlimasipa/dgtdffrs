'use client';

import { SessionStats } from '@/lib/engine/risk-manager';
import { useBotSettings } from '@/lib/store/bot-settings-store';

interface SessionPanelProps {
  stats: SessionStats;
  isRunning: boolean;
  isPaused: boolean;
  activeSymbol?: string;
  tickBuffer: number[];
  onReset: () => void;
}

export function SessionPanel({
  stats,
  isRunning,
  isPaused,
  activeSymbol,
  tickBuffer,
  onReset,
}: SessionPanelProps) {
  const { settings } = useBotSettings();

  const netPL = stats.sessionPnL;
  const isPositive = netPL >= 0;
  const totalTrades = stats.totalTrades;
  const winRate = totalTrades > 0 ? Math.round((stats.winCount / totalTrades) * 100) : 0;

  const botStatus = !isRunning
    ? 'Disconnected'
    : isPaused
      ? 'Paused'
      : 'Running';

  const botStatusColor = !isRunning
    ? 'text-muted-foreground'
    : isPaused
      ? 'text-yellow-500'
      : 'text-green-500';

  // Current streak length from tickBuffer
  const repsWaited = tickBuffer.length;

  // Determine current streak of same-direction ticks
  const currentStreak = (() => {
    if (tickBuffer.length < 2) return 0;
    let count = 1;
    for (let i = tickBuffer.length - 1; i > 0; i--) {
      const diff = tickBuffer[i] - tickBuffer[i - 1];
      const prevDiff = i < tickBuffer.length - 1 ? tickBuffer[i + 1] - tickBuffer[i] : diff;
      if ((diff > 0 && prevDiff > 0) || (diff < 0 && prevDiff < 0)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  })();

  return (
    <div className="space-y-4">
      {/* SESSION SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Session
          </h3>
          <button
            onClick={onReset}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 border border-border rounded"
          >
            Reset
          </button>
        </div>

        {/* Net P/L */}
        <div className="text-center py-2">
          <span
            className={`font-mono text-3xl font-semibold ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isPositive ? '+' : ''}
            {netPL.toFixed(2)} USD
          </span>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-border rounded p-3 text-center">
            <div className="font-mono text-xl font-semibold text-green-500">
              {stats.winCount}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              Wins
            </div>
          </div>

          <div className="border border-border rounded p-3 text-center">
            <div className="font-mono text-xl font-semibold text-red-500">
              {stats.lossCount}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              Losses
            </div>
          </div>

          <div className="border border-border rounded p-3 text-center">
            <div className="font-mono text-xl font-semibold text-foreground">
              {totalTrades}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              Trades
            </div>
          </div>

          <div className="border border-border rounded p-3 text-center">
            <div className="font-mono text-xl font-semibold text-foreground">
              {winRate}%
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              Win Rate
            </div>
          </div>
        </div>
      </div>

      {/* BOT SECTION */}
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Bot
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-mono ${botStatusColor}`}>{botStatus}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-mono text-foreground">
              {'no'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reps waited</span>
            <span className="font-mono text-foreground">{repsWaited}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Streak</span>
            <span className="font-mono text-foreground">
              {currentStreak} / {settings.streakLength}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Symbol</span>
            <span className="font-mono text-foreground">
              {activeSymbol || '--'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-mono text-foreground">1 tick</span>
          </div>
        </div>

        <p className="text-xs italic text-muted-foreground pt-2">
          Demo and Real tokens are saved separately and are only loaded for your
          signed-in account.
        </p>
      </div>
    </div>
  );
}
