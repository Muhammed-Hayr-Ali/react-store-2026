'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function UpgradeSuccessPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'seller';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-3xl">تم إرسال طلبك بنجاح!</CardTitle>
            <CardDescription className="text-lg">
              {type === 'seller' 
                ? 'تم استلام معلومات متجرك وخطة الاشتراك'
                : 'تم استلام معلوماتك وخطة الاشتراك'}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold mb-4 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                الخطوات التالية
              </h3>
              <ol className="text-right space-y-3 list-decimal list-inside">
                <li>ستقوم الإدارة بمراجعة طلبك خلال 24-48 ساعة</li>
                <li>سنتواصل معك عبر البريد الإلكتروني للموافقة أو الطلب معلومات إضافية</li>
                <li>بعد الموافقة، سنرسل لك رابط الدفع للاشتراك</li>
                <li>بعد الدفع، سيتم تفعيل حسابك واشتراكك فوراً</li>
              </ol>
            </div>

            <div className="text-sm text-gray-600">
              <p>يمكنك متابعة حالة طلبك من:</p>
              <Link href="/dashboard/upgrade/status">
                <Button variant="link">صفحة حالة الطلب</Button>
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">العودة للوحة التحكم</Button>
            </Link>
            <Link href="/dashboard/upgrade/status">
              <Button>متابعة حالة الطلب</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
