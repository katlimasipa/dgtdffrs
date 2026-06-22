import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface TradeRecord {
  id?: number;
  contractId: number;
  timestamp: number;
  stake: number;
  result: 'win' | 'loss' | 'pending';
  profit: number;
  triggerMode: string;
  patternDetected: string;
}

interface TradeHistoryDB extends DBSchema {
  trades: {
    key: number;
    value: TradeRecord;
    indexes: { 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<TradeHistoryDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<TradeHistoryDB>('THPDTSMRTTRDR_DB', 1, {
      upgrade(db) {
        const store = db.createObjectStore('trades', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
}

export async function addTradeRecord(trade: Omit<TradeRecord, 'id'>) {
  const db = await getDB();
  if (!db) return;
  return db.add('trades', trade);
}

export async function getRecentTrades(limit: number = 50): Promise<TradeRecord[]> {
  const db = await getDB();
  if (!db) return [];
  // Get all, then sort and slice since idb doesn't easily do descending limit natively
  const all = await db.getAllFromIndex('trades', 'by-timestamp');
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export async function clearHistory() {
  const db = await getDB();
  if (!db) return;
  return db.clear('trades');
}
