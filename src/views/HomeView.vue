<template>
  <div class="home-view">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">Japanese Learning Quiz</h1>
        <p class="text-gray-600">Improve your listening comprehension with interactive videos and quizzes</p>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading content...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 text-xl mb-4">⚠️ Error Loading Content</div>
        <p class="text-gray-600">{{ error }}</p>
        <button 
          @click="loadData" 
          class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>

      <div v-else class="space-y-6 fade-in">
        <!-- Progress Overview -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">Your Progress</h2>
              <p class="text-gray-600">{{ answeredQuestions }}/{{ totalQuestions }} questions completed</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-blue-600">{{ completionPercentage }}%</div>
              <div class="text-sm text-gray-500">{{ correctAnswers }} correct</div>
            </div>
          </div>
        </div>

        <!-- Unified Responsive Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Video Section -->
          <div class="lg:col-span-2">
            <VideoPlayer 
              :video-data="videoData" 
              @time-update="handleTimeUpdate"
              ref="videoPlayerRef"
            />
          </div>

          <!-- Transcript Section -->
          <div class="lg:col-span-1">
            <TranscriptViewer 
              :transcript="transcript" 
              :current-time="currentTime"
              @seek="handleSeek"
            />
          </div>
        </div>

        <!-- Quiz Section -->
        <div class="mt-8">
          <QuizSection :questions="questions" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import TranscriptViewer from '@/components/TranscriptViewer.vue'
import QuizSection from '@/components/QuizSection.vue'
import { loadTranscript } from '@/utils/transcriptParser'
import { useProgress } from '@/composables/useProgress'
import type { VideoData, TranscriptLine, Question } from '@/types'

const loading = ref(true)
const error = ref('')
const videoData = ref<VideoData | null>(null)
const transcript = ref<TranscriptLine[]>([])
const questions = ref<Question[]>([])
const currentTime = ref(0)

const videoPlayerRef = ref()

const { 
  answeredQuestions, 
  totalQuestions, 
  correctAnswers, 
  completionPercentage,
  markVideoWatched 
} = useProgress()

const handleTimeUpdate = (time: number) => {
  currentTime.value = time
  
  // Mark video as watched if user has watched for more than 30 seconds
  if (time > 30) {
    markVideoWatched()
  }
}

const handleSeek = (time: number) => {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.seekTo(time)
  }
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''

    // Load all data in parallel
    const [videoResponse, transcriptData, questionsResponse] = await Promise.all([
      fetch('/data/video.json'),
      loadTranscript(),
      fetch('/data/questions.json')
    ])

    if (!videoResponse.ok) {
      throw new Error('Failed to load video data')
    }
    if (!questionsResponse.ok) {
      throw new Error('Failed to load questions data')
    }

    videoData.value = await videoResponse.json()
    transcript.value = transcriptData
    questions.value = await questionsResponse.json()
    
    // Set total questions count for progress tracking
    totalQuestions.value = questions.value.length

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data'
    console.error('Error loading data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
@media (max-width: 1024px) {
  .home-view {
    padding-bottom: 2rem;
  }
}
</style>