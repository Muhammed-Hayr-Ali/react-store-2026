"use client";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
}

export function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-primary/10 text-primary p-2 rounded-lg">{icon}</div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
