import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LiveTickMonitorProps {
  tickBuffer: number[];
}

export function LiveTickMonitor({ tickBuffer }: LiveTickMonitorProps) {
  return (
    <Card className="bg-card border-border shadow-none overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Tick Stream
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end h-20 gap-2 overflow-hidden border-b border-border pb-4">
          <AnimatePresence mode="popLayout">
            {tickBuffer.map((digit, index) => (
              <motion.div
                key={`${index}-${digit}`}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`flex items-center justify-center w-12 h-12 rounded-lg text-xl font-bold shadow-md
                  ${digit % 2 === 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}
                `}
              >
                {digit}
              </motion.div>
            ))}
          </AnimatePresence>
          {tickBuffer.length === 0 && (
            <div className="text-muted-foreground w-full text-center">Waiting for ticks...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
