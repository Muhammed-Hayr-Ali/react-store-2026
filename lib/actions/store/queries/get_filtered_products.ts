/**
 * @file lib/actions/store/queries/get_filtered_products.ts
 * @description قائمة منتجات مبسطة ومقسمة إلى صفحات للمتجر، مع تخزين مؤقت.
 */

"use server"

import { unstable_cache } from "next/cache"
import type { ApiResult } from "../../types/utils"
import { createPublicServerClient } from "@/lib/database/supabase/public"
import { CACHE_TAG } from "@/lib/config/app_config"
import type { Tables } from "@/lib/database/supabase/types"

type ProductVariantRecord = Pick<
  Tables<"product_variants">,
  | "id"
  | "sku"
  | "price"
  | "compare_at_price"
  | "stock_quantity"
  | "track_inventory"
  | "is_active"
  | "sort_order"
>

type ProductImageRecord = Pick<
  Tables<"product_images">,
  "url" | "alt_text" | "is_primary" | "sort_order" | "variant_id"
>

type NamedRelationRecord = Pick<
  Tables<"categories"> | Tables<"brands">,
  "id" | "name" | "name_ar" | "slug" | "is_active"
>

type ProductQueryResult = Pick<
  Tables<"products">,
  "id" | "name" | "slug" | "description"
> & {
  product_variants: ProductVariantRecord[] | null
  product_images: ProductImageRecord[] | null
  product_reviews: Pick<Tables<"product_reviews">, "rating">[] | null
  categories: NamedRelationRecord | null
  brands: NamedRelationRecord | null
}

type CategoryNode = Pick<
  Tables<"categories">,
  "id" | "parent_id" | "slug" | "is_active"
>

export interface SimpliProduct {
  id: string
  name: string
  slug: string
  description?: string | null
  variantId: string | null
  price: number | null
  compareAtPrice?: number | null
  /** هل المتغير المعروض متاح للبيع */
  inStock: boolean
  imageUrl?: string | null
  imageAlt?: string | null
  rating: number
  reviewCount: number
  categoryId: string
  categoryName: string
  categoryNameAr: string | null
  categorySlug: string
  brandId: string
  brandName: string
  brandNameAr: string | null
  brandSlug: string
}

interface FilterOptions {
  categoryId?: string
  categorySlug?: string
  brandId?: string
  brandSlug?: string
  /** true: المميزة فقط، false: غير المميزة فقط، دون قيمة: الكل */
  is_featured?: boolean
  limit?: number
  page?: number
  activeOnly?: boolean
}

interface QueryParams {
  categoryId: string | null
  categorySlug: string | null
  brandId: string | null
  brandSlug: string | null
  isFeatured: boolean | null
  limit: number
  page: number
  activeOnly: boolean
  today: string
}

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 100
const STORE_TIME_ZONE = "Asia/Damascus"

const clampInt = (value: unknown, fallback: number, max: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(Math.trunc(value), 1), max)
    : fallback

const optionalText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null

/** تاريخ اليوم بصيغة YYYY-MM-DD حسب توقيت المتجر */
const todayInStore = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

/**
 * معرفات التصنيف المطلوب مع كل تصنيفاته الفرعية.
 * مع activeOnly يُستبعد التصنيف المعطل وكل ما تحته.
 */
function collectCategoryIds(
  nodes: CategoryNode[],
  { categoryId, categorySlug, activeOnly }: QueryParams
): string[] {
  const visible = nodes.filter((n) => !activeOnly || n.is_active !== false)
  const root = visible.find(
    (n) =>
      (!categoryId || n.id === categoryId) &&
      (!categorySlug || n.slug === categorySlug)
  )
  if (!root) return []

  // Set تمنع التكرار وتحمي من أي حلقة في parent_id
  const ids = new Set([root.id])
  for (const parentId of ids) {
    for (const node of visible) {
      if (node.parent_id === parentId) ids.add(node.id)
    }
  }
  return [...ids]
}

const isAvailable = (variant: ProductVariantRecord) =>
  !variant.track_inventory || variant.stock_quantity > 0

/** الأرخص بين المتاح، وإن نفد الكل فالأرخص مطلقاً. عند التساوي: sort_order */
function pickVariant(variants: ProductVariantRecord[]) {
  const available = variants.filter(isAvailable)
  const pool = available.length > 0 ? available : variants

  return (
    [...pool].sort(
      (a, b) =>
        Number(a.price) - Number(b.price) ||
        a.sort_order - b.sort_order ||
        a.id.localeCompare(b.id)
    )[0] ?? null
  )
}

/** صورة المتغير المعروض أو صورة عامة، ولا نلجأ لصورة متغير آخر إلا أخيراً */
function pickImage(
  images: ProductImageRecord[],
  variantId: string | undefined
) {
  const own = variantId ? images.filter((i) => i.variant_id === variantId) : []
  const general = images.filter((i) => !i.variant_id)

  return (
    own.find((i) => i.is_primary) ??
    general.find((i) => i.is_primary) ??
    own[0] ??
    general[0] ??
    images.find((i) => i.is_primary) ??
    images[0] ??
    null
  )
}

function toSimpliProduct(
  product: ProductQueryResult,
  activeOnly: boolean
): SimpliProduct {
  const variants = (product.product_variants ?? []).filter(
    (v) => !activeOnly || v.is_active
  )
  const variant = pickVariant(variants)
  const image = pickImage(product.product_images ?? [], variant?.id)

  const reviews = product.product_reviews ?? []
  const reviewCount = reviews.length
  const rating =
    reviewCount > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
        ) / 10
      : 0

  const price = variant ? Number(variant.price) : null
  const compareAt =
    variant?.compare_at_price != null ? Number(variant.compare_at_price) : null

  // لا نعرض اسم أو رابط تصنيف/علامة معطلة
  const visible = (relation: NamedRelationRecord | null) =>
    relation && (!activeOnly || relation.is_active !== false) ? relation : null
  const category = visible(product.categories)
  const brand = visible(product.brands)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    variantId: variant?.id ?? null,
    price,
    // السعر السابق له معنى فقط إذا كان أعلى من الحالي
    compareAtPrice:
      price != null && compareAt != null && compareAt > price
        ? compareAt
        : null,
    inStock: variant ? isAvailable(variant) : false,
    imageUrl: image?.url ?? null,
    imageAlt: image?.alt_text ?? null,
    rating,
    reviewCount,
    categoryId: category?.id ?? "",
    categoryName: category?.name ?? "",
    categoryNameAr: category?.name_ar ?? null,
    categorySlug: category?.slug ?? "",
    brandId: brand?.id ?? "",
    brandName: brand?.name ?? "",
    brandNameAr: brand?.name_ar ?? null,
    brandSlug: brand?.slug ?? "",
  }
}

const getCachedFilteredProducts = unstable_cache(
  async (params: QueryParams): Promise<SimpliProduct[]> => {
    const {
      categoryId,
      categorySlug,
      brandId,
      brandSlug,
      isFeatured,
      limit,
      page,
      activeOnly,
      today,
    } = params

    const supabase = await createPublicServerClient()

    // التصنيف الرئيسي يشمل منتجات تصنيفاته الفرعية
    let categoryIds: string[] | null = null
    if (categoryId || categorySlug) {
      const { data, error } = await supabase
        .from("categories")
        .select("id, parent_id, slug, is_active")

      if (error) throw new Error(error.message)

      categoryIds = collectCategoryIds(data ?? [], params)
      if (categoryIds.length === 0) return []
    }

    // !inner يستبعد المنتج الأب عند عدم تطابق العلاقة، فيبقى عدد الصفحة صحيحاً
    let query = supabase.from("products").select(
      `
        id,
        name,
        slug,
        description,
        product_variants${activeOnly ? "!inner" : ""} (
          id,
          sku,
          price,
          compare_at_price,
          stock_quantity,
          track_inventory,
          is_active,
          sort_order
        ),
        product_images (
          url,
          alt_text,
          is_primary,
          sort_order,
          variant_id
        ),
        product_reviews (
          rating
        ),
        categories (
          id,
          name,
          name_ar,
          slug,
          is_active
        ),
        brands${brandId || brandSlug ? "!inner" : ""} (
          id,
          name,
          name_ar,
          slug,
          is_active
        )
      `
    )

    // التقييمات غير المعتمدة لا تدخل في المتوسط ولا في العدد
    query = query.eq("product_reviews.is_approved", true)

    if (categoryIds) query = query.in("category_id", categoryIds)
    if (brandId) query = query.eq("brands.id", brandId)
    if (brandSlug) query = query.eq("brands.slug", brandSlug)
    if (isFeatured !== null) query = query.eq("is_featured", isFeatured)

    if (activeOnly) {
      query = query
        .eq("is_active", true)
        .eq("product_variants.is_active", true)
        // استبعاد المتغيرات منتهية الصلاحية
        .or(`expiration_date.is.null,expiration_date.gte.${today}`, {
          referencedTable: "product_variants",
        })

      if (brandId || brandSlug) query = query.eq("brands.is_active", true)
    }

    const from = (page - 1) * limit
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      // ترتيب ثابت للصور حتى لا تتغير الصورة المختارة بين طلب وآخر
      .order("sort_order", {
        referencedTable: "product_images",
        ascending: true,
      })
      .order("id", {
        referencedTable: "product_images",
        ascending: true,
      })
      .range(from, from + limit - 1)

    if (error) throw new Error(error.message)

    return (data ?? []).map((product) =>
      toSimpliProduct(product, activeOnly)
    )
  },
  // مفتاح جديد لأن شكل البيانات تغير
  ["filtered-products-v2"],
  { revalidate: 3600, tags: [CACHE_TAG.PRODUCTS] }
)

export async function getFilteredProducts(
  options: FilterOptions = {}
): Promise<ApiResult<SimpliProduct[]>> {
  // الملف "use server": قد تصل القيم من المتصفح، لذلك نتحقق منها ونضع حدوداً
  const params: QueryParams = {
    categoryId: optionalText(options.categoryId),
    categorySlug: optionalText(options.categorySlug),
    brandId: optionalText(options.brandId),
    brandSlug: optionalText(options.brandSlug),
    isFeatured:
      typeof options.is_featured === "boolean" ? options.is_featured : null,
    limit: clampInt(options.limit, DEFAULT_LIMIT, MAX_LIMIT),
    page: clampInt(options.page, 1, 10_000),
    // لا يُلغى الفلتر إلا بقيمة false صريحة
    activeOnly: options.activeOnly !== false,
    today: todayInStore(),
  }

  try {
    const data = await getCachedFilteredProducts(params)
    return { success: true, data }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown database error"

    // التفاصيل تبقى في سجل الخادم ولا تُرسل إلى المتصفح
    console.error("[getFilteredProducts] Database query failed", { message })

    return { success: false, error: "FETCH_PRODUCTS_ERROR" }
  }
}
