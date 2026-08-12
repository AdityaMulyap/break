# Product

## Register

product

## Users

Two audiences, one screen. Primary: an online shopper on their phone, mid-purchase, anxious that the pants they're about to buy will arrive too long — they know their favorite pair fits and they know which shoes they'll wear. Secondary: a YouCam-hackathon judge watching a 90-second demo loop, scoring technological depth (chained VTO calls) and design (25% of score).

## Product Purpose

Hemline answers the question VTO leaves open: not "does this look right on me" but "will it arrive right." The user measures one pair of pants they own, browses a curated catalog, picks a shoe, and gets a plain verdict ("Arrives 5cm too long for you with these shoes") plus a side-by-side render — as-shipped vs hemmed-to-length — on their own body. The checkout shows hem-to-length as a paid service line item: the business model made visible. Success = a judge sees two YouCam APIs chained (Shoes VTO output feeding Clothes VTO input) driving a decision, in a UI that feels like a real product.

## Brand Personality

Tailor's confidence: precise, calm, honest. The app states measurements and verdicts like a good tailor does — in centimeters, without hedging, without upsell breathlessness. Transparent about what it is (curated catalog, demo).

## Anti-references

- Generic AI-generated e-commerce template: cream background, identical product-card grids, gradient CTAs.
- Fast-fashion urgency UI: countdown timers, "only 2 left!", discount confetti.
- Never phrase the pitch as "VTO is not enough" — the framing is closing the loop that VTO opens. The judges ARE the YouCam team.

## Design Principles

1. **The verdict is the hero.** Every screen exists to earn or deliver one sentence of truth about length. Nothing may compete with it.
2. **The picture agrees with the math.** Renders always show the corrected result; never let an image contradict the verdict.
3. **Waiting is part of the product.** VTO tasks take seconds to minutes; loading states are designed, honest about progress, and never dead-end.
4. **One hand, one thumb.** Mobile-first at 390px; every action reachable and tappable on a phone held one-handed.
5. **Centimeters over vibes.** Real numbers everywhere a claim is made — garment length, heel height, delta, hem target.

## Accessibility & Inclusion

WCAG AA contrast (≥4.5:1 body text). Reduced-motion alternatives for all animation. Touch targets ≥44px. Works without an account; the single stored measurement lives in localStorage.
