import React from 'react'
import { CheckCircle, AlertCircle, Sparkles, Award } from 'lucide-react'

export default function AccuracyBadge({ score }) {
  if (score === null || score === undefined) return null

  let config = {
    bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
    icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
    label: 'Flawless Pronunciation!',
  }

  if (score >= 90) {
    config = {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
      icon: <Award className="w-4 h-4 text-emerald-600" />,
      label: 'Native-like Pronunciation! 🎯',
    }
  } else if (score >= 70) {
    config = {
      bg: 'bg-teal-500/15 border-teal-500/30 text-teal-800',
      icon: <CheckCircle className="w-4 h-4 text-teal-600" />,
      label: 'Great Effort! Very clear.',
    }
  } else if (score >= 45) {
    config = {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-800',
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
      label: 'Close! Give it another try.',
    }
  } else {
    config = {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-800',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
      label: 'Listen to the audio and retry.',
    }
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-black shadow-xs ${config.bg}`}
    >
      {config.icon}
      <span>{score}% Match</span>
      <span className="font-medium opacity-80">· {config.label}</span>
    </div>
  )
}
