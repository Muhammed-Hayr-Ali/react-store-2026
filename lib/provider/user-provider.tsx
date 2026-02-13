"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { type User } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/createBrowserClient";
import { getUser } from "../actions/get-user-action";

// 1. تعريف شكل السياق
interface UserContextType {
  user: User | null | undefined;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 2. إنشاء المكون Provider
export const UserProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null | undefined;
}) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUser();
      setUser(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // الاستماع لتغييرات المصادقة لتحديث المستخدم تلقائيًا
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        refreshUser();
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 3. إنشاء الهوك المخصص
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
