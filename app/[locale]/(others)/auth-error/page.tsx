import ErrorPage from "@/components/features/others/error-page";
import { createMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "Reset Password",
    description: "Reset Password to your account",
  });
}

type Props = {
  children: React.ReactNode;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const error = (await searchParams).error;

  let errorMessage = "Unknown Error";
  if (error === "access_denied") {
    errorMessage = "Access Denied to the API";
  }

  return <ErrorPage errorMessage={errorMessage} />;
}
