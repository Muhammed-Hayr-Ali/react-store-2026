import { createMetadata } from "@/lib/config/metadata_generator";
import { PrivacyPageContent } from "@/components/legal/privacy-content";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "Marketna Privacy Policy - Your data security and privacy are our top priorities.",
  path: "/privacy",
});

export default function Page() {
  return <PrivacyPageContent />;
}
