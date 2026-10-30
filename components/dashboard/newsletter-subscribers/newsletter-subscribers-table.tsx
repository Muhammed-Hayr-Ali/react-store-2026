"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  FilterIcon,
  MailIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Trash2Icon,
  UserCheckIcon,
  UserXIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

 import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
 import type { AppLocale } from "@/i18n/routing"
import { DeleteSubscriberDialog } from "./delete-subscriber-dialog"

type StatusFilter = "all" | NewsletterStatus
type HideableColumn = "status" | "joined" | "reason"

const HIDEABLE_COLUMNS: HideableColumn[] = ["status", "joined", "reason"]

interface NewsletterSubscribersTableProps {
  initialSubscribers: NewsletterSubscriber[]
  initialIsMobile?: boolean
}

export function NewsletterSubscribersTable({
  initialSubscribers,
  initialIsMobile = false,

}: NewsletterSubscribersTableProps) {
  const locale = useLocale()
  const t = useTranslations("NewsletterSubscribersManagement")
  const displayLocale = useLocale()
  const [subscribers, setSubscribers] = React.useState(initialSubscribers)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<HideableColumn, boolean>
  >(() => ({
    status: !initialIsMobile,
    joined: !initialIsMobile,
    reason: !initialIsMobile,
  }))
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(initialIsMobile ? 20 : 10)
  const [composeOpen, setComposeOpen] = React.useState(false)
  const [recipientIds, setRecipientIds] = React.useState<string[]>([])
  const [emailLocale, setEmailLocale] = React.useState<string>(locale)
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [isSending, startSending] = React.useTransition()
  const [isUpdating, startUpdating] = React.useTransition()
  const [isDeleting, startDeleting] = React.useTransition()

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const handleBreakpointChange = () => {
      const mobile = mediaQuery.matches
      setColumnVisibility({
        status: !mobile,
        joined: !mobile,
        reason: !mobile,
      })
      setPageSize(mobile ? 20 : 10)
      setPageIndex(0)
    }

    mediaQuery.addEventListener("change", handleBreakpointChange)
    return () =>
      mediaQuery.removeEventListener("change", handleBreakpointChange)
  }, [])

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
          toast.error(t(getActionErrorKey(result.error)))
          return
        }

        toast.error(t(getActionErrorKey(result.error)))
      } catch {
        toast.error(t("UNEXPECTED_ERROR"))
      }
    })
  }

  function handleStatusChange(subscriber: NewsletterSubscriber) {
    const nextStatus =
      subscriber.status === "active" ? "unsubscribed" : "active"
    startUpdating(async () => {
      try {
        const result = await updateNewsletterSubscriberStatus({
          id: subscriber.id,
          status: nextStatus,
        })
        if (!result.success) {
          toast.error(t(getActionErrorKey(result.error)))
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
        toast.error(t("UNEXPECTED_ERROR"))
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
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
              className="absolute inset-e-1 top-1/2 -translate-y-1/2"
              onClick={() => {
                setQuery("")
                setPageIndex(0)
              }}
              aria-label={t("CLEAR_SEARCH")}
            >
              <XIcon />
            </Button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  title={t("FILTER_BUTTON")}
                >
                  <FilterIcon className="size-3.5" />
                  <span className="sr-only">{t("FILTER_BUTTON")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                {(["all", "active", "unsubscribed"] as const).map((filter) => (
                  <DropdownMenuItem
                    key={filter}
                    onClick={() => {
                      setStatusFilter(filter)
                      setPageIndex(0)
                    }}
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <span>{t(`FILTER_${filter.toUpperCase()}`)}</span>
                    <Badge
                      variant="secondary"
                      className="px-1 py-0 text-[10px]"
                    >
                      {filter === "all"
                        ? subscribers.length
                        : filter === "active"
                          ? activeCount
                          : unsubscribedCount}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden h-8 items-center overflow-hidden rounded-md border border-input bg-background p-0.5 sm:inline-flex">
            {(["all", "active", "unsubscribed"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setStatusFilter(filter)
                  setPageIndex(0)
                }}
                className={`inline-flex h-full items-center rounded-sm px-2.5 text-xs font-medium transition-colors ${
                  statusFilter === filter
                    ? "bg-muted font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {t(`FILTER_${filter.toUpperCase()}`)}
                <Badge
                  variant="secondary"
                  className="ms-1.5 px-1.5 py-0 text-[10px]"
                >
                  {filter === "all"
                    ? subscribers.length
                    : filter === "active"
                      ? activeCount
                      : unsubscribedCount}
                </Badge>
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0"
                title={t("TOGGLE_COLUMNS")}
              >
                <Columns3Icon className="size-3.5" />
                <span className="sr-only">{t("TOGGLE_COLUMNS")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              {HIDEABLE_COLUMNS.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={columnVisibility[column]}
                  onCheckedChange={(visible) =>
                    setColumnVisibility((current) => ({
                      ...current,
                      [column]: Boolean(visible),
                    }))
                  }
                >
                  {t(
                    column === "status"
                      ? "COLUMN_STATUS"
                      : column === "joined"
                        ? "COLUMN_JOINED"
                        : "COLUMN_REASON"
                  )}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2 text-xs sm:px-3"
              disabled={selectedIds.length === 0}
              onClick={() => openComposer(selectedIds)}
              title={t("SEND_SELECTED", { count: selectedIds.length })}
            >
              <MailIcon className="size-3.5" />
              <span className="hidden sm:inline">
                {t("SEND_SELECTED", { count: selectedIds.length })}
              </span>
              <span className="sm:hidden">{selectedIds.length}</span>
            </Button>
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
                </TableHead>
                <TableHead className="text-xs">{t("COLUMN_EMAIL")}</TableHead>
                {columnVisibility.status && (
                  <TableHead className="text-xs">
                    {t("COLUMN_STATUS")}
                  </TableHead>
                )}
                {columnVisibility.joined && (
                  <TableHead className="text-xs">
                    {t("COLUMN_JOINED")}
                  </TableHead>
                )}
                {columnVisibility.reason && (
                  <TableHead className="text-xs">
                    {t("COLUMN_REASON")}
                  </TableHead>
                )}
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
                      </TableCell>
                      <TableCell className="min-w-52">
                        <span className="text-sm font-normal text-foreground">
                          {subscriber.email}
                        </span>
                      </TableCell>
                      {columnVisibility.status && (
                        <TableCell>
                          <div className="flex justify-center">
                            <Badge
                              variant="outline"
                              className={`gap-1 truncate px-1.5 py-0.5 text-xs font-normal leading-tight ${
                                isActive
                                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                  : "border-muted-foreground/30 text-muted-foreground"
                              }`}
                            >
                              {isActive ? (
                                <UserCheckIcon className="size-3" />
                              ) : (
                                <UserXIcon className="size-3" />
                              )}
                              <span>
                                {t(
                                  isActive
                                    ? "STATUS_ACTIVE"
                                    : "STATUS_UNSUBSCRIBED"
                                )}
                              </span>
                            </Badge>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.joined && (
                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                          {new Date(subscriber.created_at).toLocaleDateString(
                            displayLocale
                          )}
                        </TableCell>
                      )}
                      {columnVisibility.reason && (
                        <TableCell className="max-w-52 truncate text-xs text-muted-foreground">
                          {subscriber.unsubscribe_reason || "—"}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex justify-end">
                        
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground data-[state=open]:bg-muted"
                                  aria-label={t("ACTIONS_LABEL")}
                                >
                                  <MoreHorizontalIcon className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-44 text-xs"
                              >
                                {isActive && (
                              
                                    <DropdownMenuItem
                                      onClick={() =>
                                        openComposer([subscriber.id])
                                      }
                                      className="cursor-pointer"
                                    >
                                      <MailIcon className="me-2 size-3.5" />
                                      {t("SEND_INDIVIDUAL")}
                                    </DropdownMenuItem>
                                  
                                )}
                              
                                  <DropdownMenuItem
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(subscriber)
                                    }
                                    className="cursor-pointer"
                                  >
                                    {isActive ? (
                                      <UserXIcon className="me-2 size-3.5 text-muted-foreground" />
                                    ) : (
                                      <UserCheckIcon className="me-2 size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                    {t(
                                      isActive
                                        ? "UNSUBSCRIBE_ACTION"
                                        : "REACTIVATE_ACTION"
                                    )}
                                  </DropdownMenuItem>
                                
                              
                                  <DeleteSubscriberDialog
                                    subscriber={subscriber}
                                    isDeleting={isDeleting}
                                    onDelete={(deletedId) => {
                                      startDeleting(async () => {
                                        try {
                                          const result =
                                            await deleteNewsletterSubscriber({
                                              id: deletedId,
                                            })
                                          if (!result.success) {
                                            toast.error(
                                              t(
                                                getActionErrorKey(result.error)
                                              )
                                            )
                                            return
                                          }
                                          setSubscribers((current) =>
                                            current.filter(
                                              (item) => item.id !== deletedId
                                            )
                                          )
                                          setSelectedIds((current) =>
                                            current.filter(
                                              (id) => id !== deletedId
                                            )
                                          )
                                          toast.success(
                                            t("DELETE_SUCCESS_TOAST")
                                          )
                                        } catch {
                                          toast.error(
                                            t("UNEXPECTED_ERROR")
                                          )
                                        }
                                      })
                                    }}
                                    trigger={
                                      <DropdownMenuItem
                                        onSelect={(event) =>
                                          event.preventDefault()
                                        }
                                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                      >
                                        <Trash2Icon className="me-2 size-3.5" />
                                        {t("DELETE_ACTION")}
                                      </DropdownMenuItem>
                                    }
                                  />
                                
                              </DropdownMenuContent>
                            </DropdownMenu>
                          
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      3 +
                      HIDEABLE_COLUMNS.filter(
                        (column) => columnVisibility[column]
                      ).length
                    }
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
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setPageIndex(0)
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-18 shrink-0 text-xs"
              id="newsletter-page-size"
            >
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="text-xs">
              <SelectGroup>
                {[10, 20, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
    </div>
  )
}
