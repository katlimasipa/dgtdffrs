import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRecentTrades, TradeRecord } from '@/lib/store/trade-history-db';

export function TradeHistoryTable() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // Periodically fetch trades. In a real app we'd trigger this on a buyResult event.
  useEffect(() => {
    const fetchTrades = async () => {
      const data = await getRecentTrades(20);
      setTrades(data);
    };
    fetchTrades();
    const interval = setInterval(fetchTrades, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card border-border shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">Recent Bot Executions</CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No trades recorded in this session.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Time</TableHead>
                  <TableHead className="text-muted-foreground">Pattern</TableHead>
                  <TableHead className="text-muted-foreground">Stake</TableHead>
                  <TableHead className="text-right text-muted-foreground">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, i) => (
                  <TableRow key={trade.id || i} className="border-border hover:bg-muted/50">
                    <TableCell>{new Date(trade.timestamp).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded-md text-xs font-medium">
                        {trade.triggerMode.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>${trade.stake.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {trade.result === 'pending' ? (
                        <span className="text-yellow-500 font-medium">Pending...</span>
                      ) : (
                        <span className={trade.profit >= 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
