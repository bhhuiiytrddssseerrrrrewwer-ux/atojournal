# Auto Trading Journal

A modern, comprehensive trading journal application built with React, TypeScript, and Tailwind CSS. Import MetaTrader statements, analyze your trades with interactive charts, and maintain detailed trading journals with psychological insights.

## Features

### 📊 **Trade Analysis**
- **MetaTrader Import**: Parse MT4/MT5 HTML statements automatically
- **Interactive Charts**: Visualize trades with entry/exit points, stop loss, and take profit levels
- **Performance Metrics**: Win rate, profit factor, average R:R ratio, and more
- **Symbol Analysis**: Track performance by trading instrument

### 📝 **Journaling**
- **Strategy Documentation**: Record trade setups and confluence factors
- **Mood Tracking**: Tag emotional states during trades
- **Execution Review**: Analyze entry, exit, and trade management
- **Lessons Learned**: Document insights and improvements
- **Custom Tags**: Categorize trades for better organization

### 📈 **Analytics Dashboard**
- **Real-time Statistics**: Live updates of trading performance
- **Mood Analysis**: Correlate emotional states with trading outcomes
- **Export Capabilities**: Download data as CSV for external analysis
- **Multi-account Support**: Track multiple trading accounts

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: TradingView Lightweight Charts
- **State Management**: React Context API
- **Data Persistence**: localStorage
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AutotradingJournal-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Importing Trades

1. **Upload MetaTrader Statement**
   - Click "Upload MetaTrader Statement" button
   - Select your MT4/MT5 HTML statement files
   - The app will automatically parse and import trades

2. **View Trade Details**
   - Click on any trade in the list to view details
   - See entry/exit prices, duration, P&L, and more

3. **Add Journal Entries**
   - Select a trade and switch to "Journal Entry" tab
   - Document your strategy, mood, and lessons learned
   - Add custom tags for better organization

4. **Analyze Performance**
   - Switch to "Analytics" tab for comprehensive statistics
   - View mood correlations and performance metrics
   - Export data for external analysis

## Project Structure

```
src/
├── components/          # React components
│   ├── TradeList.tsx   # Trades list and management
│   ├── FileUpload.tsx  # File upload component
│   ├── TradeDetails.tsx # Trade details display
│   ├── Journal.tsx     # Journal entry form
│   ├── Analytics.tsx   # Analytics dashboard
│   └── Chart.tsx       # Chart visualization
├── context/            # React Context for state management
│   └── TradeContext.tsx
├── hooks/              # Custom React hooks
│   └── useFileUpload.ts
├── types/              # TypeScript type definitions
│   └── trade.ts
├── utils/              # Utility functions
│   └── tradeParser.ts
└── App.tsx             # Main application component
```

## Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Data Model: `docs/TRADE_DATA_MODEL.md`
- Parser Spec: `docs/PARSER_SPEC.md`
- Development Guide: `docs/DEVELOPMENT.md`
- Contributing: `CONTRIBUTING.md`

## Key Improvements Made

1. **Modern React Architecture**
   - Converted from vanilla JavaScript to React components
   - Implemented proper state management with Context API
   - Added TypeScript for type safety

2. **Component Structure**
   - Separated concerns into reusable components
   - Created custom hooks for data persistence
   - Implemented proper error handling

3. **User Experience**
   - Improved loading states and user feedback
   - Added form validation and error messages
   - Enhanced visual design with Tailwind CSS

4. **Data Management**
   - Robust trade parsing and validation
   - Efficient state updates and persistence
   - Duplicate detection and handling

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
