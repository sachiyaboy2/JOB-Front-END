# OpenBot Design System — v1

The visual language for **Hotel Management System**, **Nari Craft** and the new
**Job Portal**. One product family, three products.

Everything here is plain Tailwind CSS v4 + CSS custom properties + one optional
WebGL hero. No UI framework, no CSS-in-JS, no component library to learn.

---

## 1. Files

```
_design-system/
├── tokens.css      ← import into the project (theme vars, dark mode, primitives)
├── motion.css      ← import into the project (animations, reveal, tilt)
├── DESIGN-SYSTEM.md← this file
└── react/          ← copy these into <project>/src/components/brand/
    ├── ThemeProvider.jsx
    ├── ThemeToggle.jsx
    ├── useReveal.js
    ├── TiltCard.jsx
    ├── AuroraHero.jsx
    └── Reveal.jsx
```

### Import order in the project's `src/index.css`

```css
@import "tailwindcss";
@import "../../_design-system/tokens.css";   /* adjust path */
@import "../../_design-system/motion.css";
```

Path is relative to the project's own `src/` folder. If the project lives in a
different tree, copy the two CSS files into the project's `src/styles/` folder
and import them locally — **do not** edit the originals in `_design-system/`.

---

## 2. Dark mode & light mode — both are mandatory

Every project ships with a working toggle. Rules:

- The toggle writes `class="dark"` on `<html>` and persists the choice in
  `localStorage` under `ob.theme` (`"dark"` | `"light"`).
- **Never** hard-code colours in a component (`bg-white`, `text-black`,
  `bg-[#123]`). Use the semantic tokens instead:
  `bg-canvas bg-surface bg-surface-2 bg-elevated text-ink text-ink-2
   text-ink-muted border-line border-line-strong`.
- Brand accents (`aurora-*`, `cyan-glow`, `violet-glow`) are the same in both
  themes — they are the brand.
- On first visit, follow `prefers-color-scheme`. A tiny inline script in
  `index.html` sets the class before paint so there is no white flash:

  ```html
  <script>
    (function () {
      var t = localStorage.getItem("ob.theme");
      if (!t) t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", t === "dark");
    })();
  </script>
  ```

- The toggle lives in the header/navbar, right side, with a sun/moon icon and
  `aria-label="Switch to dark mode"` / `"Switch to light mode"`.
- `ThemeProvider.jsx` in `react/` already implements the above. Use it.

---

## 3. The 3D look

Three techniques, used consistently:

1. **Tilt cards** — `.tilt` + `TiltCard.jsx`. On pointer move the card rotates
   ±8° on X and Y with `perspective(1100px)`. Content inside can be layered
   with `.depth-1/.depth-2/.depth-3` (`translateZ`) so it floats above the
   surface. Use on: feature cards, job/product cards, stat tiles, pricing.
2. **Glass surfaces** — `.glass`. Translucent panel + `backdrop-filter: blur(18px)`
   + a faint gradient border. Use on: overlays, the header when scrolled,
   panels sitting on top of the aurora background, the hero text block.
3. **Depth on elevation** — every raised surface uses a shadow token
   (`--shadow-e1..e4`, `--shadow-glow`). Never write raw `box-shadow` in a
   component; use the token so light and dark stay consistent.

Do **not** use flat grey cards. A card is `surface` + `card-3d`/`card-glow`
+ a shadow token.

---

## 4. Motion

- **Scroll reveal** — wrap a section in `<Reveal>` or add `className="reveal"`.
  Elements start hidden and fade up when they enter the viewport. Stagger with
  `data-delay="120"` (ms). Anything above the fold on the first paint must
  animate immediately, not wait for a scroll.
- **Micro-interactions** — buttons lift 2px on hover (already in `.btn-*`),
  cards tilt, badges scale, icons rotate slightly on hover.
- **Ambient** — `.aurora-blob` (large blurred gradient blobs drifting slowly
  behind hero sections), `.aurora-ring` (a rotating conic ring), `.float`,
  `.shimmer-text` for highlighted words.
- **Page transitions** — wrap the routed page in `.page-enter`.
- **Numbers** — count up when they scroll into view.
- **Reduced motion** — `motion.css` already disables everything for
  `prefers-reduced-motion: reduce`. Never disable that rule.

---

## 5. The WebGL hero

`AuroraHero.jsx` renders a Three.js scene behind the hero content:

- A field of ~180 particles orbiting in a tilted disc, with additive blending
  and a colour gradient from `aurora-500` → `cyan-glow` → `violet-glow`.
- The camera slowly drifts; the pointer nudges the rotation slightly.
- **Lazy-loaded** — `three` must be imported with a dynamic `import()` inside
  `useEffect` so it is not in the initial bundle. Show the CSS aurora blobs
  immediately as the fallback, and let the canvas fade in over ~600ms.
- **Theme aware** — read the current theme from `useTheme()` and pick
  background/opacity values for light and dark. The dark version should read
  as a glowing nebula; the light version as a soft pastel wash with lower
  opacity.
- **Degrade gracefully** — if WebGL is unavailable or the device prefers
  reduced motion, skip the canvas entirely and keep the CSS background.
- **Performance** — cap device pixel ratio at 2, pause the render loop when
  the tab is hidden or the hero is scrolled out of view, and dispose the
  geometry/materials/renderer on unmount.
- The hero content (headline, sub-copy, buttons, stats) is normal HTML on top
  of the canvas and must stay readable in both themes.

`three` is the only new dependency this design system requires.

---

## 6. Component recipes

| Need | Use |
|---|---|
| Primary action | `.btn .btn-primary` |
| Secondary action | `.btn .btn-secondary` |
| Quiet action | `.btn .btn-ghost` |
| Destructive | `.btn .btn-danger` |
| Card | `.surface` or `.card-3d` + `card-glow` for a gradient border |
| Panel over a background | `.glass` |
| Text input / select / textarea | `.field` (+ `.field-invalid` on error) |
| Label | `.label` |
| Pill / status | `.badge`, `.badge-accent`, `.badge-success`, `.badge-warning`, `.badge-danger` |
| Nav item | `.nav-link` (+ `.nav-link-active` for the current route) |
| Data table | `.table-shell` wrapping `<table>` |
| Loading placeholder | `.skeleton` |
| Error state | `.surface` with `role="alert"`, a short message and a "Try again" button |
| Empty state | `.surface` with an icon, one line of copy and one action |

Typography: `font-display` for headings (Bricolage Grotesque), `font-sans` for
body, `font-mono` for codes/IDs. Load Bricolage Grotesque from Google Fonts in
`index.html` if it is not already there.

---

## 7. Accessibility rules (non-negotiable)

- Every input has a real `<label>` (visually hidden is fine for icon filters).
- Icon-only buttons get an `aria-label`.
- Focus is always visible — never `outline-none` without a replacement.
- Colour contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and borders.
- The theme toggle is a real `<button>` with `aria-pressed` or an updated
  `aria-label`.
- Modals trap focus, close on `Escape`, and restore focus on close.
- All animation respects `prefers-reduced-motion`.
- Landmarks: one `<header>`, one `<nav>`, one `<main>`, one `<footer>`.
- Images need alt text; decorative ones use `alt=""`.

---

## 8. Rules of engagement

- **Do not change the API layer.** The back end is owned by another agent and
  the API contract is fixed. Only presentation changes are in scope.
- **Do not change routes or page URLs.** Same pages, new look.
- Keep the existing component names and file paths where practical so the
  diff stays reviewable.
- No `any` in TypeScript. No inline `style={{}}` for colours — use tokens.
- Run `npm run build` in the front end after every batch of work; it must
  pass with zero errors.
