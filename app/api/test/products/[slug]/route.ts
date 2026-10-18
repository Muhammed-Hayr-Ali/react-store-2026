import { getProductForEditBySlug } from "@/lib/actions/products/queries/get-product-for-edit-by-slug"

export const dynamic = "force-dynamic"

/**
 * Temporary read-only endpoint for testing the product fetch action.
 * Example: GET /api/test/products/example-product?activeOnly=false
 * Example: GET /api/test/products/example-product?activeOnly=false
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const activeOnly = new URL(request.url).searchParams.get("activeOnly") !== "false"
  const result = await getProductForEditBySlug(slug, { activeOnly })

  if (!result.success) {
    const status = result.error === "PRODUCT_NOT_FOUND" ? 404 : 400

    return Response.json(
      {
        success: false,
        error: result.error,
        details: result.details,
      },
      { status }
    )
  }

  return Response.json({ success: true, data: result.data })
}
