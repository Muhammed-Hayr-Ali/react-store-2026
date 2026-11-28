"use client"

/**
 * @file hooks/use-debounced-cart-quantity.ts
 * @description Shows quantity changes instantly and sends only the final value after the user stops clicking.
 */

import * as React from "react"

const DEFAULT_DELAY_MS = 600

interface Options {
  /** دالة التحديث من `useCart`. */
  updateItemQuantity: (itemId: string, quantity: number) => unknown
  /** دالة الحذف من `useCart`. */
  removeItem: (itemId: string) => unknown
  /** مهلة الانتظار بعد آخر ضغطة بالملّي ثانية. الافتراضي 600. */
  delay?: number
}

interface PendingUpdate {
  timer: ReturnType<typeof setTimeout>
  quantity: number
  serverQuantity: number
}

/**
 * تعديل كميات السلة مع تأخير الإرسال لتقليل عدد الطلبات.
 *
 * @returns
 * - `drafts`: الكميات المعروضة التي لم تؤكد بعد؛ استخدم `drafts[id] ?? item.quantity`.
 * - `setQuantity(itemId, quantity, serverQuantity)`: يغير الرقم فوراً ويرسله بعد المهلة.
 * - `remove(itemId)`: يلغي التعديل المؤجل ويحذف العنصر.
 * - `flush()`: يرسل التعديلات المؤجلة فوراً.
 */
export function useDebouncedCartQuantity({
  updateItemQuantity,
  removeItem,
  delay = DEFAULT_DELAY_MS,
}: Options) {
  // الكميات المعروضة التي لم يؤكدها الخادم بعد
  const [drafts, setDrafts] = React.useState<Record<string, number>>({})

  // مؤقت لكل منتج: الضغط على منتج لا يلغي تعديل منتج آخر
  const pendingRef = React.useRef(new Map<string, PendingUpdate>())
  // طابور لكل منتج حتى لا يصل طلب قديم بعد طلب أحدث
  const queueRef = React.useRef(new Map<string, Promise<void>>())
  // آخر كمية أرسلت وما زال طابورها يعمل
  const sentRef = React.useRef(new Map<string, number>())

  // المؤقت يجب أن يستدعي أحدث نسخة من دوال السلة
  const actionsRef = React.useRef({ updateItemQuantity, removeItem })
  React.useEffect(() => {
    actionsRef.current = { updateItemQuantity, removeItem }
  })

  const clearDraft = React.useCallback((itemId: string) => {
    setDrafts((current) => {
      const next = { ...current }
      delete next[itemId]
      return next
    })
  }, [])

  const enqueue = React.useCallback(
    (itemId: string, task: () => unknown) => {
      const previous = queueRef.current.get(itemId) ?? Promise.resolve()
      const next: Promise<void> = previous
        .then(async () => {
          const result = (await task()) as { success?: boolean } | undefined
          // دوال السلة لا ترمي خطأ، بل تعيد success: false
          if (result?.success === false) sentRef.current.delete(itemId)
        })
        .catch((error) => {
          // عند الفشل تعود الواجهة إلى كمية الخادم
          console.error("[cart]", itemId, error)
          sentRef.current.delete(itemId)
        })
        .finally(() => {
          if (queueRef.current.get(itemId) !== next) return
          queueRef.current.delete(itemId)
          sentRef.current.delete(itemId)
          if (!pendingRef.current.has(itemId)) clearDraft(itemId)
        })
      queueRef.current.set(itemId, next)
    },
    [clearDraft]
  )

  const send = React.useCallback(
    (itemId: string) => {
      const pending = pendingRef.current.get(itemId)
      if (!pending) return
      clearTimeout(pending.timer)
      pendingRef.current.delete(itemId)

      // مثل +1 ثم -1: لا داعي لأي طلب
      const baseline = sentRef.current.get(itemId) ?? pending.serverQuantity
      if (pending.quantity === baseline) {
        if (!queueRef.current.has(itemId)) clearDraft(itemId)
        return
      }

      sentRef.current.set(itemId, pending.quantity)
      enqueue(itemId, () =>
        actionsRef.current.updateItemQuantity(itemId, pending.quantity)
      )
    },
    [clearDraft, enqueue]
  )

  const setQuantity = React.useCallback(
    (itemId: string, quantity: number, serverQuantity: number) => {
      clearTimeout(pendingRef.current.get(itemId)?.timer)
      pendingRef.current.set(itemId, {
        quantity,
        serverQuantity,
        timer: setTimeout(() => send(itemId), delay),
      })
      setDrafts((current) => ({ ...current, [itemId]: quantity }))
    },
    [delay, send]
  )

  const remove = React.useCallback(
    (itemId: string) => {
      // إلغاء أي تعديل مؤجل، والحذف ينفذ فوراً بعد الطلبات الجارية
      clearTimeout(pendingRef.current.get(itemId)?.timer)
      pendingRef.current.delete(itemId)
      enqueue(itemId, () => actionsRef.current.removeItem(itemId))
    },
    [enqueue]
  )

  /** إرسال كل التعديلات المؤجلة فوراً */
  const flush = React.useCallback(() => {
    Array.from(pendingRef.current.keys()).forEach(send)
  }, [send])

  // عدم ضياع التعديل إذا أزيل المكوّن قبل انتهاء المهلة
  React.useEffect(() => flush, [flush])

  return { drafts, setQuantity, remove, flush }
}
