import { z } from "zod";
import { createServerClient } from "@/lib/database/supabase/server";
import { ApiResult } from "@/lib/database/types";

// =====================================================
// 🛒 Customer Dashboard Server Actions
// =====================================================
// ⚠️ تتبع نفس نمط authentication actions
// =====================================================

// ─── Zod Schemas ───────────────────────────────────

const userIdSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ─── Types ─────────────────────────────────────────

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  created_at: string;
  store_vendor: { name_ar: string } | null;
};

type ProductRow = {
  id: string;
  name_ar: string;
  price_base: number;
  price_discount: number | null;
  store_category: { name_ar: string } | null;
  store_vendor: { name_ar: string } | null;
  product_image: { url: string }[] | null;
};

type FavoriteRow = {
  id: string;
  created_at: string;
  store_product: ProductRow | null;
};

// ─── Helper: Get Authenticated User ────────────────

async function getAuthenticatedUser(): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ─── Actions ───────────────────────────────────────

/**
 * 📊 جلب إحصائيات العميل
 */
export async function getCustomerStats(): Promise<
  ApiResult<{
    totalOrders: number;
    activeOrders: number;
    favorites: number;
    points: number;
  }>
> {
  try {
    const userId = await getAuthenticatedUser();
    if (!userId) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const validation = userIdSchema.safeParse({ userId });
    if (!validation.success) {
      return { success: false, error: "INVALID_USER_ID" };
    }

    const supabase = await createServerClient();

    // إجمالي الطلبات
    const { count: totalOrders } = await supabase
      .from("trade_order")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", userId);

    // الطلبات النشطة
    const { count: activeOrders } = await supabase
      .from("trade_order")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", userId)
      .in("status", ["pending", "confirmed", "processing", "shipping"]);

    // المفضلات
    const { count: favorites } = await supabase
      .from("customer_favorite")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", userId);

    // النقاط
    const { data: profile } = await supabase
      .from("core_profile")
      .select("points")
      .eq("id", userId)
      .single();

    return {
      success: true,
      data: {
        totalOrders: totalOrders ?? 0,
        activeOrders: activeOrders ?? 0,
        favorites: favorites ?? 0,
        points: (profile as { points?: number } | null)?.points ?? 0,
      },
    };
  } catch {
    return { success: false, error: "UNEXPECTED_ERROR" };
  }
}

/**
 * 📦 جلب آخر طلبات العميل
 */
export async function getRecentOrders(limit = 5): Promise<
  ApiResult<
    Array<{
      id: string;
      order_number: string;
      status: string;
      total_amount: number;
      created_at: string;
      store_name: string;
    }>
  >
> {
  try {
    const userId = await getAuthenticatedUser();
    if (!userId) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("trade_order")
      .select(
        `
        id,
        order_number,
        status,
        grand_total,
        created_at,
        store_vendor (
          name_ar
        )
      `,
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
      .returns<OrderRow[]>();

    if (error) throw error;

    return {
      success: true,
      data:
        data?.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.grand_total,
          created_at: order.created_at,
          store_name: order.store_vendor?.name_ar ?? "Unknown",
        })) ?? [],
    };
  } catch {
    return { success: false, error: "UNEXPECTED_ERROR" };
  }
}

/**
 * 📋 جلب جميع طلبات العميل (مع pagination)
 */
export async function getAllOrders(
  _prevState: unknown,
  formData: FormData,
): Promise<
  ApiResult<{
    orders: Array<{
      id: string;
      order_number: string;
      status: string;
      total_amount: number;
      created_at: string;
      store_name: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }>
> {
  try {
    const userId = await getAuthenticatedUser();
    if (!userId) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const input = {
      page: formData.get("page") ?? "1",
      limit: formData.get("limit") ?? "10",
    };

    const pagination = paginationSchema.safeParse(input);
    if (!pagination.success) {
      return { success: false, error: "INVALID_PAGINATION" };
    }

    const supabase = await createServerClient();
    const { page, limit } = pagination.data;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("trade_order")
      .select(
        `
        id,
        order_number,
        status,
        grand_total,
        created_at,
        store_vendor (
          name_ar
        )
      `,
        { count: "exact" },
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)
      .returns<OrderRow[]>();

    if (error) throw error;

    return {
      success: true,
      data: {
        orders:
          data?.map((order) => ({
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            total_amount: order.grand_total,
            created_at: order.created_at,
            store_name: order.store_vendor?.name_ar ?? "Unknown",
          })) ?? [],
        total: count ?? 0,
        page,
        limit,
      },
    };
  } catch {
    return { success: false, error: "UNEXPECTED_ERROR" };
  }
}

/**
 * ❤️ جلب المفضلات
 */
export async function getFavorites(): Promise<
  ApiResult<
    Array<{
      id: string;
      created_at: string;
      product: {
        id: string;
        name: string;
        price: number;
        original_price: number;
        category: string;
        store: string;
        image: string | null;
      } | null;
    }>
  >
> {
  try {
    const userId = await getAuthenticatedUser();
    if (!userId) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("customer_favorite")
      .select(
        `
        id,
        created_at,
        store_product (
          id,
          name_ar,
          price_base,
          price_discount,
          store_category (
            name_ar
          ),
          store_vendor (
            name_ar
          ),
          product_image (
            url
          )
        )
      `,
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .returns<FavoriteRow[]>();

    if (error) throw error;

    return {
      success: true,
      data:
        data
          ?.map((fav) => {
            const product = fav.store_product;
            if (!product) return null;

            return {
              id: fav.id,
              created_at: fav.created_at,
              product: {
                id: product.id,
                name: product.name_ar,
                price: product.price_discount ?? product.price_base,
                original_price: product.price_base,
                category: product.store_category?.name_ar ?? "General",
                store: product.store_vendor?.name_ar ?? "Unknown",
                image: product.product_image?.[0]?.url ?? null,
              },
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null) ?? [],
    };
  } catch {
    return { success: false, error: "UNEXPECTED_ERROR" };
  }
}
