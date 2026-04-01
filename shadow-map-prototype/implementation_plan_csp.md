# Plan: Resolve CSP Violations & Fix UI Styling

The recent v2.0 upgrade introduced high-end glassmorphism components using Tailwind CSS classes, but the styling is not rendering correctly because Tailwind was not configured. Additionally, a Content Security Policy (CSP) issue is blocking script evaluation.

## Proposed Changes

### [Component Name] Frontend Styling & Security

#### [MODIFY] [tailwind.config.js](file:///c:/Users/ajay/Desktop/innovateu4/shadow-map-prototype/frontend/tailwind.config.js) [NEW]
- Initialize Tailwind configuration to scan `src` files for classes.

#### [MODIFY] [postcss.config.js](file:///c:/Users/ajay/Desktop/innovateu4/shadow-map-prototype/frontend/postcss.config.js) [NEW]
- Configure PostCSS to use Tailwind and Autoprefixer.

#### [MODIFY] [index.css](file:///c:/Users/ajay/Desktop/innovateu4/shadow-map-prototype/frontend/src/index.css)
- Add Tailwind directives (`@tailwind base;`, etc.).

#### [MODIFY] [index.html](file:///c:/Users/ajay/Desktop/innovateu4/shadow-map-prototype/frontend/index.html)
- Add a Content Security Policy meta tag to allow necessary scripts while being explicit about `unsafe-eval` if required for the demo environment.

## Phase 1: Tailwind Setup
1. Install dependencies: `tailwindcss`, `postcss`, `autoprefixer`.
2. Generate configuration files.
3. Update `index.css`.

## Phase 2: Security & CSP
1. Add CSP meta tag to `index.html`.
2. Audit code for any unintentional `eval()` or string-based timers.

## Verification Plan
1. Check that the UI matches the glassmorphism design tokens (vibrant colors, blur effects).
2. Monitor console for CSP violations.
