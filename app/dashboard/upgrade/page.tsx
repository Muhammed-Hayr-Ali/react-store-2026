'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/createBrowserClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Bike, ArrowRight } from 'lucide-react';

export default function UpgradeAccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectType = async (type: 'seller' | 'delivery') => {
    if (!user) return;

    setLoading(type);

    try {
      if (type === 'seller') {
        // الانتقال لصفحة معلومات البائع
        router.push('/dashboard/upgrade/seller-form');
      } else {
        // الانتقال لصفحة معلومات التوصيل
        router.push('/dashboard/upgrade/delivery-form');
      }
    } catch (error) {
      console.error('Error selecting account type:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ترقية حسابك</h1>
        <p className="text-gray-600 text-lg">
          اختر نوع الحساب الذي تريد الترقية إليه
        </p>
      </div>

      {/* Account Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* بائع */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleSelectType('seller')}
        >
          <CardHeader className="text-center">
            <Store className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">بائع</CardTitle>
            <CardDescription>
              بع منتجاتك في منصتنا
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="space-y-2 text-right">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                إدارة المنتجات
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                متابعة الطلبات
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                إحصائيات المبيعات
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                دعم فني مخصص
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" disabled={loading === 'seller'}>
              اختيار بائع
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* موظف توصيل */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleSelectType('delivery')}
        >
          <CardHeader className="text-center">
            <Bike className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">موظف توصيل</CardTitle>
            <CardDescription>
              انضم لفريق التوصيل
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="space-y-2 text-right">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                قبول طلبات التوصيل
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                تحديد مناطق التغطية
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                متابعة الأرباح
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                مرونة في الوقت
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full gap-2" disabled={loading === 'delivery'}>
              اختيار موظف توصيل
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* معلومات إضافية */}
      <div className="max-w-4xl mx-auto mt-12">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <h3 className="font-bold mb-4 text-center">كيف يعمل النظام؟</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto mb-2">
                  1
                </div>
                <p className="text-sm">اختر نوع الحساب</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto mb-2">
                  2
                </div>
                <p className="text-sm">أدخل المعلومات</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto mb-2">
                  3
                </div>
                <p className="text-sm">اختر خطة الاشتراك</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto mb-2">
                  4
                </div>
                <p className="text-sm">الإدارة توافق وتفعّل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
