# Area Manager Dashboard

A local-first React dashboard for monthly store walks.

## What it does

- Shows a dashboard summary for the current month.
- Displays Home Depot and Academy Sports sample stores on a Leaflet map.
- Filters stores by route group.
- Tracks monthly complete/incomplete walk status in browser localStorage.
- Saves store notes in browser localStorage.
- Opens Google Maps directions from the home base to each store.

## Home base

1301 Wesley St, Glenarden, MD 20706

## Data

The first version uses editable sample data in `src/data/stores.json`.

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
