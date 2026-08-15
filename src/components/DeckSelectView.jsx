import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Flame, Trophy, CheckCircle, Sparkles } from 'lucide-react'
import useStore, { VIEWS } from '../store/useStore'
import { DECKS } from '../data/decks'
import { triggerHaptic } from '../utils/haptics'

export default function DeckSelectView() {
  const { selectDeck, completedPhrases, stats } = useStore()

  const handleDeckClick = (deckId) => {
    triggerHaptic('medium')
    selectDeck(deckId)
  }

  const deckList = Object.values(DECKS)

  return (
    <main className="flex-1 px-4 pt-6 pb-safe overflow-y-auto w-full max-w-lg mx-auto flex flex-col gap-5">
      {/* Top Banner Stats */}
      <div className="glass rounded-3xl p-5 soft-shadow border border-white/60 flex items-center justify-between text-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-600">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Day Streak</div>
            <div className="text-xl font-black text-gray-900">{stats.streakDays || 1} Days 🔥</div>
          </div>
        </div>

        <div className="h-10 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-600">
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phrases Built</div>
            <div className="text-xl font-black text-gray-900">{stats.totalConstructed || 0}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-white text-2xl font-black drop-shadow-md flex items-center gap-2">
          <span>Choose a Deck</span>
          <Sparkles className="w-5 h-5 text-amber-300" />
        </h2>
        <span className="text-white/80 text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
          {deckList.length} Categories
        </span>
      </div>

      {/* Decks Grid */}
      <div className="flex flex-col gap-3.5 pb-6">
        {deckList.map((deck, idx) => {
          const completedCount = (completedPhrases[deck.id] || []).length
          const totalCount = deck.phrases.length
          const isFinished = completedCount >= totalCount && totalCount > 0
          const progressPct = Math.round((completedCount / totalCount) * 100)

          return (
            <motion.button
              key={deck.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              onClick={() => handleDeckClick(deck.id)}
              className="w-full bg-white/95 rounded-3xl p-5 soft-shadow button-pop text-left relative overflow-hidden group border-2 border-white/60 hover:border-purple-300 transition-all flex flex-col gap-3"
            >
              {/* Subtle background gradient accent */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${deck.color} opacity-10 group-hover:opacity-20 transition-opacity`}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl filter drop-shadow-xs">{deck.icon}</span>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-snug">{deck.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">{deck.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isFinished && (
                    <span className="p-1.5 rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                  <div className="bg-gray-100 group-hover:bg-purple-100 rounded-full p-2.5 text-gray-400 group-hover:text-purple-600 transition-colors">
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative z-10 flex items-center gap-3 pt-1 border-t border-gray-100">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${deck.color} rounded-full transition-all duration-500`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-black text-gray-400 min-w-[4rem] text-right">
                  {completedCount}/{totalCount} ({progressPct}%)
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </main>
  )
}
