"use client"

import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"
// The upstream component imports "motion/react". That is the same library as
// framer-motion under its new name, so it comes from the copy the project
// already ships rather than a second one.
import {
  HTMLMotionProps,
  MotionValue,
  motion,
  useScroll,
  useTransform,
} from "framer-motion"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"

const bentoGridVariants = cva(
  "relative grid gap-4 [&>*:first-child]:origin-top-right [&>*:nth-child(3)]:origin-bottom-right [&>*:nth-child(4)]:origin-top-right",
  {
    variants: {
      variant: {
        default: `
          grid-cols-8 grid-rows-[1fr_0.5fr_0.5fr_1fr]
          [&>*:first-child]:col-span-8 md:[&>*:first-child]:col-span-6 [&>*:first-child]:row-span-3
          [&>*:nth-child(2)]:col-span-2 md:[&>*:nth-child(2)]:row-span-2 [&>*:nth-child(2)]:hidden md:[&>*:nth-child(2)]:block
          [&>*:nth-child(3)]:col-span-2 md:[&>*:nth-child(3)]:row-span-2 [&>*:nth-child(3)]:hidden md:[&>*:nth-child(3)]:block
          [&>*:nth-child(4)]:col-span-4 md:[&>*:nth-child(4)]:col-span-3
          [&>*:nth-child(5)]:col-span-4 md:[&>*:nth-child(5)]:col-span-3
        `,
        threeCells: `
          grid-cols-2 grid-rows-2
          [&>*:first-child]:col-span-2
      `,
        fourCells: `
        grid-cols-3 grid-rows-2
        [&>*:first-child]:col-span-1
        [&>*:nth-child(2)]:col-span-2
        [&>*:nth-child(3)]:col-span-2
      `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>
  /** 0 until the container's top reaches the top of the screen. */
  pinProgress: MotionValue<number>
}
const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined)
function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext)
  if (!context) {
    throw new Error(
      "useContainerScrollContext must be used within a ContainerScroll Component"
    )
  }
  return context
}
const ContainerScroll = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
  })
  // Separate from the progress above (which keeps its original mapping):
  // lets the heading know whether the section has been reached yet, so it
  // stays put in the page until then instead of floating over what's above.
  const { scrollYProgress: pinProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  })
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress, pinProgress }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-screen w-full", className)}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  )
}

const BentoGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof bentoGridVariants>
>(({ variant, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(bentoGridVariants({ variant }), className)}
      {...props}
    />
  )
})
BentoGrid.displayName = "BentoGrid"

const BentoCell = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, style, ...props }, ref) => {
    const { scrollYProgress } = useContainerScrollContext()
    const translate = useTransform(scrollYProgress, [0.1, 0.9], ["-35%", "0%"])
    const scale = useTransform(scrollYProgress, [0, 0.9], [0.5, 1])
    // Reduced motion: cells at their full, final size; no scroll scaling.
    const reduced = useReducedMotion()

    return (
      <motion.div
        ref={ref}
        className={className}
        style={reduced ? style : { translate, scale, ...style }}
        {...props}
      ></motion.div>
    )
  }
)
BentoCell.displayName = "BentoCell"

const ContainerScale = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, style, ...props }, ref) => {
    const { scrollYProgress, pinProgress } = useContainerScrollContext()
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    // Before the section is reached it sits at the centre of the section's
    // first screen (absolute, 50vh down) and scrolls in with the page; once
    // pinned, it is fixed to the screen centre - the same spot - until 0.6.
    const position = useTransform(
      [scrollYProgress, pinProgress],
      ([pos, pin]: number[]) =>
        pin <= 0 || pos >= 0.6 ? "absolute" : "fixed"
    )
    const top = useTransform(pinProgress, (pin) => (pin <= 0 ? "50vh" : "50%"))
    // Reduced motion: the heading simply sits in the section's first screen.
    const reduced = useReducedMotion()
    return (
      <motion.div
        ref={ref}
        className={cn("left-1/2 top-1/2  size-fit", className)}
        style={
          reduced
            ? {
                translate: "-50% -50%",
                position: "absolute",
                top: "50vh",
                ...style,
              }
            : {
                translate: "-50% -50%",
                scale,
                position,
                top,
                opacity,
                ...style,
              }
        }
        {...props}
      />
    )
  }
)
ContainerScale.displayName = "ContainerScale"
export { ContainerScroll, BentoGrid, BentoCell, ContainerScale }
