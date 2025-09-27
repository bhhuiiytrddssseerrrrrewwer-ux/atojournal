import React, { useState } from 'react';
import { Trade, JournalEntry } from '../types/trade';
import { ChevronDown, ChevronRight, CreditCard as Edit3, Save, X } from 'lucide-react';
import { formatDuration, formatRR } from '../utils/tradeParser';

interface TradeRowExpanderProps {
  trade: Trade;
  onUpdateTrade: (trade: Trade) => void;
}

const TradeRowExpander: React.FC<TradeRowExpanderProps> = ({ trade, onUpdateTrade }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJournal, setEditedJournal] = useState<JournalEntry>(trade.journal);

  const handleSaveJournal = () => {
    const updatedTrade: Trade = {
      ...trade,
      journal: editedJournal
    };
    onUpdateTrade(updatedTrade);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedJournal(trade.journal);
    setIsEditing(false);
  };

  const toggleMood = (mood: string) => {
    setEditedJournal(prev => ({
      ...prev,
      mood: {
        ...prev.mood,
        tags: prev.mood.tags.includes(mood)
          ? prev.mood.tags.filter(m => m !== mood)
          : [...prev.mood.tags, mood]
      }
    }));
  };

  const MOOD_OPTIONS = ['confident', 'anxious', 'greedy', 'fearful', 'patient', 'impatient', 'disciplined', 'fomo'];

  return (
    <div className="border-b border-gray-700">
      {/* Main Trade Row */}
      <div className="flex items-center p-3 hover:bg-gray-700 transition-colors">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mr-3 text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        <div className="grid grid-cols-12 gap-2 text-sm flex-1">
          <div className="col-span-3 text-white">
            {new Date(trade.close_time || trade.open_time).toLocaleString()}
          </div>
          <div className="col-span-2 font-medium text-white">{trade.symbol}</div>
          <div className="col-span-2">
            <span className={`${trade.type === 'buy' ? 'bg-green-600' : 'bg-red-600'} text-white text-xs px-2 py-1 rounded uppercase`}>
              {trade.type}
            </span>
          </div>
          <div className="col-span-2 text-white">{trade.lot_size}</div>
          <div className={`col-span-3 font-medium ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${trade.profit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-gray-800 border-t border-gray-600">
          <div className="p-4 space-y-4">
            {/* Trade Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-medium text-blue-400">Entry Details</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ticket:</span>
                    <span className="text-white">{trade.ticket}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Price:</span>
                    <span className="text-white">{trade.entry_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Open Time:</span>
                    <span className="text-white">{new Date(trade.open_time).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-red-400">Exit Details</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Close Price:</span>
                    <span className="text-white">{trade.close_price || 'Open'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Close Time:</span>
                    <span className="text-white">
                      {trade.close_time ? new Date(trade.close_time).toLocaleString() : 'Open'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{formatDuration(trade.duration_seconds || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-yellow-400">Risk Management</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-white">{trade.stop_loss || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-white">{trade.take_profit || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Planned R:R:</span>
                    <span className="text-white">{formatRR(trade.planned_risk_reward)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-green-400">Performance</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pips:</span>
                    <span className={`${(trade.pips || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pips?.toFixed(1) || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Realized R:R:</span>
                    <span className="text-white">{formatRR(trade.realized_risk_reward)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commission:</span>
                    <span className="text-white">${trade.commission.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Journal Section */}
            <div className="border-t border-gray-600 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-purple-400">Journal Entry</h5>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveJournal}
                      className="flex items-center space-x-1 text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Save size={14} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  {/* Strategy */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Strategy</label>
                    <textarea
                      value={editedJournal.strategy}
                      onChange={(e) => setEditedJournal(prev => ({ ...prev, strategy: e.target.value }))}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                      placeholder="Trade setup and strategy..."
                    />
                  </div>

                  {/* Mood */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Mood</label>
                    <div className="flex flex-wrap gap-1">
                      {MOOD_OPTIONS.map(mood => (
                        <button
                          key={mood}
                          onClick={() => toggleMood(mood)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            editedJournal.mood.tags.includes(mood)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Execution Review */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Execution Review</label>
                    <textarea
                      value={editedJournal.execution_review}
                      onChange={(e) => setEditedJournal(prev => ({ ...prev, execution_review: e.target.value }))}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                      placeholder="How was the execution?"
                    />
                  </div>

                  {/* Lessons Learned */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Lessons Learned</label>
                    <textarea
                      value={editedJournal.lessons_learned}
                      onChange={(e) => setEditedJournal(prev => ({ ...prev, lessons_learned: e.target.value }))}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                      placeholder="Key takeaways..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {trade.journal.strategy && (
                    <div>
                      <span className="text-gray-400">Strategy: </span>
                      <span className="text-white">{trade.journal.strategy}</span>
                    </div>
                  )}
                  {trade.journal.mood.tags.length > 0 && (
                    <div>
                      <span className="text-gray-400">Mood: </span>
                      <span className="text-white">{trade.journal.mood.tags.join(', ')}</span>
                    </div>
                  )}
                  {trade.journal.execution_review && (
                    <div>
                      <span className="text-gray-400">Execution: </span>
                      <span className="text-white">{trade.journal.execution_review}</span>
                    </div>
                  )}
                  {trade.journal.lessons_learned && (
                    <div>
                      <span className="text-gray-400">Lessons: </span>
                      <span className="text-white">{trade.journal.lessons_learned}</span>
                    </div>
                  )}
                  {(!trade.journal.strategy && !trade.journal.mood.tags.length && 
                    !trade.journal.execution_review && !trade.journal.lessons_learned) && (
                    <div className="text-gray-500 italic">No journal entry yet. Click Edit to add one.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeRowExpander;