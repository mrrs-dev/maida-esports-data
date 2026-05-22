# MAIDA eSPORTS Data

Source-of-truth JSON files for the Labuan eSports Challenge iOS app.

## Files

- `data/teams.json` — list of teams and their rosters.
- `data/standings.json` — live standings keyed by `team_id`.
- `data/schedule.json` — match schedule keyed by `home_team_id` / `away_team_id`.

## Updating during a tournament

1. Edit the JSON file you want to change.
2. Commit and push.
3. Cloudflare Pages auto-deploys in ~30 seconds.
4. Users pull-to-refresh in the app to see the new data.

## Hosting

This repo is intended to be connected to Cloudflare Pages with build command `(none)` and output directory `/`. Once connected, the files are served at:

```
https://<project-slug>.pages.dev/data/teams.json
https://<project-slug>.pages.dev/data/standings.json
https://<project-slug>.pages.dev/data/schedule.json
```

The iOS app reads its base URL from the `MAIDA_API_BASE` Info.plist key.
