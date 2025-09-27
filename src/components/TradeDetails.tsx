import React from 'react';
import { Trade } from '../types/trade';
import { formatDuration } from '../utils/tradeParser';

interface TradeDetailsProps {
  trade: Trade | null;
}

const TradeDetails: React.FC<TradeDetailsProps> = ({ trade }) => {
  if (!trade) {
    return (
      <div className="p-6">
        <p className="text-gray-500 col-span-2">Select a trade to view details</p>
      </div>
    );
  }

  const openDate = new Date(trade.open_time);
  const closeDate = trade.close_time ? new Date(trade.close_time) : null;

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Ticket:</span>
            <span className="font-medium text-white">{trade.ticket}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Symbol:</span>
            <span className="font-medium text-white">{trade.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Type:</span>
            <span className="font-medium text-white uppercase">{trade.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Lot Size:</span>
            <span className="font-medium text-white">{trade.lot_size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Open Time:</span>
            <span className="font-medium text-white">{openDate.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Entry Price:</span>
            <span className="font-medium text-white">{trade.entry_price}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Close Time:</span>
            <span className="font-medium text-white">
              {closeDate ? closeDate.toLocaleString() : 'Open'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Close Price:</span>
            <span className="font-medium text-white">
              {trade.close_price || 'Open'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Stop Loss:</span>
            <span className="font-medium text-white">
              {trade.stop_loss || 'Not Set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Take Profit:</span>
            <span className="font-medium text-white">
              {trade.take_profit || 'Not Set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Profit:</span>
            <span className={`font-medium ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${trade.profit.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pips:</span>
            <span className={`font-medium ${(trade.pips || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trade.pips || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Duration:</span>
            <span className="font-medium text-white">
              {formatDuration(trade.duration_seconds || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">R:R Ratio:</span>
            <span className="font-medium text-white">
              {trade.risk_reward_ratio ? trade.risk_reward_ratio.toFixed(2) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetails;
