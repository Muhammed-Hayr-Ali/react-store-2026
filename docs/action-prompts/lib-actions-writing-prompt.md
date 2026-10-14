# Marketna Server Actions Writing Prompt

Use this prompt when creating or updating queries and mutations under `lib/actions/`.

---

You are working in the Marketna codebase. Implement the requested server action using the shared code and comment style described in `lib/actions/README.md`. Inspect the module's actions, schemas, types, helpers, barrel, and callers before editing. Preserve intentional behavioral differences between modules; consistent style must not change authorization, validation order, exception handling, or public contracts.

## Before implementation

- Read `lib/actions/README.md` and, when present, the module's own documentation.
- Inspect neighboring query and mutation files, the module's schemas and types, its `index.ts`, and the action's callers. Preserve their public input shape, result contract, and expected error identifiers.
- Check the database schema and generated Supabase types before composing queries or RPC calls. Prefer existing helpers and shared schemas over duplicating their logic.
- Identify whether the operation is public, authenticated, or permission-protected. Find the existing permission constant and use `hasPermission` for protected operations; UI checks are not authorization.
- Choose the Supabase client based on the operation and local convention. Use the server client for ordinary user-scoped access. Use the admin client only for an established privileged flow that requires it, and preserve its authorization and security boundaries.

## File and function structure

- Keep query and mutation modules in their existing subdirectories. Export public functions and types through the module barrel when that is the module's pattern.
- Follow the established file header:

  ```ts
  /**
   * @file lib/actions/example/mutations/create-example.ts
   * @description Creates an example after validating its input.
   */
  ```

- Put `"use server"` at the top of server-action modules, following neighboring files.
- Put the file JSDoc header before `"use server"` and use a concise, present-tense description without prefixing it with “Server Action”.
- Use descriptive verb-first function names (`get...`, `create...`, `update...`, `delete...`).
- Accept related arguments, including identifiers, as one named input object when that matches the module's API. Name the parameter `input`; keep optional query filters optional where callers rely on that behavior.
- Define input schemas and named input types alongside the module's schemas and types. Keep schema and type names aligned with local conventions.
- Account for Zod defaults and transformations: use `z.input` for the value accepted from a caller and `z.output` for the parsed value when those types differ.
- Use type-only imports for types when appropriate. Group imports consistently: framework and third-party imports first, project-alias imports next, then relative imports. Follow the repository Prettier configuration.

## Validation and authorization

- Treat server-action arguments as untrusted. Validate them at the action boundary with the relevant Zod schema before using them in database queries or mutations. Use `safeParse` and the shared `getValidationDetails` helper from `lib/actions/validation.ts` when returning field-level validation details.
- Keep validation messages as stable translation keys consistent with the module's schemas and message catalogs.
- Apply authorization to every protected operation before privileged data access or mutation. Reuse permission constants and `hasPermission`; do not duplicate permission strings. Do not add needless permission checks to intentional public/authentication flows.
- For public reads, make access intentional. Require the established management-view permission when exposing inactive or otherwise restricted records.
- Validate relational invariants not guaranteed by the input schema alone, such as a referenced parent existing or a hierarchy not containing a cycle. Reuse module helpers for these checks.

## Queries and mutations

- Use the project's typed Supabase clients and generated database types. Prefer selecting only fields the action needs when compatible with the existing contract.
- Use `.maybeSingle()` when absence is an expected outcome and map it to the module's stable not-found result. Use `.single()` when exactly one row must be returned. Preserve established empty-list behavior for queries.
- For public-facing entities with direct routes (such as products, categories, and offers), use the required unique `slug` at the public URL/read boundary and resolve to the stable `id` for internal relations and writes. Do not add `slug` to internal or join tables.
- Check Supabase's returned `error` explicitly, including errors returned by RPC and Auth calls. Map expected conditions (such as conflicts or missing records) to stable action error identifiers and put diagnostic messages under `details` (for example, `details.database` or `details.auth`).
- When mapping a specific expected database error, handle it in its own nested branch inside `if (error)`, then return the general operation error for remaining failures. Keep this structure consistent across actions.
- Normalize form values at the persistence boundary where needed (for example, convert an empty optional URL to `null`).
- After successful mutations, invalidate the relevant route or layout using the project's existing `revalidatePath` pattern. Prefer the specific route constant when the neighboring action uses one.
- Do not report success when a requested row was not found or a database operation failed.

## Error handling

- Match the surrounding module's handling style. Handle returned Supabase errors explicitly whether or not a local flow uses `try/catch`.
- Add `try/catch` only for a concrete throwing boundary or when required by the established flow; do not wrap every action automatically. Do not silently convert unexpected exceptions into success-shaped or generic results. Log unexpected errors using the local convention and return a stable failure result.
- Keep validation failures, permission denials, not-found cases, expected conflicts, and unexpected failures distinguishable.
- Use stable, translation-friendly error keys as the main `error` value; never expose raw database or provider messages as the error identifier. When adding a key, update `lib/actions/error-keys.ts` and the relevant message catalogs if the key is represented there.

## Return contract

- Use `ApiResult<T>` from `lib/actions/types/utils.ts` for actions with expected failure cases.
- Always include `data` on success. Use `ApiResult<null>` when the successful operation has no useful payload.
- Keep result shapes consistent:

  ```ts
  { success: true, data }
  { success: false, error: "STABLE_ERROR_KEY", details? }
  ```

- Keep intentional specialized contracts already used by callers, such as permission checks returning `boolean`; do not change a public result contract without updating and verifying all callers.

## Comments and completion

- Write concise English comments only when they explain a non-obvious constraint or decision. Keep the established JSDoc file header accurate; add function-level documentation only when semantics need clarification. Do not narrate straightforward steps or duplicate information already in the header.
- Update directly related documentation when the action changes a shared convention or public behavior.
- Run the smallest relevant type-check, lint, or test command. Review the final diff and verify existing callers and neighboring action behavior remain compatible.
