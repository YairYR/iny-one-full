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
| Primary | #4F46E5 | indigo-600 |
| Primary Hover | #4338CA | indigo-700 |
| Primary Soft | #EEF2FF | indigo-50 |
| Primary Border | #C7D2FE | indigo-200 |

## 4. Neutral Colors

| Token | Hex | Tailwind |
|---|---|---|
| Background | #F9FAFB | gray-50 |
| Surface | #FFFFFF | white |
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