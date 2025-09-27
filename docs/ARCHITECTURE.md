# Architecture Overview

This document describes the architecture of the Auto Trading Journal application.

## Tech Summary
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS for styling
- React Context for app-wide state
- LocalStorage for persistence

## High-Level Flow
1. User uploads MetaTrader HTML statement(s)
2. Parser converts rows to strongly typed `Trade` objects
3. `TradeContext` stores trades, computes derived statistics, and persists to `localStorage`
4. UI components read from the context and render analytics, lists, details, and journal

## Key Modules

### Entry
- `src/main.tsx` mounts React application
- `src/App.tsx` composes top-level layout and routes/sections

### State Management: `TradeContext`
Located at `src/context/TradeContext.tsx`.

Responsibilities:
- Holds `trades`, `selectedTrade`, `stats`, `moodStats`, loading + error state
- Computes stats via `calculateTradeStats` and `calculateMoodStats`
- Persists `trades` to `localStorage` and loads on mount
- Deduplicates trades on add using `ticket`

Public API:
- `loadTrades()`, `saveTrades()`
- `addTrades(trades)`
- `selectTrade(trade)`
- `updateTrade(trade)`
- `clearTrades()`
- `setLoading(bool)`, `setError(msg)`

### Parsing Utilities
Located at `src/utils/tradeParser.ts`.

Responsibilities:
- `parseMetaTraderHTML(html, fileName)` → `Trade[]`
- `parseTradeRow(cells, accountId, fileName)` → `Trade | null`
- `calculateTradeStats(trades)` and `calculateMoodStats(trades)`
- `formatDuration(seconds)`

Notes:
- Pips and R:R are simplified, symbol-sensitive (JPY pip size handling)
- Robust to missing data; skips incomplete rows

### Types
Located at `src/types/trade.ts`.

Core types:
- `Trade`, `TradeStats`, `MoodStats`, `SymbolStats`
- `JournalEntry`, `TradeMetadata`

### Components (selected)
- `FileUpload.tsx`: handles selecting and reading HTML files; invokes parser; adds trades to context
- `TradeList.tsx`: displays list, supports selecting a trade
- `TradeDetails.tsx`: shows fields, metrics, duration, R:R, and journal
- `Journal.tsx`: form to edit journal fields/tags/mood on selected trade
- `Analytics.tsx`: aggregates and displays KPIs and mood/symbol analytics
- `Chart.tsx`: price visualization; markers for entries/exits as supported
- `ErrorBoundary.tsx`: guards UI from runtime errors
- `DebugInfo.tsx`: optional diagnostics for development

### Persistence
- `localStorage` key: `trades`
- Writes on trade changes, loads on mount

### Error Handling
- Context maintains `error` string; components may render banner/toast
- Parsing catches row-level errors and continues

### Performance Considerations
- Derived stats recomputed on trade mutations only
- Avoids duplicate pushes by `ticket` check

## Data Lifecycle
- Import → Parse → Normalize → Store → Derive stats → Render → Journal edits → Persist

## Future Extensions
- Replace `localStorage` with backend API sync
- Add user auth and multi-account cloud sync
- Improve pip/R:R models per-asset and account currency


