import { Trade, TradeStats, MoodStats, SymbolStats } from '../types/trade';

export const parseDateTime = (dateStr: string): string | null => {
  if (!dateStr || dateStr === '-' || dateStr === '') return null;
  
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

export const parseTradeType = (typeStr: string): 'buy' | 'sell' | null => {
  if (!typeStr) return null;
  
  const type = typeStr.toLowerCase();
  if (type.includes('buy')) return 'buy';
  if (type.includes('sell')) return 'sell';
  return null;
};

export const parseTradeRow = (cells: NodeListOf<Element>, accountId: string, fileName: string): Trade | null => {
  const ticket = cells[0]?.textContent?.trim();
  const openTime = parseDateTime(cells[1]?.textContent?.trim() || '');
  const type = parseTradeType(cells[2]?.textContent?.trim() || '');
  const lotSize = parseFloat(cells[3]?.textContent?.trim() || '0') || 0;
  const symbol = cells[4]?.textContent?.trim().replace(/[^A-Za-z0-9]/g, '').toUpperCase() || '';
  const entryPrice = parseFloat(cells[5]?.textContent?.trim() || '0') || 0;
  const stopLossParsed = parseFloat(cells[6]?.textContent?.trim() || '');
  const stopLoss: number | undefined = isNaN(stopLossParsed) || stopLossParsed === 0 ? undefined : stopLossParsed;
  const takeProfitParsed = parseFloat(cells[7]?.textContent?.trim() || '');
  const takeProfit: number | undefined = isNaN(takeProfitParsed) || takeProfitParsed === 0 ? undefined : takeProfitParsed;
  const closeTimeParsed = parseDateTime(cells[8]?.textContent?.trim() || '');
  const closeTime: string | undefined = closeTimeParsed || undefined;
  const closePrice = parseFloat(cells[9]?.textContent?.trim() || '0') || 0;
  const commission = parseFloat(cells[10]?.textContent?.trim() || '0') || 0;
  const taxes = parseFloat(cells[11]?.textContent?.trim() || '0') || 0;
  const swap = parseFloat(cells[12]?.textContent?.trim() || '0') || 0;
  const profit = parseFloat(cells[13]?.textContent?.trim() || '0') || 0;
  
  if (!ticket || !openTime || !type) return null;
  
  // Calculate duration
  const durationSeconds = closeTime ? Math.round((new Date(closeTime).getTime() - new Date(openTime).getTime()) / 1000) : undefined;
  
  // Calculate pips (simplified - assumes 4/5 digit pricing)
  const pipValue = symbol.includes('JPY') ? 0.01 : 0.0001;
  const pips = type === 'buy' ? 
    (closePrice - entryPrice) / pipValue : 
    (entryPrice - closePrice) / pipValue;
  
  // Calculate planned and realized R:R
  let riskRewardRatio: number | undefined = undefined;
  let plannedRiskReward: number | undefined = undefined;
  if (stopLoss !== undefined && takeProfit !== undefined) {
    const risk = type === 'buy' ? entryPrice - stopLoss : stopLoss - entryPrice;
    const reward = type === 'buy' ? takeProfit - entryPrice : entryPrice - takeProfit;
    riskRewardRatio = risk !== 0 ? reward / risk : undefined;
    plannedRiskReward = risk !== 0 ? reward / risk : undefined;
  }
  // Realized RR based on actual close (fallback to TP if close not available)
  let realizedRiskReward: number | undefined = undefined;
  if (stopLoss !== undefined && (closePrice > 0 || takeProfit !== undefined)) {
    const usedExit = closePrice > 0 ? closePrice : (takeProfit as number);
    const risk = type === 'buy' ? entryPrice - stopLoss : stopLoss - entryPrice;
    const realized = type === 'buy' ? usedExit - entryPrice : entryPrice - usedExit;
    realizedRiskReward = risk !== 0 ? realized / risk : undefined;
  }
  
  return {
    ticket,
    account_id: accountId,
    symbol,
    type,
    lot_size: lotSize,
    open_time: openTime,
    entry_price: entryPrice,
    stop_loss: stopLoss,
    take_profit: takeProfit,
    close_time: closeTime,
    close_price: closePrice,
    commission,
    taxes,
    swap,
    profit,
    duration_seconds: durationSeconds,
    pips: Math.round(pips * 10) / 10,
    risk_reward_ratio: riskRewardRatio !== undefined ? Math.round(riskRewardRatio * 100) / 100 : undefined,
    planned_risk_reward: plannedRiskReward !== undefined ? Math.round(plannedRiskReward * 100) / 100 : undefined,
    realized_risk_reward: realizedRiskReward !== undefined ? Math.round(realizedRiskReward * 100) / 100 : undefined,
    journal: {
      strategy: '',
      mood: { tags: [], scale: 0 },
      execution_review: '',
      lessons_learned: '',
      tags: [],
      screenshots: [],
      insights: ''
    },
    metadata: {
      imported_at: new Date().toISOString(),
      source_file: fileName,
      duplicate_flag: false,
      import_history: []
    }
  };
};

export const parseMetaTraderHTML = (html: string, fileName: string): Trade[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const trades: Trade[] = [];
  
  // Find account information
  let accountId = 'Unknown';
  const accountInfo = doc.querySelector('table');
  if (accountInfo) {
    const rows = accountInfo.querySelectorAll('tr');
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2 && cells[0].textContent?.includes('Account')) {
        accountId = cells[1].textContent?.trim() || 'Unknown';
        break;
      }
    }
  }
  
  // Find closed transactions table
  const tables = doc.querySelectorAll('table');
  let transactionTable: HTMLTableElement | null = null;
  
  for (const table of tables) {
    const prevElement = table.previousElementSibling;
    if (prevElement && (prevElement.textContent?.includes('Closed Transactions') || 
                      prevElement.textContent?.includes('Orders') ||
                      prevElement.textContent?.includes('Deals'))) {
      transactionTable = table as HTMLTableElement;
      break;
    }
  }
  
  if (!transactionTable) {
    // Fallback: look for the largest table
    let maxRows = 0;
    for (const table of tables) {
      const rows = table.querySelectorAll('tr').length;
      if (rows > maxRows) {
        maxRows = rows;
        transactionTable = table as HTMLTableElement;
      }
    }
  }
  
  if (!transactionTable) {
    throw new Error('Could not find transaction data in the HTML file');
  }
  
  const rows = transactionTable.querySelectorAll('tr');
  if (rows.length < 2) {
    throw new Error('No transaction data found');
  }
  
  // Skip header row and process data rows
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    if (cells.length < 8) continue; // Skip incomplete rows
    
    try {
      const trade = parseTradeRow(cells, accountId, fileName);
      if (trade && (trade.type === 'buy' || trade.type === 'sell')) {
        trades.push(trade);
      }
    } catch (error) {
      console.warn(`Error parsing trade row ${i}:`, error);
    }
  }
  
  return trades;
};

export const calculateTradeStats = (trades: Trade[]): TradeStats => {
  if (trades.length === 0) {
    return {
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
      mostTraded: '',
      grossProfit: 0,
      grossLoss: 0,
      expectedPayoff: 0,
      absoluteDrawdown: 0,
      maximalDrawdown: 0,
      maximalDrawdownPercent: 0,
      relativeDrawdown: 0,
      relativeDrawdownAmount: 0,
      shortPositions: 0,
      shortWinRate: 0,
      longPositions: 0,
      longWinRate: 0,
      profitTrades: 0,
      lossTrades: 0,
      largestProfitTrade: 0,
      largestLossTrade: 0,
      avgProfitTrade: 0,
      avgLossTrade: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveWinsAmount: 0,
      maxConsecutiveLosses: 0,
      maxConsecutiveLossesAmount: 0,
      maxConsecutiveProfitAmount: 0,
      maxConsecutiveProfitCount: 0,
      maxConsecutiveLossAmount: 0,
      maxConsecutiveLossCount: 0,
      avgConsecutiveWins: 0,
      avgConsecutiveLosses: 0,
      depositWithdrawal: 0,
      creditFacility: 0,
      closedTradesPL: 0,
      floatingPL: 0,
      margin: 0,
      balance: 0,
      equity: 0,
      freeMargin: 0
    };
  }

  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);
  const shortTrades = trades.filter(t => t.type === 'sell');
  const longTrades = trades.filter(t => t.type === 'buy');
  const shortWinningTrades = shortTrades.filter(t => t.profit > 0);
  const longWinningTrades = longTrades.filter(t => t.profit > 0);
  const totalTrades = trades.length;
  
  // Basic metrics
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;
  
  const avgWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
  
  const bestTrade = Math.max(...trades.map(t => t.profit));
  const worstTrade = Math.min(...trades.map(t => t.profit));
  
  // Enhanced metrics
  const netPnl = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const expectedPayoff = totalTrades > 0 ? netPnl / totalTrades : 0;
  
  // Calculate drawdown metrics
  const sortedTrades = [...trades].sort((a, b) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime());
  let runningBalance = 1000; // Assume starting balance
  let peak = runningBalance;
  let maxDrawdown = 0;
  let maximalDrawdownPercentValue = 0;
  
  sortedTrades.forEach(trade => {
    runningBalance += trade.profit;
    if (runningBalance > peak) {
      peak = runningBalance;
    }
    const drawdown = peak - runningBalance;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
    
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maximalDrawdownPercentValue = drawdownPercent;
    }
  });
  
  // Calculate consecutive wins/losses
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let maxWinStreakAmount = 0;
  let maxLossStreakAmount = 0;
  let currentWinAmount = 0;
  let currentLossAmount = 0;
  let winStreaks: number[] = [];
  let lossStreaks: number[] = [];
  
  sortedTrades.forEach(trade => {
    if (trade.profit > 0) {
      currentWinStreak++;
      currentWinAmount += trade.profit;
      if (currentLossStreak > 0) {
        lossStreaks.push(currentLossStreak);
        currentLossStreak = 0;
        currentLossAmount = 0;
      }
    } else if (trade.profit < 0) {
      currentLossStreak++;
      currentLossAmount += trade.profit;
      if (currentWinStreak > 0) {
        winStreaks.push(currentWinStreak);
        if (currentWinStreak > maxWinStreak) {
          maxWinStreak = currentWinStreak;
          maxWinStreakAmount = currentWinAmount;
        }
        currentWinStreak = 0;
        currentWinAmount = 0;
      }
    }
    
    if (currentLossStreak > maxLossStreak) {
      maxLossStreak = currentLossStreak;
      maxLossStreakAmount = currentLossAmount;
    }
  });
  
  // Handle final streaks
  if (currentWinStreak > 0) winStreaks.push(currentWinStreak);
  if (currentLossStreak > 0) lossStreaks.push(currentLossStreak);
  
  const avgConsecutiveWins = winStreaks.length > 0 ? winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length : 0;
  const avgConsecutiveLosses = lossStreaks.length > 0 ? lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length : 0;
  
  // Average R:R
  const rrTrades = trades.filter(t => t.risk_reward_ratio !== null);
  const avgRR = rrTrades.length > 0 ? 
    rrTrades.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / rrTrades.length : 0;
  
  // Average duration
  const durationTrades = trades.filter(t => t.duration_seconds);
  const avgDuration = durationTrades.length > 0 ?
    durationTrades.reduce((sum, t) => sum + (t.duration_seconds || 0), 0) / durationTrades.length : 0;
  
  // Symbol analysis
  const symbolStats: Record<string, SymbolStats> = {};
  trades.forEach(trade => {
    if (!symbolStats[trade.symbol]) {
      symbolStats[trade.symbol] = { count: 0, profit: 0 };
    }
    symbolStats[trade.symbol].count++;
    symbolStats[trade.symbol].profit += trade.profit;
  });
  
  const bestSymbol = Object.keys(symbolStats).reduce((best, symbol) => {
    return symbolStats[symbol].profit > (symbolStats[best]?.profit || -Infinity) ? symbol : best;
  }, '');
  
  const mostTraded = Object.keys(symbolStats).reduce((most, symbol) => {
    return symbolStats[symbol].count > (symbolStats[most]?.count || 0) ? symbol : most;
  }, '');
  
  return {
    totalTrades,
    netPnl,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    bestTrade,
    worstTrade,
    avgRR,
    avgDuration,
    bestSymbol,
    mostTraded,
    grossProfit: totalProfit,
    grossLoss: totalLoss,
    expectedPayoff,
    absoluteDrawdown: maxDrawdown,
    maximalDrawdown: maxDrawdown,
    maximalDrawdownPercent: maximalDrawdownPercentValue,
    relativeDrawdown: maximalDrawdownPercentValue,
    relativeDrawdownAmount: maxDrawdown,
    shortPositions: shortTrades.length,
    shortWinRate: shortTrades.length > 0 ? (shortWinningTrades.length / shortTrades.length) * 100 : 0,
    longPositions: longTrades.length,
    longWinRate: longTrades.length > 0 ? (longWinningTrades.length / longTrades.length) * 100 : 0,
    profitTrades: winningTrades.length,
    lossTrades: losingTrades.length,
    largestProfitTrade: bestTrade,
    largestLossTrade: worstTrade,
    avgProfitTrade: avgWin,
    avgLossTrade: avgLoss,
    maxConsecutiveWins: maxWinStreak,
    maxConsecutiveWinsAmount: maxWinStreakAmount,
    maxConsecutiveLosses: maxLossStreak,
    maxConsecutiveLossesAmount: Math.abs(maxLossStreakAmount),
    maxConsecutiveProfitAmount: maxWinStreakAmount,
    maxConsecutiveProfitCount: maxWinStreak,
    maxConsecutiveLossAmount: Math.abs(maxLossStreakAmount),
    maxConsecutiveLossCount: maxLossStreak,
    avgConsecutiveWins: Math.round(avgConsecutiveWins),
    avgConsecutiveLosses: Math.round(avgConsecutiveLosses),
    depositWithdrawal: 0, // Would need to be parsed from statement
    creditFacility: 0,
    closedTradesPL: netPnl,
    floatingPL: 0,
    margin: 0,
    balance: runningBalance,
    equity: runningBalance,
    freeMargin: runningBalance
  };
};

export const calculateMoodStats = (trades: Trade[]): Record<string, MoodStats> => {
  const moodStats: Record<string, MoodStats> = {};
  
  trades.forEach(trade => {
    if (trade.journal && trade.journal.mood && trade.journal.mood.tags) {
      trade.journal.mood.tags.forEach(mood => {
        if (!moodStats[mood]) {
          moodStats[mood] = { count: 0, profit: 0, wins: 0 };
        }
        moodStats[mood].count++;
        moodStats[mood].profit += trade.profit;
        if (trade.profit > 0) moodStats[mood].wins++;
      });
    }
  });
  
  return moodStats;
};

export const formatDuration = (seconds: number): string => {
  if (!seconds) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const formatRR = (rr?: number): string => {
  if (rr === undefined || rr === null || !isFinite(rr)) return '';
  const abs = Math.abs(rr);
  const label = `${abs.toFixed(abs >= 10 ? 0 : abs >= 2 ? 1 : 2)}:1`;
  return rr < 0 ? `-${label}` : label;
};

export const recomputeRRFields = (trade: Trade): Trade => {
  const { type, entry_price, stop_loss, take_profit, close_price } = trade;
  let planned: number | undefined = undefined;
  if (stop_loss !== undefined && take_profit !== undefined) {
    const risk = type === 'buy' ? entry_price - stop_loss : stop_loss - entry_price;
    const reward = type === 'buy' ? take_profit - entry_price : entry_price - take_profit;
    planned = risk !== 0 ? reward / risk : undefined;
  }
  let realized: number | undefined = undefined;
  if (stop_loss !== undefined && (close_price || take_profit !== undefined)) {
    const usedExit = (close_price && close_price > 0) ? close_price : take_profit as number | undefined;
    if (usedExit !== undefined) {
      const risk = type === 'buy' ? entry_price - stop_loss : stop_loss - entry_price;
      const realizedDelta = type === 'buy' ? usedExit - entry_price : entry_price - usedExit;
      realized = risk !== 0 ? realizedDelta / risk : undefined;
    }
  }
  return { ...trade, planned_risk_reward: planned, realized_risk_reward: realized, risk_reward_ratio: planned };
};
