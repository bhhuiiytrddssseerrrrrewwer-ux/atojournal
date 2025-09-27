import React from 'react';
import { useTradeContext } from '../context/TradeContext';
import TradeList from './TradeList';
import FileUpload from './FileUpload';

interface SettingsProps {
  isUploading: boolean;
  progress: number;
  error: string | null;
  onFileUpload: (files: FileList) => void;
}

const Settings: React.FC<SettingsProps> = ({ isUploading, progress, error, onFileUpload }) => {
  const { state, selectTrade, clearTrades } = useTradeContext();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="font-medium mb-2">Data Import</h3>
        <FileUpload onFileUpload={onFileUpload} isUploading={isUploading} progress={progress} error={error} />
        <p className="text-sm text-gray-400 mt-2">Trade List becomes visible here during uploads/updates.</p>
      </div>

      {(state.trades.length > 0 || isUploading) && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <TradeList
            trades={state.trades}
            selectedTrade={state.selectedTrade}
            onSelectTrade={selectTrade}
            onExportTrades={() => {}}
            onClearTrades={clearTrades}
            onUpdateTrade={(trade) => {
              // This would need to be passed from parent or use context
              console.log('Update trade:', trade);
            }}
          />
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="font-medium mb-2">Preferences</h3>
        <div className="text-sm text-gray-400">Theme, default filters, and account settings will go here.</div>
      </div>
    </div>
  );
};

export default Settings;


