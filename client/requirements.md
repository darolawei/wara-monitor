## Packages
recharts | Beautiful, responsive charts for historical salinity readings
date-fns | Formatting dates for the charts and history logs
@hookform/resolvers | Form validation with zod
react-hook-form | Form state management
zod | Schema validation

## Notes
- `currentSalinity` and `salinity` are `numeric` in DB, so they might be strings in the JSON response to preserve precision. The frontend will parse them as numbers for charting.
- Recharts is used for the salinity trend line chart.
- The UI uses an ocean/water-inspired blue palette with semantic colors for well status.
