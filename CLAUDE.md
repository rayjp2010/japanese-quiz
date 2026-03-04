# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + build for production
npm run build-only   # Build without type-checking
npm run type-check   # Run vue-tsc type checking
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting for src/
npm run preview      # Preview production build
```

## Architecture

This is a Vue 3 + TypeScript Japanese language learning application built with Vite. It displays a YouTube video with synchronized transcript and interactive quiz questions.

### Key Technologies
- Vue 3 with Composition API (`<script setup>`)
- Vue Router for routing
- Tailwind CSS for styling
- Path alias: `@` maps to `src/`

### Source Structure

**Views & Components:**
- `src/views/HomeView.vue` - Main page orchestrating video, transcript, and quiz
- `src/components/VideoPlayer.vue` - YouTube video embed with playback controls
- `src/components/TranscriptViewer.vue` - Synchronized transcript display
- `src/components/QuizSection.vue` - Quiz UI with progress tracking, answer checking, and navigation

**Composables:**
- `useTheme` - Dark/light mode toggle (persisted to localStorage)
- `useProgress` - Quiz progress tracking with localStorage persistence
- `useParticles` - Visual particle effects and notifications for quiz feedback

**Data Flow:**
- Static data files in `public/data/`: `video.json`, `transcript.txt`, `questions.json`
- Transcript format: `[0m0s0ms - 0m5s500ms] Japanese text` parsed by `utils/transcriptParser.ts`
- Video time updates flow from VideoPlayer -> HomeView -> TranscriptViewer for sync

### Types

Core interfaces in `src/types/index.ts`:
- `VideoData` - YouTube video URL and title
- `TranscriptLine` - Timed transcript entries
- `Question` - Quiz questions with choices, answer index, difficulty, explanation
- `QuestionProgress` / `ProgressData` - Quiz state tracking
