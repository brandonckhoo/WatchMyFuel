# Watch My Fuel

Find cheap fuel near you. A single-page fuel price comparison for Queensland, Australia.

**Live:** [watchmyfuel.vercel.app](https://watchmyfuel.vercel.app)

## What it does

Pulls live servo prices from the Queensland Government's Fuel Price Reporting API and shows the cheapest nearby, by fuel type. Searches are kept in local storage so your usual stations are one tap away.

Fuel types covered:

| Code | Fuel |
|---|---|
| U91 | Unleaded 91 |
| U95 | Premium Unleaded 95 |
| U98 | Premium Unleaded 98 |
| E10 | Ethanol blend |
| Diesel | Diesel and ULSD |

## How it's built

No framework and no build step. Three files do the work.

- `index.html` - The whole front end. Markup, styles and logic in one file.
- `api/fuel.js` - A Vercel serverless function that calls the fuel API and normalises the response. It fetches brands, site details and prices in parallel, then joins them into one payload so the browser makes a single request.
- `vercel.json` - Sets a 10 second max duration on the function.

The function exists because the fuel API needs an authorization header and does not send CORS headers, so the browser cannot call it directly.

## Running it locally

```
npm i -g vercel
vercel dev
```

`vercel dev` is needed rather than opening `index.html` directly, since the page depends on the `/api/fuel` route.

## Configuration

The API subscriber token is read from `FUEL_API_TOKEN`, falling back to the value in `api/fuel.js` if it is not set.

```
vercel env add FUEL_API_TOKEN
```

Set it in the Vercel project and the fallback stops being used. Tokens are issued by the Queensland Government Fuel Price Reporting scheme.

## Data source

[FPDAPI](https://fppdirectapi-prod.fuelpricesqld.com.au), the Queensland Fuel Price Reporting API. Prices are reported by retailers and can lag the pump by a few minutes.
