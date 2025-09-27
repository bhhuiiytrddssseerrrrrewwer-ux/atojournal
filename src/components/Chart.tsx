import React, { useMemo } from 'react';
import { Trade } from '../types/trade';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Circle } from 'lucide-react';

interface ChartProps {
  trade: Trade | null;
}

interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
  isEntry?: boolean;
  isExit?: boolean;
}

const Chart: React.FC<ChartProps> = ({ trade }) => {
  const chartData = useMemo(() => {
    if (!trade) return [];

    const openTime = new Date(trade.open_time);
    const closeTime = trade.close_time ? new Date(trade.close_time) : new Date(openTime.getTime() + 3600000);
    const entryPrice = trade.entry_price;
    const closePrice = trade.close_price || entryPrice;
    
    const data: ChartDataPoint[] = [];
    const steps = 20;
    const timeStep = (closeTime.getTime() - openTime.getTime()) / steps;
    
    for (let i = 0; i <= steps; i++) {
      const time = new Date(openTime.getTime() + (i * timeStep));
      let price;
      
      if (i === 0) {
        price = entryPrice;
      } else if (i === steps) {
        price = closePrice;
      } else {
        // Simulate price movement with some volatility
        const progress = i / steps;
        const volatility = 0.0005; // 5 pips volatility
        const random = (Math.random() - 0.5) * volatility;
        const trend = (closePrice - entryPrice) * progress;
        price = entryPrice + trend + random;
      }
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: price,
        timestamp: time.getTime(),
        isEntry: i === 0,
        isExit: i === steps && trade.close_time
      });
    }
    
    return data;
  }, [trade]);

  const chartConfig = useMemo(() => {
    if (!trade) return null;

    const entryPrice = trade.entry_price;
    const closePrice = trade.close_price || entryPrice;
    const stopLoss = trade.stop_loss;
    const takeProfit = trade.take_profit;
    const isProfitable = trade.profit >= 0;
    
    // Calculate price range with padding
    const prices = [entryPrice, closePrice];
    if (stopLoss) prices.push(stopLoss);
    if (takeProfit) prices.push(takeProfit);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.1; // 10% padding
    
    return {
      entryPrice,
      closePrice,
      stopLoss,
      takeProfit,
      isProfitable,
      minPrice: minPrice - padding,
      maxPrice: maxPrice + padding,
      lineColor: isProfitable ? '#10b981' : '#ef4444',
      entryColor: trade.type === 'buy' ? '#10b981' : '#ef4444'
    };
  }, [trade]);

  if (!trade || !chartConfig) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Select a trade to view chart</p>
      </div>
    );
  }

  const { entryPrice, closePrice, stopLoss, takeProfit, isProfitable, minPrice, maxPrice, lineColor, entryColor } = chartConfig;

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg p-4">
      <div className="h-full flex flex-col">
        {/* Trade Summary Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">
              {trade.symbol} - {trade.type.toUpperCase()}
            </h3>
            <div className="flex items-center space-x-2">
              {trade.type === 'buy' ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-sm font-medium ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                {isProfitable ? '+' : ''}${trade.profit.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-gray-300">
              <span className="text-gray-400">Entry:</span> 
              <div className="font-mono">{entryPrice}</div>
            </div>
            <div className="text-gray-300">
              <span className="text-gray-400">Exit:</span> 
              <div className="font-mono">{closePrice}</div>
            </div>
            <div className="text-gray-300">
              <span className="text-gray-400">Pips:</span> 
              <div className={`font-mono ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                {trade.pips?.toFixed(1) || '0'}
              </div>
            </div>
            <div className="text-gray-300">
              <span className="text-gray-400">Duration:</span> 
              <div className="font-mono">
                {trade.duration_seconds ? 
                  `${Math.floor(trade.duration_seconds / 3600)}h ${Math.floor((trade.duration_seconds % 3600) / 60)}m` : 
                  'N/A'
                }
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[minPrice, maxPrice]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toFixed(5)}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#f9fafb', fontWeight: 'bold' }}
                formatter={(value: number, name: string) => [
                  <span key="value" className="font-mono">{value.toFixed(5)}</span>, 
                  'Price'
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              
              {/* Main price line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke={lineColor}
                strokeWidth={3}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: lineColor,
                  stroke: '#fff',
                  strokeWidth: 2
                }}
              />
              
              {/* Entry point marker */}
              <ReferenceDot
                x={chartData[0]?.time}
                y={entryPrice}
                r={8}
                fill={entryColor}
                stroke="#fff"
                strokeWidth={3}
              />
              
              {/* Exit point marker */}
              {trade.close_time && (
                <ReferenceDot
                  x={chartData[chartData.length - 1]?.time}
                  y={closePrice}
                  r={8}
                  fill={isProfitable ? '#10b981' : '#ef4444'}
                  stroke="#fff"
                  strokeWidth={3}
                />
              )}
              
              {/* Stop Loss line */}
              {stopLoss && (
                <ReferenceLine
                  y={stopLoss}
                  stroke="#ef4444"
                  strokeDasharray="8 4"
                  strokeWidth={2}
                  label={{ 
                    value: "S/L", 
                    position: "topRight",
                    style: { fill: '#ef4444', fontSize: '12px', fontWeight: 'bold' }
                  }}
                />
              )}
              
              {/* Take Profit line */}
              {takeProfit && (
                <ReferenceLine
                  y={takeProfit}
                  stroke="#10b981"
                  strokeDasharray="8 4"
                  strokeWidth={2}
                  label={{ 
                    value: "T/P", 
                    position: "topRight",
                    style: { fill: '#10b981', fontSize: '12px', fontWeight: 'bold' }
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex-shrink-0">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${entryColor === '#10b981' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Entry ({trade.type.toUpperCase()})</span>
            </div>
            {trade.close_time && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isProfitable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Exit</span>
              </div>
            )}
            {stopLoss && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-red-500" style={{ borderTop: '2px dashed #ef4444' }}></div>
                <span>Stop Loss</span>
              </div>
            )}
            {takeProfit && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-green-500" style={{ borderTop: '2px dashed #10b981' }}></div>
                <span>Take Profit</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart;