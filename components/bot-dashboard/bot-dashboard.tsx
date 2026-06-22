'use client';

import { OverviewPanel } from './overview-panel';
import { LiveTickMonitor } from './live-tick-monitor';
import { PatternSettings } from './pattern-settings';
import { BotControls } from './bot-controls';
import { TradeHistoryTable } from './trade-history-table';
import { useBotRunner } from '@/lib/engine/bot-runner';
import { SymbolSelector } from '@/components/custom/symbol-selector';
import type { DigitsViewProps } from '../digits-view';
import type { DerivWS } from '@deriv/core';

export interface BotDashboardProps extends DigitsViewProps {
  ws: DerivWS | null;
}

// Reusing the props from DigitsView so we can swap it cleanly in page.tsx
export function BotDashboard(props: BotDashboardProps) {
  const {
    ws,
    isConnected,
    activeSymbol,
    pipSize,
    currentTick,
    buyContract,
    isBuying,
    buyResult,
    buyError,
    proposal,
    symbols,
    selectSymbol,
  } = props as any; // Using any for simplicity in this wrapper, normally map explicit props

  const runner = useBotRunner({
    ws,
    isConnected,
    activeSymbol: activeSymbol?.symbol,
    pipSize,
    currentTick,
    buyContract,
    isBuying,
    buyResult,
    buyError,
    proposal,
  });

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 py-6 gap-6 pb-24">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            THPDTSMRTTRDR
          </h1>
          <p className="text-muted-foreground">Institutional Pattern Trading Engine</p>
        </div>
        <div className="w-full sm:w-72">
          <SymbolSelector
            symbols={symbols}
            activeSymbol={activeSymbol}
            onSymbolChange={selectSymbol}
          />
        </div>
      </div>

      <OverviewPanel stats={runner.sessionStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LiveTickMonitor tickBuffer={runner.tickBuffer} />
          <PatternSettings />
        </div>
        <div className="space-y-6">
          <BotControls 
            isRunning={runner.isRunning} 
            isPaused={runner.isPaused}
            onToggleBot={runner.toggleBot}
            onPauseBot={runner.pauseBot}
          />
          <TradeHistoryTable />
        </div>
      </div>
    </div>
  );
}
