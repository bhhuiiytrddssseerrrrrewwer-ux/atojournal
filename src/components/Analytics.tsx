import React, { useMemo } from 'react';
import { TradeStats, MoodStats } from '../types/trade';
import { formatDuration } from '../utils/tradeParser';

interface AnalyticsProps {
  stats: TradeStats;
  moodStats: Record<string, MoodStats>;
}

const Analytics: React.FC<AnalyticsProps> = ({ stats, moodStats }) => {
  const sortedMoods = Object.entries(moodStats)
    .sort(([,a], [,b]) => (b.wins / b.count) - (a.wins / a.count))
    .slice(0, 3);

  // Equity curve and drawdown (cumulative P&L)
  const { equityPoints, maxDrawdown, drawdownSeries } = useMemo(() => {
    // We don't have raw trades here; rely on window state via a global context import avoided.
    // Instead, derive placeholder arrays from stats for visualization stub.
    // In a fuller impl, pass trades to Analytics and compute from time-sorted profits.
    const equityPoints: number[] = [];
    const drawdownSeries: number[] = [];
    let cumulative = 0;
    let peak = 0;
    // create a simple synthetic progression with 50 steps toward netPnl
    const steps = 50;
    for (let i = 0; i < steps; i++) {
      const inc = stats.netPnl / steps;
      cumulative += inc;
      if (cumulative > peak) peak = cumulative;
      const dd = peak - cumulative;
      equityPoints.push(cumulative);
      drawdownSeries.push(dd);
    }
    const maxDrawdown = Math.max(0, ...drawdownSeries);
    return { equityPoints, maxDrawdown, drawdownSeries };
  }, [stats.netPnl]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Performance Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Trades:</span>
              <span className="text-white">{stats.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate:</span>
              <span className="text-white">{stats.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Factor:</span>
              <span className="text-white">{stats.profitFactor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Win:</span>
              <span className="text-white">${stats.avgWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Loss:</span>
              <span className="text-white">${stats.avgLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Best Trade:</span>
              <span className="text-green-400">${stats.bestTrade.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Worst Trade:</span>
              <span className="text-red-400">${stats.worstTrade.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Trading Insights</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg R:R Ratio:</span>
              <span className="text-white">{stats.avgRR.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Duration:</span>
              <span className="text-white">{formatDuration(stats.avgDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Best Symbol:</span>
              <span className="text-white">{stats.bestSymbol || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Most Traded:</span>
              <span className="text-white">{stats.mostTraded || '-'}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-2 text-white">Mood Analysis</h5>
            <div className="text-sm text-gray-400">
              {sortedMoods.length === 0 ? (
                <span>No mood data available</span>
              ) : (
                sortedMoods.map(([mood, moodStat]) => {
                  const winRate = ((moodStat.wins / moodStat.count) * 100).toFixed(1);
                  return (
                    <div key={mood} className="flex justify-between mb-1">
                      <span className="capitalize text-gray-300">{mood}:</span>
                      <span className="text-white">
                        {winRate}% ({moodStat.count} trades)
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Equity Curve (synthetic)</h4>
          <MiniLine data={equityPoints} color="#60a5fa" />
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Drawdown (synthetic)</h4>
          <div className="text-sm text-gray-300 mb-2">Max DD: ${maxDrawdown.toFixed(2)}</div>
          <MiniLine data={drawdownSeries} color="#f87171" />
        </div>
      </div>
    </div>
  );
};

export default Analytics;

const MiniLine: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (!data || data.length === 0) return <div className="text-gray-400 text-sm">No data</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm = (v: number) => max === min ? 0.5 : (v - min) / (max - min);
  return (
    <svg viewBox="0 0 100 30" className="w-full h-24">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={data.map((v, i) => `${(i / (data.length - 1)) * 100},${30 - norm(v) * 28 - 1}`).join(' ')}
      />
    </svg>
  );
};
