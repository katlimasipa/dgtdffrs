import { Play, Square, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BotControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onToggleBot: () => void;
  onPauseBot: () => void;
}

export function BotControls({ isRunning, isPaused, onToggleBot, onPauseBot }: BotControlsProps) {
  return (
    <div className="space-y-3">
      {!isRunning ? (
        <button
          onClick={onToggleBot}
          className="w-full h-10 bg-primary/90 hover:bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <Play className="h-3.5 w-3.5" /> Connect
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onToggleBot}
            className="flex-1 h-10 bg-destructive/90 hover:bg-destructive text-destructive-foreground font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <Square className="h-3.5 w-3.5" /> Stop
          </button>
          <button
            onClick={onPauseBot}
            className="flex-1 h-10 border border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      )}
    </div>
  );
}
