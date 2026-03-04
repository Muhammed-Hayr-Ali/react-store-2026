// src/components/FeaturedProductsServer.tsx (المكون الرئيسي)

import { getFeaturedProducts } from "@/lib/actions/featured-products";
import { FeaturedProductCard } from "./featured-product-card";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";

export default async function FeaturedProductsServer() {
  const { data: featuredProducts, error } = await getFeaturedProducts(4);

  if (error || !featuredProducts || featuredProducts.length < 3) {
    if (error) {
      console.error("Error fetching featured products:", error);
    }
    return null;
  }

  // تقسيم المنتجات
  const mainProduct = featuredProducts[0];
  const sideProduct1 = featuredProducts[1];
  const sideProduct2 = featuredProducts[2];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
      <div className="col-span-1 lg:col-span-2">
        <FeaturedProductCard product={mainProduct} />
      </div>
      <div className="col-span-1 lg:col-span-1 flex flex-row lg:flex-col gap-1">
        <div className="w-1/2 lg:w-full grow">
          <FeaturedProductCard product={sideProduct1} />
        </div>
        <div className="w-1/2 lg:w-full grow">
          <FeaturedProductCard product={sideProduct2} />
        </div>
      </div>
    </div>
    // <AspectRatio ratio={16 / 9} className="overflow-hidden">
    //   <Image
    //     src={mainProduct.main_image_url}
    //     fill
    //     alt="Image"
    //     className="rounded-md object-cover"
    //   />
    // </AspectRatio>
  );
}
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 md:p-6">
//       {/* --- العمود الرئيسي (المنتج الأول) --- */}
//       <div className="col-span-1 lg:col-span-2 min-h-[200px] lg:min-h-[300px]">
//         <FeaturedProductCard product={mainProduct} />
//       </div>

//       {/* --- الحاوية الجانبية (المنتجان الثاني والثالث) --- */}
//       <div className="col-span-1 lg:col-span-1">
//         <div className="flex flex-row lg:flex-col gap-4 h-full">
//           {/* المنتج الجانبي الأول */}
//           <div className="w-1/2 lg:w-full h-full min-h-[150px] lg:min-h-0">
//             <FeaturedProductCard product={sideProduct1} />
//           </div>

//           {/* المنتج الجانبي الثاني */}
//           <div className="w-1/2 lg:w-full h-full min-h-[150px] lg:min-h-0">
//             <FeaturedProductCard product={sideProduct2} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
