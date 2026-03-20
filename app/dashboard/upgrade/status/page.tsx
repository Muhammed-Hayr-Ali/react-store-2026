'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/createBrowserClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface Request {
  request_id: string;
  current_plan_name: string;
  target_plan_name: string;
  target_plan_price: number;
  status: string;
  admin_notes: string;
  created_at: string;
}

export default function UpgradeStatusPage() {
  const { user } = useAuth();
  const supabase = createBrowserClient();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      if (!user) return;

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
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> قيد المراجعة</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-blue-500"><CheckCircle className="w-3 h-3" /> تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> مرفوض</Badge>;
      case 'completed':
        return <Badge className="gap-1 bg-green-500"><DollarSign className="w-3 h-3" /> مكتمل</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">حالة طلبات الترقية</h1>

      {requests.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <p className="text-gray-500">ليس لديك طلبات ترقية حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.request_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>طلب ترقية #{request.request_id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      {new Date(request.created_at).toLocaleDateString('ar-SA')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>الخطة المستهدفة:</span>
                  <span className="font-bold">{request.target_plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>السعر:</span>
                  <span className="font-bold text-green-600">${request.target_plan_price}/شهر</span>
                </div>
                {request.admin_notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold mb-2">ملاحظات الإدارة:</p>
                    <p className="text-gray-700">{request.admin_notes}</p>
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
