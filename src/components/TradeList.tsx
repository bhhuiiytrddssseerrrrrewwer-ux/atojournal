import React, { useState } from 'react';
import { Trade } from '../types/trade';
import { ChevronUp, ChevronDown } from 'lucide-react';
import TradeRowExpander from './TradeRowExpander';

interface TradeListProps {
  trades: Trade[];
  selectedTrade: Trade | null;
  onSelectTrade: (trade: Trade) => void;
  onExportTrades: () => void;
  onClearTrades: () => void;
  onUpdateTrade: (trade: Trade) => void;
}

type SortField = 'date' | 'symbol' | 'type' | 'size' | 'profit';
type SortDirection = 'asc' | 'desc';

const TradeList: React.FC<TradeListProps> = ({
  trades,
  selectedTrade,
  onSelectTrade,
  onExportTrades,
  onClearTrades,
  onUpdateTrade
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Set default sort direction based on field type
      if (field === 'date' || field === 'profit') {
        setSortDirection('desc'); // Most recent first, highest profit first
      } else {
        setSortDirection('asc'); // Alphabetical for text fields
      }
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'date':
        const dateA = new Date(a.close_time || a.open_time);
        const dateB = new Date(b.close_time || b.open_time);
        comparison = dateA.getTime() - dateB.getTime();
        break;
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'size':
        comparison = a.lot_size - b.lot_size;
        break;
      case 'profit':
        comparison = a.profit - b.profit;
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Trades</h3>
          <div className="flex space-x-2">
            <button
              onClick={onExportTrades}
              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors text-white"
            >
              Export
            </button>
            <button
              onClick={onClearTrades}
              className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors text-white"
            >
              Clear All
            </button>
          </div>
        </div>
        
        {/* Sort Info */}
        <div className="text-xs text-gray-400 mb-2 px-2">
          Click column headers to sort • Click arrow to expand trade details • Currently sorting by: <span className="text-blue-400 font-medium">{sortField}</span> ({sortDirection === 'asc' ? '↑' : '↓'})
        </div>
        
        {/* Table Header */}
        <div className="bg-gray-700 rounded-t-lg p-2 text-sm font-medium grid grid-cols-12 gap-2 text-white">
          <div className="col-span-1"></div>
          <div
            className={`col-span-3 cursor-pointer hover:bg-gray-600 p-1 rounded flex items-center justify-between transition-colors ${
              sortField === 'date' ? 'bg-blue-600' : ''
            }`}
            onClick={() => handleSort('date')}
          >
            <span>Date</span>
            {sortField === 'date' && (
              sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </div>
          <div 
            className={`col-span-2 cursor-pointer hover:bg-gray-600 p-1 rounded flex items-center justify-between transition-colors ${
              sortField === 'symbol' ? 'bg-blue-600' : ''
            }`}
            onClick={() => handleSort('symbol')}
          >
            <span>Symbol</span>
            {sortField === 'symbol' && (
              sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </div>
          <div 
            className={`col-span-2 cursor-pointer hover:bg-gray-600 p-1 rounded flex items-center justify-between transition-colors ${
              sortField === 'type' ? 'bg-blue-600' : ''
            }`}
            onClick={() => handleSort('type')}
          >
            <span>Type</span>
            {sortField === 'type' && (
              sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </div>
          <div 
            className={`col-span-2 cursor-pointer hover:bg-gray-600 p-1 rounded flex items-center justify-between transition-colors ${
              sortField === 'size' ? 'bg-blue-600' : ''
            }`}
            onClick={() => handleSort('size')}
          >
            <span>Size</span>
            {sortField === 'size' && (
              sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </div>
          <div
            className={`col-span-3 cursor-pointer hover:bg-gray-600 p-1 rounded flex items-center justify-between transition-colors ${
              sortField === 'profit' ? 'bg-blue-600' : ''
            }`}
            onClick={() => handleSort('profit')}
          >
            <span>Profit</span>
            {sortField === 'profit' && (
              sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </div>
        </div>
      </div>
      
      {/* Scrollable Trades List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4 min-h-0">
        <div className="bg-gray-750 rounded-b-lg">
          {trades.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No trades imported yet</div>
          ) : (
            sortedTrades.map((trade) => (
              <TradeRowExpander
                key={trade.ticket}
                trade={trade}
                onUpdateTrade={onUpdateTrade}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeList;
