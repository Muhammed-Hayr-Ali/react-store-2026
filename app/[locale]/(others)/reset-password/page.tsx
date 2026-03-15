import ResetPasswordForm from "@/components/others/reset-password-page";
import { checkResetToken } from "@/lib/actions/update-password";
import { createMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";

export function generateMetadata() {
  return createMetadata({
    title: "Reset Password",
    description: "Reset Password to your account",
  });
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const token = (await searchParams).token as string;

  if (!token) return notFound();

  const result = await checkResetToken(token);
  if (!result.is_valid || !result.user_id) return notFound();

  return <ResetPasswordForm token={token} resetTokenData={result} />;
}
