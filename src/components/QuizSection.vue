<template>
  <div class="quiz-section bg-white rounded-lg shadow-lg p-6">
    <div class="quiz-header mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-800">Quiz</h3>
        <div class="flex gap-2">
          <button
            @click="jumpToUnanswered"
            class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
            :disabled="!hasUnanswered"
          >
            Jump to Unanswered
          </button>
        </div>
      </div>
      
      <div class="progress-bar bg-gray-200 rounded-full h-2 mb-4">
        <div 
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      
      <div class="text-sm text-gray-600">
        Progress: {{ answeredCount }}/{{ questions.length }} questions completed
        ({{ correctCount }} correct)
      </div>
    </div>

    <div class="questions-container space-y-8 max-h-96 overflow-y-auto">
      <div
        v-for="(question, index) in questions"
        :key="index"
        :id="`question-${index}`"
        class="question-card border rounded-lg p-4 transition-all duration-200"
        :class="getQuestionCardClass(index)"
      >
        <div class="question-header mb-4">
          <div class="flex justify-between items-start mb-2">
            <h4 class="text-lg font-semibold text-gray-800">
              Question {{ index + 1 }} of {{ questions.length }}
            </h4>
            <span 
              class="difficulty-badge px-2 py-1 rounded text-xs font-medium"
              :class="getDifficultyClass(question.difficulty)"
            >
              {{ question.difficulty }}
            </span>
          </div>
          <p class="text-gray-700 mb-4">{{ question.question }}</p>
        </div>

        <div class="choices-container mb-4">
          <div
            v-for="(choice, choiceIndex) in question.choices"
            :key="choiceIndex"
            @click="selectChoice(index, choiceIndex)"
            class="choice-option p-3 mb-2 border rounded cursor-pointer transition-all duration-200"
            :class="getChoiceClass(index, choiceIndex)"
          >
            <div class="flex items-center">
              <div 
                class="choice-indicator w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center"
                :class="getChoiceIndicatorClass(index, choiceIndex)"
              >
                <div v-if="selectedAnswers[index] === choiceIndex" class="w-2 h-2 bg-current rounded-full"></div>
              </div>
              <span>{{ choice }}</span>
            </div>
          </div>
        </div>

        <div class="question-actions mb-4">
          <button
            @click="checkAnswer(index)"
            :disabled="selectedAnswers[index] === undefined || questionStates[index]?.checked"
            class="check-btn bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors mr-2"
          >
            Check Answer
          </button>
          
          <button
            v-if="questionStates[index]?.checked && !questionStates[index]?.correct"
            @click="retryQuestion(index)"
            class="retry-btn bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
          >
            Retry
          </button>
        </div>

        <div v-if="questionStates[index]?.checked" class="feedback-section fade-in">
          <div 
            class="result-indicator p-3 rounded mb-3 flex items-center"
            :class="questionStates[index]?.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            <span class="text-xl mr-2">{{ questionStates[index]?.correct ? '✅' : '❌' }}</span>
            <span class="font-medium">
              {{ questionStates[index]?.correct ? 'Correct!' : 'Incorrect' }}
            </span>
          </div>
          
          <div class="explanation bg-blue-50 p-3 rounded">
            <h5 class="font-medium text-blue-800 mb-1">Explanation:</h5>
            <p class="text-blue-700">{{ question.explanation }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Question } from '@/types'
import { useProgress } from '@/composables/useProgress'

interface Props {
  questions: Question[]
}

const props = defineProps<Props>()

const { updateQuestionProgress, getQuestionProgress, totalQuestions } = useProgress()

const selectedAnswers = ref<Record<number, number>>({})
const questionStates = ref<Record<number, { checked: boolean, correct: boolean }>>({})

const answeredCount = computed(() => {
  return Object.keys(questionStates.value).filter(key => questionStates.value[parseInt(key)]?.checked).length
})

const correctCount = computed(() => {
  return Object.values(questionStates.value).filter(state => state.correct).length
})

const progressPercentage = computed(() => {
  return props.questions.length > 0 ? Math.round((answeredCount.value / props.questions.length) * 100) : 0
})

const hasUnanswered = computed(() => {
  return answeredCount.value < props.questions.length
})

const selectChoice = (questionIndex: number, choiceIndex: number) => {
  if (!questionStates.value[questionIndex]?.checked) {
    selectedAnswers.value[questionIndex] = choiceIndex
  }
}

const checkAnswer = (questionIndex: number) => {
  const selectedChoice = selectedAnswers.value[questionIndex]
  if (selectedChoice === undefined) return

  const question = props.questions[questionIndex]
  const isCorrect = selectedChoice === question.answer

  questionStates.value[questionIndex] = {
    checked: true,
    correct: isCorrect
  }

  updateQuestionProgress(questionIndex, isCorrect, selectedChoice)
}

const retryQuestion = (questionIndex: number) => {
  questionStates.value[questionIndex] = { checked: false, correct: false }
  delete selectedAnswers.value[questionIndex]
}

const jumpToUnanswered = () => {
  for (let i = 0; i < props.questions.length; i++) {
    if (!questionStates.value[i]?.checked) {
      const element = document.getElementById(`question-${i}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      break
    }
  }
}

const getQuestionCardClass = (index: number) => {
  const state = questionStates.value[index]
  if (!state?.checked) return 'border-gray-200'
  return state.correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
}

const getChoiceClass = (questionIndex: number, choiceIndex: number) => {
  const selected = selectedAnswers.value[questionIndex] === choiceIndex
  const state = questionStates.value[questionIndex]
  const isCorrectAnswer = choiceIndex === props.questions[questionIndex].answer

  if (!state?.checked) {
    return selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  }

  if (selected && state.correct) {
    return 'border-green-400 bg-green-100'
  } else if (selected && !state.correct) {
    return 'border-red-400 bg-red-100'
  } else if (isCorrectAnswer) {
    return 'border-green-400 bg-green-100'
  }

  return 'border-gray-200 bg-gray-50'
}

const getChoiceIndicatorClass = (questionIndex: number, choiceIndex: number) => {
  const selected = selectedAnswers.value[questionIndex] === choiceIndex
  const state = questionStates.value[questionIndex]
  const isCorrectAnswer = choiceIndex === props.questions[questionIndex].answer

  if (!state?.checked) {
    return selected ? 'border-blue-500 text-blue-500' : 'border-gray-300'
  }

  if (selected && state.correct) {
    return 'border-green-500 text-green-500'
  } else if (selected && !state.correct) {
    return 'border-red-500 text-red-500'
  } else if (isCorrectAnswer) {
    return 'border-green-500 text-green-500'
  }

  return 'border-gray-300'
}

const getDifficultyClass = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'hard':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
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
.choice-option {
  touch-action: manipulation;
  user-select: none;
}

@media (max-width: 768px) {
  .choice-option {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .quiz-section {
    padding: 1rem;
  }
}
</style>