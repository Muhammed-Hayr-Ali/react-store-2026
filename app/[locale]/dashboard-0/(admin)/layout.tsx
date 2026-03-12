// app\[locale]\dashboard\(admin)\layout.tsx

import { RolesGuard } from "@/lib/guards/roles-guard";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RolesGuard roleNames="admin" />
      {children}
    </>
  );
}




