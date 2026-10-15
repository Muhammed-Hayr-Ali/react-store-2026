"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MailIcon,
  SearchIcon,
  Trash2Icon,
  UserRoundCheckIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Can } from "@/components/shared/can"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { deleteNewsletterSubscriber } from "@/lib/actions/newsletter_subscribers/mutations/delete-newsletter-subscriber"
import { sendNewsletterEmail } from "@/lib/actions/newsletter_subscribers/mutations/send-newsletter-email"
import { updateNewsletterSubscriberStatus } from "@/lib/actions/newsletter_subscribers/mutations/update-newsletter-subscriber"
import {
  NEWSLETTER_EMAIL_BATCH_LIMIT,
  type NewsletterStatus,
} from "@/lib/actions/newsletter_subscribers/schemas"
import type { NewsletterSubscriber } from "@/lib/actions/newsletter_subscribers/types"
import { PERMISSIONS } from "@/lib/actions/role"
import type { AppLocale } from "@/i18n/routing"

type StatusFilter = "all" | NewsletterStatus

interface NewsletterSubscribersTableProps {
  initialSubscribers: NewsletterSubscriber[]
  locale: AppLocale
}

export function NewsletterSubscribersTable({
  initialSubscribers,
  locale,
}: NewsletterSubscribersTableProps) {
  const t = useTranslations("NewsletterSubscribersManagement")
  const tErrors = useTranslations("ActionErrors")
  const displayLocale = useLocale()
  const [subscribers, setSubscribers] = React.useState(initialSubscribers)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [composeOpen, setComposeOpen] = React.useState(false)
  const [recipientIds, setRecipientIds] = React.useState<string[]>([])
  const [emailLocale, setEmailLocale] = React.useState<AppLocale>(locale)
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [isSending, startSending] = React.useTransition()
  const [isUpdating, startUpdating] = React.useTransition()
  const [isDeleting, startDeleting] = React.useTransition()
  const [subscriberToDelete, setSubscriberToDelete] =
    React.useState<NewsletterSubscriber | null>(null)

  const activeCount = subscribers.filter(
    (subscriber) => subscriber.status === "active"
  ).length
  const unsubscribedCount = subscribers.length - activeCount

  const filteredSubscribers = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return subscribers.filter((subscriber) => {
      const matchesStatus =
        statusFilter === "all" || subscriber.status === statusFilter
      const matchesQuery =
        !normalizedQuery ||
        subscriber.email.toLocaleLowerCase().includes(normalizedQuery) ||
        (subscriber.unsubscribe_reason || "")
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      return matchesStatus && matchesQuery
    })
  }, [query, statusFilter, subscribers])

  const pageCount = Math.max(
    1,
    Math.ceil(filteredSubscribers.length / pageSize)
  )
  const effectivePageIndex = Math.min(pageIndex, pageCount - 1)
  const pageSubscribers = filteredSubscribers.slice(
    effectivePageIndex * pageSize,
    (effectivePageIndex + 1) * pageSize
  )
  const activeOnPage = pageSubscribers.filter(
    (subscriber) => subscriber.status === "active"
  )
  const selectedOnPage = activeOnPage.filter((subscriber) =>
    selectedIds.includes(subscriber.id)
  ).length

  function openComposer(ids: string[]) {
    setRecipientIds(ids)
    setEmailLocale(locale)
    setSubject(t("DEFAULT_SUBJECT"))
    setMessage("")
    setComposeOpen(true)
  }

  function toggleSubscriberSelection(id: string, checked: boolean) {
    if (
      checked &&
      !selectedIds.includes(id) &&
      selectedIds.length >= NEWSLETTER_EMAIL_BATCH_LIMIT
    ) {
      toast.error(
        t("BATCH_LIMIT_REACHED", { limit: NEWSLETTER_EMAIL_BATCH_LIMIT })
      )
      return
    }

    setSelectedIds((current) => {
      if (checked) {
        if (current.includes(id)) return current
        return [...current, id]
      }
      return current.filter((selectedId) => selectedId !== id)
    })
  }

  function togglePageSelection(checked: boolean) {
    const pageIds = activeOnPage.map((subscriber) => subscriber.id)
    const missingIds = pageIds.filter((id) => !selectedIds.includes(id))
    const availableSlots = NEWSLETTER_EMAIL_BATCH_LIMIT - selectedIds.length
    if (checked && missingIds.length > availableSlots) {
      toast.error(
        t("BATCH_LIMIT_REACHED", { limit: NEWSLETTER_EMAIL_BATCH_LIMIT })
      )
    }

    setSelectedIds((current) => {
      if (!checked) {
        return current.filter((id) => !pageIds.includes(id))
      }

      return [...current, ...missingIds.slice(0, Math.max(availableSlots, 0))]
    })
  }

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startSending(async () => {
      try {
        const result = await sendNewsletterEmail({
          subscriberIds: recipientIds,
          subject,
          message,
          locale: emailLocale,
        })

        if (result.success) {
          toast.success(
            t("SEND_SUCCESS_TOAST", { count: result.data.sentCount })
          )
          setSelectedIds((current) =>
            current.filter((id) => !recipientIds.includes(id))
          )
          setComposeOpen(false)
          return
        }

        if (result.error === "NEWSLETTER_EMAIL_PARTIAL_FAILURE") {
          const failedIds = result.failedSubscriberIds ?? []
          setRecipientIds(failedIds)
          setSelectedIds((current) => {
            const retained = current.filter((id) => !recipientIds.includes(id))
            return [...retained, ...failedIds]
          })
          toast.error(
            t("SEND_PARTIAL_FAILURE", {
              sent: result.sentCount ?? 0,
              failed: result.failedCount ?? failedIds.length,
            })
          )
          return
        }

        if (result.error === "NEWSLETTER_RECIPIENTS_CHANGED") {
          const invalidIds = result.invalidSubscriberIds ?? recipientIds
          const inactiveIds = new Set(result.inactiveSubscriberIds ?? [])
          const missingIds = new Set(result.missingSubscriberIds ?? [])
          setSelectedIds((current) =>
            current.filter((id) => !invalidIds.includes(id))
          )
          setSubscribers((current) =>
            current
              .filter((subscriber) => !missingIds.has(subscriber.id))
              .map((subscriber) =>
                inactiveIds.has(subscriber.id)
                  ? { ...subscriber, status: "unsubscribed" }
                  : subscriber
              )
          )
          setRecipientIds([])
          toast.error(tErrors(getActionErrorKey(result.error)))
          return
        }

        toast.error(tErrors(getActionErrorKey(result.error)))
      } catch {
        toast.error(tErrors("UNEXPECTED_ERROR"))
      }
    })
  }

  function handleStatusChange(subscriber: NewsletterSubscriber) {
    const nextStatus =
      subscriber.status === "active" ? "unsubscribed" : "active"
    startUpdating(async () => {
      try {
        const result = await updateNewsletterSubscriberStatus(
          subscriber.id,
          nextStatus
        )
        if (!result.success) {
          toast.error(tErrors(getActionErrorKey(result.error)))
          return
        }

        setSubscribers((current) =>
          current.map((item) =>
            item.id === result.data.id ? result.data : item
          )
        )
        if (nextStatus !== "active") {
          setSelectedIds((current) =>
            current.filter((id) => id !== subscriber.id)
          )
        }
        toast.success(
          t(
            nextStatus === "active" ? "REACTIVATED_TOAST" : "UNSUBSCRIBED_TOAST"
          )
        )
      } catch {
        toast.error(tErrors("UNEXPECTED_ERROR"))
      }
    })
  }

  function handleDelete() {
    if (!subscriberToDelete) return
    const deletedId = subscriberToDelete.id
    startDeleting(async () => {
      try {
        const result = await deleteNewsletterSubscriber({ id: deletedId })
        if (!result.success) {
          toast.error(tErrors(getActionErrorKey(result.error)))
          return
        }
        setSubscribers((current) =>
          current.filter((item) => item.id !== deletedId)
        )
        setSelectedIds((current) => current.filter((id) => id !== deletedId))
        setSubscriberToDelete(null)
        toast.success(t("DELETE_SUCCESS_TOAST"))
      } catch {
        toast.error(tErrors("UNEXPECTED_ERROR"))
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<UsersIcon className="size-4" />}
          label={t("TOTAL_COUNT")}
          value={subscribers.length}
        />
        <SummaryCard
          icon={<UserRoundCheckIcon className="size-4" />}
          label={t("ACTIVE_COUNT")}
          value={activeCount}
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryCard
          icon={<XIcon className="size-4" />}
          label={t("UNSUBSCRIBED_COUNT")}
          value={unsubscribedCount}
          accent="text-muted-foreground"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPageIndex(0)
            }}
            placeholder={t("SEARCH_PLACEHOLDER")}
            className="h-8 ps-8 pe-8 text-xs"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute end-1 top-1/2 -translate-y-1/2"
              onClick={() => setQuery("")}
              aria-label={t("CLEAR_SEARCH")}
            >
              <XIcon />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 items-center rounded-md border border-border bg-background p-0.5">
            {(["all", "active", "unsubscribed"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setStatusFilter(filter)
                  setPageIndex(0)
                }}
                className={`inline-flex h-full items-center gap-1 rounded-sm px-2 text-[11px] transition-colors ${
                  statusFilter === filter
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {t(`FILTER_${filter.toUpperCase()}`)}
                <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                  {filter === "all"
                    ? subscribers.length
                    : filter === "active"
                      ? activeCount
                      : unsubscribedCount}
                </Badge>
              </button>
            ))}
          </div>

          <Can permission={PERMISSIONS.SEND_NEWSLETTER_EMAIL}>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={selectedIds.length === 0}
              onClick={() => openComposer(selectedIds)}
            >
              <MailIcon className="size-3.5" />
              {t("SEND_SELECTED", { count: selectedIds.length })}
            </Button>
          </Can>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <p className="text-xs text-foreground">
            {t("SELECTED_COUNT", {
              selected: selectedIds.length,
              limit: NEWSLETTER_EMAIL_BATCH_LIMIT,
            })}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setSelectedIds([])}
          >
            {t("CLEAR_SELECTION")}
          </Button>
        </div>
      )}

      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-10">
                  <Can permission={PERMISSIONS.SEND_NEWSLETTER_EMAIL}>
                    <Checkbox
                      aria-label={t("SELECT_PAGE")}
                      checked={
                        activeOnPage.length > 0 &&
                        selectedOnPage === activeOnPage.length
                      }
                      onCheckedChange={(checked) =>
                        togglePageSelection(checked === true)
                      }
                    />
                  </Can>
                </TableHead>
                <TableHead className="text-xs">{t("COLUMN_EMAIL")}</TableHead>
                <TableHead className="text-xs">{t("COLUMN_STATUS")}</TableHead>
                <TableHead className="text-xs">{t("COLUMN_JOINED")}</TableHead>
                <TableHead className="text-xs">{t("COLUMN_REASON")}</TableHead>
                <TableHead className="text-end text-xs">
                  {t("ACTIONS_LABEL")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageSubscribers.length > 0 ? (
                pageSubscribers.map((subscriber) => {
                  const isActive = subscriber.status === "active"
                  const isSelected = selectedIds.includes(subscriber.id)
                  const atLimit =
                    selectedIds.length >= NEWSLETTER_EMAIL_BATCH_LIMIT &&
                    !isSelected

                  return (
                    <TableRow key={subscriber.id} className="hover:bg-muted/20">
                      <TableCell className="w-10">
                        <Can permission={PERMISSIONS.SEND_NEWSLETTER_EMAIL}>
                          <Checkbox
                            aria-label={t("SELECT_SUBSCRIBER", {
                              email: subscriber.email,
                            })}
                            checked={isSelected}
                            disabled={!isActive || atLimit}
                            onCheckedChange={(checked) =>
                              toggleSubscriberSelection(
                                subscriber.id,
                                checked === true
                              )
                            }
                          />
                        </Can>
                      </TableCell>
                      <TableCell className="min-w-52">
                        <span className="font-mono text-xs text-foreground">
                          {subscriber.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isActive
                              ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : "border-muted-foreground/30 text-muted-foreground"
                          }
                        >
                          {t(
                            isActive ? "STATUS_ACTIVE" : "STATUS_UNSUBSCRIBED"
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {new Date(subscriber.created_at).toLocaleDateString(
                          displayLocale
                        )}
                      </TableCell>
                      <TableCell className="max-w-52 truncate text-xs text-muted-foreground">
                        {subscriber.unsubscribe_reason || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {isActive && (
                            <Can permission={PERMISSIONS.SEND_NEWSLETTER_EMAIL}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={t("SEND_INDIVIDUAL")}
                                title={t("SEND_INDIVIDUAL")}
                                onClick={() => openComposer([subscriber.id])}
                              >
                                <MailIcon className="size-3.5" />
                              </Button>
                            </Can>
                          )}
                          <Can
                            permission={
                              PERMISSIONS.UPDATE_NEWSLETTER_SUBSCRIBER
                            }
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isUpdating}
                              className="h-7 px-2 text-[11px]"
                              onClick={() => handleStatusChange(subscriber)}
                            >
                              {t(
                                isActive
                                  ? "UNSUBSCRIBE_ACTION"
                                  : "REACTIVATE_ACTION"
                              )}
                            </Button>
                          </Can>
                          <Can
                            permission={
                              PERMISSIONS.DELETE_NEWSLETTER_SUBSCRIBER
                            }
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("DELETE_ACTION")}
                              title={t("DELETE_ACTION")}
                              onClick={() => setSubscriberToDelete(subscriber)}
                            >
                              <Trash2Icon className="size-3.5 text-destructive" />
                            </Button>
                          </Can>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-xs text-muted-foreground"
                  >
                    {t("NO_SUBSCRIBERS_FOUND")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Label htmlFor="newsletter-page-size" className="text-xs">
            {t("ROWS_PER_PAGE")}
          </Label>
          <select
            id="newsletter-page-size"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPageIndex(0)
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>
            {t("PAGE_COUNTER", {
              page: effectivePageIndex + 1,
              total: pageCount,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("FIRST_PAGE")}
            disabled={effectivePageIndex === 0}
            onClick={() => setPageIndex(0)}
          >
            <ChevronsLeftIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("PREVIOUS_PAGE")}
            disabled={effectivePageIndex === 0}
            onClick={() => setPageIndex(Math.max(0, effectivePageIndex - 1))}
          >
            <ChevronLeftIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("NEXT_PAGE")}
            disabled={effectivePageIndex + 1 >= pageCount}
            onClick={() =>
              setPageIndex(Math.min(pageCount - 1, effectivePageIndex + 1))
            }
          >
            <ChevronRightIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("LAST_PAGE")}
            disabled={effectivePageIndex + 1 >= pageCount}
            onClick={() => setPageIndex(pageCount - 1)}
          >
            <ChevronsRightIcon className="rtl:rotate-180" />
          </Button>
        </div>
      </div>

      <Dialog
        open={composeOpen}
        onOpenChange={(open) => {
          if (!isSending) setComposeOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle className="text-base font-bold">
              {t("COMPOSE_TITLE")}
            </DialogTitle>
            <DialogDescription>
              {t("COMPOSE_DESCRIPTION", { count: recipientIds.length })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newsletter-subject">{t("SUBJECT_LABEL")}</Label>
              <Input
                id="newsletter-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={200}
                required
                disabled={isSending}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newsletter-email-locale">
                {t("EMAIL_LANGUAGE_LABEL")}
              </Label>
              <select
                id="newsletter-email-locale"
                value={emailLocale}
                onChange={(event) =>
                  setEmailLocale(event.target.value === "ar" ? "ar" : "en")
                }
                disabled={isSending}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="ar">{t("ARABIC")}</option>
                <option value="en">{t("ENGLISH")}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newsletter-message">{t("MESSAGE_LABEL")}</Label>
              <Textarea
                id="newsletter-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={5000}
                rows={7}
                required
                disabled={isSending}
                placeholder={t("MESSAGE_PLACEHOLDER")}
                className="resize-y text-xs"
              />
              <p className="text-end text-[11px] text-muted-foreground">
                {message.length}/5000
              </p>
            </div>
            <Alert>
              <AlertDescription>
                {t("UNSUBSCRIBE_FOOTER_NOTICE")}
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSending}
                onClick={() => setComposeOpen(false)}
              >
                {t("CANCEL_BUTTON")}
              </Button>
              <Button
                type="submit"
                disabled={
                  isSending ||
                  !subject.trim() ||
                  !message.trim() ||
                  recipientIds.length === 0
                }
              >
                {isSending ? (
                  <>
                    <Spinner className="me-1.5 size-3.5" />
                    {t("SENDING_BUTTON")}
                  </>
                ) : (
                  <>
                    <MailIcon className="me-1.5 size-3.5" />
                    {t("SEND_BUTTON", { count: recipientIds.length })}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={subscriberToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setSubscriberToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>{t("DELETE_DIALOG_TITLE")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("DELETE_DIALOG_DESCRIPTION")}{" "}
              <span className="font-semibold text-foreground">
                {subscriberToDelete?.email}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("CANCEL_BUTTON")}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? (
                <>
                  <Spinner className="me-1.5 size-3.5" />
                  {t("DELETING_BUTTON")}
                </>
              ) : (
                t("DELETE_ACTION")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  accent = "text-foreground",
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold tabular-nums ${accent}`}>{value}</p>
      </div>
      <span
        className={`flex size-8 items-center justify-center rounded-lg bg-secondary ${accent}`}
      >
        {icon}
      </span>
    </div>
  )
}
