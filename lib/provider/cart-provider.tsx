


"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect, // 1. استيراد useEffect
} from "react";
import { getTotalCartQuantity } from "@/lib/actions/cart";
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"; // 2. استيراد عميل المتصفح

// ... (تعريف السياق يبقى كما هو)
interface CartCountContextType {
  count: number;
  loading: boolean;
  refreshCount: () => Promise<void>;
}

const CartCountContext = createContext<CartCountContextType | undefined>(
  undefined,
);

export const CartCountProvider = ({
  children,
  initialCount,
}: {
  children: ReactNode;
  initialCount: number;
}) => {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient(); // 3. إنشاء نسخة من عميل المتصفح

  const refreshCount = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getTotalCartQuantity();
      if (error || !data) {
        setCount(0);
        return;
      }

      setCount(data ?? 0); // استخدام `?? 0` للأمان
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. ✅ الحل: استخدام useEffect للاستماع إلى تغييرات المصادقة
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // نستمع إلى حدثي SIGNED_IN و SIGNED_OUT
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        // عندما يتغير المستخدم، نقوم بإعادة جلب عدد السلة
        // هذا سيجلب العدد الصحيح للمستخدم الجديد أو يعيده إلى 0 للزائر
        console.log(`Auth event: ${event}. Refreshing cart count.`);
        refreshCount();
      }
    });

    // دالة التنظيف: إلغاء الاشتراك عند تفكيك المكون لمنع تسرب الذاكرة
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshCount]); // إضافة التبعيات الصحيحة

  return (
    <CartCountContext.Provider value={{ count, loading, refreshCount }}>
      {children}
    </CartCountContext.Provider>
  );
};

// ... (الهوك useCartCount يبقى كما هو)
export const useCartCount = () => {
  const context = useContext(CartCountContext);
  if (context === undefined) {
    throw new Error("useCartCount must be used within a CartCountProvider");
  }
  return context;
};
