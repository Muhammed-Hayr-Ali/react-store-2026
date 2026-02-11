import { GuestGuard } from "@/lib/guards/guest-guard";
import { MfaGuard } from "@/lib/guards/mfa-guard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuestGuard />
      <MfaGuard />
       <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div className="w-full max-w-lg">{children}</div>
  </div>
    </>
  );
}
