# Action Module Conventions

Use these conventions when adding or changing code under `lib/actions/`. Keep existing public behavior unless a migration is intentional and all call sites are updated.

## Inputs

- Accept related arguments as one object, including identifiers. Give the object a named input type and name the function parameter `input`.
- Keep query filters grouped in an optional input object when the query can be called without filters.
- Treat server-action inputs as untrusted. Validate them at the boundary with the relevant Zod schema before using them.
- Keep input schema and inferred input type names aligned (`createUserSchema` / `CreateUserFormValues`, for example).

```ts
interface GetRoleByIdInput {
  roleId: string
}

export async function getRoleById(
  input: GetRoleByIdInput
): Promise<ApiResult<RoleRecord>> {
  // Validate and use input.roleId.
}
```

## Results

- Use the shared `ApiResult<T>` from `lib/actions/types/utils.ts` for operations that can return an expected error.
- Its success branch always contains `data`; use `ApiResult<null>` for successful operations that have no useful return value.
- Return a discriminated object consistently: `{ success: true, data }` or `{ success: false, error, details? }`.
- Keep error identifiers stable and suitable for translation at the UI boundary. Put diagnostic details in `details` rather than replacing the stable error identifier.
- Keep specialized return contracts only where they are meaningful and already consumed as such, such as boolean permission checks.

## Comments

- Use a concise English file header in the established JSDoc form: `@file` followed by a one-sentence present-tense `@description`.
- Add function-level JSDoc when input semantics, return meaning, or a non-obvious behavior needs clarification.
- Prefer comments that explain why a decision exists. Avoid line-by-line narration, redundant numbered steps, outdated notes, and comments that merely restate the code.

## Implementation shape

- Keep permission checks and input validation before the database mutation.
- Return the same `ApiResult` shape from validation, expected database failures, and success paths.
- Preserve explicit logging or diagnostics for unexpected failures according to the surrounding module's error-handling pattern.
- Use type-only imports for types when appropriate and keep barrel exports limited to the public surface.
- Keep query and mutation files in their existing subdirectories and expose them through the relevant module barrel when needed.
