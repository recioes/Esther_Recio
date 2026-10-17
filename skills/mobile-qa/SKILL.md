---
name: mobile-qa
description: Use when verifying how a web page behaves on phones and tablets — touch interactions, layout at small viewports, tap targets, safe areas, overlays, performance under a slow CPU, and features that need a keyboard or mouse. Covers the repo's CDP-based mobile emulation (scripts/qa) and what still needs a real device.
---

# Mobile QA

Pair this with the `qa-senior` skill. Mobile bugs are mostly **assumptions about input and space**: a feature that needs a keyboard, a hover, or 300 px of free screen.

## 1. Emulate properly, not just resize

Resizing the window is not mobile. The harness in `scripts/qa/cdp.mjs` drives Edge/Chrome over the DevTools Protocol and sets:

- viewport and device pixel ratio (`Emulation.setDeviceMetricsOverride`, `mobile: true`),
- **touch** (`setTouchEmulationEnabled`) so `matchMedia('(pointer: coarse)')` is true and `(hover: hover)` is false,
- a mobile user agent,
- optional CPU throttling (`cpu: 4`) to approximate a mid-range phone,
- real touch input (`Input.dispatchTouchEvent`), including long-press (`page.tap(x, y, holdMs)`).

Always assert the emulation took effect (`pointer: coarse`, no hover) before trusting the rest.

## 2. Viewport matrix

| Case | Size | Why |
|---|---|---|
| Smallest supported | 320×568 | iPhone SE 1st gen, forces wrapping and overflow bugs |
| Common Android | 360×800 | most traffic |
| Modern iPhone | 390×844 | safe areas, dynamic toolbar |
| Large phone | 430×932 | thumb reach |
| Landscape | 844×390 | very little height: fixed overlays collide |
| Tablet | 768×1024 | between breakpoints |

Check at least the first two and one landscape. Also zoom to 200% for text (WCAG 1.4.4).

## 3. Checklist

**Input**
- Every feature has a **touch equivalent**. List what is keyboard-only or hover-only and make sure it is neither required nor counted/hinted on phones (this repo filters hints with `reachableEggs`).
- Long-press, double-tap, drag vs scroll (`touch-action`), pinch zoom not blocked, text selection and context menus not hijacked.
- On-screen keyboard: a page-level `keydown` listener will not fire without a focused input; do not rely on typing.

**Layout**
- No horizontal scroll (`scrollWidth <= innerWidth`).
- **Tap targets ≥ 44×44 px** (recommended); below 24 px fails WCAG 2.5.8. Fixing one target can make neighbors overlap: enlarge the whole group when points are close together (see the constellation).
- Safe areas: fixed elements use `env(safe-area-inset-*)`. Use `dvh`, not `vh`, for full height.
- **Overlays**: toasts, popovers, boards and banners must not cover each other or primary actions. Trigger two at once and look. Anything that opens itself must close itself and be dismissible by tap-outside and Escape.
- Fixed elements vs the browser toolbar and the home indicator.

**Performance** (always with `cpu: 4` and mention that headless uses software WebGL)
- Long tasks (> 200 ms) during interaction fail; during load, report them.
- Heavy work (3D, big bundles) is deferred, respects `prefers-reduced-motion` and `Save-Data`, and a fallback exists without WebGL.
- Watch for continuous `requestAnimationFrame` loops and `backdrop-filter` on many layers.

**Content and a11y**
- Text readable without zoom (≥ 16 px body), contrast in dark/glass backgrounds, focus order, screen-reader names on icon-only buttons, `aria-expanded`/`aria-controls` wiring.
- Locale strings fit: Spanish and Portuguese run ~20% longer than English.

## 4. Run it

```sh
npm run build   # tests run against dist/, like production (CSP included)
npm run qa      # desktop + iPhone + small-phone scenarios, screenshots to the temp folder it prints
```

Edit `scripts/qa/easter-e2e.mjs`: add a case by writing an action that does **exactly what the user-facing text says**, then assert the visible result. Open the screenshots; state assertions cannot see overlap.

Set `QA_BROWSER` to use another browser binary.

## 5. What emulation cannot prove (say so in the report)

- Real iOS Safari behavior: dynamic toolbar and `100vh`, `backdrop-filter` cost, WebGL limits, audio and autoplay policies, rubber-band scrolling.
- Real GPU/thermal performance (headless uses software rendering: absolute numbers are pessimistic, use them only to compare before/after).
- Real networks and battery.

To check on a real phone: run `npm run preview -- --host`, open the LAN URL on the phone (same Wi-Fi), or attach desktop DevTools through USB (`chrome://inspect` with Android debugging; Safari Web Inspector for iOS). Use the checklist above and the same cases.

## Reporting

Use the `qa-senior` report format, always with device/viewport and emulation vs real device stated, plus screenshots.
