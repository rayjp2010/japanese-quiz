# Japanese Learning Quiz App

A Vue.js application for learning Japanese through interactive YouTube videos, transcripts, and quizzes.

## Features

- **YouTube Video Player**: Embedded video with synchronized transcript
- **Interactive Transcript**: Click any line to jump to that timestamp
- **Comprehensive Quiz System**: All questions displayed with progress tracking
- **Progress Tracking**: localStorage-based progress persistence
- **Mobile Responsive**: Optimized layout for mobile devices
- **Real-time Feedback**: Immediate feedback with explanations

## Technology Stack

- Vue.js 3 (Composition API)
- TypeScript
- Tailwind CSS
- Vite

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Data Structure

The app loads data from three JSON/text files in the `data/` directory:

- `video.json`: YouTube video metadata
- `transcript.txt`: Timestamped transcript
- `questions.json`: Quiz questions with explanations

## Features Implemented

✅ Video embedding and playback control  
✅ Transcript parsing and highlighting  
✅ Click-to-seek functionality  
✅ All questions displayed on one page  
✅ Progress tracking with localStorage  
✅ Mobile-responsive design  
✅ Smooth animations and transitions  
✅ Question retry functionality  
✅ Jump to unanswered questions