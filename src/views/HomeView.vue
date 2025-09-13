<template>
  <div class="home-view">
    <!-- Modern Header -->
    <header class="header-modern">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo-icon">📚</div>
          <h1 class="app-title">Japanese Learning Platform</h1>
        </div>
        <div class="header-controls">
          <button class="control-button theme-toggle" @click="toggleTheme" title="Toggle Theme">
            {{ isDarkMode ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay" id="loadingOverlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 text-xl mb-4">⚠️ Error Loading Content</div>
      <p class="text-gray-600">{{ error }}</p>
      <button 
        @click="loadData" 
        class="mt-4 control-button"
      >
        Retry
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="main-container fade-in">
      <!-- Video and Transcript Layout -->
      <div class="video-transcript-layout">
        <!-- Video Section -->
        <section class="video-section fade-in">
          <div class="video-container">
            <h2 class="video-title japanese-text">{{ videoData?.title || 'アンジャッシュ バイトの面接' }}</h2>
            <VideoPlayer 
              :video-data="videoData" 
              @time-update="handleTimeUpdate"
              ref="videoPlayerRef"
            />
          </div>
        </section>

        <!-- Transcript Panel -->
        <aside class="transcript-panel slide-in">
          <TranscriptViewer 
            :transcript="transcript" 
            :current-time="currentTime"
            @seek="handleSeek"
          />
        </aside>
      </div>
    </div>

    <!-- Quiz Arena -->
    <section class="quiz-arena slide-in">
      <div class="quiz-content">
        <div class="quiz-header">
          <div class="quiz-info">
            <div class="question-counter">PROGRESS</div>
            <div class="quiz-stats">
              <span class="stat-item">CORRECT: <span class="stat-value">{{ correctAnswers }}/{{ totalQuestions }}</span></span>
              <span class="stat-item">COMPLETED: <span class="stat-value">{{ answeredQuestions }}/{{ totalQuestions }}</span></span>
            </div>
          </div>
        </div>

        <!-- Quiz Component -->
        <QuizSection :questions="questions" />

        <!-- Progress Bar -->
        <div class="quiz-progress">
          <div class="progress-bar-container" style="background: var(--muted); height: 8px; border-radius: 4px; margin-top: 2rem; overflow: hidden; border: 2px solid var(--border);">
            <div class="progress-bar-fill" :style="progressBarStyle"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.9rem; color: var(--muted-foreground);">
            <span>Progress: {{ answeredQuestions }}/{{ totalQuestions }}</span>
            <span>{{ completionPercentage }}% Complete</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Floating Action Buttons -->
    <div class="floating-actions" style="position: fixed; bottom: 2rem; right: 2rem; z-index: 1000;">
      <button class="control-button" @click="toggleFullscreen" title="Fullscreen Mode" style="margin-bottom: 1rem; display: block;">
        🔍
      </button>
    </div>

    <!-- Success/Error Notifications -->
    <div class="notification-container" id="notifications"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import TranscriptViewer from '@/components/TranscriptViewer.vue'
import QuizSection from '@/components/QuizSection.vue'
import { loadTranscript } from '@/utils/transcriptParser'
import { useProgress } from '@/composables/useProgress'
import { useTheme } from '@/composables/useTheme'
import { useParticles } from '@/composables/useParticles'
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

const { isDarkMode, toggleTheme } = useTheme()
const { createParticleSystem, stopParticleSystem } = useParticles()

const progressBarStyle = computed(() => {
  const percentage = completionPercentage.value
  return {
    height: '100%',
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    width: `${percentage}%`,
    transition: 'width 0.5s ease',
    boxShadow: '0 0 10px var(--primary)'
  }
})

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

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
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
  // Initialize particle system
  setTimeout(() => {
    createParticleSystem()
  }, 1000)
})

onUnmounted(() => {
  stopParticleSystem()
})
</script>

<style scoped>
/* Header Styles */
.header-modern {
  background: var(--card) !important;
  border-bottom: 1px solid var(--border) !important;
  padding: 1.5rem 2rem !important;
  box-shadow: var(--shadow-soft) !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  backdrop-filter: blur(10px) !important;
}

.header-content {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  max-width: 1400px !important;
  margin: 0 auto !important;
}

.logo-container {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
}

.logo-icon {
  font-size: 1.5rem !important;
}

.app-title {
  font-size: 1.5rem !important;
  color: var(--primary) !important;
  font-weight: 600 !important;
}

.header-controls {
  display: flex !important;
  gap: 1rem !important;
}

/* Main Layout */
.main-container {
  max-width: 1400px !important;
  margin: 2rem auto !important;
  padding: 0 2rem !important;
}

.video-transcript-layout {
  display: grid !important;
  grid-template-columns: 2fr 1fr !important;
  gap: 2rem !important;
  margin-bottom: 3rem !important;
  align-items: stretch !important;
}

/* Video Section */
.video-section {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  padding: 2rem !important;
  box-shadow: var(--shadow-soft) !important;
  height: 100% !important;
}

.video-container {
  height: 100%;
}

.video-title {
  font-size: 1.25rem !important;
  margin-bottom: 1.5rem !important;
  color: var(--foreground) !important;
  text-align: center !important;
  font-weight: 600 !important;
}

/* Transcript Panel */
.transcript-panel {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  padding: 2rem !important;
  box-shadow: var(--shadow-soft) !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Quiz Arena */
.quiz-arena {
  max-width: 1400px !important;
  margin: 3rem auto !important;
  padding: 0 2rem !important;
}

.quiz-content {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  padding: 2rem !important;
  box-shadow: var(--shadow-soft) !important;
}

.quiz-header {
  margin-bottom: 2rem !important;
  padding-bottom: 1.5rem !important;
  border-bottom: 1px solid var(--border) !important;
}

.quiz-info {
  display: flex !important;
  align-items: center !important;
  gap: 2rem !important;
}

.question-counter {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: var(--primary) !important;
}

.quiz-stats {
  display: flex !important;
  gap: 2rem !important;
}

.stat-item {
  font-weight: 500 !important;
  color: var(--muted-foreground) !important;
  font-size: 0.875rem !important;
}

.stat-value {
  color: var(--accent) !important;
  font-weight: 600 !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .video-transcript-layout {
    grid-template-columns: 1fr !important;
    gap: 1.5rem !important;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 0 1rem !important;
    margin: 1rem auto !important;
  }
  
  .quiz-arena {
    padding: 0 1rem !important;
    margin: 2rem auto !important;
  }
  
  .quiz-header {
    text-align: center !important;
  }
  
  .quiz-info {
    flex-direction: column !important;
    gap: 0.5rem !important;
  }
  
  .app-title {
    font-size: 1.25rem !important;
  }
}
</style>