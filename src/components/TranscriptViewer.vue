<template>
  <div class="transcript-viewer bg-white rounded-lg shadow-lg p-4 flex flex-col" :style="containerStyle">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <h3 class="text-lg font-semibold text-gray-800">Transcript</h3>
      <button 
        @click="toggleTranscript"
        class="md:hidden bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
      >
        {{ showTranscript ? 'Hide' : 'Show' }}
      </button>
    </div>
    
    <div 
      v-show="showTranscript || !isMobile"
      class="transcript-content overflow-y-auto flex-1 space-y-2 mobile-panel-transition"
      ref="transcriptContainer"
    >
      <div
        v-for="(line, index) in transcript"
        :key="index"
        @click="seekToTime(line.startTime)"
        :class="[
          'transcript-line p-3 rounded cursor-pointer transition-all duration-200 hover:bg-blue-50',
          isCurrentLine(line) ? 'bg-blue-100 border-l-4 border-blue-500 shadow-sm' : 'bg-gray-50 hover:bg-gray-100'
        ]"
      >
        <div class="text-sm text-gray-500 mb-1">
          {{ formatTime(line.startTime) }} - {{ formatTime(line.endTime) }}
        </div>
        <div class="text-gray-800 font-medium">{{ line.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { TranscriptLine } from '@/types'

interface Props {
  transcript: TranscriptLine[]
  currentTime: number
}

interface Emits {
  (e: 'seek', time: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const transcriptContainer = ref<HTMLDivElement>()
const showTranscript = ref(false)
const isMobile = ref(false)

// Calculate container height to match video player
const containerStyle = computed(() => {
  if (isMobile.value) {
    return { height: 'auto' }
  }
  // Video has aspect ratio 16:9, plus title and controls
  // Approximate total height to match video section
  return { 
    height: 'calc(56.25vw * 2/3 + 120px)', // 56.25vw is 16:9 aspect ratio for 2/3 width, plus extra for title/controls
    maxHeight: '600px',
    minHeight: '400px'
  }
})

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
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${minutes}m${secs}s${ms}ms`
}

const toggleTranscript = () => {
  showTranscript.value = !showTranscript.value
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Auto-scroll to current line
watch(currentLineIndex, (newIndex) => {
  if (newIndex >= 0 && transcriptContainer.value) {
    const lineElement = transcriptContainer.value.children[newIndex] as HTMLElement
    if (lineElement) {
      lineElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.transcript-line {
  user-select: none;
  touch-action: manipulation;
}

@media (max-width: 768px) {
  .transcript-line {
    padding: 1rem;
    margin: 0.5rem 0;
  }
}
</style>