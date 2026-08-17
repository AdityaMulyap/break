# Break

**Will the pants you're about to buy arrive too long?** Break answers that
before checkout: measure one pair you already own, pick the shoes you'll wear,
and get a verdict in centimeters — plus a try-on render of the *corrected*
garment on your own photo.

Virtual try-on answers "does this look right on me." Break closes the loop:
"will it arrive right" — and if not, checkout offers hemming to your exact
length as a service line item.

## How the render works

1. The **length verdict** (pure math, `lib/fit.js`) compares the catalog
   garment's published inseam against the user's benchmark, adjusted for the
   chosen shoe's heel height and break preference.
2. **Clothes VTO** (`/s2s/v2.0/task/cloth-v4`) runs on the user's own photo,
   twice: once with the garment as shipped, once against a pre-shortened
   reference. The side-by-side render always agrees with the math.

The comparison strip shows the untouched photo beside both renders, so the
difference is readable rather than asserted.

### Why Shoes VTO is not in the chain

The original design fed Shoes VTO's output into Clothes VTO. It was cut after
measurement, not on a hunch. Both tasks regenerate the entire image rather than
editing one region, so whichever runs last owns the whole frame. Across five
configurations the shoes task restaged a plain studio portrait as an art
gallery, a cobblestone street, a wheat field, a Yosemite overlook and a Tudor
cottage — and swapped the garment for denim shorts, a skirt and cargo pants
along the way. It applies the right shoe every time and keeps nothing else.

`cloth-v4` is the better behaved of the two: it holds pose and background and
only invents footwear. So it runs last and alone, which is what lets the
as-shipped and hemmed frames share one backdrop and read as a comparison.

The consequence is deliberate and visible in the UI: the shoe picker changes
the hem target, not the photograph, and says so. `POST /api/shoe-preview` still
calls the shoes task for anyone who wants to see this for themselves.

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

Set `BREAK_MOCK=1` to force mock mode even with a key present.

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
  lengths) — Break is a proof of the flow, not a store.
- One user photo ships with the demo; production would ask for your own.
- Checkout is a UI state, not a payment flow.
