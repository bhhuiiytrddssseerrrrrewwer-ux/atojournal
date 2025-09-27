# Trade Data Model

This document describes the core types and their semantics.

## Trade
```ts
interface Trade {
  ticket: string;                 // Unique trade identifier (used for deduplication)
  account_id: string;             // Extracted from statement header
  symbol: string;                 // Normalized to upper-case alphanumerics
  type: 'buy' | 'sell';
  lot_size: number;
  open_time: string;              // ISO string
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  close_time?: string;            // ISO string
  close_price?: number;
  commission: number;
  taxes: number;
  swap: number;
  profit: number;                 // As reported by statement
  duration_seconds?: number;      // Derived if close_time present
  pips?: number;                  // Derived; JPY pip size = 0.01 else 0.0001
  risk_reward_ratio?: number;     // Derived if SL/TP both present
  journal: JournalEntry;
  metadata: TradeMetadata;
}
```

## JournalEntry
```ts
interface JournalEntry {
  strategy: string;               // Free-text notes
  mood: string[];                 // Tags like "calm", "anxious"
  execution_review: string;       // What went well/poorly
  lessons_learned: string;        // Actionable insights
  tags: string[];                 // Custom labels
}
```

## TradeMetadata
```ts
interface TradeMetadata {
  imported_at: string;            // ISO timestamp of import
  source_file: string;            // File name
  duplicate_flag: boolean;        // For UI surfacing if needed
}
```

## Aggregate Stats
```ts
interface TradeStats {
  totalTrades: number;
  netPnl: number;                 // Sum of `profit`
  winRate: number;                // % trades with profit > 0
  profitFactor: number;           // totalProfit / abs(totalLoss)
  avgWin: number;
  avgLoss: number;
  bestTrade: number;              // Max profit
  worstTrade: number;             // Min profit
  avgRR: number;                  // Avg of available R:R values
  avgDuration: number;            // Seconds
  bestSymbol: string;             // By profit
  mostTraded: string;             // By count
}
```

## Storage
- Persisted to `localStorage` under key `trades`
- Entire array serialized; updates overwrite stored value

## Invariants
- `ticket` is unique across a given import source; duplicates ignored on add
- Missing `close_time` leads to `duration_seconds` omitted
- `risk_reward_ratio` computed only if both `stop_loss` and `take_profit` present


