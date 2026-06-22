import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBotSettings, TriggerMode } from '@/lib/store/bot-settings-store';

export function PatternSettings() {
  const { settings, updateSettings } = useBotSettings();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-card border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Strategy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Trigger Mode</Label>
            <Select 
              value={settings.triggerMode} 
              onValueChange={(val: TriggerMode) => updateSettings({ triggerMode: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trigger mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EVEN_STREAK">Even Streak</SelectItem>
                <SelectItem value="ODD_STREAK">Odd Streak</SelectItem>
                <SelectItem value="ANY_DIGIT">Any Digit Streak</SelectItem>
                <SelectItem value="SPECIFIC_DIGIT">Specific Digit Streak</SelectItem>
                <SelectItem value="XXYYY">XXYYY Pattern</SelectItem>
                <SelectItem value="XXXYY">XXXYY Pattern</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Streak Length</Label>
              <Input 
                type="number" 
                min={2} max={10} 
                value={settings.streakLength} 
                onChange={e => updateSettings({ streakLength: Number(e.target.value) })}
              />
            </div>
            {settings.triggerMode === 'SPECIFIC_DIGIT' && (
              <div className="space-y-2">
                <Label>Target Digit</Label>
                <Input 
                  type="number" 
                  min={0} max={9} 
                  value={settings.targetDigit} 
                  onChange={e => updateSettings({ targetDigit: Number(e.target.value) })}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Risk Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stake Amount ($)</Label>
              <Input 
                type="number" 
                min={0.35} step={0.5} 
                value={settings.stake} 
                onChange={e => updateSettings({ stake: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cooldown (Sec)</Label>
              <Input 
                type="number" 
                min={0} 
                value={settings.cooldownSeconds} 
                onChange={e => updateSettings({ cooldownSeconds: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Stop Loss ($)</Label>
              <Input 
                type="number" 
                min={0} 
                className="text-red-400"
                value={settings.stopLoss} 
                onChange={e => updateSettings({ stopLoss: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Take Profit ($)</Label>
              <Input 
                type="number" 
                min={0} 
                className="text-green-400"
                value={settings.takeProfit} 
                onChange={e => updateSettings({ takeProfit: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

