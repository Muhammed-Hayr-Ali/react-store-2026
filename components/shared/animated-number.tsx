"use client"

import * as React from "react"
import { motion, useSpring, useTransform } from "motion/react"

interface AnimatedNumberProps {
  value: number
  className?: string
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const spring = useSpring(0, {
    stiffness: 75,
    damping: 15,
    duration: 1,
  })

  const display = useTransform(spring, (current) => Math.round(current))

  React.useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className={className}>{display}</motion.span>
}
