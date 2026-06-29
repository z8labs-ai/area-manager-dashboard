# Area Manager Dashboard

A local-first React dashboard for monthly store walks.

## What it does

- Shows a dashboard summary for the current month.
- Displays the v0.2 territory list on a Leaflet map.
- Filters stores by route group.
- Keeps non-walk locations in the app for territory reference.
- Tracks monthly complete/incomplete walk status in browser localStorage.
- Saves store notes in browser localStorage.
- Opens Google Maps directions from the home base to each store.

## Home base

1301 Wesley St, Glenarden, MD 20706

## Data

The app uses editable local data in `src/data/stores.json`.

Each store has a `requiresMonthlyWalk` flag. The planner and monthly progress focus on stores where this is `true`, while the map and store list can still show every territory location.

No database is connected yet, and no API keys or secrets are stored in this app.

## Security note

Notes are saved only in the browser's localStorage. Do not store passwords, API keys, customer information, or other sensitive data in store notes.

## Run locally

Install dependencies first:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```
