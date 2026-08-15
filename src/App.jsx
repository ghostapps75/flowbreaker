import React from 'react'
import Header from './components/Header'
import DeckSelectView from './components/DeckSelectView'
import LessonView from './components/LessonView'
import SettingsModal from './components/SettingsModal'
import useStore, { VIEWS } from './store/useStore'

export default function App() {
  const { currentView } = useStore()

  return (
    <div className="text-gray-900 h-[100dvh] flex flex-col overflow-hidden bg-animated relative select-none">
      {/* Top iOS Header */}
      <Header />

      {/* Dynamic Main View */}
      {currentView === VIEWS.DECK_SELECT && <DeckSelectView />}
      {currentView === VIEWS.LESSON && <LessonView />}

      {/* Global Settings & Voice Modal */}
      <SettingsModal />
    </div>
  )
}
