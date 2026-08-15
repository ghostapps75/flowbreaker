import React from 'react'
import { motion } from 'framer-motion'

export default function AudioWaveform({ active = false, color = 'bg-rose-500', barCount = 5 }) {
  const bars = Array.from({ length: barCount }, (_, i) => i)

  return (
    <div className="flex items-center justify-center gap-1 h-6 px-2">
      {bars.map((i) => (
        <motion.span
          key={i}
          className={`w-1 rounded-full ${color}`}
          animate={
            active
              ? {
                  height: ['6px', '22px', '10px', '26px', '6px'],
                }
              : { height: '4px' }
          }
          transition={
            active
              ? {
                  repeat: Infinity,
                  duration: 0.65 + (i % 3) * 0.15,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  )
}
