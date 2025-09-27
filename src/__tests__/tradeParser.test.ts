import { parseDateTime, parseTradeType, formatDuration, calculateTradeStats } from '../utils/tradeParser';
import { Trade } from '../types/trade';

describe('tradeParser', () => {
  describe('parseDateTime', () => {
    it('should parse valid date strings', () => {
      expect(parseDateTime('2023-12-01 10:30:00')).toBe('2023-12-01T10:30:00.000Z');
      expect(parseDateTime('2023-12-01')).toBe('2023-12-01T00:00:00.000Z');
    });

    it('should return null for invalid dates', () => {
      expect(parseDateTime('')).toBeNull();
      expect(parseDateTime('-')).toBeNull();
      expect(parseDateTime('invalid')).toBeNull();
    });
  });

  describe('parseTradeType', () => {
    it('should parse buy trades', () => {
      expect(parseTradeType('buy')).toBe('buy');
      expect(parseTradeType('BUY')).toBe('buy');
      expect(parseTradeType('buy limit')).toBe('buy');
    });

    it('should parse sell trades', () => {
      expect(parseTradeType('sell')).toBe('sell');
      expect(parseTradeType('SELL')).toBe('sell');
      expect(parseTradeType('sell limit')).toBe('sell');
    });

    it('should return null for invalid types', () => {
      expect(parseTradeType('')).toBeNull();
      expect(parseTradeType('invalid')).toBeNull();
    });
  });

  describe('formatDuration', () => {
    it('should format duration in hours and minutes', () => {
      expect(formatDuration(3661)).toBe('1h 1m'); // 1 hour 1 minute 1 second
      expect(formatDuration(3600)).toBe('1h 0m'); // 1 hour exactly
      expect(formatDuration(300)).toBe('5m'); // 5 minutes
    });

    it('should handle zero and null values', () => {
      expect(formatDuration(0)).toBe('N/A');
      expect(formatDuration(null as any)).toBe('N/A');
    });
  });

  describe('calculateTradeStats', () => {
    const mockTrades: Trade[] = [
      {
        ticket: '1',
        account_id: '123',
        symbol: 'EURUSD',
        type: 'buy',
        lot_size: 0.1,
        open_time: '2023-12-01T10:00:00Z',
        entry_price: 1.1000,
        close_time: '2023-12-01T11:00:00Z',
        close_price: 1.1050,
        commission: 0,
        taxes: 0,
        swap: 0,
        profit: 50,
        duration_seconds: 3600,
        pips: 50,
        risk_reward_ratio: 1.5,
        journal: { strategy: '', mood: [], execution_review: '', lessons_learned: '', tags: [] },
        metadata: { imported_at: '2023-12-01T10:00:00Z', source_file: 'test.html', duplicate_flag: false }
      },
      {
        ticket: '2',
        account_id: '123',
        symbol: 'EURUSD',
        type: 'sell',
        lot_size: 0.1,
        open_time: '2023-12-01T12:00:00Z',
        close_time: '2023-12-01T13:00:00Z',
        close_price: 1.0950,
        commission: 0,
        taxes: 0,
        swap: 0,
        profit: -25,
        duration_seconds: 3600,
        pips: -25,
        risk_reward_ratio: 0.5,
        journal: { strategy: '', mood: [], execution_review: '', lessons_learned: '', tags: [] },
        metadata: { imported_at: '2023-12-01T12:00:00Z', source_file: 'test.html', duplicate_flag: false }
      }
    ];

    it('should calculate correct statistics', () => {
      const stats = calculateTradeStats(mockTrades);
      
      expect(stats.totalTrades).toBe(2);
      expect(stats.netPnl).toBe(25); // 50 - 25
      expect(stats.winRate).toBe(50); // 1 win out of 2 trades
      expect(stats.profitFactor).toBe(2); // 50 / 25
      expect(stats.avgWin).toBe(50);
      expect(stats.avgLoss).toBe(25);
      expect(stats.bestTrade).toBe(50);
      expect(stats.worstTrade).toBe(-25);
    });

    it('should handle empty trades array', () => {
      const stats = calculateTradeStats([]);
      
      expect(stats.totalTrades).toBe(0);
      expect(stats.netPnl).toBe(0);
      expect(stats.winRate).toBe(0);
    });
  });
});
