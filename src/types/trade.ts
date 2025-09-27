export interface Trade {
  ticket: string;
  account_id: string;
  symbol: string;
  type:
    | 'buy'
    | 'sell'
    | 'balance'
    | 'deposit'
    | 'withdrawal'
    | 'buy limit'
    | 'sell limit'
    | 'cancelled'
    | 'open'
    | 'pending';
  lot_size: number;
  open_time: string;
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  close_time?: string;
  close_price?: number;
  commission: number;
  taxes: number;
  swap: number;
  profit: number;
  duration_seconds?: number;
  pips?: number;
  risk_reward_ratio?: number;
  planned_risk_reward?: number;
  realized_risk_reward?: number;
  unrealized_profit?: number;
  journal: JournalEntry;
  metadata: TradeMetadata;
  daily_aggregate?: DailyAggregate;
}

export interface JournalEntryMood {
  tags: string[];
  scale?: number;
}

export interface JournalEntry {
  strategy: string;
  mood: JournalEntryMood;
  execution_review: string;
  lessons_learned: string;
  tags: string[];
  screenshots?: string[];
  insights?: string;
}

export interface TradeMetadata {
  imported_at: string;
  source_file: string;
  duplicate_flag: boolean;
  import_history?: string[];
}

export interface TradeStats {
  totalTrades: number;
  netPnl: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  avgRR: number;
  avgDuration: number;
  bestSymbol: string;
  mostTraded: string;
}

export interface MoodStats {
  count: number;
  profit: number;
  wins: number;
}

export interface SymbolStats {
  count: number;
  profit: number;
}

export interface ChartData {
  time: number;
  value: number;
}

export interface ChartMarker {
  time: number;
  position: 'belowBar' | 'aboveBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle';
  text: string;
}

export interface DailyAggregate {
  date: string; // YYYY-MM-DD
  daily_trades: number;
  daily_pl: number;
  daily_mood_avg?: number;
}
