import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, Sliders, RotateCcw } from 'lucide-react'
import useStore from '../store/useStore'
import { ELEVENLABS_VOICES } from '../services/elevenLabsService'
import { triggerHaptic } from '../utils/haptics'

export default function SettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    selectedVoiceId,
    setSelectedVoiceId,
    ttsSpeed,
    setTtsSpeed,
    ttsStability,
    setTtsStability,
    ttsSimilarityBoost,
    setTtsSimilarityBoost,
    showPhonetics,
    toggleShowPhonetics,
    autoPlayTTS,
    toggleAutoPlayTTS,
  } = useStore()

  if (!isSettingsOpen) return null

  const handleClose = () => {
    triggerHaptic('light')
    closeSettings()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2.2rem] soft-shadow border border-white/80 p-6 flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 leading-tight">Settings & Voice</h3>
                <p className="text-xs text-gray-500 font-medium">Audio engines & display</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close settings"
              className="p-2 text-gray-400 hover:text-gray-700 button-pop rounded-full bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2 block flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                ElevenLabs Voice Profile
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ELEVENLABS_VOICES.map((v) => {
                  const isSelected = selectedVoiceId === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVoiceId(v.id)
                        triggerHaptic('light')
                      }}
                      className={`p-3 rounded-2xl text-left border text-xs font-bold button-pop transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 text-purple-950 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
                      }`}
                    >
                      <div className="font-extrabold flex items-center justify-between">
                        <span>{v.name}</span>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-normal truncate">{v.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Speech Rate Slider */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-800">Learning Speech Speed</label>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                  {ttsSpeed.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.60"
                max="1.20"
                step="0.05"
                value={ttsSpeed}
                onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                <span>0.6x (Slow)</span>
                <span>0.85x (Optimal)</span>
                <span>1.2x (Native)</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-gray-800">Show Latin Transliterations</div>
                  <div className="text-[10px] text-gray-500 font-medium">Pronunciation guide under Bulgarian text</div>
                </div>
                <input
                  type="checkbox"
                  checked={showPhonetics}
                  onChange={() => {
                    toggleShowPhonetics()
                    triggerHaptic('light')
                  }}
                  className="w-5 h-5 rounded-md accent-purple-600"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-gray-800">Auto-Play Audio on Success</div>
                  <div className="text-[10px] text-gray-500 font-medium">Listen to correct phrase upon completing</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPlayTTS}
                  onChange={() => {
                    toggleAutoPlayTTS()
                    triggerHaptic('light')
                  }}
                  className="w-5 h-5 rounded-md accent-purple-600"
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-black text-sm rounded-2xl button-pop shadow-md text-center"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
