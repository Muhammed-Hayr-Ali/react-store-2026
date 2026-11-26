export function normalizePrimaryImages<
  T extends { is_primary: boolean; variant_id: string | null },
>(images: T[]): T[] {
  const primaryGeneralIndex = images.findIndex(
    (image) => image.variant_id === null && image.is_primary
  )
  const primaryIndex =
    primaryGeneralIndex >= 0
      ? primaryGeneralIndex
      : images.findIndex((image) => image.variant_id === null)

  return images.map((image, index) => ({
    ...image,
    is_primary: image.variant_id === null && index === primaryIndex,
  }))
}
