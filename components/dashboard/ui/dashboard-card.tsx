// components/account/DashboardCard.tsx

import { type ElementType } from "react"; // ✅ 1. استيراد ElementType

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  buttonText: string;
  Icon: ElementType;
  iconClassName?: string;
}

export function DashboardCard({
  title,
  children,
  Icon,
  iconClassName,
}: DashboardCardProps) {
  return (
    <div className="border bg-linear-to-bl from-muted/50 to-muted/10 rounded-xl hover:bg-muted transition-colors duration-300 ease-in-out h-full">
      <div className="p-6 flex flex-col ">
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`h-6 w-6 ${iconClassName}`} />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <>{children}</>
      </div>
    </div>
  );
}
