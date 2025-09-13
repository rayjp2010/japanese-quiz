<template>
  <div class="transcript-viewer-container">
    <div class="transcript-header">
      <h3 class="transcript-title">TRANSCRIPT</h3>
      <div class="transcript-controls">
        <button 
          @click="toggleTranscript"
          class="control-btn md:hidden"
          id="transcriptToggle"
        >
          {{ showTranscript ? '👁️' : '🙈' }}
        </button>
      </div>
    </div>
    
    <div 
      v-show="showTranscript || !isMobile"
      class="transcript-content" 
      ref="transcriptContainer"
      id="transcriptContent"
    >
      <div
        v-for="(line, index) in transcript"
        :key="index"
        @click="seekToTime(line.startTime)"
        :class="[
          'transcript-line',
          isCurrentLine(line) ? 'active' : ''
        ]"
        :data-timestamp="line.startTime"
      >
        <span class="timestamp">{{ formatTime(line.startTime) }}</span>
        <span class="japanese-text transcript-text">{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { TranscriptLine } from '@/types'
import { useParticles } from '@/composables/useParticles'

interface Props {
  transcript: TranscriptLine[]
  currentTime: number
}

interface Emits {
  (e: 'seek', time: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { showNotification } = useParticles()

const transcriptContainer = ref<HTMLDivElement>()
const showTranscript = ref(true)
const isMobile = ref(false)

let scrollTimeout: number | null = null

const currentLineIndex = computed(() => {
  return props.transcript.findIndex(line => 
    props.currentTime >= line.startTime && props.currentTime <= line.endTime
  )
})

const isCurrentLine = (line: TranscriptLine) => {
  return props.currentTime >= line.startTime && props.currentTime <= line.endTime
}

const seekToTime = (time: number) => {
  emit('seek', time)
  showNotification('🎯 Jumped to timestamp', 'info')
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const toggleTranscript = () => {
  showTranscript.value = !showTranscript.value
  const message = showTranscript.value ? '👁️ Transcript shown' : '🙈 Transcript hidden'
  showNotification(message, 'info')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const scrollToTranscriptLine = (lineIndex: number) => {
  if (!transcriptContainer.value || lineIndex < 0) return
  
  nextTick(() => {
    const transcriptContent = transcriptContainer.value
    if (!transcriptContent) return
    
    const lineElement = transcriptContent.children[lineIndex] as HTMLElement
    if (!lineElement) return
    
    const lineTop = lineElement.offsetTop
    const containerHeight = transcriptContent.clientHeight
    const lineHeight = lineElement.offsetHeight
    const containerScrollTop = transcriptContent.scrollTop

    // Calculate scroll position to center the line
    const scrollPosition = lineTop - (containerHeight / 2) + (lineHeight / 2)
    
    // Only scroll if the line is not currently visible or not centered
    const lineVisible = lineTop >= containerScrollTop && 
                       lineTop + lineHeight <= containerScrollTop + containerHeight
    
    const isApproximatelyCentered = Math.abs(containerScrollTop - scrollPosition) < 50
    
    if (!lineVisible || !isApproximatelyCentered) {
      transcriptContent.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      })
    }
  })
}

const throttledScrollToLine = (lineIndex: number) => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  scrollTimeout = window.setTimeout(() => {
    scrollToTranscriptLine(lineIndex)
    scrollTimeout = null
  }, 100)
}

// Auto-scroll to current line when video plays
watch(currentLineIndex, (newIndex, oldIndex) => {
  // Only auto-scroll if the line actually changed and it's a valid line
  if (newIndex !== oldIndex && newIndex >= 0) {
    throttledScrollToLine(newIndex)
  }
})

// Also watch for currentTime changes to handle edge cases
watch(() => props.currentTime, (newTime) => {
  if (newTime > 0 && currentLineIndex.value >= 0) {
    // Small delay to ensure the active class has been applied
    throttledScrollToLine(currentLineIndex.value)
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style scoped>
.transcript-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--muted);
}

.transcript-title {
  color: var(--foreground);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.transcript-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  background: var(--muted);
  color: var(--foreground);
  border: 1px solid var(--border);
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.875rem;
}

.control-btn:hover {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.transcript-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  height: 100%;
  max-height: 500px;
}

.transcript-line {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.transcript-line:hover {
  background: var(--muted);
  border-color: var(--border);
}

.transcript-line.active {
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  border-color: var(--primary) !important;
  transform: translateX(4px);
}

.timestamp {
  color: var(--accent);
  font-weight: 600;
  min-width: 50px;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.transcript-line.active .timestamp {
  color: var(--primary-foreground);
}

.transcript-text {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Custom scrollbar */
.transcript-content::-webkit-scrollbar {
  width: 6px;
}

.transcript-content::-webkit-scrollbar-track {
  background: var(--muted);
  border-radius: 3px;
}

.transcript-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.transcript-content::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}

@media (max-width: 768px) {
  .transcript-line {
    padding: 1rem;
    margin: 0.5rem 0;
  }
  
  .transcript-header {
    padding: 1rem;
  }
  
  .transcript-content {
    padding: 0.5rem;
  }
}
</style>