import React, { useMemo } from 'react';
import { useTradeContext } from '../context/TradeContext';
import { formatRR } from '../utils/tradeParser';

const numberFmt = (n: number) => {
  if (n === undefined || n === null || isNaN(n as unknown as number)) return '0';
  return n.toFixed(2);
};

const percentFmt = (n: number) => `${(n || 0).toFixed(1)}%`;

const Dashboard: React.FC = () => {
  const { state } = useTradeContext();

  const symbolRows = useMemo(() => {
    const bySymbol: Record<string, { count: number; pnl: number; wins: number; rrSum: number; rrCount: number } > = {};
    state.trades.forEach(t => {
      if (!bySymbol[t.symbol]) bySymbol[t.symbol] = { count: 0, pnl: 0, wins: 0, rrSum: 0, rrCount: 0 };
      const s = bySymbol[t.symbol];
      s.count += 1;
      s.pnl += t.profit;
      if (t.profit > 0) s.wins += 1;
      if (t.risk_reward_ratio !== undefined && t.risk_reward_ratio !== null) {
        s.rrSum += t.risk_reward_ratio;
        s.rrCount += 1;
      }
    });
    return Object.entries(bySymbol).map(([symbol, v]) => ({
      symbol,
      trades: v.count,
      pnl: v.pnl,
      winRate: v.count ? (v.wins / v.count) * 100 : 0,
      avgRR: v.rrCount ? v.rrSum / v.rrCount : 0
    })).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
  }, [state.trades]);

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Net P&L</div>
          <div className={`text-2xl font-semibold ${state.stats.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>${numberFmt(state.stats.netPnl)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Win Rate</div>
          <div className="text-2xl font-semibold">{percentFmt(state.stats.winRate)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Profit Factor</div>
          <div className="text-2xl font-semibold">{numberFmt(state.stats.profitFactor)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Avg R:R</div>
          <div className="text-2xl font-semibold">{numberFmt(state.stats.avgRR)}</div>
        </div>
      </div>

      {/* Per-Symbol Summary Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Symbols</h2>
          <div className="text-sm text-gray-400">Total Trades: {state.stats.totalTrades}</div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="text-left px-4 py-2">Symbol</th>
                <th className="text-right px-4 py-2">Trades</th>
                <th className="text-right px-4 py-2">Net P&L</th>
                <th className="text-right px-4 py-2">Win Rate</th>
                <th className="text-right px-4 py-2">Avg R:R</th>
              </tr>
            </thead>
            <tbody>
              {symbolRows.map(row => (
                <SymbolRow key={row.symbol} row={row} />
              ))}
              {symbolRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No data yet. Import trades to see your dashboard.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity (placeholder for expanded cards) */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <div className="text-sm text-gray-400">Recent trades section will be expanded here.</div>
      </div>
    </div>
  );
};

export default Dashboard;

const SymbolRow: React.FC<{ row: { symbol: string; trades: number; pnl: number; winRate: number; avgRR: number } }> = ({ row }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <tr className="odd:bg-gray-900 even:bg-gray-800 hover:bg-gray-700/50 cursor-pointer" onClick={() => setOpen(true)}>
        <td className="px-4 py-2 font-medium">{row.symbol}</td>
        <td className="px-4 py-2 text-right">{row.trades}</td>
        <td className={`px-4 py-2 text-right ${row.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>${numberFmt(row.pnl)}</td>
        <td className="px-4 py-2 text-right">{percentFmt(row.winRate)}</td>
        <td className="px-4 py-2 text-right">{numberFmt(row.avgRR)}</td>
      </tr>
      <SymbolModal symbol={row.symbol} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

import Modal from './Modal';
import TradeRowExpander from './TradeRowExpander';
const SymbolModal: React.FC<{ symbol: string; open: boolean; onClose: () => void }> = ({ symbol, open, onClose }) => {
  const { state, updateTrade } = useTradeContext();
  const trades = React.useMemo(() => state.trades.filter(t => t.symbol === symbol), [state.trades, symbol]);
  const byDay = React.useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach(t => {
      const key = (t.open_time || '').slice(0, 10);
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [trades]);
  return (
    <Modal isOpen={open} onClose={onClose} title={`Trades for ${symbol}`}>
      <div className="mb-4 text-sm text-gray-400">Total Trades: {trades.length}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-gray-700 rounded-lg">
          <div className="space-y-1">
            {trades.map(trade => (
              <TradeRowExpander
                key={trade.ticket}
                trade={trade}
                onUpdateTrade={updateTrade}
              />
            ))}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
          <div className="font-medium mb-2">Activity by Day</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(byDay).map(([day, count]) => (
              <div key={day} className="flex items-center justify-between bg-gray-900 rounded px-2 py-1 text-sm">
                <span>{day}</span>
                <span className="text-gray-300">{count} trades</span>
              </div>
            ))}
            {Object.keys(byDay).length === 0 && <div className="text-sm text-gray-400">No activity</div>}
          </div>
        </div>
      </div>
    </Modal>
  );
};


