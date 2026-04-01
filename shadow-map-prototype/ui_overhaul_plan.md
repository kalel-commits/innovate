# Plan: Premium UI Refinement

The current UI is failing to meet premium standards due to font loading issues, aggressive scaling, and faint aesthetic effects. This plan focuses on restoring visual excellence.

## Proposed Changes

### [Component Name] Global Styles & Typography

#### [MODIFY] [index.html](file:///c:/Users/ajay/Desktop/innovateu4/shadow-map-prototype/frontend/index.html)
- Add Google Fonts import (Inter & Outfit) for a modern, sleek look.
- Refine CSP to allow Google Fonts.

#### [MODIFY] [index.css](file:///c:/Users/ajay/Desktop/innovateu4/shadow-map-prototype/frontend/src/index.css)
- Set 'Outfit' as the primary heading font and 'Inter' as the body font.
- Add global focus and scrollbar styles.

### [Component Name] Landing Page Refinement

#### [MODIFY] [LandingPage.tsx](file:///c:/Users/ajay/Desktop/innovateu4/shadow-map-prototype/frontend/src/pages/LandingPage.tsx)
- Scale down the hero heading to `text-5xl md:text-7xl` for better fit.
- Increase the intensity and size of the background glow effects.
- Add subtle border gradients and improved glassmorphism tokens.
- Ensure buttons have proper hover-scale effects.

## Verification Plan

### Manual Verification
1. Open the dev server and verify fonts are loading correctly (sans-serif, not serif).
2. Check the hero section on multiple screen widths to ensure no text overlapping.
3. Verify the "glow" is visible but not overwhelming.
