import { cn } from "@/lib/utils";
import { motion } from "motion/react";


interface MenuButtonProps {
  className?: string;
  isOpen: boolean;
  onClick: () => void;

}

export default function MenuButton({
  className,
  onClick,
  isOpen,
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn("relative flex p-2 flex-col items-center justify-center w-10 h-10 focus:outline-none", className)}
      aria-label={`${isOpen ? "clse menu" : "open menu"}`}
    >
      {/* الخط العلوي */}
      <motion.div
        className="w-6 h-0.5 bg-foreground"
        variants={{
          closed: { rotate: 0, translateY: 0 },
          open: { rotate: 45, translateY: 4 },
        }}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* الخط السفلي */}
      <motion.div
        className="w-6 h-0.5 bg-foreground mt-1.5"
        variants={{
          closed: { rotate: 0, translateY: 0 },
          open: { rotate: -45, translateY: -4 },
        }}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
      />
    </button>
  );
}
