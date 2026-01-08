# Time Handling & UTC

## Why UTC
- Multiple user timezones
- Stateless containers
- Deterministic scheduling

## Rules
- UI sends time + timezone
- Backend converts to UTC
- Elasticsearch stores UTC only

## Notes
- No separate UTC field is stored
- Cron expressions are evaluated in UTC

⬅️ [Back to README](../README.md)
