# Project TODO / Roadmap

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
- Enhance Trades List with search and filters; virtualize list
- Add Trade Details side panel/modal
- Enable inline rich-text journal editing
- Add mood sliders/emojis and tag autocomplete

## Analytics & Insights
- Expand analytics with equity curve, distributions, heatmaps
- Implement mood correlation analytics
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
