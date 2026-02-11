"use server";
import { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./supabase/createServerClient";

export type SubmitSupportRequestResult = {
  data: { success: true } | null;
  error: PostgrestError | null;
};

// export async function submitSupportRequest(
//   user_id: string,
//   email: string,
//   subject: string,
//   details: string,
// ): Promise<SubmitSupportRequestResult> {
//   const supabase = createBrowserClient();

//   const { data, error } = await supabase.from("support_requests").insert({
//     user_id,
//     email,
//     subject,
//     details,
//   });

//   return { data, error };
// }


export async function submitSupportRequest(
  subject: string,
  details: string,
  contactEmail: string,
) {
  const supabase = await createServerClient();
  const { error } = await supabase.rpc('create_support_request', {
    subject_text: subject,
    details_text: details,
    contact_email_text: contactEmail,
  });

  if (error) {
    console.error("Supabase RPC error:", error.message);
    return { error: { message: "Database error." } };
  }
  return { success: true };
}
