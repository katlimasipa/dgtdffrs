import { Play, Square, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BotControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onToggleBot: () => void;
  onPauseBot: () => void;
}

export function BotControls({ isRunning, isPaused, onToggleBot, onPauseBot }: BotControlsProps) {
  return (
    <Card className="bg-card border-border shadow-none">
      <CardContent className="flex items-center justify-center gap-4 p-6">
        {!isRunning ? (
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold tracking-wide"
            onClick={onToggleBot}
          >
            <Play className="mr-2 h-5 w-5" /> Start Trading Bot
          </Button>
        ) : (
          <>
            <Button 
              size="lg" 
              variant="destructive"
              className="w-full sm:w-auto font-bold tracking-wide shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              onClick={onToggleBot}
            >
              <Square className="mr-2 h-5 w-5" /> Stop Bot
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="w-full sm:w-auto font-bold tracking-wide bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/50"
              onClick={onPauseBot}
            >
              {isPaused ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
