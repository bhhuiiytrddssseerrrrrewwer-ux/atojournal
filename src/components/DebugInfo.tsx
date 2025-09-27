import React from 'react';
import { useTradeContext } from '../context/TradeContext';

const DebugInfo: React.FC = () => {
  const { state } = useTradeContext();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg text-xs text-gray-300 max-w-xs">
      <h4 className="font-bold text-white mb-2">Debug Info</h4>
      <div>Trades: {state.trades.length}</div>
      <div>Selected: {state.selectedTrade?.ticket || 'None'}</div>
      <div>Loading: {state.isLoading ? 'Yes' : 'No'}</div>
      <div>Error: {state.error || 'None'}</div>
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-gray-400 text-xs">Click column headers to sort</div>
      </div>
    </div>
  );
};

export default DebugInfo;
