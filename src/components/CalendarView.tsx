import React, { useMemo, useState } from 'react';
import { useTradeContext } from '../context/TradeContext';
import Modal from './Modal';
import { formatRR, recomputeRRFields } from '../utils/tradeParser';
import TradeRowExpander from './TradeRowExpander';

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const CalendarView: React.FC = () => {
  const { state } = useTradeContext();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const now = new Date();
  const display = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

  const days = useMemo(() => {
    const start = new Date(display.getFullYear(), display.getMonth(), 1);
    const end = new Date(display.getFullYear(), display.getMonth() + 1, 0);
    const map: Record<string, { count: number; pl: number; moods: number[] } > = {};
    state.trades.forEach(t => {
      const d = new Date(t.open_time);
      if (d.getMonth() !== display.getMonth() || d.getFullYear() !== display.getFullYear()) return;
      const key = formatDateKey(d);
      if (!map[key]) map[key] = { count: 0, pl: 0, moods: [] };
      map[key].count += 1;
      map[key].pl += t.profit;
      if (t.journal?.mood?.scale !== undefined && t.journal?.mood?.scale !== null) {
        map[key].moods.push(t.journal.mood.scale || 0);
      }
    });
    const arr: Array<{ date: Date; key: string; count: number; pl: number; moodAvg: number | null }> = [];
    for (let i = 1; i <= end.getDate(); i++) {
      const d = new Date(display.getFullYear(), display.getMonth(), i);
      const key = formatDateKey(d);
      const v = map[key];
      const moodAvg = v && v.moods.length ? v.moods.reduce((a, b) => a + b, 0) / v.moods.length : null;
      arr.push({ date: d, key, count: v?.count || 0, pl: v?.pl || 0, moodAvg });
    }
    return arr;
  }, [display, state.trades]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <button className="text-sm text-gray-300 hover:text-white" onClick={() => setMonthOffset(m => m - 1)}>Prev</button>
        <div className="text-sm font-medium text-gray-200">{display.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button className="text-sm text-gray-300 hover:text-white" onClick={() => setMonthOffset(m => m + 1)}>Next</button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-700">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="bg-gray-900 text-center text-xs py-1 text-gray-400">{d}</div>
        ))}
        {(() => {
          const first = new Date(display.getFullYear(), display.getMonth(), 1).getDay();
          const blanks = Array.from({ length: first }, (_, i) => <div key={`b-${i}`} className="bg-gray-900" />);
          const cells = days.map(({ key, date, count, pl, moodAvg }) => (
            <button key={key} className="bg-gray-900 p-2 h-24 text-left w-full"
                    onClick={() => setSelectedDayKey(key)}>
              <div className="text-xs text-gray-400">{date.getDate()}</div>
              <div className={`text-xs ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pl === 0 ? '' : `$${pl.toFixed(0)}`}</div>
              <div className="text-[10px] text-gray-400">{count ? `${count} trades` : ''}</div>
              {moodAvg !== null && <div className="text-[10px] text-gray-300">Mood {moodAvg.toFixed(1)}</div>}
            </button>
          ));
          return [...blanks, ...cells];
        })()}
      </div>
      <Modal isOpen={!!selectedDayKey} onClose={() => setSelectedDayKey(null)} title={selectedDayKey || ''}>
        {selectedDayKey && (
          <DayTradesList dayKey={selectedDayKey} />
        )}
      </Modal>
    </div>
  );
};

export default CalendarView;

const DayTradesList: React.FC<{ dayKey: string }> = ({ dayKey }) => {
  const { state, updateTrade } = useTradeContext();
  const trades = useMemo(() => {
    return state.trades.filter(t => t.open_time.startsWith(dayKey));
  }, [state.trades, dayKey]);
  
  return (
    <div>
      <div className="text-sm text-gray-400 mb-2">Trades on {dayKey}: {trades.length}</div>
      <div className="space-y-1">
        {trades.map(trade => (
          <TradeRowExpander
            key={trade.ticket}
            trade={trade}
            onUpdateTrade={updateTrade}
          />
        ))}
        {trades.length === 0 && (
          <div className="px-3 py-6 text-center text-gray-400">No trades for this day.</div>
        )}
      </div>
    </div>
  );
};



