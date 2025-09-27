import React, { useState } from 'react';
import { TradeProvider, useTradeContext } from './context/TradeContext';
import { useFileUpload } from './hooks/useFileUpload';
import TradeDetails from './components/TradeDetails';
import Journal from './components/Journal';
import Analytics from './components/Analytics';
import Dashboard from './components/Dashboard';
import CalendarPage from './components/CalendarPage';
import ErrorBoundary from './components/ErrorBoundary';
import DebugInfo from './components/DebugInfo';
import TopNav from './components/TopNav';
import Settings from './components/Settings';
import { Trade, JournalEntry } from './types/trade';

const AppContent: React.FC = () => {
  const { state, addTrades, selectTrade, updateTrade, clearTrades } = useTradeContext();
  const { isUploading, progress, error, uploadFiles, reset } = useFileUpload();
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'journal' | 'analytics' | 'settings'>('dashboard');

  // Debug logging
  console.log('App state:', { 
    tradesCount: state.trades.length, 
    selectedTrade: state.selectedTrade?.ticket,
    activeView 
  });

  const handleFileUpload = async (files: FileList) => {
    try {
      reset();
      const trades = await uploadFiles(files);
      addTrades(trades);
      setActiveView('settings');
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  const handleExportTrades = () => {
    if (state.trades.length === 0) {
      alert('No trades to export');
      return;
    }

    const csvContent = [
      // CSV headers
      'Ticket,Symbol,Type,Lot Size,Open Time,Entry Price,Close Time,Close Price,Stop Loss,Take Profit,Profit,Pips,Duration (sec),Commission,Swap,Taxes,Strategy,Mood,Tags',
      // CSV data
      ...state.trades.map(trade => [
        trade.ticket,
        trade.symbol,
        trade.type,
        trade.lot_size,
        trade.open_time,
        trade.entry_price,
        trade.close_time || '',
        trade.close_price || '',
        trade.stop_loss || '',
        trade.take_profit || '',
        trade.profit,
        trade.pips || '',
        trade.duration_seconds || '',
        trade.commission,
        trade.swap,
        trade.taxes,
        trade.journal?.strategy || '',
        trade.journal?.mood?.tags?.join(';') || '',
        trade.journal?.tags?.join(';') || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_journal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearTrades = () => {
    if (confirm('Are you sure you want to delete all trades and journal entries? This action cannot be undone.')) {
      clearTrades();
    }
  };

  const handleSaveJournal = (journal: JournalEntry) => {
    if (!state.selectedTrade) return;

    const updatedTrade: Trade = {
      ...state.selectedTrade,
      journal
    };

    updateTrade(updatedTrade);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <TopNav
        activeView={activeView}
        onChangeView={setActiveView}
        onUploadFiles={handleFileUpload}
        isUploading={isUploading}
        progress={progress}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'calendar' && (
          <CalendarPage />
        )}
        {activeView === 'journal' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Trade Details</h2>
              <TradeDetails trade={state.selectedTrade} />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Journal Entry</h2>
              <Journal trade={state.selectedTrade} onSaveJournal={handleSaveJournal} />
            </div>
          </div>
        )}
        {activeView === 'analytics' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <Analytics stats={state.stats} moodStats={state.moodStats} />
          </div>
        )}
        {activeView === 'settings' && (
          <Settings isUploading={isUploading} progress={progress} error={error} onFileUpload={handleFileUpload} />
        )}
      </div>
      <DebugInfo />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <TradeProvider>
        <AppContent />
      </TradeProvider>
    </ErrorBoundary>
  );
}

export default App;
