"use client"

import { ElegantShape } from "@/components/ui/elegant-shape"

export function GeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-voltBlue-500/[0.05] via-transparent to-voltBlue-200/[0.05] dark:from-voltBlue-500/[0.05] dark:via-transparent dark:to-voltBlue-300/[0.05] blur-3xl" />

      <ElegantShape
        delay={0.3}
        width={600}
        height={140}
        rotate={12}
        gradient="from-voltBlue-500/[0.15]"
        className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
      />

      <ElegantShape
        delay={0.5}
        width={500}
        height={120}
        rotate={-15}
        gradient="from-voltBlue-300/[0.15]"
        className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
      />

      <ElegantShape
        delay={0.4}
        width={300}
        height={80}
        rotate={-8}
        gradient="from-voltBlue-400/[0.15]"
        className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
      />

      <ElegantShape
        delay={0.6}
        width={200}
        height={60}
        rotate={20}
        gradient="from-voltBlue-200/[0.15]"
        className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
      />

      <ElegantShape
        delay={0.7}
        width={150}
        height={40}
        rotate={-25}
        gradient="from-voltBlue-600/[0.15]"
        className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none" />
    </div>
  )
}
