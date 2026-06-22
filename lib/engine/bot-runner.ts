import { useState, useEffect, useRef, useCallback } from 'react';
import { Tick, ProposalInfo, BuyResult, DerivWS } from '@deriv/core';
import { useBotSettings } from '../store/bot-settings-store';
import { detectPattern } from './pattern-detector';
import { canTrade, SessionStats } from './risk-manager';
import { addTradeRecord, updateTradeResult, TradeRecord, getRecentTrades } from '../store/trade-history-db';
import type { ClosedPosition } from '../types';

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
  closedPositions,
}: UseBotRunnerParams) {
  const { settings } = useBotSettings();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalTrades: 0,
    winCount: 0,
    lossCount: 0,
    sessionPnL: 0,
  });

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
  useEffect(() => {
    if (buyResult && isRunning) {
      // In a real implementation we would subscribe to proposal_open_contract to get the exact profit/loss.
      // For this demo hook, we assume buyResult contains the ID and we just log it as pending.
      addTradeRecord({
        contractId: (buyResult as any).contractId || (buyResult as any).contract_id || 0,
        timestamp: Date.now(),
        stake: settings.stake,
        result: 'pending',
        profit: 0,
        triggerMode: settings.triggerMode,
        patternDetected: 'Pattern', // Can be refined
      });
      // The open positions hook from the existing repo handles the actual resolution.
    }
  }, [buyResult]);

  // Handle closed positions resolution
  useEffect(() => {
    if (!closedPositions || closedPositions.length === 0) return;
    
    // Check recently closed positions against our pending trades
    const resolveTrades = async () => {
      const recentTrades = await getRecentTrades(20);
      const pendingTrades = recentTrades.filter(t => t.result === 'pending');
      
      let newWins = 0;
      let newLosses = 0;
      let newPnL = 0;
      
      for (const trade of pendingTrades) {
        const closed = closedPositions.find(p => p.contract_id === trade.contractId);
        if (closed) {
          const profit = closed.profit ?? 0;
          await updateTradeResult(trade.contractId, profit);
          
          if (profit > 0) newWins++;
          else if (profit < 0) newLosses++;
          newPnL += profit;
        }
      }
      
      if (newWins > 0 || newLosses > 0) {
        setSessionStats(prev => ({
          ...prev,
          totalTrades: prev.totalTrades + newWins + newLosses,
          winCount: prev.winCount + newWins,
          lossCount: prev.lossCount + newLosses,
          sessionPnL: prev.sessionPnL + newPnL,
        }));
      }
    };
    
    resolveTrades();
  }, [closedPositions]);

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
      setSessionStats({ totalTrades: 0, winCount: 0, lossCount: 0, sessionPnL: 0 }); // Reset stats for new session
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
    setSessionStats, // Allow external update from open positions resolution
  };
}
