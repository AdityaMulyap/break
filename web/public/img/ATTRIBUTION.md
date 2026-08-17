# Image credits

## Storefront photography (`hero.jpg`, `catalog/`)

AI-generated for this project — no third-party rights, no model releases needed, and no
brand marks on the footwear (the previous stock set showed three-stripe sneakers, a
trademark risk on camera). Converted from PNG to JPEG at 900px wide.

Catalog mapping, one source image per garment:

| file | garment | shot |
| --- | --- | --- |
| g1 | Mara Wide-Leg | wide leg, front, full length |
| g2 | Ida Straight | light wash straight |
| g3 | Ren Slim Taper | dark rinse slim |
| g4 | Noa Barrel | curved barrel leg |
| g5 | Sena Bootcut | relaxed, leaning against concrete |
| g6 | Alma Low Loose | low rise loose |
| g7 | Kit Relaxed Taper | men's relaxed straight, street |
| g8 | Vera Column | column wide, front |
| g9 | Juno Utility | wide leg, three-quarter angle |
| g10 | Lova Flare | flare |

`-d1`/`-d2` gallery slots reuse a shared pool of alternate shots (back view, waist-down,
hem detail) and two lifestyle frames, rotated across garments.

`catalog/g1-hemmed.jpg` is the shortened reference cloth-v4 renders the "hemmed" try-on
from: g1 with a 130px band of leg fabric spliced out and the gap closed.

## Try-on input photos (`assets/input/`)

Both AI-generated, metadata stripped. The previous `avatar.jpg` carried a
"Terence Balisong Photography 2023" claim in its XMP and was replaced.

- `user.jpg` — the "upload a photo" path. Deliberately shows black leggings: swapping
  leggings for denim is a far more legible try-on than swapping jeans for jeans, which
  is what the earlier input produced.
- `avatar.jpg` — the "no photo needed" path.

`user-shipped.jpg` / `user-hemmed.jpg` are mock-mode placeholders only (`BREAK_MOCK=1`);
live mode replaces them with real YouCam renders. `garment.jpg` and `shoe.jpg` are
leftovers from the early API spikes and are not referenced by the app.
