// app\[locale]\(others)\unsubscribe\page.tsx

import UnsubscribePage from "@/components/others/unsubscribe-page";
import { createMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";

export function generateMetadata() {
  return createMetadata({
    title: "Unsubscribe",
    description: "Unsubscribe from our newsletter",
  });
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const token = (await searchParams).token;

  if (!token) return notFound();

  return <UnsubscribePage token={token} />;
}



