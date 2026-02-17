import { FullProduct } from "@/lib/types";

export default function ProductCard({ product }: { product: FullProduct }) {

    const image = product.main_image_url || "/placeholder.svg";
  const price = product.variants.filter((variant) => variant.is_default)[0]
    .price;
  const dscPrice = product.variants.filter((variant) => !variant.is_default)[0]
    .price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
        {dscPrice && dscPrice < price ? (
          <>
            <p className="text-gray-600 mt-2">${price.toFixed(2)}</p>
            <p className="text-red-500 text-xl font-bold">
              ${dscPrice.toFixed(2)}
            </p>
          </>
        ) : (
          <p className="text-gray-600 mt-2">${price.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
