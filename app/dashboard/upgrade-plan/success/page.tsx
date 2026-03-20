'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    async function getLastRequest() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (sellerData) {
          const { data: requests } = await supabase
            .from('seller_upgrade_requests')
            .select('id')
            .eq('seller_id', sellerData.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (requests && requests.length > 0) {
            setRequestId(requests[0].id);
          }
        }
      }
    }

    getLastRequest();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">تم استلام طلبك بنجاح!</h1>
          <p className="text-xl text-gray-600">
            شكراً لثقتك بنا. فريقنا سيتواصل معك قريباً.
          </p>
        </div>

        {/* Request Info */}
        {requestId && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-mono font-bold">#{requestId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الطلب:</span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-yellow-600">قيد المراجعة</span>
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>الخطوات التالية</CardTitle>
            <CardDescription>ماذا سيحدث بعد الإرسال</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold mb-1">مراجعة الطلب</h3>
                  <p className="text-gray-600">ستقوم الإدارة بمراجعة طلبك خلال 24 ساعة</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold mb-1">التواصل معك</h3>
                  <p className="text-gray-600">سنتواصل معك عبر طريقة التواصل التي اخترتها</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold mb-1">إرسال رابط الدفع</h3>
                  <p className="text-gray-600">سنرسل لك رابط الدفع الآمن</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold mb-1">تفعيل الاشتراك</h3>
                  <p className="text-gray-600">بعد استلام الدفع، سيتم تفعيل اشتراكك فوراً</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <MessageSquare className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">هل لديك أسئلة؟</h3>
                <p className="text-gray-600 mb-3">
                  فريق الدعم جاهز لمساعدتك في أي وقت
                </p>
                <div className="flex gap-4 text-sm">
                  <a href="mailto:support@marketna.com" className="text-blue-600 hover:underline">
                    📧 support@marketna.com
                  </a>
                  <a href="tel:+966501234567" className="text-blue-600 hover:underline">
                    📱 +966 50 123 4567
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/upgrade-requests">
            <Button size="lg" className="w-full sm:w-auto">
              عرض حالة الطلب
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              العودة للوحة التحكم
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
