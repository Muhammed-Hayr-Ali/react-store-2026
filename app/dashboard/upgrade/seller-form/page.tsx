'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/createBrowserClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createBrowserClient();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    phone: '',
    email: '',
    tax_number: '',
    commercial_registration: '',
    street: '',
    city: '',
    country: 'السعودية'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // 1. إنشاء سجل البائع
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .insert({
          user_id: user.id,
          store_name: formData.store_name,
          store_slug: formData.store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          store_description: formData.store_description,
          phone: formData.phone,
          email: formData.email,
          tax_number: formData.tax_number,
          commercial_registration: formData.commercial_registration,
          address: {
            street: formData.street,
            city: formData.city,
            country: formData.country
          },
          account_status: 'pending'  // بانتظار موافقة الإدارة
        })
        .select()
        .single();

      if (sellerError) throw sellerError;

      // 2. الانتقال لصفحة اختيار الخطة
      router.push(`/dashboard/upgrade/seller-plans?seller_id=${seller.id}`);
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error('Error creating seller:', err);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back Button */}
      <Link href="/dashboard/upgrade">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          العودة
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">معلومات المتجر</CardTitle>
          <CardDescription>
            أدخل معلومات متجرك ليتم مراجعتها من قبل الإدارة
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* معلومات أساسية */}
            <div className="space-y-2">
              <Label htmlFor="store_name">اسم المتجر *</Label>
              <Input
                id="store_name"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                placeholder="مثال: متجري الإلكتروني"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_description">وصف المتجر</Label>
              <Textarea
                id="store_description"
                value={formData.store_description}
                onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
                placeholder="وصف مختصر لمتجرك..."
                rows={3}
              />
            </div>

            {/* معلومات التواصل */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0501234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* المعلومات الضريبية */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_number">الرقم الضريبي</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commercial_registration">الرقم التجاري</Label>
                <Input
                  id="commercial_registration"
                  value={formData.commercial_registration}
                  onChange={(e) => setFormData({ ...formData, commercial_registration: e.target.value })}
                  placeholder="1010101010"
                />
              </div>
            </div>

            {/* العنوان */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">المدينة *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="الرياض"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">الشارع</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="شارع التخصصي"
                />
              </div>
            </div>

            {/* تنبيه */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> بعد حفظ المعلومات، سيتم إرسال طلبك للإدارة للمراجعة.
                بعد الموافقة، ستتمكن من اختيار خطة الاشتراك وبدء البيع.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ والمتابعة لاختيار الخطة'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
