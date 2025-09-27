import React, { useState, useEffect } from 'react';
import { Trade, JournalEntry } from '../types/trade';
import { Save, X } from 'lucide-react';

interface JournalProps {
  trade: Trade | null;
  onSaveJournal: (journal: JournalEntry) => void;
}

const MOOD_OPTIONS = [
  'confident', 'anxious', 'greedy', 'fearful', 
  'patient', 'impatient', 'disciplined', 'fomo'
];

const Journal: React.FC<JournalProps> = ({ trade, onSaveJournal }) => {
  const [strategy, setStrategy] = useState('');
  const [mood, setMood] = useState<string[]>([]);
  const [executionReview, setExecutionReview] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Load journal data when trade changes
  useEffect(() => {
    if (trade?.journal) {
      setStrategy(trade.journal.strategy || '');
      setMood(trade.journal.mood || []);
      setExecutionReview(trade.journal.execution_review || '');
      setLessonsLearned(trade.journal.lessons_learned || '');
      setTags(trade.journal.tags || []);
    } else {
      // Reset form when no trade is selected
      setStrategy('');
      setMood([]);
      setExecutionReview('');
      setLessonsLearned('');
      setTags([]);
    }
  }, [trade]);

  const handleMoodToggle = (moodOption: string) => {
    setMood(prev => 
      prev.includes(moodOption) 
        ? prev.filter(m => m !== moodOption)
        : [...prev, moodOption]
    );
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (!trade) return;

    const journalData: JournalEntry = {
      strategy,
      mood,
      execution_review: executionReview,
      lessons_learned: lessonsLearned,
      tags
    };

    onSaveJournal(journalData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!trade) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Select a trade to add journal entry</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Strategy & Setup
        </label>
        <textarea
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          placeholder="Describe your trade setup, confluence factors, and strategy used..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mood & Emotions
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((moodOption) => (
            <span
              key={moodOption}
              onClick={() => handleMoodToggle(moodOption)}
              className={`mood-tag cursor-pointer transition-colors ${
                mood.includes(moodOption)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Execution Review
        </label>
        <textarea
          value={executionReview}
          onChange={(e) => setExecutionReview(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          placeholder="Analyze your entry, exit, and trade management..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Lessons Learned
        </label>
        <textarea
          value={lessonsLearned}
          onChange={(e) => setLessonsLearned(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          placeholder="What went right? What could be improved?"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-300"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="Add tags (press Enter to add)..."
          />
          <button
            onClick={handleAddTag}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={isSaved}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
          isSaved
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Save size={20} />
        <span>{isSaved ? 'Saved!' : 'Save Journal Entry'}</span>
      </button>
    </div>
  );
};

export default Journal;
