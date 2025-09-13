<template>
  <div class="quiz-section-container">
    <!-- Quiz Navigation Header -->
    <div class="quiz-navigation-header">
      <div class="question-counter">
        Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
      </div>
      <div class="quiz-progress-mini">
        <div class="progress-dots">
          <div
            v-for="(_, index) in questions"
            :key="index"
            class="progress-dot"
            :class="{
              'completed': questionStates[index]?.checked && questionStates[index]?.correct,
              'attempted': questionStates[index]?.checked && !questionStates[index]?.correct,
              'current': index === currentQuestionIndex
            }"
          ></div>
        </div>
        <div class="progress-text">
          {{ answeredCount }}/{{ questions.length }} completed • {{ correctCount }} correct
        </div>
      </div>
    </div>

    <!-- Single Question Display -->
    <div class="current-question-container" v-if="currentQuestion">
      <div class="question-card">
        <div class="question-header">
          <div class="flex justify-between items-start mb-2">
            <span 
              class="difficulty-badge"
              :class="getDifficultyClass(currentQuestion.difficulty)"
            >
              {{ currentQuestion.difficulty }}
            </span>
          </div>
          <div class="question-text">
            <span>{{ currentQuestion.question }}</span>
          </div>
        </div>

        <div class="answers-grid">
          <div
            v-for="(choice, choiceIndex) in currentQuestion.choices"
            :key="choiceIndex"
            @click="selectChoice(choiceIndex)"
            class="answer-option"
            :class="getChoiceClass(choiceIndex)"
            :data-option="getOptionLetter(choiceIndex)"
          >
            <span class="option-label" :class="getChoiceIndicatorClass(choiceIndex)">
              {{ getOptionLetter(choiceIndex) }}
            </span>
            <span class="option-text japanese-text">{{ choice }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button
            @click="resetCurrentQuestion"
            class="action-btn"
            :disabled="!isCurrentQuestionAnswered"
          >
            🔄 RESET
          </button>
          <button
            v-if="!isCurrentQuestionAnswered"
            @click="checkAnswer"
            :disabled="!hasSelectedAnswer"
            class="action-btn primary"
          >
            ✓ CHECK ANSWER
          </button>
          <div v-else class="navigation-buttons">
            <button
              @click="previousQuestion"
              class="action-btn"
              :disabled="currentQuestionIndex === 0"
            >
              ← PREVIOUS
            </button>
            <button
              @click="nextQuestion"
              class="action-btn primary"
              v-if="currentQuestionIndex < questions.length - 1"
            >
              NEXT →
            </button>
            <button
              v-else
              @click="completeQuiz"
              class="action-btn success"
            >
              🏆 FINISH QUIZ
            </button>
          </div>
        </div>

        <div v-if="isCurrentQuestionAnswered" class="feedback-section fade-in">
          <div 
            class="result-indicator"
            :class="currentQuestionState?.correct ? 'correct' : 'incorrect'"
          >
            <span class="result-icon">{{ currentQuestionState?.correct ? '✅' : '❌' }}</span>
            <span class="result-text">
              {{ currentQuestionState?.correct ? 'Correct! Great job!' : 'Incorrect. Try again next time!' }}
            </span>
          </div>
          
          <div class="explanation">
            <h5 class="explanation-title">Explanation:</h5>
            <p class="explanation-text">{{ currentQuestion.explanation }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Completion Summary -->
    <div v-if="isQuizCompleted" class="quiz-completion">
      <h3 class="completion-title">🎉 Quiz Complete!</h3>
      <div class="completion-stats">
        <div class="stat-card">
          <div class="stat-value">{{ correctCount }}</div>
          <div class="stat-label">Correct</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ Math.round((correctCount / questions.length) * 100) }}%</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ questions.length }}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      <button @click="restartQuiz" class="action-btn primary">
        🔄 Restart Quiz
      </button>
    </div>

    <!-- Quick Navigation -->
    <div class="quick-navigation">
      <button
        @click="jumpToUnanswered"
        class="action-btn"
        :disabled="!hasUnanswered"
      >
        Jump to Next Unanswered
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Question } from '@/types'
import { useProgress } from '@/composables/useProgress'
import { useParticles } from '@/composables/useParticles'

interface Props {
  questions: Question[]
}

const props = defineProps<Props>()

const { updateQuestionProgress, getQuestionProgress } = useProgress()
const { createSuccessParticles, showNotification } = useParticles()

const selectedAnswers = ref<Record<number, number>>({})
const questionStates = ref<Record<number, { checked: boolean, correct: boolean }>>({})
const currentQuestionIndex = ref(0)
const isQuizCompleted = ref(false)

const currentQuestion = computed(() => {
  return props.questions[currentQuestionIndex.value] || null
})

const currentQuestionState = computed(() => {
  return questionStates.value[currentQuestionIndex.value] || null
})

const isCurrentQuestionAnswered = computed(() => {
  return currentQuestionState.value?.checked || false
})

const hasSelectedAnswer = computed(() => {
  return selectedAnswers.value[currentQuestionIndex.value] !== undefined
})

const answeredCount = computed(() => {
  return Object.keys(questionStates.value).filter(key => questionStates.value[parseInt(key)]?.checked).length
})

const correctCount = computed(() => {
  return Object.values(questionStates.value).filter(state => state.correct).length
})

const hasUnanswered = computed(() => {
  return answeredCount.value < props.questions.length
})

const getOptionLetter = (index: number) => {
  return String.fromCharCode(65 + index) // A, B, C, D
}

const selectChoice = (choiceIndex: number) => {
  if (!isCurrentQuestionAnswered.value) {
    selectedAnswers.value[currentQuestionIndex.value] = choiceIndex
  }
}

const checkAnswer = () => {
  const selectedChoice = selectedAnswers.value[currentQuestionIndex.value]
  if (selectedChoice === undefined || !currentQuestion.value) return

  const isCorrect = selectedChoice === currentQuestion.value.answer

  questionStates.value[currentQuestionIndex.value] = {
    checked: true,
    correct: isCorrect
  }

  updateQuestionProgress(currentQuestionIndex.value, isCorrect, selectedChoice)
  
  if (isCorrect) {
    createSuccessParticles()
    showNotification('Correct! Great job! 🎉', 'success')
  } else {
    showNotification('Incorrect. The correct answer is highlighted.', 'error')
  }
}

const resetCurrentQuestion = () => {
  if (!isCurrentQuestionAnswered.value) return
  
  questionStates.value[currentQuestionIndex.value] = { checked: false, correct: false }
  delete selectedAnswers.value[currentQuestionIndex.value]
  showNotification('🔄 Question reset! Select your answer again.', 'info')
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.questions.length - 1) {
    currentQuestionIndex.value++
    showNotification(`Question ${currentQuestionIndex.value + 1}`, 'info')
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    showNotification(`Question ${currentQuestionIndex.value + 1}`, 'info')
  }
}

const jumpToUnanswered = () => {
  for (let i = 0; i < props.questions.length; i++) {
    if (!questionStates.value[i]?.checked) {
      currentQuestionIndex.value = i
      showNotification(`Jumped to question ${i + 1}`, 'info')
      return
    }
  }
}

const completeQuiz = () => {
  isQuizCompleted.value = true
  const finalScore = Math.round((correctCount.value / props.questions.length) * 100)
  
  let message = ''
  if (finalScore >= 90) {
    message = '🏆 EXCELLENT! You\'re a Japanese master!'
  } else if (finalScore >= 70) {
    message = '🎉 GREAT JOB! Keep up the good work!'
  } else if (finalScore >= 50) {
    message = '👍 GOOD EFFORT! Practice makes perfect!'
  } else {
    message = '💪 KEEP TRYING! You\'ll get better!'
  }
  
  showNotification(message, 'success')
  createSuccessParticles()
}

const restartQuiz = () => {
  selectedAnswers.value = {}
  questionStates.value = {}
  currentQuestionIndex.value = 0
  isQuizCompleted.value = false
  showNotification('Quiz restarted! Good luck! 🍀', 'info')
}

const getChoiceClass = (choiceIndex: number) => {
  const selected = selectedAnswers.value[currentQuestionIndex.value] === choiceIndex
  const state = currentQuestionState.value
  const isCorrectAnswer = currentQuestion.value && choiceIndex === currentQuestion.value.answer

  if (!state?.checked) {
    return selected ? 'selected' : ''
  }

  if (selected && state.correct) {
    return 'correct'
  } else if (selected && !state.correct) {
    return 'incorrect'
  } else if (isCorrectAnswer) {
    return 'correct'
  }

  return ''
}

const getChoiceIndicatorClass = (choiceIndex: number) => {
  const selected = selectedAnswers.value[currentQuestionIndex.value] === choiceIndex
  const state = currentQuestionState.value
  const isCorrectAnswer = currentQuestion.value && choiceIndex === currentQuestion.value.answer

  if (!state?.checked) {
    return selected ? 'selected' : ''
  }

  if (selected && state.correct) {
    return 'correct'
  } else if (selected && !state.correct) {
    return 'incorrect'
  } else if (isCorrectAnswer) {
    return 'correct'
  }

  return ''
}

const getDifficultyClass = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'easy'
    case 'medium':
      return 'medium'
    case 'hard':
      return 'hard'
    default:
      return 'medium'
  }
}

const loadPreviousProgress = () => {
  props.questions.forEach((_, index) => {
    const progress = getQuestionProgress(index)
    if (progress) {
      selectedAnswers.value[index] = progress.lastAnswer
      questionStates.value[index] = {
        checked: true,
        correct: progress.correct
      }
    }
  })
}

onMounted(() => {
  loadPreviousProgress()
})
</script>

<style scoped>
.quiz-section-container {
  margin-top: 2rem;
}

/* Quiz Navigation Header */
.quiz-navigation-header {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-soft);
}

.question-counter {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 1rem;
}

.quiz-progress-mini {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-dots {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--muted);
  border: 2px solid var(--border);
  transition: all var(--transition-fast);
}

.progress-dot.completed {
  background: var(--success);
  border-color: var(--success);
}

.progress-dot.attempted {
  background: var(--destructive);
  border-color: var(--destructive);
}

.progress-dot.current {
  background: var(--primary);
  border-color: var(--primary);
  transform: scale(1.2);
}

.progress-text {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  font-weight: 500;
}

/* Current Question Container */
.current-question-container {
  margin-bottom: 2rem;
}

/* Question Card */
.question-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-normal);
}

.question-header {
  margin-bottom: 2rem;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-badge.easy {
  background: color-mix(in srgb, var(--success) 20%, var(--card));
  color: var(--success);
}

.difficulty-badge.medium {
  background: color-mix(in srgb, var(--warning) 20%, var(--card));
  color: var(--warning);
}

.difficulty-badge.hard {
  background: color-mix(in srgb, var(--destructive) 20%, var(--card));
  color: var(--destructive);
}

.question-text {
  font-size: 1.125rem;
  margin-top: 1rem;
  padding: 1.5rem;
  background: var(--muted);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  font-weight: 500;
}

/* Answers Grid */
.answers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.answer-option {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.answer-option:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-glow);
}

.answer-option.selected {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
}

.answer-option.correct {
  background: var(--success) !important;
  border-color: var(--success) !important;
  color: white !important;
}

.answer-option.incorrect {
  background: var(--destructive) !important;
  border-color: var(--destructive) !important;
  color: white !important;
}

.option-label {
  background: var(--primary);
  color: var(--primary-foreground);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.answer-option.selected .option-label {
  background: var(--primary-foreground);
  color: var(--primary);
}

.answer-option.correct .option-label {
  background: white !important;
  color: var(--success) !important;
}

.answer-option.incorrect .option-label {
  background: white !important;
  color: var(--destructive) !important;
}

.option-text {
  flex: 1;
  font-size: 1rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.navigation-buttons {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: var(--muted);
  color: var(--foreground);
  border: 1px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover:not(:disabled) {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.action-btn.primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
}

.action-btn.success {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.action-btn.success:hover:not(:disabled) {
  background: color-mix(in srgb, var(--success) 80%, black);
  border-color: color-mix(in srgb, var(--success) 80%, black);
}

.action-btn:disabled {
  background: var(--muted);
  color: var(--muted-foreground);
  border-color: var(--border);
  cursor: not-allowed;
  opacity: 0.5;
}

/* Feedback Section */
.feedback-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.result-indicator {
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.result-indicator.correct {
  background: color-mix(in srgb, var(--success) 10%, var(--card));
  border: 1px solid var(--success);
  color: var(--success);
}

.result-indicator.incorrect {
  background: color-mix(in srgb, var(--destructive) 10%, var(--card));
  border: 1px solid var(--destructive);
  color: var(--destructive);
}

.result-icon {
  font-size: 1.25rem;
}

.result-text {
  font-weight: 600;
}

.explanation {
  background: color-mix(in srgb, var(--primary) 5%, var(--card));
  border: 1px solid var(--primary);
  padding: 1rem;
  border-radius: var(--radius);
}

.explanation-title {
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.explanation-text {
  color: var(--foreground);
  line-height: 1.6;
}

/* Quiz Completion */
.quiz-completion {
  text-align: center;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 3rem 2rem;
  box-shadow: var(--shadow-soft);
  margin-bottom: 2rem;
}

.completion-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 2rem;
}

.completion-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  min-width: 100px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Quick Navigation */
.quick-navigation {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .answers-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .navigation-buttons {
    flex-direction: column;
    width: 100%;
  }

  .question-card {
    padding: 1rem;
  }

  .answer-option {
    padding: 1rem;
  }

  .completion-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .quiz-navigation-header {
    padding: 1rem;
  }

  .progress-dots {
    justify-content: center;
  }
}
</style>