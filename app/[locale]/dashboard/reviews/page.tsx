import MyReviewsPage from "@/components/dashboard/reviews/my-reviews";
import { getAllUserReviews } from "@/lib/actions/reviews";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "My Profile",
  description: "Manage your account settings and personal information.",
});

export default async function Page() {
  const reviews = await getAllUserReviews();

  return <MyReviewsPage items={reviews} />;
}
