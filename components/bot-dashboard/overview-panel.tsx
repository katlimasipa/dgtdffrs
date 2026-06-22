import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBotSettings } from '@/lib/store/bot-settings-store';
import { SessionStats } from '@/lib/engine/risk-manager';

interface OverviewPanelProps {
  stats: SessionStats;
}

export function OverviewPanel({ stats }: OverviewPanelProps) {
  const { settings } = useBotSettings();

  const winRate = stats.totalTrades > 0 ? ((stats.winCount / stats.totalTrades) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Session PnL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.sessionPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
            ${stats.sessionPnL.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{winRate}%</div>
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
          <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Current Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold tracking-tight uppercase truncate">{settings.triggerMode.replace('_', ' ')}</div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Streak: {settings.streakLength}</p>
        </CardContent>
      </Card>
    </div>
  );
}
