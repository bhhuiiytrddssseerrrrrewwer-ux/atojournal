import React, { useMemo, useState } from 'react';
import { useTradeContext } from '../context/TradeContext';

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SymbolMiniCalendar: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { state } = useTradeContext();
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const display = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

  const days = useMemo(() => {
    const end = new Date(display.getFullYear(), display.getMonth() + 1, 0);
    const map: Record<string, { count: number; pl: number }> = {};
    state.trades.forEach(t => {
      if (t.symbol !== symbol) return;
      const d = new Date(t.open_time);
      if (d.getMonth() !== display.getMonth() || d.getFullYear() !== display.getFullYear()) return;
      const key = dateKey(d);
      if (!map[key]) map[key] = { count: 0, pl: 0 };
      map[key].count += 1;
      map[key].pl += t.profit;
    });
    const arr: Array<{ key: string; d: Date; count: number; pl: number }> = [];
    for (let i = 1; i <= end.getDate(); i++) {
      const d = new Date(display.getFullYear(), display.getMonth(), i);
      const key = dateKey(d);
      const v = map[key];
      arr.push({ key, d, count: v?.count || 0, pl: v?.pl || 0 });
    }
    return arr;
  }, [display, state.trades, symbol]);

  const firstDay = new Date(display.getFullYear(), display.getMonth(), 1).getDay();

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-700 text-xs">
        <button className="text-gray-300 hover:text-white" onClick={() => setMonthOffset(m => m - 1)}>Prev</button>
        <div className="text-gray-200">{display.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button className="text-gray-300 hover:text-white" onClick={() => setMonthOffset(m => m + 1)}>Next</button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-700">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="bg-gray-900 text-center text-[10px] py-1 text-gray-400">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`b-${i}`} className="bg-gray-900" />
        ))}
        {days.map(({ key, d, count, pl }) => (
          <div key={key} className="bg-gray-900 p-1 h-16">
            <div className="text-[10px] text-gray-400">{d.getDate()}</div>
            <div className={`text-[10px] ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pl === 0 ? '' : `$${pl.toFixed(0)}`}</div>
            <div className="text-[9px] text-gray-500">{count ? `${count}` : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SymbolMiniCalendar;


