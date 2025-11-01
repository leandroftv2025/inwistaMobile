# Inwista Fintech MVP - Design Guidelines

## Design Foundation

**System:** Material Design 3 adapted for fintech
**Principles:** Financial clarity, trust through polish, progressive disclosure, cross-platform consistency

**Typography:**
- **Fonts:** Inter (primary), JetBrains Mono (monospace for numbers/IDs)
- **Scale:** Display (text-4xl-6xl/bold), Page Titles (text-2xl-3xl/semibold), Headers (text-xl/semibold), Body (text-base/normal/leading-relaxed), Financial Values (text-2xl-4xl/bold/tabular-nums), Labels (text-sm/medium), Micro (text-xs)
- **Numbers:** Tabular-nums for alignment, currency symbols with spacing, +/- prefixes for gains/losses

**Spacing:** Tailwind units: 2-4 (micro), 4-8 (component), 8-16 (margins), 16-24 (sections), 4-8 (screen padding by device)

**Containers:**
- Auth: max-w-md centered
- Dashboard: max-w-7xl
- Detail: max-w-4xl
- Settings: max-w-2xl

**Breakpoints:** Mobile <768px, Tablet 768-1024px, Desktop >1024px

---

## Core Components

### Navigation
- **Mobile:** Bottom tabs (4-5 items), icons+labels, active with fill/scale
- **Desktop:** Side rail, expandable on hover
- **Top Bar:** Logo (44x44), title, actions (notifications, settings, theme), elevate on scroll

### Cards
- **Product Cards:** Elevated shadow, icon (32x32), title+description, CTA. "Coming Soon": reduced opacity, disabled, badge overlay
- **Transaction Cards:** Icon left, details center, amount right, timestamp caption, dividers/spacing, swipeable actions
- **Balance Cards:** Large values, trend indicators, period chips, optional glass morphism

### Forms & Inputs
- **Text Fields:** MD3 outlined, floating labels, helper text, error/success states with icons
- **CPF:** Auto-mask (###.###.###-##), real-time validation
- **Password:** Toggle visibility, strength bars, requirements checklist
- **Buttons:** Primary (filled), Secondary (outlined), Tertiary (text), Icon (48x48 min). Loading: spinner replaces text
- **Amount:** Large text, currency prefix, locale formatting, quick chips

### Data Display
- **Lists:** 56-72px rows, leading icon, primary/secondary text, trailing values, sticky headers
- **Tables:** Zebra striping, sortable headers, sticky, collapse to cards on mobile
- **Charts:** Line (trends), Donut (allocation), Bar (spending), tooltips

### States
- **Empty:** Icon (96x96+), headline, description, CTA, centered max-w-sm
- **Loading:** Skeleton screens with shimmer, spinners for overlays only
- **Error:** Alert icon, clear message, retry CTA, inline preferred
- **Success:** Checkmark animation, 3-4s auto-dismiss, undo option

### Overlays
- **Dialogs:** Centered max-w-md, scrim backdrop, title/content/actions
- **Bottom Sheets:** Slide-up, drag handle, partial/full height
- **Toasts:** Bottom center/left, 4-6s, optional action, queue

---

## Screen Patterns

### Onboarding
Full-screen logo, 3-4 benefit cards, "Get Started" CTA, legal footer, swipeable carousel

### Authentication
- **Login:** Logo top, CPF+password, forgot link, full-width button (mobile), signup link
- **2FA:** Progress (1/3, 2/3, 3/3), method chips, 6-digit auto-submit, resend timer

### Home/Dashboard
- **Hero:** Net worth (large), hide/show toggle, period selector, quick actions (PIX/Deposit/Invest)
- **Products Grid:** 1-3 cols by device, dynamic from catalog, enabled vs coming-soon states, 160-200px min height
- **Activity:** Recent grouped by date, sticky headers, "View All"

### PIX
- **Send:** Recipient selection → amount input → confirmation → receipt (share/done)
- **Receive:** Keys list, QR generator (animated), share options
- **History:** Filter chips, search, tap for receipt

### StableCOIN
- **Dashboard:** BRL/StableCOIN balances, exchange ticker, quick actions, history
- **Trade:** Tab nav (Buy/Sell/Convert), amount input with toggle, live rate, fee breakdown, slippage warning, confirmation

### Investments
- **Portfolio:** Total/return, allocation donut, performance chart, category tabs
- **Listings:** Filter sidebar/sheet (risk/return/liquidity), cards with metrics, sort options
- **Detail:** Hero card, about (risk/minimum/liquidity), chart, deposit/redeem buttons, documents
- **Simulation:** Amount slider, projected returns, date estimate, confirmation

### Settings
Grouped lists: Account, Preferences (theme radio/language), Privacy (biometrics toggle), Support. Theme applies immediately.

---

## Accessibility (WCAG AA)

- **Focus:** Visible 2px rings, logical tab order, skip nav, modal traps
- **Touch Targets:** 44x44px min (iOS), 48x48px preferred (Material), adequate spacing
- **Contrast:** 4.5:1 text, 3:1 UI/large text. No color-only indicators (use icons/patterns/text)
- **Screen Readers:** Semantic HTML, ARIA roles, icon labels, dynamic announcements, form errors
- **Keyboard:** All functions accessible, Esc closes, arrows navigate, Enter/Space activate

---

## Responsive Adaptations

**Navigation:** Bottom tabs → side rail  
**Cards:** Stack → 2-col → 3-col grid  
**Forms:** Full width → max-w-md  
**Modals:** Full screen → centered  
**Tables:** Cards → data table

---

## Images & Media

- **Logo:** 40x40 (mobile), 44x44 (desktop), high-res for splash
- **Onboarding Hero:** 375x300 (mobile), 1200x600 (desktop), top of screen, modern/professional
- **Module Icons:** 32x32 (cards), 48x48 (nav), Heroicons/Material Icons, consistent stroke
- **Empty States:** 128x128+ simple illustrations, consistent style
- **Avatars:** 40x40 (lists), 64x64 (profile), circular, initials/default
- **Charts:** Programmatic, responsive canvas
- **No heroes needed:** Transaction/settings/history pages

---

## Animation (Minimal, Purposeful)

**Use:** Page slides (mobile)/fades (desktop), stagger card entry, checkmark scale-in, pull-refresh, skeleton shimmer  
**Avoid:** Parallax, auto-carousels, excessive hovers, background animations  
**Performance:** 60fps, GPU transforms only, respect prefers-reduced-motion

---

## Color System (Tailwind)

Use semantic tokens:
- **Primary:** Brand actions (buttons, links)
- **Surface:** Cards, backgrounds (gray-50 light, gray-900 dark)
- **On-Surface:** Text (gray-900 light, gray-50 dark)
- **Success:** Green-600/400 (gains, confirmations)
- **Error:** Red-600/400 (losses, errors)
- **Warning:** Amber-600/400 (alerts)
- **Borders:** gray-200 (light), gray-700 (dark)

Test all states (default/hover/focus/disabled) for contrast.

---

**Implementation:** Follow MD3 patterns, adapt with Inwista brand, ensure cross-platform consistency, prioritize financial data clarity and user trust.