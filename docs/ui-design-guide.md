# Iny One — UI Design System Guidelines

## 1. Design Philosophy

Build interfaces following a modern SaaS design language.

The visual identity must be:
- Minimalist and clean.
- Professional and consistent.
- Data-oriented.
- Accessible and responsive.
- Visually similar to Linear, Vercel and Stripe.

Avoid excessive decoration, gradients, unnecessary shadows and saturated backgrounds.

Dashboards should feel data-oriented and varied in hierarchy without becoming
visually fragmented. Indigo remains the primary interface and data color;
neutral surfaces and borders carry most of the layout.

## 2. Technology Stack

- ReactJS
- TailwindCSS
- Chart.js
- Headless UI (@headlessui/react)
- Lucide React for icons.

Prefer reusable components and utility classes.

## 3. Brand Colors

Use these colors as the canonical design tokens:

| Token | Hex | Tailwind |
|---|---|---|
| Primary | #4F46E5 | `primary` (filled buttons, active segments) |
| Primary Hover | #4338CA | `primary-hover` |
| Primary Text | #4F46E5 | indigo-600 (links, icons, accents) |
| Primary Soft | #EEF2FF | indigo-50 |
| Primary Border | #C7D2FE | indigo-200 |

Filled primary controls use `bg-primary` / `hover:bg-primary-hover`, not
`bg-indigo-600`: the `indigo-*` scale is remapped in dark mode for text and
tints, while `primary` keeps white text at AA contrast in both themes.

Indigo is reserved for actions, links, focus and the primary data series.
Do not use it (or blue) for page backgrounds, decorative gradients or plan
cards: page backgrounds are `gray-50`, content sits on `surface`.

## 4. Neutral Colors

| Token | Hex | Tailwind |
|---|---|---|
| Background | #F9FAFB | gray-50 |
| Surface | #FFFFFF | `surface` (never `bg-white`) |
| Border | #E5E7EB | gray-200 |
| Text Primary | #111827 | gray-900 |
| Text Secondary | #4B5563 | gray-600 |
| Text Muted | #6B7280 | gray-500 |

## 5. Semantic Colors

Use semantic colors consistently:

- Success: #16A34A (green-600)
- Success Background: #F0FDF4 (green-50)
- Warning: #D97706 (amber-600)
- Warning Background: #FFFBEB (amber-50)
- Danger: #DC2626 (red-600)
- Danger Background: #FEF2F2 (red-50)
- Info: #2563EB (blue-600)
- Info Background: #EFF6FF (blue-50)

Never use semantic colors for purely decorative purposes.

- Use `amber`, never `yellow`, for warnings.
- Info (`blue`) is only for informational notices, never for brand actions:
  brand actions are always `primary`.

## 5.1 Dark Mode

Dark mode is class-based (`.dark` on `<html>`, `dark:` variant available).
An inline script in `app/layout.tsx` applies it before first paint: the stored
choice (`localStorage.theme`) wins, otherwise the system preference is followed
live. The toggle lives in the navbar.

The palette is remapped by role in `src/styles/globals.css`, so components keep
semantic classes (`text-gray-900`, `bg-gray-50`, `border-gray-200`,
`bg-indigo-50`) and must not add parallel `dark:` classes for them.

| Role | Light | Dark |
|---|---|---|
| Background (gray-50) | #F9FAFB | #0B1120 |
| Surface (`surface`) | #FFFFFF | #111827 |
| Subtle fill (gray-100) | #F3F4F6 | #182133 |
| Border (gray-200) | #E5E7EB | #263145 |
| Text Primary (gray-900) | #111827 | #F1F5F9 |
| Text Secondary (gray-600) | #4B5563 | #AAB6C6 |
| Text Muted (gray-500) | #6B7280 | #94A3B8 |
| Primary Soft (indigo-50) | #EEF2FF | #1C1A48 |
| Primary Text (indigo-600) | #4F46E5 | #8B93F8 |
| Primary (`primary`) | #4F46E5 | #4F46E5 |

Semantic tints (50–200) become dark tinted backgrounds and their text tones
(600–800) are lightened to keep AA contrast.

Rules:
- Use `dark:` only for what the remap cannot express (outlines on
  `black/5`, third-party brand assets such as the Google button).
- Always-dark elements (navbar, tooltips, code blocks) carry `.theme-static`
  so they keep their original palette; descendants that must follow the theme
  (dropdowns rendered inside the navbar) carry `.theme-follow`.
- Content that must stay white to work (QR previews) keeps `bg-white`.
- Never rely on shadows for separation in dark mode; use borders.

## 6. Component Guidelines

### Buttons
- Primary actions: indigo-600 with white text.
- Secondary actions: white background with gray border.
- Destructive actions: red-600.
- Hover states must be subtle.
- Provide visible focus states.

### Cards
- White background.
- Rounded-xl corners.
- Subtle shadow-sm or border.
- Consistent internal padding.
- Avoid excessive borders and shadows.
- Reserve white cards for content that needs visual priority: KPIs, charts,
  tables and primary summaries.
- Use `gray-50` surfaces or simple gray borders for secondary containers,
  toolbars and supporting information instead of stacking additional white
  cards.
- Do not give every section the same visual weight. Use spacing, heading
  hierarchy and one emphasized metric or chart to establish the reading order.
- Avoid combining multiple shadows, heavy borders and saturated backgrounds
  inside a single dashboard panel.

### Dashboard Layout and Hierarchy
- Structure dashboards around a clear primary insight, then supporting trends,
  breakdowns and detailed records.
- Use compact section headers and consistent internal padding. Large empty
  areas should be avoided, but the layout should retain enough breathing room
  to distinguish sections.
- Prefer neutral `gray-50` page backgrounds, white content surfaces and
  `gray-200` dividers. This keeps data sections distinct without relying on
  repeated colored panels.
- Emphasize at most one KPI or summary metric within a section. Use indigo
  soft fills (`indigo-50`) or indigo text for the highlighted value, not an
  additional shadow or border.
- Alternate information density deliberately: high-density tables and
  breakdown lists should sit beside more open charts or summary cards.
- Example, empty and setup states must remain visibly different from real data
  through an indigo-soft notice or explicit label. Do not use decorative color
  to imply real activity or a successful metric.

### Dashboard Page Density
- Page container: `px-4 py-5 md:px-6 lg:px-8`, `max-w-7xl`, `space-y-4`
  between sections and `gap-3` inside grids. Card padding is `p-4`; KPI tiles
  use `px-4 py-3`.
- Order: compact header with the primary action → KPI row
  (`grid-cols-2 lg:grid-cols-4`) → charts row
  (`md:grid-cols-2 xl:grid-cols-3`) → full-width table. Tables get the full
  width so more columns fit without horizontal scrolling.
- Build sections with the shared `DashboardCard` and `Kpi` components. Do not
  restyle cards locally.
- Chart heights follow the viewport: `DASHBOARD_CHART_HEIGHT`
  (`h-48 lg:h-[clamp(11rem,24dvh,15rem)]`) on dashboards; the main trend of a
  detail page may use `clamp(18rem,50dvh,28rem)` with the breakdowns stacked
  beside it (`lg:grid-cols-[2fr_1fr]`). Avoid fixed `h-64`/`h-72` blocks.
- Hide the legend of single-series charts; the card title already names it.
- Table scroll areas use `max-h-[clamp(18rem,62dvh,44rem)]` so the toolbar and
  pagination stay reachable.

### Example Data
- Example (demo, empty, setup) dashboards mirror the real layout exactly:
  same components, order, grids and table. Only the data and the markers
  differ, so what users learn transfers to their real dashboard.
- Mark example data at three levels: a dashed indigo notice with the CTA at
  the top, `border-dashed` on every example card and KPI, and the
  `ExampleBadge` («Ejemplo» / «Sample») on cards and the table title.
- Example data must be internally consistent (per-link clicks add up to the
  total; chart labels match table slugs) and use `example.com` destinations.
- Actions on example rows are visible but disabled with an explicit reason
  (`readOnlyReason`), never silently missing.

### Dashboard Color Usage
- Indigo is the default for primary actions, the dominant chart series,
  active controls and selected states.
- Use cyan, emerald, amber and rose only to distinguish meaningful categories,
  datasets or semantic states.
- Do not assign a different brand color to every card or section. Repeated
  equal-weight color accents make dashboards repetitive and reduce hierarchy.
- Limit category charts to a restrained mix of chart palette colors. A primary
  indigo series should remain visually dominant unless the chart represents
  unrelated categories.
- Semantic colors must communicate status or state. Do not use success, warning
  or danger backgrounds as decoration.

### Inputs
- White background.
- Gray-300 border.
- Indigo focus ring.
- Clearly distinguish disabled and invalid states.

### Modals and Dialogs

Modals must show the task at a glance; scrolling is a fallback for small
viewports, not the default.

Structure:
- The panel is a flex column: fixed header (title + close), a body that is the
  only scroll area (`min-h-0 flex-1 overflow-y-auto`) and, for forms, a sticky
  footer with the actions. Title, close and Save stay visible at any height.
- Height: `max-h-[calc(100dvh-2rem)]` from `sm`; never a fixed height. Use
  `dvh`, not `vh`, so mobile browser bars do not hide the footer.
- Width by content: forms `max-w-3xl`, analytics `max-w-6xl`, single
  previews (QR) `max-w-md`. Do not reuse one width for every mode.

Responsive behavior:
- Mobile (< sm): full-screen sheet (`h-dvh`, no radius or border), one column.
- Tablet (sm–lg): centered panel; group short related fields in 2–3 columns.
- Desktop (≥ lg): use the width before the height. Place secondary content
  beside the primary content (e.g. breakdown charts next to the trend).

Density inside modals:
- Header `px-4 py-3` / `sm:px-5`; body `p-4` / `sm:px-5`; gaps `gap-3`.
- Group fields in rows by meaning (destination full width; alias + short URL
  side by side; UTM in one row) instead of one boxed section per field.
- Helper text `text-xs`; only one tinted container per form for an optional
  group (UTM).
- KPI tiles: `px-3 py-2`, label `text-xs`, value `text-xl`.
- Chart heights follow the viewport with a clamp, e.g.
  `h-[clamp(16rem,48dvh,26rem)]`, with a fixed `h-52` fallback on mobile.
- Hide chart legends when a single series is labelled by the card title.
- Read-only values (short URL) are shown as disabled-looking fields in the
  grid, not as separate banners.

### Popovers and Tooltips
- Use Headless UI Popover.
- White background.
- Gray-200 border.
- Subtle shadow.
- Rounded-lg corners.
- Ensure content never overflows the viewport.
- Support keyboard navigation and accessible labels.

### Tables
- White background.
- Gray-50 header.
- Gray-200 row separators.
- Subtle hover background.
- Support horizontal scrolling on mobile.

### Badges
- Use semantic backgrounds and text colors.
- Keep badges small and unobtrusive.
- Do not use badges for decorative purposes.

## 7. Chart.js Guidelines

Use the following fixed visualization palette:

- Indigo: #4F46E5
- Cyan: #0891B2
- Emerald: #059669
- Amber: #D97706
- Rose: #E11D48
- Violet: #7C3AED

Rules:
- Keep chart colors consistent across the application.
- Use Indigo as the primary data series color.
- Use transparent fills for area charts.
- Keep grid lines subtle.
- Avoid unnecessary legends.
- Always provide responsive chart containers.
- Use maintainAspectRatio: false when the container controls chart dimensions.
- Import charts from `features/dashboard/components/charts`, never from
  `react-chartjs-2` directly: the wrapper adapts axis, grid and series colors
  to the active theme.

Dark mode series use the 400 tone of each family (Indigo #818CF8,
Cyan #22D3EE, Emerald #34D399, Amber #FBBF24, Rose #FB7185, Violet #A78BFA),
mapped automatically from `DASHBOARD_CHART_COLORS`.

## 8. Responsive Design

All components must be responsive.

Use Tailwind breakpoints:
- Default: Mobile first.
- sm: 640px.
- md: 768px.
- lg: 1024px.
- xl: 1280px.

Rules:
- Use grid-cols-1 as the default.
- Increase columns on larger screens.
- Tables must support overflow-x-auto.
- Avoid fixed widths that cause horizontal overflow.
- Popovers must remain inside the viewport.
- Charts must resize according to their containers.
- Ensure buttons and interactive elements remain usable on touch devices.

## 9. Accessibility

- Maintain WCAG AA contrast whenever possible.
- Never communicate status using color alone.
- Use descriptive accessible labels.
- Support keyboard navigation.
- Provide visible focus indicators.
- Use semantic HTML elements.

## 10. Consistency Rules

When creating or modifying UI components:

1. Always reuse the established color palette.
2. Never introduce arbitrary brand colors.
3. Prefer existing Tailwind color tokens.
4. Avoid unnecessary visual complexity.
5. Use consistent spacing and border radii.
6. Prioritize readability over decoration.
7. Maintain visual consistency across all pages.
8. Do not introduce a new design language without explicit authorization.

The objective is to make every new component look like it belongs to the same Iny One application.