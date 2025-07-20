import { ref, computed } from 'vue'
import type { ProgressData, QuestionProgress } from '@/types'

const STORAGE_KEY = 'japanese-quiz-progress'

const progressData = ref<ProgressData>({
  videoWatched: false,
  quizProgress: {}
})

export function useProgress() {
  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        progressData.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const saveProgress = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData.value))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const markVideoWatched = () => {
    progressData.value.videoWatched = true
    saveProgress()
  }

  const updateQuestionProgress = (questionIndex: number, correct: boolean, selectedAnswer: number) => {
    const questionId = questionIndex.toString()
    const current = progressData.value.quizProgress[questionId] || { attempts: 0, correct: false, lastAnswer: -1 }
    
    progressData.value.quizProgress[questionId] = {
      attempts: current.attempts + 1,
      correct,
      lastAnswer: selectedAnswer
    }
    
    saveProgress()
  }

  const getQuestionProgress = (questionIndex: number): QuestionProgress | null => {
    const questionId = questionIndex.toString()
    return progressData.value.quizProgress[questionId] || null
  }

  const totalQuestions = ref(0)
  const answeredQuestions = computed(() => {
    return Object.keys(progressData.value.quizProgress).length
  })

  const correctAnswers = computed(() => {
    return Object.values(progressData.value.quizProgress).filter(p => p.correct).length
  })

  const completionPercentage = computed(() => {
    return totalQuestions.value > 0 ? Math.round((answeredQuestions.value / totalQuestions.value) * 100) : 0
  })

  // Initialize progress on first use
  loadProgress()

  return {
    progressData,
    markVideoWatched,
    updateQuestionProgress,
    getQuestionProgress,
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    completionPercentage
  }
}