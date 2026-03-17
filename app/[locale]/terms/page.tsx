import { createMetadata } from "@/lib/config/metadata_generator";
import { TermsPageContent } from "@/components/legal/terms-content";

export const metadata = createMetadata({
  title: "Terms of Service",
  description: "Marketna Terms of Service and Conditions - Learn about your rights and responsibilities.",
  path: "/terms",
});

export default function Page() {
  return <TermsPageContent />;
}
