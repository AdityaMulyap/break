# Hemline

**Will the pants you're about to buy arrive too long?** Hemline answers that
before checkout: measure one pair you already own, pick the shoes you'll wear,
and get a verdict in centimeters — plus a try-on render of the *corrected*
garment on your own photo, powered by two chained YouCam APIs.

Virtual try-on answers "does this look right on me." Hemline closes the loop:
"will it arrive right" — and if not, checkout offers hemming to your exact
length as a service line item.

## How the YouCam chain works

1. **Shoes VTO** (`/s2s/v2.0/task/shoes`) renders the chosen shoe onto the
   user's photo.
2. The **length verdict** (pure math, `lib/verdict.js`) compares the catalog
   garment's published outseam against the user's benchmark, adjusted for the
   chosen shoe's heel height and break preference.
3. **Clothes VTO** (`/s2s/v2.0/task/cloth-v4`) runs *on the shoe-rendered
   image* — twice: once with the garment as shipped, once pre-shortened to the
   hem target. The side-by-side render always agrees with the math.

Every YouCam call goes through one cached client (`server/lib/youcam.js`):
requests are hashed (task + input image bytes + params) and replayed from
`/cache` on disk, so repeated demos cost zero API units.

## Run it

Requires Node 20+.

```bash
npm install
npm run build          # builds the frontend into web/dist
npm start              # serves app + API on http://localhost:5171
```

Without an API key the app runs in **mock mode** automatically: renders are
simulated with local images (clearly labeled in the UI), the verdict math is
real, and no API units are spent.

For live renders:

```bash
cp .env.example .env   # add your YouCam API key
npm start
```

Set `HEMLINE_MOCK=1` to force mock mode even with a key present.

## Development

```bash
npm start              # API server on :5171
npm run dev            # Vite dev server on :5170, proxies /api
npm test               # verdict math unit tests
node scripts/spike-shoes.js   # standalone Shoes VTO chain test
node scripts/screenshots.js   # headless walkthrough + screenshots
```

## Honest limitations

- The catalog is curated demo data (8 garments, hand-entered published
  lengths) — Hemline is a proof of the flow, not a store.
- One user photo ships with the demo; production would ask for your own.
- Checkout is a UI state, not a payment flow.
