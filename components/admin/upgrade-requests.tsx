"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  MessageSquare,
} from "lucide-react"
import { useTranslations } from "next-intl"
import {
  getAllUpgradeRequests,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  completeUpgradeRequest,
} from "@/lib/actions/admin/upgradeRequests"

interface UpgradeRequest {
  request_id: string
  seller_name: string
  store_name: string
  seller_email: string
  current_plan_name: string
  target_plan_name: string
  target_plan_price: number
  status: "pending" | "approved" | "rejected" | "completed"
  contact_method: string
  contact_value: string
  seller_notes: string
  admin_notes: string
  contacted_at: string
  payment_received_at: string
  completed_at: string
  created_at: string
}

export default function AdminUpgradeRequests() {
  const t = useTranslations("Admin.upgradeRequests")
  const router = useRouter()
  const supabase = createBrowserClient()
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(
    null
  )
  const [adminNotes, setAdminNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [statusFilter])

  async function loadRequests() {
    setLoading(true)
    const data = await getAllUpgradeRequests(statusFilter)
    setRequests(data)
    setLoading(false)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const result = await approveUpgradeRequest({
        requestId: selectedRequest.request_id,
        adminNotes: adminNotes || "",
      })

      if (!result.success) {
        alert(t("errorApproving"))
        return
      }

      await loadRequests()
      setSelectedRequest(null)
      setAdminNotes("")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error approving request:", err)
      alert(t("errorApproving"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const result = await rejectUpgradeRequest({
        requestId: selectedRequest.request_id,
        adminNotes: adminNotes || "",
      })

      if (!result.success) {
        alert(t("errorRejecting"))
        return
      }

      await loadRequests()
      setSelectedRequest(null)
      setAdminNotes("")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error rejecting request:", err)
      alert(t("errorRejecting"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const result = await completeUpgradeRequest(selectedRequest.request_id)

      if (!result.success) {
        alert(t("errorCompleting"))
        return
      }

      await loadRequests()
      setSelectedRequest(null)
      setAdminNotes("")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Error completing request:", err)
      alert(t("errorCompleting"))
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t("statusPending")}
          </Badge>
        )
      case "approved":
        return (
          <Badge className="gap-1 bg-blue-500">
            <CheckCircle className="h-3 w-3" />
            {t("statusApproved")}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t("statusRejected")}
          </Badge>
        )
      case "completed":
        return (
          <Badge className="gap-1 bg-green-500">
            <DollarSign className="h-3 w-3" />
            {t("statusCompleted")}
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getContactIcon = (method: string) => {
    switch (method) {
      case "email":
        return "📧"
      case "phone":
        return "📱"
      case "whatsapp":
        return "💬"
      default:
        return "📞"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
          <p className="text-gray-600">{t("description")}</p>
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterAll")}</SelectItem>
              <SelectItem value="pending">{t("statusPending")}</SelectItem>
              <SelectItem value="approved">{t("statusApproved")}</SelectItem>
              <SelectItem value="rejected">{t("statusRejected")}</SelectItem>
              <SelectItem value="completed">{t("statusCompleted")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t("statTotal")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-500">
              {t("statPending")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-500">
              {t("statApproved")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter((r) => r.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-500">
              {t("statCompleted")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter((r) => r.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("requestsList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-gray-500">{t("loading")}</p>
          ) : requests.length === 0 ? (
            <p className="py-8 text-center text-gray-500">{t("noRequests")}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tableRequestId")}</TableHead>
                    <TableHead>{t("tableSeller")}</TableHead>
                    <TableHead>{t("tableStore")}</TableHead>
                    <TableHead>{t("tableUpgrade")}</TableHead>
                    <TableHead>{t("tablePrice")}</TableHead>
                    <TableHead>{t("tableContact")}</TableHead>
                    <TableHead>{t("tableStatus")}</TableHead>
                    <TableHead>{t("tableDate")}</TableHead>
                    <TableHead>{t("tableActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.request_id}>
                      <TableCell className="font-mono">
                        #{request.request_id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-bold">
                            {request.seller_name || t("na")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.seller_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{request.store_name || "-"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{request.current_plan_name || t("free")}</div>
                          <div className="text-gray-500">↓</div>
                          <div className="font-bold">
                            {request.target_plan_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${request.target_plan_price}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{getContactIcon(request.contact_method)}</span>
                          <span className="text-sm">
                            {request.contact_value || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          {t("view")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedRequest && (
        <Dialog
          open={!!selectedRequest}
          onOpenChange={() => setSelectedRequest(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{t("dialogTitle")}</DialogTitle>
              <DialogDescription>
                #{selectedRequest.request_id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>{t("seller")}</Label>
                <p className="font-bold">
                  {selectedRequest.seller_name || t("na")}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedRequest.seller_email}
                </p>
              </div>
              <div>
                <Label>{t("store")}</Label>
                <p className="font-bold">{selectedRequest.store_name || "-"}</p>
              </div>
              <div>
                <Label>{t("upgradeFrom")}</Label>
                <p className="font-bold">
                  {selectedRequest.current_plan_name || t("free")}
                </p>
              </div>
              <div>
                <Label>{t("upgradeTo")}</Label>
                <p className="font-bold">{selectedRequest.target_plan_name}</p>
              </div>
              <div>
                <Label>{t("monthlyPrice")}</Label>
                <p className="font-bold text-green-600">
                  ${selectedRequest.target_plan_price}
                </p>
              </div>
              <div>
                <Label>{t("contactMethod")}</Label>
                <p className="flex items-center gap-1">
                  <span>{getContactIcon(selectedRequest.contact_method)}</span>
                  <span>{selectedRequest.contact_value || "-"}</span>
                </p>
              </div>
              <div className="col-span-2">
                <Label>{t("sellerNotes")}</Label>
                <p className="text-gray-700">
                  {selectedRequest.seller_notes || "-"}
                </p>
              </div>
              <div>
                <Label>{t("status")}</Label>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <Label>{t("createdAt")}</Label>
                <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Admin Notes */}
            {selectedRequest.admin_notes && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <Label>{t("previousAdminNotes")}</Label>
                </div>
                <p className="text-gray-700">{selectedRequest.admin_notes}</p>
                {selectedRequest.contacted_at && (
                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(selectedRequest.contacted_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Action Form */}
            {selectedRequest.status === "pending" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminNotes">{t("adminNotes")}</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder={t("adminNotesPlaceholder")}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("reject")}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="gap-1 bg-blue-500"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t("approve")}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Complete Action */}
            {selectedRequest.status === "approved" &&
              !selectedRequest.payment_received_at && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-yellow-500" />
                    <Label>{t("confirmPayment")}</Label>
                  </div>
                  <p className="mb-4 text-sm text-gray-700">
                    {t("confirmPaymentQuestion")}
                  </p>
                  <Button
                    onClick={handleComplete}
                    disabled={actionLoading}
                    className="w-full gap-1 bg-green-500"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t("confirmPaymentButton")}
                  </Button>
                </div>
              )}

            {/* Completed */}
            {selectedRequest.status === "completed" && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Label>{t("subscriptionActivated")}</Label>
                </div>
                <p className="text-sm text-gray-700">
                  {t("paymentReceivedAt")}:{" "}
                  {new Date(
                    selectedRequest.payment_received_at!
                  ).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  {t("activatedAt")}:{" "}
                  {new Date(selectedRequest.completed_at!).toLocaleString()}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
