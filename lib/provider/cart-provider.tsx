// lib/provider/cart-provider.tsx

"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { type Cart } from "@/types";
import { getCart } from "@/lib/actions/cart";

// 1. تعريف شكل الحالة والسياق
interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

interface CartContextType extends CartState {
  dispatch: React.Dispatch<Action>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 2. تعريف الإجراءات (Actions) التي يمكن تنفيذها
type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Cart | null }
  | { type: "FETCH_ERROR"; payload: string };

// 3. إنشاء الـ Reducer لإدارة تحديثات الحالة
const cartReducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, cart: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// 4. إنشاء المكون Provider
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const initialState: CartState = {
    cart: null,
    loading: true,
    error: null,
  };

  const [state, dispatch] = useReducer(cartReducer, initialState);

  const refreshCart = async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const cartData = await getCart();
      dispatch({ type: "FETCH_SUCCESS", payload: cartData });
    } catch (e) {
      dispatch({ type: "FETCH_ERROR", payload: "Failed to fetch cart." });
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ ...state, dispatch, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

// 5. إنشاء Hook مخصص لسهولة الاستخدام
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
