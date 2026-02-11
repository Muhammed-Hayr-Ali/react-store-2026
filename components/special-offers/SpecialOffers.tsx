// components/special-offers/SpecialOffers.tsx

import { getSpecialOfferProducts } from "@/lib/actions/products";
import { OfferProductCard } from "./OfferProductCard";
import { CountdownTimer } from "./CountdownTimer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function SpecialOffers() {
  const products = await getSpecialOfferProducts();

  if (products.length === 0) {
    return null; // لا تعرض القسم إذا لم تكن هناك عروض
  }

  // سنجد أقرب تاريخ انتهاء عرض لاستخدامه في العداد الرئيسي
  const earliestExpiry = products.reduce((earliest, current) => {
    const earliestDate = new Date(earliest.discount_expires_at!);
    const currentDate = new Date(current.discount_expires_at!);
    return currentDate < earliestDate ? current : earliest;
  }).discount_expires_at;

  return (
    <section className="w-full py-12 md:py-20">
      <div className="container mx-auto px-4">
        {/* البطاقة الرئيسية الكبيرة */}
        <div className="relative rounded-2xl border bg-card shadow-2xl overflow-hidden p-8 md:p-12">
          {/* خلفية متدرجة */}
          <div className="absolute inset-0 bg-linear-to-r rtl:bg-linear-to-l from-primary/10 via-transparent to-secondary/10 opacity-75"></div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-10">
            {/* الجزء الأيسر: العنوان والعداد */}
            <div className="lg:w-1/3 shrink-0 text-center lg:text-start">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
                Flash Sale
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Deals so good, they won&#39;t last long! Ends in:
              </p>
              <div className="mt-6">
                {earliestExpiry && (
                  <CountdownTimer expiryTimestamp={earliestExpiry} />
                )}
              </div>
              <Button asChild size="lg" className="mt-8 hidden lg:inline-flex">
                <Link href="/deals">View All Deals</Link>
              </Button>
            </div>

            {/* الجزء الأيمن: شبكة المنتجات */}
            <div className="grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map((product) => (
                  <OfferProductCard
                    key={product.variant_id}
                    product={product}
                  />
                ))}
              </div>
              <Button asChild size="lg" className="mt-8 w-full lg:hidden">
                <Link href="/deals">View All Deals</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
