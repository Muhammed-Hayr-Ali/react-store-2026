/** Shared discriminated result contract for action queries and mutations. */
export type ApiResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
      details?: Record<string, string[]>
    }
