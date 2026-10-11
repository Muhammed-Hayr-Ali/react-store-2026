type SuccessResult<T> = {
  success: true
  data?: T
}

type ErrorResult = {
  success: false
  error: string
  details?: Record<string, string[]> // ✅ إضافة هذا السطر
}

export type ApiResult<T> = SuccessResult<T> | ErrorResult
