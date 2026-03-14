// components/account/profile/ProfileCard.tsx
import { useUserDisplay } from "@/hooks/useUserDisplay";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export function ProfileCard({user}:{user: User}) {
  const { fullName } = useUserDisplay(user);
  return (
    <div className=" bg-muted/50 rounded-xl p-6">
      <h1 className="text-2xl font-bold">Welcome back, {fullName}!</h1>
      <p className="text-muted-foreground mt-1">
        Here&#39;s a quick overview of your account.
      </p>
      <div className="mt-auto pt-4 block md:hidden">
        <Button asChild variant="outline" className="w-full">
          <Link href="/account/profile">
            Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
