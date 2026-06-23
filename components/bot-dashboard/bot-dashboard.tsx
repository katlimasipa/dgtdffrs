'use client';

import { useState } from 'react';
import { StrategyPanel } from './strategy-panel';
import { CenterContent } from './center-content';
import { SessionPanel } from './session-panel';
import { BotControls } from './bot-controls';
import { useBotRunner } from '@/lib/engine/bot-runner';
import type { DigitsViewProps } from '../digits-view';
import type { DerivWS } from '@deriv/core';
import type { ClosedPosition } from '@/lib/types';

export interface BotDashboardProps extends DigitsViewProps {
  ws: DerivWS | null;
  openPositions?: any[];
  closedPositions?: ClosedPosition[];
}

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
    openPositions,
    closedPositions,
  } = props as any;

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
    openPositions,
    closedPositions,
  });

  const [mobileTab, setMobileTab] = useState<'strategy' | 'dashboard' | 'session'>('dashboard');

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Desktop 3-column layout */}
      <div className="hidden lg:grid lg:grid-cols-[240px_1fr_280px] h-full overflow-hidden">
        {/* Left Sidebar - Strategy */}
        <aside className="border-r border-border overflow-y-auto p-5 space-y-6">
          <StrategyPanel
            symbols={symbols}
            activeSymbol={activeSymbol}
            onSymbolChange={selectSymbol}
          />
          <div className="pt-2">
            <BotControls
              isRunning={runner.isRunning}
              isPaused={runner.isPaused}
              onToggleBot={runner.toggleBot}
              onPauseBot={runner.pauseBot}
            />
          </div>
        </aside>

        {/* Center - Main Content */}
        <main className="overflow-y-auto p-6 pb-20">
          <CenterContent
            currentTick={currentTick}
            tickBuffer={runner.tickBuffer}
            activeSymbol={activeSymbol?.symbol}
            pipSize={pipSize}
            closedPositions={closedPositions}
          />
        </main>

        {/* Right Sidebar - Session Stats */}
        <aside className="border-l border-border overflow-y-auto p-5">
          <SessionPanel
            stats={runner.sessionStats}
            isRunning={runner.isRunning}
            isPaused={runner.isPaused}
            activeSymbol={activeSymbol?.symbol}
            tickBuffer={runner.tickBuffer}
            onReset={runner.resetSession}
          />
        </aside>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex-1 overflow-y-auto pb-32">
        <div className="p-4">
          {mobileTab === 'strategy' && (
            <div className="space-y-6">
              <StrategyPanel
                symbols={symbols}
                activeSymbol={activeSymbol}
                onSymbolChange={selectSymbol}
              />
              <BotControls
                isRunning={runner.isRunning}
                isPaused={runner.isPaused}
                onToggleBot={runner.toggleBot}
                onPauseBot={runner.pauseBot}
              />
            </div>
          )}
          {mobileTab === 'dashboard' && (
            <CenterContent
              currentTick={currentTick}
              tickBuffer={runner.tickBuffer}
              activeSymbol={activeSymbol?.symbol}
              pipSize={pipSize}
              closedPositions={closedPositions}
            />
          )}
          {mobileTab === 'session' && (
            <SessionPanel
              stats={runner.sessionStats}
              isRunning={runner.isRunning}
              isPaused={runner.isPaused}
              activeSymbol={activeSymbol?.symbol}
              tickBuffer={runner.tickBuffer}
              onReset={runner.resetSession}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-12 left-0 right-0 h-14 bg-card/95 backdrop-blur-sm border-t border-border flex items-center justify-around z-40">
        <button
          onClick={() => setMobileTab('strategy')}
          className={`flex-1 h-full text-[10px] uppercase tracking-widest font-bold transition-colors ${mobileTab === 'strategy' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Strategy
        </button>
        <button
          onClick={() => setMobileTab('dashboard')}
          className={`flex-1 h-full text-[10px] uppercase tracking-widest font-bold transition-colors ${mobileTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setMobileTab('session')}
          className={`flex-1 h-full text-[10px] uppercase tracking-widest font-bold transition-colors ${mobileTab === 'session' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          Session
        </button>
      </div>
    </div>
  );
}
