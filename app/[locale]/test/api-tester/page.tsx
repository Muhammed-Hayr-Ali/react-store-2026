"use client"

import { useState, useEffect, useRef } from "react"

interface ApiResponse {
  success: boolean
  function?: string
  data?: unknown
  error?: string
  message?: string
  details?: unknown
  timestamp?: string
  availableFunctions?: string[]
}

interface FunctionSuggestion {
  name: string
  description: string
  syntax: string
  example: string
}

const functionSuggestions: FunctionSuggestion[] = [
  {
    name: "get_my_complete_data",
    description: "جلب جميع بيانات المستخدم الحالي",
    syntax: "get_my_complete_data()",
    example: "get_my_complete_data()",
  },
  {
    name: "get_my_permissions",
    description: "جلب جميع صلاحيات المستخدم",
    syntax: "get_my_permissions()",
    example: "get_my_permissions()",
  },
  {
    name: "do_i_have_permission",
    description: "التحقق من صلاحية معينة",
    syntax: "do_i_have_permission('permission:name')",
    example: "do_i_have_permission('products:create')",
  },
  {
    name: "get_my_setup_status",
    description: "حالة إعداد الحساب",
    syntax: "get_my_setup_status()",
    example: "get_my_setup_status()",
  },
  {
    name: "get_user_complete_data_admin",
    description: "جلب بيانات مستخدم (للإداريين)",
    syntax: "get_user_complete_data_admin('user-id')",
    example:
      "get_user_complete_data_admin('123e4567-e89b-12d3-a456-426614174000')",
  },
]

export default function ApiTesterPage() {
  const [functionInput, setFunctionInput] = useState<string>("")
  const [permission, setPermission] = useState<string>("")
  const [targetUserId, setTargetUserId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [history, setHistory] = useState<ApiResponse[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("api-tester-history")
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "api-tester-history",
      JSON.stringify(history.slice(0, 10))
    )
  }, [history])

  const parseFunctionInput = (input: string) => {
    const match = input.match(/(\w+)\(([^)]*)\)/)
    if (!match) return { functionName: input.trim(), args: [] }

    const functionName = match[1]
    const argsString = match[2].trim()
    const args = argsString
      ? argsString.split(",").map((a) => a.trim().replace(/['"]/g, ""))
      : []

    return { functionName, args }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!functionInput.trim()) return

    setLoading(true)
    setResponse(null)

    try {
      const { functionName, args } = parseFunctionInput(functionInput)

      const params = new URLSearchParams({
        function: functionName,
      })

      if (args.length > 0) {
        if (functionName === "do_i_have_permission") {
          params.append("permission", args[0] || permission)
        }
        if (functionName === "get_user_complete_data_admin") {
          params.append("target_user_id", args[0] || targetUserId)
        }
      } else {
        if (permission) params.append("permission", permission)
        if (targetUserId) params.append("target_user_id", targetUserId)
      }

      const res = await fetch(`/api/api-tester?${params.toString()}`)
      const data = await res.json()
      setResponse(data)
      setHistory((prev) => [data, ...prev].slice(0, 10))
    } catch (error) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "REQUEST_ERROR",
        message: "حدث خطأ أثناء إرسال الطلب",
        details: error instanceof Error ? error.message : String(error),
      }
      setResponse(errorResponse)
      setHistory((prev) => [errorResponse, ...prev].slice(0, 10))
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResponse = async () => {
    if (!response) return

    try {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = JSON.stringify(response, null, 2)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const insertFunction = (func: FunctionSuggestion) => {
    setFunctionInput(func.example)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("api-tester-history")
  }

  const getDetectedFunction = () => {
    const { functionName } = parseFunctionInput(functionInput)
    return functionSuggestions.find((f) => f.name === functionName)
  }

  const detectedFunction = getDetectedFunction()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            🔌 API Tester
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            اكتب اسم الدالة ونفذها مباشرة لرؤية النتائج
          </p>
        </div>

        {/* Main Input Section */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Function Input */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <span>⌨️</span> اكتب الدالة هنا
                </span>
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={functionInput}
                  onChange={(e) => {
                    setFunctionInput(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder="مثال: get_my_complete_data() أو do_i_have_permission('products:create')"
                  className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 font-mono text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={loading || !functionInput.trim()}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "🚀 تنفيذ"
                  )}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="z-10 mt-1 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {functionSuggestions
                    .filter((f) => f.name.includes(functionInput.toLowerCase()))
                    .map((func) => (
                      <button
                        key={func.name}
                        type="button"
                        onClick={() => insertFunction(func)}
                        className="w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <code className="font-mono text-sm text-blue-600 dark:text-blue-400">
                              {func.syntax}
                            </code>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {func.description}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            اضغط للإدراج
                          </span>
                        </div>
                      </button>
                    ))}
                  {functionSuggestions.filter((f) =>
                    f.name.includes(functionInput.toLowerCase())
                  ).length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      لا توجد اقتراحات. اكتب اسم الدالة يدوياً.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Detected Function Info */}
            {detectedFunction && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✅ الدالة المكتشفة:{" "}
                  <code className="font-mono">{detectedFunction.name}</code>
                </p>
                <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                  {detectedFunction.description}
                </p>
              </div>
            )}

            {/* Additional Inputs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  الصلاحية (لـ do_i_have_permission)
                </label>
                <input
                  type="text"
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  placeholder="products:create"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  معرف المستخدم (لـ admin)
                </label>
                <input
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="xxx-xxx-xxx (UUID)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Response Card */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <span>📊</span> الاستجابة
              </h2>
              {response && (
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {copySuccess ? (
                    <>
                      <span>✅</span> تم
                    </>
                  ) : (
                    <>
                      <span>📋</span> نسخ
                    </>
                  )}
                </button>
              )}
            </div>

            {!response && !loading && (
              <div className="flex h-96 items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🔍</div>
                  <p>قم بإرسال طلب لرؤية الاستجابة</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="text-gray-600 dark:text-gray-400">
                    جاري معالجة الطلب...
                  </p>
                </div>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                    response.success
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  <span>{response.success ? "✅" : "❌"}</span>
                  {response.success ? "ناجح" : "فشل"}
                  {response.error && (
                    <span className="ml-2 text-xs opacity-75">
                      ({response.error})
                    </span>
                  )}
                </div>

                {/* Timestamp */}
                {response.timestamp && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    🕐 {new Date(response.timestamp).toLocaleString("ar-SA")}
                  </div>
                )}

                {/* JSON Response */}
                <div className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4">
                  <pre className="font-mono text-xs whitespace-pre-wrap text-green-400">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* History Card */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <span>📜</span> السجل
              </h2>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="rounded-md bg-red-100 px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  مسح
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex h-96 items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <div className="mb-4 text-6xl">📭</div>
                  <p>لا يوجد سجل بعد</p>
                </div>
              </div>
            ) : (
              <div className="max-h-96 space-y-2 overflow-auto">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 text-sm ${
                      item.success
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{item.success ? "✅" : "❌"}</span>
                        <code className="font-mono text-xs text-blue-600 dark:text-blue-400">
                          {item.function || "unknown"}
                        </code>
                      </div>
                      {item.timestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString("ar-SA")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
            <span>📚</span> مرجع سريع
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {functionSuggestions.map((func) => (
              <button
                key={func.name}
                onClick={() => insertFunction(func)}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-700"
              >
                <code className="font-mono text-xs text-blue-600 dark:text-blue-400">
                  {func.example}
                </code>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {func.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
