'use client';

import { useState } from 'react';
import { OverviewPanel } from './overview-panel';
import { LiveTickMonitor } from './live-tick-monitor';
import { PatternSettings } from './pattern-settings';
import { BotControls } from './bot-controls';
import { TradeHistoryTable } from './trade-history-table';
import { useBotRunner } from '@/lib/engine/bot-runner';
import { SymbolSelector } from '@/components/custom/symbol-selector';
import type { DigitsViewProps } from '../digits-view';
import type { DerivWS } from '@deriv/core';
import type { ClosedPosition } from '@/lib/types';

export interface BotDashboardProps extends DigitsViewProps {
  ws: DerivWS | null;
  closedPositions?: ClosedPosition[];
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
    closedPositions,
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
    closedPositions,
  });

  const [activeTab, setActiveTab] = useState<'monitor' | 'controls' | 'history'>('monitor');

  return (
    <div className="flex flex-col w-full flex-1 lg:max-w-[1400px] lg:mx-auto">
      {/* Header section with minimal padding */}
      <div className="px-4 py-4 lg:py-8 lg:px-8 border-b border-border bg-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-[var(--fs-xl)] font-bold tracking-tight leading-none uppercase text-primary">
              Institutional Engine
            </h1>
            <p className="text-[var(--fs-sm)] tracking-widest uppercase text-muted-foreground font-semibold">
              Pattern Detection System
            </p>
          </div>
          <div className="w-full md:w-80">
            <SymbolSelector
              symbols={symbols}
              activeSymbol={activeSymbol}
              onSymbolChange={selectSymbol}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32 lg:p-8 lg:pb-24 space-y-6">
        <OverviewPanel stats={runner.sessionStats} onReset={runner.resetSession} />

        <div className="lg:grid lg:grid-cols-[1fr_350px] gap-8">
          {/* Left Column (Monitor & Settings) */}
          <div className={`space-y-6 lg:block ${activeTab === 'monitor' ? 'block' : 'hidden'}`}>
            <LiveTickMonitor tickBuffer={runner.tickBuffer} />
            <PatternSettings />
          </div>

          {/* Right Column (Controls & History) */}
          <div className={`space-y-6 lg:block ${activeTab === 'controls' || activeTab === 'history' ? 'block' : 'hidden'}`}>
            <div className={`lg:block ${activeTab === 'controls' ? 'block' : 'hidden'}`}>
              <BotControls 
                isRunning={runner.isRunning} 
                isPaused={runner.isPaused}
                onToggleBot={runner.toggleBot}
                onPauseBot={runner.pauseBot}
              />
            </div>
            <div className={`lg:block ${activeTab === 'history' ? 'block' : 'hidden'}`}>
              <TradeHistoryTable />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-12 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-40">
        <button 
          onClick={() => setActiveTab('monitor')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] uppercase tracking-wider font-bold transition-colors ${activeTab === 'monitor' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Monitor
        </button>
        <button 
          onClick={() => setActiveTab('controls')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] uppercase tracking-wider font-bold transition-colors ${activeTab === 'controls' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Controls
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] uppercase tracking-wider font-bold transition-colors ${activeTab === 'history' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          History
        </button>
      </div>
    </div>
  );
}
