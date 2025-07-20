export interface VideoData {
  url: string
  title: string
}

export interface TranscriptLine {
  startTime: number
  endTime: number
  text: string
}

export interface Question {
  question: string
  choices: string[]
  answer: number
  difficulty: string
  explanation: string
}

export interface QuestionProgress {
  attempts: number
  correct: boolean
  lastAnswer: number
}

export interface ProgressData {
  videoWatched: boolean
  quizProgress: Record<string, QuestionProgress>
}