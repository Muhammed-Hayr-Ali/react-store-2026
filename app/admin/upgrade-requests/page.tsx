'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, CheckCircle, XCircle, DollarSign, MessageSquare } from 'lucide-react';

interface UpgradeRequest {
  request_id: string;
  seller_name: string;
  store_name: string;
  seller_email: string;
  current_plan_name: string;
  target_plan_name: string;
  target_plan_price: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  contact_method: string;
  contact_value: string;
  seller_notes: string;
  admin_notes: string;
  contacted_at: string;
  payment_received_at: string;
  completed_at: string;
  created_at: string;
}

export default function AdminUpgradeRequestsPage() {
  const supabase = useSupabase();
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  async function loadRequests() {
    setLoading(true);
    const status = statusFilter === 'all' ? null : statusFilter;
    const { data, error } = await supabase.rpc('get_all_upgrade_requests', {
      p_status: status
    });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  }

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('approve_upgrade_request', {
        p_request_id: selectedRequest.request_id,
        p_admin_notes: adminNotes
      });

      if (error) throw error;

      await loadRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('reject_upgrade_request', {
        p_request_id: selectedRequest.request_id,
        p_admin_notes: adminNotes
      });

      if (error) throw error;

      await loadRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('complete_upgrade_request', {
        p_request_id: selectedRequest.request_id
      });

      if (error) throw error;

      await loadRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error completing request:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            قيد المراجعة
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-blue-500">
            <CheckCircle className="w-3 h-3" />
            تمت الموافقة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            مرفوض
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <DollarSign className="w-3 h-3" />
            مكتمل
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'email':
        return '📧';
      case 'phone':
        return '📱';
      case 'whatsapp':
        return '💬';
      default:
        return '📞';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">طلبات ترقية الاشتراك</h1>
          <p className="text-gray-600">إدارة ومراجعة طلبات الترقية</p>
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">تمت الموافقة</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">المجموع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-500">قيد المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-500">تمت الموافقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-500">مكتمل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">جاري التحميل...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>البائع</TableHead>
                    <TableHead>المتجر</TableHead>
                    <TableHead>الترقية</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>التواصل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
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
                          <div className="font-bold">{request.seller_name || 'غير متوفر'}</div>
                          <div className="text-sm text-gray-500">{request.seller_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{request.store_name || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{request.current_plan_name || 'مجانية'}</div>
                          <div className="text-gray-500">↓</div>
                          <div className="font-bold">{request.target_plan_name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${request.target_plan_price}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{getContactIcon(request.contact_method)}</span>
                          <span className="text-sm">{request.contact_value || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(request.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          عرض
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
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>تفاصيل طلب الترقية</DialogTitle>
              <DialogDescription>
                #{selectedRequest.request_id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>البائع</Label>
                <p className="font-bold">{selectedRequest.seller_name}</p>
                <p className="text-sm text-gray-500">{selectedRequest.seller_email}</p>
              </div>
              <div>
                <Label>المتجر</Label>
                <p className="font-bold">{selectedRequest.store_name || '-'}</p>
              </div>
              <div>
                <Label>الترقية من</Label>
                <p className="font-bold">{selectedRequest.current_plan_name || 'مجانية'}</p>
              </div>
              <div>
                <Label>الترقية إلى</Label>
                <p className="font-bold">{selectedRequest.target_plan_name}</p>
              </div>
              <div>
                <Label>السعر الشهري</Label>
                <p className="font-bold text-green-600">${selectedRequest.target_plan_price}</p>
              </div>
              <div>
                <Label>طريقة التواصل</Label>
                <p className="flex items-center gap-1">
                  <span>{getContactIcon(selectedRequest.contact_method)}</span>
                  <span>{selectedRequest.contact_value || '-'}</span>
                </p>
              </div>
              <div className="col-span-2">
                <Label>ملاحظات البائع</Label>
                <p className="text-gray-700">{selectedRequest.seller_notes || '-'}</p>
              </div>
              <div>
                <Label>الحالة</Label>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <Label>تاريخ الإنشاء</Label>
                <p>{new Date(selectedRequest.created_at).toLocaleString('ar-SA')}</p>
              </div>
            </div>

            {/* Admin Notes */}
            {selectedRequest.admin_notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <Label>ملاحظات الإدارة السابقة</Label>
                </div>
                <p className="text-gray-700">{selectedRequest.admin_notes}</p>
                {selectedRequest.contacted_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(selectedRequest.contacted_at).toLocaleString('ar-SA')}
                  </p>
                )}
              </div>
            )}

            {/* Action Form */}
            {selectedRequest.status === 'pending' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminNotes">ملاحظات الإدارة</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="أضف ملاحظاتك هنا..."
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
                    <XCircle className="w-4 h-4" />
                    رفض الطلب
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="gap-1 bg-blue-500"
                  >
                    <CheckCircle className="w-4 h-4" />
                    الموافقة على الطلب
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Complete Action */}
            {selectedRequest.status === 'approved' && !selectedRequest.payment_received_at && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <Label>تأكيد استلام الدفع</Label>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  هل تم استلام الدفع من البائع؟
                </p>
                <Button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="w-full gap-1 bg-green-500"
                >
                  <CheckCircle className="w-4 h-4" />
                  تأكيد استلام الدفع وتفعيل الاشتراك
                </Button>
              </div>
            )}

            {/* Completed */}
            {selectedRequest.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <Label>تم تفعيل الاشتراك</Label>
                </div>
                <p className="text-sm text-gray-700">
                  تم استلام الدفع في: {new Date(selectedRequest.payment_received_at!).toLocaleString('ar-SA')}
                </p>
                <p className="text-sm text-gray-700">
                  تم التفعيل في: {new Date(selectedRequest.completed_at!).toLocaleString('ar-SA')}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
