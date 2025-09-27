# Project TODO / Roadmap

## ✅ COMPLETED - Enhanced Analytics & Trade Expanders
- ✅ Added comprehensive MT statement metrics display
- ✅ Implemented inline trade row expanders with drill-down
- ✅ Added real equity curve using time-sorted trades
- ✅ Enhanced journal preview and quick-edit functionality
- ✅ Replaced modal popups with inline expansion
- ✅ Added detailed trade analysis in expanded rows

## Data & Parsing
- Extend types to support new trade fields (in progress)
- Add Zod schemas for trades and aggregated data
- Implement per-symbol precision map for pips/RR
- Support MT4/MT5 CSV import parsing
- Aggregate daily data for calendar view
- Compute per-symbol summaries and KPIs

## Import UX
- Implement multi-file upload with progress and error toasts
- Add deduplication report modal per uploaded file

## Storage & Settings
- Persist UI state and preferences to `localStorage`
- Add LZ-string compression and optional encryption
- Introduce multi-account storage and switcher

## UI: Dashboard
- Build per-symbol summary grid (sortable, filterable)
- Add KPI cards (Net P&L, WinRate, ProfitFactor, Expectancy, Sharpe, DD)
- Add sparklines per symbol and equity curve

## UI: Calendar
- Create calendar month view with daily counts and P&L
- Add day drill-down modal with trades list and mini-chart

## UI: Trades & Journal
- ✅ Enhanced Trades List with inline expansion
- ✅ Added Trade Details in expandable rows
- ✅ Enabled inline journal editing with mood tags
- Add search and filters; virtualize list for large datasets
- Add mood sliders/emojis and tag autocomplete

## Analytics & Insights
- ✅ Added comprehensive MT statement metrics
- ✅ Implemented real equity curve and drawdown charts
- ✅ Enhanced mood correlation analytics
- Add distributions and heatmaps
- Implement rule-based insights and tilt detection
- Add backtesting hooks for what-if analysis

## Export & PWA
- Export data to CSV with filters applied
- Add PWA manifest and service worker for offline

## Dev & Quality
- Optimize performance with memoization and selectors
- Add ESLint rules and import order config
- Increase unit tests for parser and stats
- Add component tests for upload and lists

## Next Priority Items
1. **Performance Optimization**
   - Implement virtual scrolling for large trade lists
   - Add memoization for expensive calculations
   - Optimize re-renders in expanded rows

2. **Enhanced Filtering & Search**
   - Add symbol, date range, and P&L filters
   - Implement text search across journal entries
   - Add saved filter presets

3. **Advanced Analytics**
   - Add distribution charts (P&L, duration, R:R)
   - Implement heat maps for trading patterns
   - Add correlation analysis between different metrics

4. **Data Validation & Quality**
   - Add data validation rules and warnings
   - Implement trade quality scoring
   - Add duplicate detection improvements