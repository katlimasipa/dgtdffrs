'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBotSettings, TriggerMode } from '@/lib/store/bot-settings-store';
import { SymbolSelector } from '@/components/custom/symbol-selector';
import type { ActiveSymbol } from '@deriv/core';

interface StrategyPanelProps {
  symbols: ActiveSymbol[];
  activeSymbol: ActiveSymbol | null;
  onSymbolChange: (symbol: string) => void;
}

const triggerModeLabels: Record<TriggerMode, string> = {
  EVEN_STREAK: 'Even Streak',
  ODD_STREAK: 'Odd Streak',
  ANY_DIGIT: 'Any Digit Streak',
  SPECIFIC_DIGIT: 'Specific Digit Streak',
  XXYYY: 'XXYYY Pattern',
  XXXYY: 'XXXYY Pattern',
};

const triggerModeDescriptions: Record<TriggerMode, string> = {
  SPECIFIC_DIGIT:
    'Trades only when the chosen target digit repeats N times in a row.',
  ANY_DIGIT:
    'Trades when any single digit repeats N times consecutively.',
  ODD_STREAK:
    'Trades after N consecutive odd digits appear.',
  EVEN_STREAK:
    'Trades after N consecutive even digits appear.',
  XXYYY:
    'Trades on the XXYYY pattern (2 same + 3 same).',
  XXXYY:
    'Trades on the XXXYY pattern (3 same + 2 same).',
};

export function StrategyPanel({
  symbols,
  activeSymbol,
  onSymbolChange,
}: StrategyPanelProps) {
  const { settings, updateSettings } = useBotSettings();
  
  const triggerMode = settings.triggerMode;
  const targetDigit = settings.targetDigit;
  const repetitions = settings.streakLength;
  const stake = settings.stake;

  const setTriggerMode = (val: TriggerMode) => updateSettings({ triggerMode: val });
  const setTargetDigit = (val: number) => updateSettings({ targetDigit: val });
  const setRepetitions = (val: number) => updateSettings({ streakLength: val });
  const setStake = (val: number) => updateSettings({ stake: val });

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
        Strategy
      </h2>

      {/* Trigger Mode */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Trigger Mode
        </Label>
        <Select
          value={triggerMode}
          onValueChange={(value) => setTriggerMode(value as TriggerMode)}
        >
          <SelectTrigger className="w-full bg-transparent border-border">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(triggerModeLabels) as TriggerMode[]).map((mode) => (
              <SelectItem key={mode} value={mode}>
                {triggerModeLabels[mode]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
          {triggerModeDescriptions[triggerMode]}
        </p>
      </div>

      {/* Target Digit & Repetitions */}
      <div className="flex items-start gap-3">
        {triggerMode === 'SPECIFIC_DIGIT' && (
          <div className="w-1/2 space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Target Digit
            </Label>
            <Select
              value={String(targetDigit)}
              onValueChange={(value) => setTargetDigit(Number(value))}
            >
              <SelectTrigger className="w-full bg-transparent border-border">
                <SelectValue placeholder="Digit" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div
          className={`space-y-2 ${
            triggerMode === 'SPECIFIC_DIGIT' ? 'w-1/2' : 'w-full'
          }`}
        >
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Repetitions
          </Label>
          <Input
            type="number"
            min={1}
            value={repetitions}
            onChange={(e) => setRepetitions(Number(e.target.value))}
            className="bg-transparent border-border"
          />
        </div>
      </div>

      {/* Stake */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Stake (USD)
        </Label>
        <Input
          type="number"
          min={0.01}
          step={0.01}
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          className="bg-transparent border-border"
        />
      </div>

      {/* Symbol Selector */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Symbol
        </Label>
        <SymbolSelector
          symbols={symbols}
          activeSymbol={activeSymbol}
          onSymbolChange={onSymbolChange}
        />
      </div>
    </div>
  );
}
