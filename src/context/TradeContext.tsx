import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Trade, TradeStats, MoodStats } from '../types/trade';
import { calculateTradeStats, calculateMoodStats } from '../utils/tradeParser';

interface TradeState {
  trades: Trade[];
  selectedTrade: Trade | null;
  stats: TradeStats;
  moodStats: Record<string, MoodStats>;
  isLoading: boolean;
  error: string | null;
}

type TradeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRADES'; payload: Trade[] }
  | { type: 'ADD_TRADES'; payload: Trade[] }
  | { type: 'SELECT_TRADE'; payload: Trade | null }
  | { type: 'UPDATE_TRADE'; payload: Trade }
  | { type: 'CLEAR_TRADES' };

const initialState: TradeState = {
  trades: [],
  selectedTrade: null,
  stats: {
    totalTrades: 0,
    netPnl: 0,
    winRate: 0,
    profitFactor: 0,
    avgWin: 0,
    avgLoss: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgRR: 0,
    avgDuration: 0,
    bestSymbol: '',
    mostTraded: ''
  },
  moodStats: {},
  isLoading: false,
  error: null
};

function tradeReducer(state: TradeState, action: TradeAction): TradeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_TRADES':
      const newStats = calculateTradeStats(action.payload);
      const newMoodStats = calculateMoodStats(action.payload);
      return {
        ...state,
        trades: action.payload,
        stats: newStats,
        moodStats: newMoodStats,
        isLoading: false,
        error: null
      };
    
    case 'ADD_TRADES':
      const updatedTrades = [...state.trades];
      let duplicateCount = 0;
      
      action.payload.forEach(trade => {
        const existingIndex = updatedTrades.findIndex(existing => existing.ticket === trade.ticket);
        if (existingIndex === -1) {
          updatedTrades.push(trade);
        } else {
          duplicateCount++;
        }
      });
      
      const addedStats = calculateTradeStats(updatedTrades);
      const addedMoodStats = calculateMoodStats(updatedTrades);
      
      return {
        ...state,
        trades: updatedTrades,
        stats: addedStats,
        moodStats: addedMoodStats,
        isLoading: false,
        error: null
      };
    
    case 'SELECT_TRADE':
      return { ...state, selectedTrade: action.payload };
    
    case 'UPDATE_TRADE':
      const updatedTradesList = state.trades.map(trade =>
        trade.ticket === action.payload.ticket ? action.payload : trade
      );
      const updatedStats = calculateTradeStats(updatedTradesList);
      const updatedMoodStats = calculateMoodStats(updatedTradesList);
      
      return {
        ...state,
        trades: updatedTradesList,
        selectedTrade: action.payload,
        stats: updatedStats,
        moodStats: updatedMoodStats
      };
    
    case 'CLEAR_TRADES':
      return {
        ...initialState,
        selectedTrade: null
      };
    
    default:
      return state;
  }
}

interface TradeContextType {
  state: TradeState;
  loadTrades: () => void;
  saveTrades: () => void;
  addTrades: (trades: Trade[]) => void;
  selectTrade: (trade: Trade | null) => void;
  updateTrade: (trade: Trade) => void;
  clearTrades: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const useTradeContext = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTradeContext must be used within a TradeProvider');
  }
  return context;
};

interface TradeProviderProps {
  children: ReactNode;
}

export const TradeProvider: React.FC<TradeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(tradeReducer, initialState);

  const loadTrades = () => {
    try {
      const storedTrades = localStorage.getItem('trades');
      if (storedTrades) {
        const trades = JSON.parse(storedTrades);
        dispatch({ type: 'SET_TRADES', payload: trades });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load trades from storage' });
    }
  };

  const saveTrades = () => {
    try {
      localStorage.setItem('trades', JSON.stringify(state.trades));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save trades to storage' });
    }
  };

  const addTrades = (trades: Trade[]) => {
    dispatch({ type: 'ADD_TRADES', payload: trades });
  };

  const selectTrade = (trade: Trade | null) => {
    console.log('TradeContext: Selecting trade:', trade?.ticket);
    dispatch({ type: 'SELECT_TRADE', payload: trade });
  };

  const updateTrade = (trade: Trade) => {
    dispatch({ type: 'UPDATE_TRADE', payload: trade });
  };

  const clearTrades = () => {
    dispatch({ type: 'CLEAR_TRADES' });
    localStorage.removeItem('trades');
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // Load trades on mount
  useEffect(() => {
    loadTrades();
  }, []);

  // Save trades whenever trades change
  useEffect(() => {
    if (state.trades.length > 0) {
      saveTrades();
    }
  }, [state.trades]);

  const value: TradeContextType = {
    state,
    loadTrades,
    saveTrades,
    addTrades,
    selectTrade,
    updateTrade,
    clearTrades,
    setLoading,
    setError
  };

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
};
