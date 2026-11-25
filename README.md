# OTS live account statistics

The OTS homepage reads the four public account figures from [live.json](https://raw.githubusercontent.com/olivesandgin/ots-live-stats/main/public/live.json). They come from the [Orthogonal Trading System signal on MQL5](https://www.mql5.com/en/signals/2397535).

| Field | Meaning |
| --- | --- |
| `growthPct` | MQL5 account growth, in percent |
| `equityDrawdownPct` | MQL5 drawdown “By Equity”, in percent |
| `trades` | Trades reported by MQL5 |
| `profitFactor` | Profit factor reported by MQL5 |
| `refreshedAt` | UTC time when the publisher successfully retrieved and validated all four figures |
| `sourceUrl` | The public MQL5 signal used for that reading |

GitHub Actions schedules a retrieval daily at 06:00 Europe/Malta, including daylight-saving changes. A backup run is scheduled at 06:17. Scheduled runs skip retrieval if the feed has already refreshed since 06:00 Malta time. GitHub may delay scheduled runs. A successful retrieval updates the JSON even when the four figures are unchanged. If the source is unavailable or its report cannot be validated, the previous figures and timestamp stay in place. The [workflow history](https://github.com/olivesandgin/ots-live-stats/actions/workflows/refresh.yml) shows the outcome of each attempt and supports on-demand refreshes.
