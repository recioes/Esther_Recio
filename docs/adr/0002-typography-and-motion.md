# ADR 0002: Display typography and a GSAP motion layer

**Status:** accepted (2026-11-09)

## Context

The page used Inter for everything and only CSS entrance animations. The maintainer wanted more identity and motion in line with the site built for jessica-recio (GSAP and Lenis), and explicitly lifted the earlier restriction on new dependencies.

## Options

1. **Keep Inter and CSS only.** No added weight, but it does not deliver the requested identity.
2. **New type system, motion still in CSS.** Light, but no scroll-linked effects, per-letter intro or smooth scrolling.
3. **New type system plus GSAP, ScrollTrigger and Lenis (chosen).** Adds JavaScript and font weight, in exchange for the requested result.

## Decision

- Bricolage Grotesque (display), Geist (text) and Geist Mono (labels), self-hosted through Fontsource.
- `src/scripts/motion.ts`, loaded with a dynamic import from `interactions.ts`.
- Scroll-linked effects, smooth scrolling and the animated border run only with a fine pointer; phones get the intro and one-shot reveals.

## Consequences

- The name and role are held hidden for at most 2.2 s by `hero-hold`, so they still appear without JavaScript.
- `prefers-reduced-motion` skips the motion layer entirely.
- **Security:** the CSP did not need to change. Letter splitting and scrambling use `textContent` and `createElement`, so nothing writes HTML strings, which Trusted Types would block.
- **Print:** elements animated by the layer carry `data-motion`, which `print.css` forces visible.

## Open questions

- Real-device performance on phones has not been measured.
