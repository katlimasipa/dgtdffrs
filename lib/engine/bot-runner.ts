import { useState, useEffect, useRef, useCallback } from 'react';
import { Tick, ProposalInfo, BuyResult, DerivWS } from '@deriv/core';
import { useBotSettings } from '../store/bot-settings-store';
import { detectPattern } from './pattern-detector';
import { canTrade, SessionStats } from './risk-manager';
import { addTradeRecord, updateTradeResult, TradeRecord, getRecentTrades } from '../store/trade-history-db';
import type { ClosedPosition, OpenPosition } from '../types';

interface UseBotRunnerParams {
  ws: DerivWS | null;
  isConnected: boolean;
  activeSymbol: string | undefined;
  pipSize: number;
  currentTick: Tick | null;
  buyContract: () => Promise<void>;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  proposal: ProposalInfo | null;
  openPositions?: OpenPosition[];
  closedPositions?: ClosedPosition[];
}

export function useBotRunner({
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
  openPositions,
  closedPositions,
}: UseBotRunnerParams) {
  const { settings } = useBotSettings();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [sessionStatsMap, setSessionStatsMap] = useState<Record<string, SessionStats>>({});
  const currentStrategy = settings.triggerMode;
  
  const sessionStats = sessionStatsMap[currentStrategy] || {
    totalTrades: 0,
    winCount: 0,
    lossCount: 0,
    sessionPnL: 0,
  };

  const updateSessionStats = useCallback((updater: (prev: SessionStats) => SessionStats) => {
    setSessionStatsMap(prevMap => {
      const prevStats = prevMap[currentStrategy] || { totalTrades: 0, winCount: 0, lossCount: 0, sessionPnL: 0 };
      return {
        ...prevMap,
        [currentStrategy]: updater(prevStats),
      };
    });
  }, [currentStrategy]);

  const resetSession = useCallback(() => {
    setSessionStatsMap(prevMap => ({
      ...prevMap,
      [currentStrategy]: { totalTrades: 0, winCount: 0, lossCount: 0, sessionPnL: 0 },
    }));
  }, [currentStrategy]);

  const [tickBuffer, setTickBuffer] = useState<number[]>([]);
  const [lastCooldownTime, setLastCooldownTime] = useState<number>(0);
  
  // Track last executed trade to prevent duplicate buys on same tick/pattern
  const lastExecutedTickEpochRef = useRef<number>(0);

  // Buffer incoming ticks
  useEffect(() => {
    if (!currentTick || !isRunning || isPaused) return;
    
    // Extract digit
    const priceStr = currentTick.quote.toFixed(pipSize);
    const digit = parseInt(priceStr.slice(-1), 10);
    
    setTickBuffer(prev => {
      const newBuffer = [...prev, digit];
      if (newBuffer.length > 20) return newBuffer.slice(-20);
      return newBuffer;
    });
  }, [currentTick, pipSize, isRunning, isPaused]);

  // Handle buy result updates to stats & db
  const lastRecordedCidRef = useRef<number>(0);
  useEffect(() => {
    if (buyResult && isRunning) {
      const bRes = buyResult as any;
      const cid = bRes.buy?.contract_id || bRes.contract_id || bRes.contractId || 0;
      if (cid && cid !== lastRecordedCidRef.current) {
        lastRecordedCidRef.current = cid;
        addTradeRecord({
          contractId: cid,
          timestamp: Date.now(),
          stake: settings.stake,
          result: 'pending',
          profit: 0,
          triggerMode: settings.triggerMode,
          patternDetected: 'Pattern',
        });
      }
    }
  }, [buyResult, isRunning, settings]);

  // Handle closed positions resolution
  useEffect(() => {
    const resolveTrades = async () => {
      const recentTrades = await getRecentTrades(20);
      const pendingTrades = recentTrades.filter(t => t.result === 'pending');
      if (pendingTrades.length === 0) return;
      
      let newWins = 0;
      let newLosses = 0;
      let newPnL = 0;
      
      for (const trade of pendingTrades) {
        // Check openPositions for recently sold contracts
        const openPos = openPositions?.find(p => p.contract_id === trade.contractId);
        if (openPos && openPos.is_sold) {
          const profit = Number(openPos.profit) || 0;
          await updateTradeResult(trade.contractId, profit);
          if (profit > 0) newWins++;
          else if (profit < 0) newLosses++;
          newPnL += profit;
          continue;
        }

        // Check closedPositions as fallback
        const closed = closedPositions?.find(p => p.contract_id === trade.contractId);
        if (closed) {
          const profit = closed.sell_price - closed.buy_price;
          await updateTradeResult(trade.contractId, profit);
          
          if (profit > 0) newWins++;
          else if (profit < 0) newLosses++;
          newPnL += profit;
        }
      }
      
      if (newWins > 0 || newLosses > 0) {
        updateSessionStats(prev => ({
          ...prev,
          totalTrades: prev.totalTrades + newWins + newLosses,
          winCount: prev.winCount + newWins,
          lossCount: prev.lossCount + newLosses,
          sessionPnL: prev.sessionPnL + newPnL,
        }));
      }
    };
    
    resolveTrades();
  }, [closedPositions, openPositions, updateSessionStats]);

  // Main evaluation loop
  useEffect(() => {
    if (!isRunning || isPaused || !currentTick || isBuying || !proposal) return;

    // Check risk limits
    const riskCheck = canTrade(settings, sessionStats);
    if (!riskCheck.allowed) {
      setIsRunning(false);
      console.log('Bot stopped:', riskCheck.reason);
      return;
    }

    // Cooldown check
    const now = Date.now();
    if (now - lastCooldownTime < settings.cooldownSeconds * 1000) {
      return;
    }

    // Check if we already bought on this tick
    if (currentTick.epoch <= lastExecutedTickEpochRef.current) {
      return;
    }

    const pattern = detectPattern(tickBuffer, settings.triggerMode, settings.targetDigit, settings.streakLength);
    
    if (pattern.matched) {
      console.log(`Pattern ${pattern.patternName} matched! Executing trade.`);
      lastExecutedTickEpochRef.current = currentTick.epoch;
      setLastCooldownTime(Date.now());
      buyContract().catch(console.error);
    }

  }, [
    tickBuffer, 
    isRunning, 
    isPaused, 
    settings, 
    sessionStats, 
    currentTick, 
    isBuying, 
    proposal,
    buyContract,
    lastCooldownTime
  ]);

  const toggleBot = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(false);
      setTickBuffer([]);
    } else {
      setIsRunning(true);
      setIsPaused(false);
      setTickBuffer([]);
      // We no longer automatically reset stats here; users can use resetSession explicitly or we can keep it accumulating per strategy
    }
  }, [isRunning]);

  const pauseBot = useCallback(() => setIsPaused(p => !p), []);

  return {
    isRunning,
    isPaused,
    toggleBot,
    pauseBot,
    sessionStats,
    tickBuffer,
    updateSessionStats, // Allow external update from open positions resolution
    resetSession,
  };
}
