'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TradeHistoryTable } from './trade-history-table';
import { useBotSettings } from '@/lib/store/bot-settings-store';
import { ClosedPosition } from '@/lib/types';
import type { Tick } from '@deriv/core';

interface CenterContentProps {
  currentTick: Tick | null;
  tickBuffer: number[];
  activeSymbol?: string;
  pipSize: number;
  closedPositions?: ClosedPosition[];
  onRefreshPositions?: () => void;
}

export function CenterContent({
  currentTick,
  tickBuffer,
  activeSymbol,
  pipSize,
  closedPositions,
  onRefreshPositions,
}: CenterContentProps) {
  const { settings } = useBotSettings();
  const [historyTab, setHistoryTab] = useState<'demo' | 'real'>('demo');

  // We consider real positions to be anything that isn't virtual.
  // We don't have login context here so we just show what is passed in.
  const closed = closedPositions || [];

  return (
    <div className="space-y-6">
      {/* Section 1: Two cards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last Digit Card */}
        <div className="bg-card border border-border">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-sm font-semibold">Last Digit</h2>
            <span className="font-mono text-xs text-muted-foreground">{activeSymbol || '--'}</span>
          </div>
          <div className="p-4 pt-0 space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 border-b border-border/50 pb-1">Price</div>
              <div className="font-mono text-lg">{currentTick?.quote.toFixed(pipSize) || '—'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Streak</div>
              <div className="font-mono text-3xl font-bold">
                {tickBuffer.length > 0 ? `${tickBuffer.length} / ${settings.streakLength}` : '0 / ' + settings.streakLength}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {tickBuffer.length === 0 ? 'Waiting for ticks...' : `Latest digit: ${tickBuffer[tickBuffer.length - 1]}`}
            </div>
          </div>
        </div>

        {/* Tick Stream Card */}
        <div className="bg-card border border-border">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-sm font-semibold">Tick Stream</h2>
          </div>
          <div className="p-4 pt-0 h-32 flex flex-col justify-end overflow-hidden">
            <div className="flex items-center justify-end gap-2 overflow-hidden w-full">
              <AnimatePresence mode="popLayout">
                {tickBuffer.map((digit, index) => (
                  <motion.div
                    key={`${index}-${digit}`}
                    layout
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded text-lg font-bold
                      ${digit % 2 === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}
                    `}
                  >
                    {digit}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {tickBuffer.length === 0 && (
              <div className="text-muted-foreground text-center mt-4">
                No ticks yet. Connect & start the bot.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Trade Log */}
      <TradeHistoryTable />

      {/* Section 3: Session History */}
      <div className="bg-card border border-border">
        <div className="flex justify-between items-center p-4 pb-2 border-b border-border">
          <h2 className="text-sm font-semibold">Session History</h2>
          <button 
            onClick={onRefreshPositions}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Refresh
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setHistoryTab('demo')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${historyTab === 'demo' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              Demo ({closed.length})
            </button>
            <button
              onClick={() => setHistoryTab('real')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${historyTab === 'real' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              Real (0)
            </button>
          </div>

          {closed.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground text-left text-xs uppercase tracking-wider">
                    <th className="py-2 font-normal">Contract ID</th>
                    <th className="py-2 font-normal">Buy Price</th>
                    <th className="py-2 font-normal">Sell Price</th>
                    <th className="py-2 font-normal text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {closed.slice(0, 20).map((pos) => {
                    const profit = pos.sell_price - pos.buy_price;
                    return (
                      <tr key={pos.contract_id} className="border-b border-border/20 last:border-0 hover:bg-muted/30">
                        <td className="py-2">{pos.contract_id}</td>
                        <td className="py-2 font-mono">${pos.buy_price.toFixed(2)}</td>
                        <td className="py-2 font-mono">${pos.sell_price.toFixed(2)}</td>
                        <td className={`py-2 text-right font-mono font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No closed positions in this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
