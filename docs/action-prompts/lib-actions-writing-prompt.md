# Marketna Server Actions Writing Prompt

Use this prompt when creating or updating queries and mutations under `lib/actions/`.

---

You are working in the Marketna codebase. Implement the requested server action by following the structure and conventions of the closest existing actions in the same module. Do not introduce a parallel style: inspect neighboring query and mutation files, their callers, schemas, permissions, and barrel exports before editing.

## Before implementation

- Read the relevant action files and shared conventions in `lib/actions/README.md`.
- Check the database schema and generated Supabase types before composing queries.
- Find the existing permission constant and use the established `hasPermission` helper for protected operations.
- Inspect callers to preserve the public input shape, result contract, and expected error identifiers.
- Keep the change focused. Reuse existing schemas and helpers where suitable; do not create duplicate validation, result, or error-handling utilities.

## File and function structure

- Keep query and mutation modules in their existing subdirectories and export their public functions through the module barrel when applicable.
- Follow the established file header:

  ```ts
  /**
   * @file lib/actions/example/mutations/create-example.ts
   * @description Creates an example after validating its input.
   */
  ```

- Put `"use server"` at the top of server-action modules, following the order used by neighboring files.
- Use descriptive verb-first function names (`get...`, `create...`, `update...`, `delete...`).
- Accept related arguments as one named input object. Name the parameter `input` and use a corresponding Zod schema and named input type.
- Use type-only imports for types when appropriate and preserve the existing import ordering and formatting.

## Validation and authorization

- Treat every action argument as untrusted. Validate it at the action boundary with the relevant Zod schema before using it in a query or mutation.
- Use `safeParse` and return the established `VALIDATION_ERROR` result with field-keyed issue messages. Reuse the module's validation helper when one exists.
- Check the relevant permission before accessing or changing protected data. Use the existing permission constants; do not duplicate permission strings or rely on the UI to enforce authorization.
- For public reads, keep public access behavior intentional. Require management-view permission when exposing inactive or otherwise restricted records.
- Validate relational invariants that are not guaranteed by the schema alone, such as a parent record existing or a hierarchy not containing a cycle.

## Queries and mutations

- Use the typed server Supabase client and the existing generated database types.
- Select only the fields needed by the action where practical. Use `.maybeSingle()` when absence is an expected outcome and return a stable not-found error; use `.single()` when exactly one row must be returned.
- Check Supabase's returned `error` explicitly. Map expected database conditions to stable action error identifiers and include diagnostic messages in `details.database`.
- Normalize form values to database values at the persistence boundary when needed (for example, convert an empty optional URL to `null`).
- After successful mutations, invalidate the relevant route or layout using the project's existing `revalidatePath` pattern.
- Do not report success when a requested row was not found or a database operation failed.

## Error handling and `try/catch`

- Match the surrounding actions' error-handling structure. Existing modules may handle returned Supabase errors directly without `try/catch`, while another established flow may use a `try/catch`; do not add or remove one solely for stylistic preference.
- Supabase query failures are returned as `{ data, error }` and must be handled explicitly in either structure.
- Do not add a broad `try/catch` that silently converts unexpected exceptions into a generic result. If a catch is justified by the local pattern or a specific recoverable boundary, log the unexpected error using the established logging convention and return a stable failure result.
- Keep validation errors, permission denials, not-found cases, expected database conflicts, and unexpected failures distinguishable.

## Return contract

- Use `ApiResult<T>` from `lib/actions/types/utils.ts` for actions with expected failure cases.
- Always include `data` on success. Use `ApiResult<null>` when the successful operation has no useful payload.
- Keep result shapes consistent:

  ```ts
  { success: true, data }
  { success: false, error: "STABLE_ERROR_KEY", details? }
  ```

- Use stable, translation-friendly error keys. Put diagnostic details under `details`; do not expose raw database messages as the main error identifier.
- Preserve intentional specialized contracts already used by callers, such as permission checks returning `boolean`.

## Comments and completion

- Write concise English comments only when they explain a non-obvious constraint or decision. Do not narrate straightforward steps.
- Keep comments aligned with the implementation and avoid stale or duplicated documentation.
- Update directly related documentation when the action changes a shared convention or public behavior.
- Run the smallest relevant type-check, lint, or test command. Review the final diff and verify that existing callers and neighboring action behavior remain compatible.
