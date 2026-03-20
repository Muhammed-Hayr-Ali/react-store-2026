'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface UpgradeRequest {
  request_id: string;
  current_plan_name: string;
  target_plan_name: string;
  target_plan_price: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  contact_method: string;
  contact_value: string;
  admin_notes: string;
  contacted_at: string;
  payment_received_at: string;
  completed_at: string;
  created_at: string;
}

export default function UpgradeRequestsPage() {
  const supabase = useSupabase();
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      const { data, error } = await supabase.rpc('get_seller_upgrade_requests');

      if (!error && data) {
        setRequests(data);
      }

      setLoading(false);
    }

    loadRequests();
  }, []);

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
            <CheckCircle className="w-3 h-3" />
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">طلبات ترقية الاشتراك</h1>
          <p className="text-gray-600">تابع حالة طلبات الترقية الخاصة بك</p>
        </div>
        <Link href="/dashboard/upgrade-plan">
          <Button>طلب ترقية جديد</Button>
        </Link>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد طلبات ترقية</h3>
            <p className="text-gray-600 mb-6">
              لم تقم بإنشاء أي طلبات ترقية بعد
            </p>
            <Link href="/dashboard/upgrade-plan">
              <Button>تصفح الخطط</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.request_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      طلب ترقية #{request.request_id.slice(0, 8).toUpperCase()}
                      {getStatusBadge(request.status)}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      تم الإنشاء: {new Date(request.created_at).toLocaleDateString('ar-SA')}
                    </CardDescription>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">من</p>
                    <p className="font-bold">{request.current_plan_name || 'مجانية'}</p>
                    <p className="text-sm text-gray-500">إلى</p>
                    <p className="font-bold">{request.target_plan_name}</p>
                    <p className="text-sm text-green-600 font-bold">
                      ${request.target_plan_price}/شهر
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* معلومات التواصل */}
                {(request.status === 'pending' || request.status === 'approved') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getContactIcon(request.contact_method)}</span>
                      <span className="font-bold">طريقة التواصل:</span>
                      <span className="text-gray-600">
                        {request.contact_method === 'email' ? 'البريد الإلكتروني' : 
                         request.contact_method === 'phone' ? 'الهاتف' : 'WhatsApp'}
                      </span>
                    </div>
                    {request.contact_value && (
                      <p className="text-gray-700 mr-6">{request.contact_value}</p>
                    )}
                  </div>
                )}

                {/* ملاحظات الإدارة */}
                {request.admin_notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="font-bold">ملاحظات الإدارة:</span>
                    </div>
                    <p className="text-gray-700">{request.admin_notes}</p>
                    {request.contacted_at && (
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(request.contacted_at).toLocaleString('ar-SA')}
                      </p>
                    )}
                  </div>
                )}

                {/* حالة الدفع */}
                {request.status === 'approved' && !request.payment_received_at && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold">في انتظار الدفع</span>
                    </div>
                    <p className="text-gray-700">
                      يرجى انتظار تواصل الإدارة معك لإتمام عملية الدفع
                    </p>
                  </div>
                )}

                {/* تم الدفع */}
                {request.payment_received_at && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-bold">تم استلام الدفع</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(request.payment_received_at).toLocaleString('ar-SA')}
                    </p>
                  </div>
                )}

                {/* مكتمل */}
                {request.completed_at && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-bold">تم تفعيل الاشتراك</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(request.completed_at).toLocaleString('ar-SA')}
                    </p>
                  </div>
                )}

                {/* أزرار الإجراءات */}
                {request.status === 'approved' && !request.payment_received_at && (
                  <div className="flex gap-4">
                    <Button className="flex-1">
                      إتمام الدفع الآن
                    </Button>
                    <Button variant="outline">
                      تواصل معنا
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
