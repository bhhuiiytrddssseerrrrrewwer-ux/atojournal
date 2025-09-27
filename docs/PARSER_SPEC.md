# Parser Specification (MetaTrader HTML)

The parser ingests MT4/MT5 exported HTML statements and produces normalized `Trade` objects.

## Inputs
- HTML string contents from file uploads
- File name used for metadata

## Account Extraction
- Attempts to read first table for a row with label containing "Account"; value becomes `account_id`
- Falls back to `Unknown` when unavailable

## Transaction Table Detection
1. Prefer table whose previous sibling contains any of: "Closed Transactions", "Orders", "Deals"
2. Fallback to the largest table by row count

## Row Mapping
Expected columns (by index) after header:
0. ticket
1. open time
2. type (buy/sell)
3. lot size
4. symbol (sanitized to A–Z0–9 upper-case)
5. entry price
6. stop loss
7. take profit
8. close time
9. close price
10. commission
11. taxes
12. swap
13. profit

Rows with fewer than 8 cells are skipped. Missing or invalid fields default safely (0 or null) where appropriate. Rows missing `ticket`, `open time`, or `type` are discarded.

## Derived Fields
- Duration: `close_time - open_time` in seconds, when `close_time` present
- Pips: pip size = 0.01 for JPY symbols else 0.0001; direction-sensitive
- Risk/Reward: only when `stop_loss` and `take_profit` both exist

## Error Handling
- Row-level parse exceptions are caught; parser continues
- If no transaction table or insufficient rows, throws with descriptive error

## Limitations / Future Work
- Pip size currently assumes FX majors with simple JPY rule
- Does not convert P&L to base currency; relies on statement profit values
- Different MT templates may require additional table detection heuristics


