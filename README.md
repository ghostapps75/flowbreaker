# FlowBreaker (Bulgarian Edition) 👻

> A mobile-first, iOS-style Bulgarian language learning app designed for receptive bilingual users to practice sentence construction, word recognition, and spoken recall.

Built with **React 19 + Vite + Tailwind CSS + Zustand + Framer Motion + Lucide Icons**.

---

## ✨ Features

- **Deconstruct Mode (Sentence Construction)**:
  - **Click-to-Speak**: Tap any Cyrillic word chip in the word bank to hear its audio pronunciation out loud before placing it.
  - **Drag-to-Assemble**: Drag word chips up into the dropzone to construct the target phrase in correct order.
  - **Click-to-Remove**: Tap placed words in the dropzone to return them to the word bank.
  - **Confetti & Replay**: Automatic celebration with full phrase audio replay and Latin transliteration.

- **Speak Mode (Active Recall & STT Validation)**:
  - **Bulgarian Speech-to-Text (`bg-BG`)**: Real-time microphone recording and waveform animations.
  - **Pronunciation Accuracy Scoring**: Fuzzy matching and Levenshtein similarity algorithm evaluating spoken accuracy (0–100%).
  - **Word-Level Highlighting**: Color-coded feedback highlighting matched vs. missed words.
  - **Reveal Fallback**: Instant answer reveal with native voice synthesis for silent practice.

- **Dual-Engine Voice Synthesis**:
  - **ElevenLabs HD Multilingual TTS (`eleven_multilingual_v2`)**: Customizable voice profiles and learning speeds (0.6x to 1.2x).
  - **Smart Native Browser Voice Fallback**: Prioritizes Google/Microsoft neural Bulgarian voices when no API key is set.

- **Categorized Decks**:
  - The Basics
  - Dining & Food
  - Travel & Logistics
  - Chit-Chat & Social
  - Shopping & Markets

- **iOS "ghostapps" Aesthetic**:
  - Vibrant animated gradient mesh (`bg-animated`).
  - Frosted glassmorphism and soft drop shadows.
  - Safe-area padding and `100dvh` mobile ergonomics.
  - Tactile haptic feedback simulation.

---

## 🛠️ Getting Started

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 📄 License
MIT © ghostapps
