"use server";

import { AddressPayload, UserAddress } from "@/lib/types/account/address";
import { createServerClient } from "../supabase/createServerClient";
import { revalidatePath } from "next/cache";

//================================================================================
// 1. جلب عناصر قائمة العناوين (Get User Addresses)
//================================================================================
export async function getUserAddresses(): Promise<UserAddress[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id) // ✅ الأفضل دائمًا فلترة النتائج للمستخدم الحالي
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error.message);
    return [];
  }

  return data || [];
}

//================================================================================
// 2. تحديث عنصر قائمة العناوين (Update User Address)
//================================================================================
export async function updateAddress(
  addressId: string,
  formData: AddressPayload,
) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: "You must be logged in to update an address.",
    };
  }

  const { error } = await supabase
    .from("user_addresses")
    .update(formData)
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating address:", error.message);
    return { success: false, error: "Failed to update address." };
  }

  revalidatePath("/checkout");
  revalidatePath("/addresses");
  return { success: true, message: "Address updated successfully!" };
}

//================================================================================
// 3. اضافة عنصر قائمة العناوين (Add User Address)
//================================================================================
export async function addAddress(formData: AddressPayload) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: "You must be logged in to add an address.",
    };
  }

  const { error } = await supabase
    .from("user_addresses")
    .insert({ ...formData, user_id: user.id });

  if (error) {
    console.error("Error adding address:", error.message);
    return { success: false, error: "Failed to add new address." };
  }

  revalidatePath("/checkout");
  revalidatePath("/addresses");
  return { success: true, message: "Address added successfully!" };
}

//================================================================================
// 4. حذف عنصر قائمة العناوين (Delete User Address)
//================================================================================
export async function deleteAddress(addressId: string) {
  if (!addressId) {
    return { success: false, error: "Address ID is required." };
  }

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: "You must be logged in to delete an address.",
    };
  }

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id); // طبقة أمان حاسمة

  if (error) {
    console.error("Error deleting address:", error.message);
    return { success: false, error: "Failed to delete address." };
  }

  // // ✅ إعادة التحقق من صحة الصفحات ذات الصلة
  revalidatePath("/checkout");
  revalidatePath("/addresses");

  return { success: true, message: "Address deleted successfully." };
}
