# Marketna Dashboard UI Design Prompt

Use this prompt when creating or updating a dashboard page, form, sheet, dialog, data table, or its loading state in the Marketna codebase.

---

You are working on the Marketna application. Design and implement the requested dashboard UI so it feels consistent with the existing application rather than introducing a new visual system.

## Before making changes

- Inspect the target page and its related components first. Reuse existing patterns and shared components from `components/ui/` and `components/dashboard/` wherever practical.
- Check nearby pages for the established layout, responsive behavior, translations, permissions, and interaction conventions. Keep related views consistent.
- This project uses a Next.js version with breaking API changes. Before writing or changing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and follow its current conventions.
- Keep the requested scope focused. Do not redesign unrelated parts of the application or add dependencies for visual styling.

## Visual language

- Use the existing design tokens and semantic Tailwind classes: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`, `text-primary`, and the established destructive/status variants.
- Support both light and dark themes through tokens. Do not introduce hard-coded colors where a project token or shared component is appropriate.
- Keep the dashboard compact, clear, and information-dense. Prefer restrained borders, subtle `shadow-xs`, rounded cards (`rounded-xl`), and consistent spacing over decorative effects.
- Use the established typography hierarchy: bold page titles (`text-xl`/`sm:text-2xl`), small section headings (`text-sm font-semibold`), compact labels and table content (`text-xs`), and subdued supporting text (`text-xs` or `text-sm text-muted-foreground`).
- Reuse the common dashboard content width and spacing where applicable: `mx-auto w-full max-w-7xl`, `space-y-6`, and `px-2 py-4 md:px-4 md:py-6`.
- For card sections, follow the existing shape: `rounded-xl border border-border bg-card p-4 shadow-xs` or `p-5` for roomier forms. Section headers commonly use an icon, title, optional description, and `border-b border-border/60 pb-3`.
- Use Lucide icons consistently with nearby components. Icons are supporting cues, not substitutes for clear labels.

## Page headers and responsive layout

- Match the target page's established header pattern. Management pages commonly use a small icon in a `size-7` secondary-colored container, a bold title, a muted description, and a subtle bottom border.
- Preserve responsive behavior rather than shrinking a desktop layout indiscriminately. Stack controls and form fields on narrow screens; use the existing `sm:`, `md:`, and `lg:` breakpoints for wider layouts.
- Use logical CSS properties and RTL-aware utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `inset-s-*`, `inset-e-*`). Ensure alignment, icon placement, and directional controls remain correct in Arabic and other RTL locales.
- Keep meaningful content order on mobile, including when desktop layouts use grid columns or CSS ordering.

## Forms

- Use the shared `Field`, `FieldGroup`, `FieldLabel`, and `FieldError` components with the project's established form and schema-validation patterns.
- Put related fields into clearly titled card sections. Use compact, readable labels (`text-xs`), consistent vertical spacing, and input heights aligned with nearby forms (commonly `h-8` or `h-9`).
- Keep label-to-input associations, validation messages, required indicators, and accessible names intact. Do not rely on placeholders as labels.
- Show validation and server errors clearly using the shared `Alert` components or the existing inline field errors. Preserve the project's toast and error-handling conventions.
- Make submission state visible with the shared `Spinner` and an appropriate pending label. Disable duplicate submission and prevent closing the sheet or dialog during an in-flight operation when that matches the surrounding flow.
- Place form actions consistently. On compact screens, actions may become full-width and stacked; on larger screens, keep them aligned and sized like neighboring forms.

## Sheets and dialogs

- Use the shared `Sheet` or `Dialog` primitives from `components/ui/`; preserve their built-in overlay, focus behavior, close control, and animation.
- Give each overlay a clear title and short description. Use a stable header and action area with a separately scrollable body for long content so actions remain reachable.
- For sheets, follow the existing full-width mobile treatment and constrained desktop width (often `sm:max-w-xl`). Keep the header and footer fixed while the form body scrolls.
- For dialogs with substantial content, constrain height relative to the dynamic viewport and make only the content region scrollable. Avoid clipping form fields or footer actions on short screens.
- Keep cancel and submit actions distinct, preserve pending-state close guards, and use destructive styling only for destructive actions.

## Tables and management lists

- Use the existing table primitives and TanStack Table patterns for management data. Keep the table inside a rounded, bordered card with horizontal overflow handling.
- Use a muted table header, compact muted header labels, consistent row padding, and subtle hover states. Keep primary identity information readable and secondary details visually quieter.
- Match the toolbar to nearby tables: a flexible `h-8` search field, compact action buttons, and filters/column controls aligned in a single row where space allows.
- On small screens, replace wide segmented filters with the existing dropdown-filter pattern and hide only secondary columns. Do not hide the primary identity or essential row action.
- Preserve column visibility controls, sorting/filtering behavior, empty states, row actions, permissions, and pagination behavior when adjusting the appearance.
- Keep pagination responsive and visually secondary. Follow the target table's actual behavior for when pagination appears, page-size controls, and compact mobile navigation.

## Loading, empty, and feedback states

- A loading skeleton should mirror the actual page structure, content order, approximate element dimensions, table columns, responsive visibility, and spacing. Do not use a generic skeleton that suggests a different page.
- Reuse the shared `Skeleton` component and keep its shapes aligned with the components they represent. Use a restrained pulse animation consistent with existing loading screens.
- Design empty, error, and success feedback as part of the page, not as afterthoughts. Preserve actionable recovery paths and clear status text.

## Accessibility, localization, and behavior

- Localize all user-facing text with the project's `next-intl` conventions. Do not hard-code new labels, descriptions, accessible names, or validation text.
- Preserve permission gating and authorization behavior. A visual change must not make a hidden action available or bypass an existing permission check.
- Use semantic buttons and form controls, keyboard-operable actions, visible focus states, accessible names for icon-only controls, and appropriate table semantics.
- Preserve existing server/client component boundaries, form submission behavior, data flow, and route navigation. Do not move server-only logic into client components merely to support styling.
- Keep error handling explicit. Do not replace failures with success-shaped fallbacks or silently swallow errors.

## Completion checks

- Compare the result with the relevant existing page and verify the visual hierarchy at mobile and desktop widths, in both LTR and RTL layouts, and in light and dark themes when practical.
- Check that forms, sheets, dialogs, tables, loading states, and empty states remain consistent with their neighboring dashboard screens.
- Run the smallest relevant lint, type-check, or test command for the files changed, and report any validation that could not be completed.
