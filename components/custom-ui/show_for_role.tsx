// components/auth/ShowForRole.tsx
"use client";

interface Props {
  userRoles:  string[];
  requiredRoles: string;
  children: React.ReactNode;
}


export function ShowForRole({ userRoles, requiredRoles, children }: Props) {
  const rolesToCheck = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  const hasPermission = rolesToCheck.some(
    (role) => userRoles?.includes(role) ?? false,
  );

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}
