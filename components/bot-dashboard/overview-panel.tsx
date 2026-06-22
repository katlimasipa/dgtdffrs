import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBotSettings, TriggerMode } from '@/lib/store/bot-settings-store';
import { SessionStats } from '@/lib/engine/risk-manager';

const TRIGGER_DISPLAY_NAMES: Record<TriggerMode, string> = {
  SPECIFIC_DIGIT: 'Specific Digit',
  ANY_DIGIT: 'Any Digit',
  ODD_STREAK: 'Odd Streak',
  EVEN_STREAK: 'Even Streak',
  XXYYY: 'XXYYY Pattern',
  XXXYY: 'XXXYY Pattern',
};

interface OverviewPanelProps {
  stats: SessionStats;
  onReset: () => void;
}

export function OverviewPanel({ stats, onReset }: OverviewPanelProps) {
  const { settings } = useBotSettings();

  const winRate = stats.totalTrades > 0 ? ((stats.winCount / stats.totalTrades) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Session PnL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.sessionPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${stats.sessionPnL.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{winRate}%</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Trades Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTrades} <span className="text-sm font-normal text-muted-foreground">/ {settings.maxTrades}</span></div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Strategy</CardTitle>
            <button 
              onClick={onReset}
              className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-400 transition-colors"
            >
              Reset
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold tracking-tight uppercase truncate">
            {TRIGGER_DISPLAY_NAMES[settings.triggerMode]}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Streak: {settings.streakLength}</p>
        </CardContent>
      </Card>
    </div>
  );
}
