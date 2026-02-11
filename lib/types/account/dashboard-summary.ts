

// =================================================================
// 1. TYPES Orders Summary
// =================================================================
export type OrdersSummary = {
  totalOrders: number;
  latestOrder: {
    id: string;
    status: string;
    created_at: string;
    total_amount: number;
  } | null;
};

//=================================================================
// 2. TYPES Cart Summary
//=================================================================
export type CartSummary = {
  totalItems: number;
  totalPrice: number;
};

//=================================================================
// 3. TYPES Wishlist Summary
//=================================================================
  export type WishlistSummary = {
    totalItems: number;
    recentItems: {
      id: string;
      products: {
        name: string;
        slug: string;
        main_image_url: string;
      };
    }[];
  }


//=================================================================
// 4. TYPES Reviews Summary
//=================================================================
export type ReviewsSummary = {
  totalReviews: number;
  latestReview: {
    rating: number;
    title: string | null;
    product: {
      name: string;
      slug: string;
    };
  } | null;
};

//=================================================================
// 5. TYPES Addresses Summary
//=================================================================
export type AddressesSummary = {
  totalAddresses: number;
  latestAddress: {
    address_nickname: string | null;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
};

//=================================================================
// 6. TYPES Dashboard Summary
//=================================================================
export type DashboardSummary = {
  ordersSummary: OrdersSummary;
  cartSummary: CartSummary;
  wishlistSummary: WishlistSummary;
  reviewsSummary: ReviewsSummary;
  addressesSummary: AddressesSummary;
  [key: string]: unknown;
};

