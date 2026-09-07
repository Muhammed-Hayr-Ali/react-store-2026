import { cn } from "@/lib/utils"
import { motion } from "motion/react"

interface MenuButtonProps {
  className?: string
  isOpen: boolean
  onClick: () => void
}

export default function MenuButton({
  className,
  onClick,
  isOpen,
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center focus:outline-none",
        className
      )}
      aria-label={`${isOpen ? "clse menu" : "open menu"}`}
    >
      {/* الخط العلوي */}
      <motion.div
        className="h-0.5 w-5 bg-foreground"
        variants={{
          closed: { rotate: 0, translateY: 0 },
          open: { rotate: 45, translateY: 4 },
        }}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* الخط السفلي */}
      <motion.div
        className="mt-1.5 h-0.5 w-5 bg-foreground"
        variants={{
          closed: { rotate: 0, translateY: 0 },
          open: { rotate: -45, translateY: -4 },
        }}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
      />
    </button>
  )
}
