"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Store,
  Bike,
  User,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import { toast } from "sonner"
import {
  approveSellerUpgradeRequest,
  approveDeliveryUpgradeRequest,
  rejectSellerUpgradeRequest,
  rejectDeliveryUpgradeRequest,
  completeUpgradeRequest,
  changeUpgradeRequestStatus,
  getSellerUpgradeRequests,
  getDeliveryUpgradeRequests,
} from "@/lib/actions/admin/upgradeRequests"

interface UpgradeRequest {
  request_id: string
  request_type: "seller" | "delivery"
  entity_id: string
  entity_name: string
  entity_email: string
  entity_phone?: string
  current_plan_name: string
  target_plan_name: string
  target_plan_price: number
  status: string
  admin_notes: string
  contact_method: string
  contact_value: string
  created_at: string
  // Seller specific
  store_name?: string
  store_description?: string
  store_slug?: string
  address?: {
    street?: string
    city?: string
    country?: string
  }
  tax_number?: string
  commercial_registration?: string
  // Delivery specific
  company_name?: string
  vehicle_types?: string[]
  coverage_areas?: {
    city?: string
    zones?: string[]
  }
  max_delivery_radius?: number
  license_number?: string
  insurance_number?: string
}

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  phone?: string
  phone_verified?: boolean
  avatar_url?: string
  bio?: string
  language?: string
  timezone?: string
  email_verified?: boolean
  created_at?: string
  last_sign_in_at?: string
}

export default function AdminUpgradeRequestsPage() {
  const t = useTranslations("Admin.upgradeRequests")
  const supabase = createBrowserClient()

  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Dialogs
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(
    null
  )
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Actions
  const [adminNotes, setAdminNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [statusFilter, typeFilter])

  async function loadRequests() {
    setLoading(true)

    try {
      // Load seller requests
      const sellerData = await getSellerUpgradeRequests()

      // Load delivery requests
      const deliveryData = await getDeliveryUpgradeRequests()

      if (!sellerData) console.error("Error loading seller requests: no data")
      if (!deliveryData)
        console.error("Error loading delivery requests: no data")

      // Combine and format requests
      const formattedRequests: UpgradeRequest[] = [
        ...(sellerData || []).map(
          (r: {
            request_id: string
            seller_id: string
            store_name: string
            seller_email: string
            phone?: string
            current_plan_name?: string
            target_plan_name: string
            target_plan_price?: string | number
            status: string
            admin_notes?: string
            contact_method?: string
            contact_value?: string
            created_at: string
            store_description?: string
            store_slug?: string
            address?: {
              street?: string
              city?: string
              country?: string
            }
            tax_number?: string
            commercial_registration?: string
          }) => ({
            request_id: r.request_id,
            request_type: "seller" as const,
            entity_id: r.seller_id,
            entity_name: r.store_name,
            entity_email: r.seller_email,
            entity_phone: r.phone,
            current_plan_name: r.current_plan_name || "None",
            target_plan_name: r.target_plan_name,
            target_plan_price: parseFloat(String(r.target_plan_price)) || 0,
            status: r.status,
            admin_notes: r.admin_notes || "",
            contact_method: r.contact_method || "",
            contact_value: r.contact_value || "",
            created_at: r.created_at,
            store_name: r.store_name,
            store_description: r.store_description,
            store_slug: r.store_slug,
            address: r.address,
            tax_number: r.tax_number,
            commercial_registration: r.commercial_registration,
          })
        ),
        ...(deliveryData || []).map(
          (r: {
            request_id: string
            delivery_partner_id: string
            company_name: string
            partner_email: string
            phone?: string
            current_plan_name?: string
            target_plan_name: string
            target_plan_price?: string | number
            status: string
            admin_notes?: string
            contact_method?: string
            contact_value?: string
            created_at: string
            vehicle_types?: string[]
            coverage_areas?: {
              city?: string
              zones?: string[]
            }
            max_delivery_radius?: number
            license_number?: string
            insurance_number?: string
          }) => ({
            request_id: r.request_id,
            request_type: "delivery" as const,
            entity_id: r.delivery_partner_id,
            entity_name: r.company_name,
            entity_email: r.partner_email,
            entity_phone: r.phone,
            current_plan_name: r.current_plan_name || "None",
            target_plan_name: r.target_plan_name,
            target_plan_price: parseFloat(String(r.target_plan_price)) || 0,
            status: r.status,
            admin_notes: r.admin_notes || "",
            contact_method: r.contact_method || "",
            contact_value: r.contact_value || "",
            created_at: r.created_at,
            company_name: r.company_name,
            vehicle_types: r.vehicle_types,
            coverage_areas: r.coverage_areas,
            max_delivery_radius: r.max_delivery_radius,
            license_number: r.license_number,
            insurance_number: r.insurance_number,
          })
        ),
      ]

      // Filter by status
      let filtered = formattedRequests
      if (statusFilter !== "all") {
        filtered = filtered.filter((r) => r.status === statusFilter)
      }

      // Filter by type
      if (typeFilter !== "all") {
        filtered = filtered.filter((r) => r.request_type === typeFilter)
      }

      // Filter by search
      if (searchQuery) {
        filtered = filtered.filter(
          (r) =>
            r.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.entity_email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setRequests(
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      )
    } catch (error) {
      console.error("Error loading requests:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const result =
        selectedRequest.request_type === "seller"
          ? await approveSellerUpgradeRequest({
              requestId: selectedRequest.request_id,
              adminNotes: adminNotes || undefined,
            })
          : await approveDeliveryUpgradeRequest({
              requestId: selectedRequest.request_id,
              adminNotes: adminNotes || undefined,
            })

      if (result.success) {
        toast.success("Request approved successfully", {
          description: `The ${selectedRequest.request_type} upgrade request has been approved.`,
        })
        await loadRequests()
        setShowInfoDialog(false)
        setAdminNotes("")
        setSelectedRequest(null)
      } else {
        toast.error("Failed to approve request", {
          description: result.error || "An unknown error occurred",
        })
      }
    } catch (error) {
      console.error("Error approving request:", error)
      toast.error("Error approving request", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const result =
        selectedRequest.request_type === "seller"
          ? await rejectSellerUpgradeRequest({
              requestId: selectedRequest.request_id,
              adminNotes: adminNotes || "No reason provided",
            })
          : await rejectDeliveryUpgradeRequest({
              requestId: selectedRequest.request_id,
              adminNotes: adminNotes || "No reason provided",
            })

      if (result.success) {
        toast.success("Request rejected", {
          description: `The ${selectedRequest.request_type} upgrade request has been rejected.`,
        })
        await loadRequests()
        setShowInfoDialog(false)
        setAdminNotes("")
        setSelectedRequest(null)
      } else {
        toast.error("Failed to reject request", {
          description: result.error || "An unknown error occurred",
        })
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast.error("Error rejecting request", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleComplete() {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const result = await completeUpgradeRequest(selectedRequest.request_id)

      if (result.success) {
        toast.success("Request completed", {
          description: "Payment received and subscription activated.",
        })
        await loadRequests()
        setShowInfoDialog(false)
        setAdminNotes("")
        setSelectedRequest(null)
      } else {
        toast.error("Failed to complete request", {
          description: result.error || "An unknown error occurred",
        })
      }
    } catch (error) {
      console.error("Error completing request:", error)
      toast.error("Error completing request", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleChangeStatus(newStatus: string) {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const result = await changeUpgradeRequestStatus({
        requestId: selectedRequest.request_id,
        newStatus: newStatus,
        adminNotes: adminNotes || undefined,
      })

      if (result.success) {
        toast.success("Status changed successfully", {
          description: `Request status has been changed to ${newStatus}.`,
        })
        await loadRequests()
        setShowInfoDialog(false)
        setAdminNotes("")
        setSelectedRequest(null)
      } else {
        toast.error("Failed to change status", {
          description: result.error || "An unknown error occurred",
        })
      }
    } catch (error) {
      console.error("Error changing status:", error)
      toast.error("Error changing status", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setActionLoading(false)
    }
  }

  async function viewUserProfile(
    entityId: string,
    requestType: "seller" | "delivery"
  ) {
    try {
      // Get user_id from seller or delivery partner
      let userId: string | null = null

      if (requestType === "seller") {
        const { data: sellerData, error: sellerError } = await supabase
          .from("sellers")
          .select("user_id")
          .eq("id", entityId)
          .single()

        if (sellerError || !sellerData) {
          console.error("Error fetching seller:", sellerError)
          alert("Seller not found")
          return
        }
        userId = sellerData.user_id
      } else {
        const { data: partnerData, error: partnerError } = await supabase
          .from("delivery_partners")
          .select("user_id")
          .eq("id", entityId)
          .single()

        if (partnerError || !partnerData) {
          console.error("Error fetching delivery partner:", partnerError)
          alert("Delivery partner not found")
          return
        }
        userId = partnerData.user_id
      }

      if (!userId) {
        alert("User not found")
        return
      }

      // Load profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error loading profile:", error)
        alert("Failed to load user profile")
        return
      }

      setUserProfile(data)
      setShowProfileDialog(true)
    } catch (error) {
      console.error("Error loading profile:", error)
      alert("Failed to load user profile")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge className="gap-1 bg-blue-500">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      case "completed":
        return (
          <Badge className="gap-1 bg-green-500">
            <DollarSign className="h-3 w-3" /> Completed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    completed: requests.filter((r) => r.status === "completed").length,
    sellers: requests.filter((r) => r.request_type === "seller").length,
    delivery: requests.filter((r) => r.request_type === "delivery").length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Upgrade Requests Management</h1>
        <p className="text-gray-600">
          Manage seller and delivery partner upgrade requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-500">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-500">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-500">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-500">
              <Store className="mr-1 inline h-4 w-4" />
              Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sellers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-500">
              <Bike className="mr-1 inline h-4 w-4" />
              Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivery}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="seller">
                    <Store className="mr-2 inline h-4 w-4" />
                    Sellers
                  </SelectItem>
                  <SelectItem value="delivery">
                    <Bike className="mr-2 inline h-4 w-4" />
                    Delivery
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Requests List</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `${requests.length} request(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No requests found
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card
                  key={request.created_at}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {request.request_type === "seller" ? (
                          <Store className="mt-1 h-8 w-8 flex-shrink-0 text-purple-500" />
                        ) : (
                          <Bike className="mt-1 h-8 w-8 flex-shrink-0 text-orange-500" />
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold">
                              {request.entity_name}
                            </h3>
                            {getStatusBadge(request.status)}
                            <Badge variant="outline">
                              {request.request_type === "seller"
                                ? "Seller"
                                : "Delivery"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {request.entity_email}
                            </span>
                            {request.entity_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {request.entity_phone}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium">
                              Upgrade: {request.current_plan_name} →{" "}
                              {request.target_plan_name}
                            </span>
                            <span className="font-bold text-green-600">
                              ${request.target_plan_price}/year
                            </span>
                          </div>

                          <div className="text-xs text-gray-500">
                            Created:{" "}
                            {new Date(request.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowInfoDialog(true)
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            viewUserProfile(
                              request.entity_id,
                              request.request_type
                            )
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.request_type === "seller"
                ? "Seller"
                : "Delivery"}{" "}
              Request Details
            </DialogTitle>
            <DialogDescription>
              Request ID:{" "}
              {selectedRequest?.request_id
                ? selectedRequest.request_id.slice(0, 8)
                : "N/A"}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger key="info" value="info">
                  Request Info
                </TabsTrigger>
                <TabsTrigger key="entity" value="entity">
                  {selectedRequest.request_type === "seller"
                    ? "Store Info"
                    : "Delivery Info"}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                key="info-content"
                value="info"
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Contact</Label>
                    <div className="mt-1">
                      {selectedRequest.contact_method}:{" "}
                      {selectedRequest.contact_value}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Current Plan</Label>
                    <div className="mt-1 font-medium">
                      {selectedRequest.current_plan_name}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Target Plan</Label>
                    <div className="mt-1 font-bold text-green-600">
                      {selectedRequest.target_plan_name} ($
                      {selectedRequest.target_plan_price}/year)
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Created At</Label>
                    <div className="mt-1">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedRequest.admin_notes && (
                  <div>
                    <Label className="text-gray-500">Admin Notes</Label>
                    <div className="mt-1 rounded-lg bg-gray-50 p-3">
                      {selectedRequest.admin_notes}
                    </div>
                  </div>
                )}

                {selectedRequest.status === "pending" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminNotes">Admin Notes</Label>
                      <Textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add your notes here..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="flex-1 bg-blue-500"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={actionLoading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {selectedRequest.status === "approved" && (
                  <div className="border-t pt-4">
                    <Button
                      onClick={handleComplete}
                      disabled={actionLoading}
                      className="w-full bg-green-500"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Mark as Completed (Payment Received)
                    </Button>
                  </div>
                )}

                {/* Change Status Section - Available for all statuses */}
                <div className="border-t pt-4">
                  <Label className="mb-2 block text-gray-500">
                    Change Status Manually
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedRequest.status}
                      onValueChange={(value) => {
                        if (value !== selectedRequest.status) {
                          handleChangeStatus(value)
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    This allows you to change the status even after rejection.
                  </p>
                </div>
              </TabsContent>

              <TabsContent
                key="entity-content"
                value="entity"
                className="space-y-4"
              >
                {selectedRequest.request_type === "seller" ? (
                  // Seller Info
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-500">Store Name</Label>
                        <div className="mt-1 font-medium">
                          {selectedRequest.store_name || "N/A"}
                        </div>
                      </div>
                      {selectedRequest.store_slug && (
                        <div>
                          <Label className="text-gray-500">Store Slug</Label>
                          <div className="mt-1 font-mono text-sm">
                            {selectedRequest.store_slug}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedRequest.store_description ? (
                      <div>
                        <Label className="text-gray-500">Description</Label>
                        <div className="mt-1 rounded-lg bg-gray-50 p-3">
                          {selectedRequest.store_description}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-gray-500">Description</Label>
                        <div className="mt-1 text-gray-400 italic">
                          No description
                        </div>
                      </div>
                    )}
                    {selectedRequest.tax_number && (
                      <div>
                        <Label className="text-gray-500">Tax Number</Label>
                        <div className="mt-1">{selectedRequest.tax_number}</div>
                      </div>
                    )}
                    {selectedRequest.commercial_registration && (
                      <div>
                        <Label className="text-gray-500">
                          Commercial Registration
                        </Label>
                        <div className="mt-1">
                          {selectedRequest.commercial_registration}
                        </div>
                      </div>
                    )}
                    {selectedRequest.address ? (
                      <div>
                        <Label className="flex items-center gap-1 text-gray-500">
                          <MapPin className="h-4 w-4" /> Address
                        </Label>
                        <div className="mt-1 rounded-lg bg-gray-50 p-3">
                          {selectedRequest.address.city || "N/A"},{" "}
                          {selectedRequest.address.street || "N/A"}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label className="flex items-center gap-1 text-gray-500">
                          <MapPin className="h-4 w-4" /> Address
                        </Label>
                        <div className="mt-1 text-gray-400 italic">
                          No address
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Delivery Info
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-500">Company Name</Label>
                        <div className="mt-1 font-medium">
                          {selectedRequest.company_name}
                        </div>
                      </div>
                      {selectedRequest.max_delivery_radius && (
                        <div>
                          <Label className="text-gray-500">
                            Max Delivery Radius
                          </Label>
                          <div className="mt-1">
                            {selectedRequest.max_delivery_radius} km
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedRequest.vehicle_types &&
                      selectedRequest.vehicle_types.length > 0 && (
                        <div>
                          <Label className="text-gray-500">Vehicle Types</Label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {selectedRequest.vehicle_types.map((type, i) => (
                              <Badge
                                key={`${selectedRequest.request_id}-vehicle-${i}`}
                                variant="secondary"
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    {selectedRequest.license_number && (
                      <div>
                        <Label className="text-gray-500">License Number</Label>
                        <div className="mt-1">
                          {selectedRequest.license_number}
                        </div>
                      </div>
                    )}
                    {selectedRequest.insurance_number && (
                      <div>
                        <Label className="text-gray-500">
                          Insurance Number
                        </Label>
                        <div className="mt-1">
                          {selectedRequest.insurance_number}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>View user profile information</DialogDescription>
          </DialogHeader>

          {userProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.full_name || "User"}
                    className="h-20 w-20 rounded-full"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {userProfile.full_name || "N/A"}
                  </h3>
                  <p className="text-gray-600">{userProfile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">First Name</Label>
                  <div className="mt-1">{userProfile.first_name || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Last Name</Label>
                  <div className="mt-1">{userProfile.last_name || "N/A"}</div>
                </div>
                {userProfile.phone && (
                  <div>
                    <Label className="flex items-center gap-1 text-gray-500">
                      <Phone className="h-4 w-4" /> Phone
                    </Label>
                    <div className="mt-1">{userProfile.phone}</div>
                  </div>
                )}
                <div>
                  <Label className="text-gray-500">Language</Label>
                  <div className="mt-1">{userProfile.language || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Timezone</Label>
                  <div className="mt-1">{userProfile.timezone || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Email Verified</Label>
                  <div className="mt-1">
                    {userProfile.email_verified ? (
                      <Badge className="bg-green-500">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </div>
                </div>
                {userProfile.phone_verified !== undefined && (
                  <div>
                    <Label className="text-gray-500">Phone Verified</Label>
                    <div className="mt-1">
                      {userProfile.phone_verified ? (
                        <Badge className="bg-green-500">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <div className="mt-1 text-sm">
                    {userProfile.created_at
                      ? new Date(userProfile.created_at).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
                {userProfile.last_sign_in_at && (
                  <div>
                    <Label className="text-gray-500">Last Sign In</Label>
                    <div className="mt-1 text-sm">
                      {new Date(userProfile.last_sign_in_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {userProfile.bio && (
                <div>
                  <Label className="text-gray-500">Bio</Label>
                  <div className="mt-1 rounded-lg bg-gray-50 p-3">
                    {userProfile.bio}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
