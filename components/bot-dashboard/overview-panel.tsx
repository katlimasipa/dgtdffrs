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
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Session PnL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.sessionPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${stats.sessionPnL.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{winRate}%</div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Trades Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTrades} <span className="text-sm font-normal text-muted-foreground">/ {settings.maxTrades}</span></div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold truncate">{settings.triggerMode.replace('_', ' ')}</div>
          <p className="text-xs text-muted-foreground">Streak: {settings.streakLength}</p>
        </CardContent>
      </Card>
    </div>
  );
}
