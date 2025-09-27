import React, { useMemo } from 'react';
import { TradeStats, MoodStats } from '../types/trade';
import { formatDuration } from '../utils/tradeParser';
import { useTradeContext } from '../context/TradeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  stats: TradeStats;
  moodStats: Record<string, MoodStats>;
}

const Analytics: React.FC<AnalyticsProps> = ({ stats, moodStats }) => {
  const { state } = useTradeContext();
  
  const sortedMoods = Object.entries(moodStats)
    .sort(([,a], [,b]) => (b.wins / b.count) - (a.wins / a.count))
    .slice(0, 3);

  // Real equity curve from time-sorted trades
  const equityData = useMemo(() => {
    const sortedTrades = [...state.trades].sort((a, b) => 
      new Date(a.open_time).getTime() - new Date(b.open_time).getTime()
    );
    
    let runningBalance = 1000; // Starting balance
    const data = [{ time: 'Start', balance: runningBalance, drawdown: 0 }];
    let peak = runningBalance;
    
    sortedTrades.forEach((trade, index) => {
      runningBalance += trade.profit;
      if (runningBalance > peak) peak = runningBalance;
      const drawdown = peak - runningBalance;
      
      data.push({
        time: new Date(trade.close_time || trade.open_time).toLocaleDateString(),
        balance: runningBalance,
        drawdown: drawdown
      });
    });
    
    return data;
  }, [state.trades]);

  return (
    <div className="p-6 space-y-8">
      {/* Statement Summary Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Trading Statement Summary</h3>
        
        {/* Profit/Loss Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-blue-400">Profit & Loss</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Gross Profit:</span>
                <span className="text-green-400">${stats.grossProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gross Loss:</span>
                <span className="text-red-400">${stats.grossLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="text-gray-300 font-medium">Total Net Profit:</span>
                <span className={`font-medium ${stats.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.netPnl.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit Factor:</span>
                <span className="text-white">{stats.profitFactor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Payoff:</span>
                <span className="text-white">${stats.expectedPayoff.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-red-400">Drawdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Absolute Drawdown:</span>
                <span className="text-red-400">${stats.absoluteDrawdown.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Maximal Drawdown:</span>
                <span className="text-red-400">
                  ${stats.maximalDrawdown.toFixed(2)} ({stats.maximalDrawdownPercent.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Relative Drawdown:</span>
                <span className="text-red-400">
                  {stats.relativeDrawdown.toFixed(2)}% (${stats.relativeDrawdownAmount.toFixed(2)})
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-purple-400">Account Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Balance:</span>
                <span className="text-white">${stats.balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Equity:</span>
                <span className="text-white">${stats.equity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Free Margin:</span>
                <span className="text-white">${stats.freeMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Closed Trade P/L:</span>
                <span className={stats.closedTradesPL >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${stats.closedTradesPL.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trade Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-green-400">Trade Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Trades:</span>
                <span className="text-white">{stats.totalTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Short Positions:</span>
                <span className="text-white">{stats.shortPositions} ({stats.shortWinRate.toFixed(2)}% won)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Long Positions:</span>
                <span className="text-white">{stats.longPositions} ({stats.longWinRate.toFixed(2)}% won)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit Trades:</span>
                <span className="text-green-400">{stats.profitTrades} ({((stats.profitTrades/stats.totalTrades)*100).toFixed(2)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Loss Trades:</span>
                <span className="text-red-400">{stats.lossTrades} ({((stats.lossTrades/stats.totalTrades)*100).toFixed(2)}%)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-yellow-400">Consecutive Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Max Consecutive Wins:</span>
                <span className="text-green-400">{stats.maxConsecutiveWins} (${stats.maxConsecutiveWinsAmount.toFixed(2)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Consecutive Losses:</span>
                <span className="text-red-400">{stats.maxConsecutiveLosses} (${stats.maxConsecutiveLossesAmount.toFixed(2)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Consecutive Wins:</span>
                <span className="text-white">{stats.avgConsecutiveWins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Consecutive Losses:</span>
                <span className="text-white">{stats.avgConsecutiveLosses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Largest Profit Trade:</span>
                <span className="text-green-400">${stats.largestProfitTrade.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Largest Loss Trade:</span>
                <span className="text-red-400">${stats.largestLossTrade.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4">Equity Curve</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4">Drawdown</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Drawdown']}
                />
                <Line
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={false}
                  fill="#f87171"
                  fillOpacity={0.3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mood Analysis */}
      {sortedMoods.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Mood Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedMoods.map(([mood, moodStat]) => {
              const winRate = ((moodStat.wins / moodStat.count) * 100).toFixed(1);
              const avgProfit = (moodStat.profit / moodStat.count).toFixed(2);
              return (
                <div key={mood} className="bg-gray-900 rounded-lg p-4">
                  <h5 className="font-medium text-white capitalize mb-2">{mood}</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trades:</span>
                      <span className="text-white">{moodStat.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="text-white">{winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg P/L:</span>
                      <span className={parseFloat(avgProfit) >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ${avgProfit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;