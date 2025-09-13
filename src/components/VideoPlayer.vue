<template>
  <div class="video-player-container">
    <!-- Video Wrapper -->
    <div class="video-wrapper">
      <div
        v-if="props.videoData?.url"
        id="player-container"
        ref="playerContainer"
        class="w-full h-full rounded-lg bg-black"
      ></div>
    </div>

    <!-- Professional Video Controls -->
    <div class="video-controls">
      <button class="video-btn" @click="togglePlayPause" id="playBtn" :disabled="!playerReady">
        {{ isPlaying ? '⏸️' : '▶️' }} {{ isPlaying ? 'PAUSE' : 'PLAY' }}
      </button>
      <button class="video-btn" @click="rewindVideo" :disabled="!playerReady">
        ⏪ -10s
      </button>
      <button class="video-btn" @click="forwardVideo" :disabled="!playerReady">
        ⏩ +10s
      </button>
      <button class="video-btn" @click="toggleMute" id="muteBtn" :disabled="!playerReady">
        {{ isMuted ? '🔇' : '🔊' }} {{ isMuted ? 'MUTED' : 'AUDIO' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { VideoData } from '@/types'

interface Props {
  videoData: VideoData | null
}

interface Emits {
  (e: 'timeUpdate', currentTime: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const playerContainer = ref<HTMLElement>()
const currentTime = ref(0)
const maxTime = ref(480) // 8 minutes max based on transcript
const playerReady = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)

let player: any = null
let timeUpdateInterval: number | null = null
let isInitializing = false
let currentVideoId: string | null = null

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

const handleTimeChange = () => {
  if (player && playerReady.value) {
    player.seekTo(currentTime.value)
  }
  emit('timeUpdate', currentTime.value)
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

const togglePlayPause = () => {
  if (!player || !playerReady.value) return
  
  if (isPlaying.value) {
    player.pauseVideo()
    isPlaying.value = false
    stopTimeUpdate()
  } else {
    player.playVideo()
    isPlaying.value = true
    startTimeUpdate()
  }
}

const rewindVideo = () => {
  if (!player || !playerReady.value) return
  const newTime = Math.max(0, currentTime.value - 10)
  currentTime.value = newTime
  player.seekTo(newTime)
  emit('timeUpdate', newTime)
}

const forwardVideo = () => {
  if (!player || !playerReady.value) return
  const newTime = Math.min(maxTime.value, currentTime.value + 10)
  currentTime.value = newTime
  player.seekTo(newTime)
  emit('timeUpdate', newTime)
}

const toggleMute = () => {
  if (!player || !playerReady.value) return

  if (isMuted.value) {
    player.unMute()
    isMuted.value = false
  } else {
    player.mute()
    isMuted.value = true
  }
}

const seekTo = (time: number) => {
  currentTime.value = time
  if (player && playerReady.value) {
    player.seekTo(time)
  }
  emit('timeUpdate', time)
}

const startTimeUpdate = () => {
  if (timeUpdateInterval) return
  
  timeUpdateInterval = window.setInterval(() => {
    if (player && playerReady.value && isPlaying.value) {
      const time = player.getCurrentTime()
      currentTime.value = time
      emit('timeUpdate', time)
    }
  }, 100) // Update every 100ms for smooth progress
}

const stopTimeUpdate = () => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
}

const initializeYouTubePlayer = () => {
  if (!props.videoData?.url || !playerContainer.value) return
  
  const videoId = extractVideoId(props.videoData.url)
  if (!videoId) return
  
  // Prevent duplicate initialization
  if (isInitializing || currentVideoId === videoId) return
  
  console.log('Initializing YouTube player for video:', videoId)
  isInitializing = true
  currentVideoId = videoId

  // Load YouTube IFrame API
  if (!(window as any).YT || !(window as any).YT.Player) {
    // Prevent multiple script loads
    if (!(window as any).youtubeApiLoading) {
      (window as any).youtubeApiLoading = true
      
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      tag.defer = true
      
      // Add error handling for script loading
      tag.onerror = () => {
        console.error('Failed to load YouTube API')
        ;(window as any).youtubeApiLoading = false
        isInitializing = false
      }
      
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }
    
    // Create a unique callback for this component instance
    const callbackName = `onYouTubeIframeAPIReady_${Date.now()}`
    ;(window as any)[callbackName] = () => {
      ;(window as any).youtubeApiLoading = false
      createPlayer(videoId)
      // Clean up the callback
      delete (window as any)[callbackName]
    }
    
    // Set the global callback only if it doesn't exist
    if (!(window as any).onYouTubeIframeAPIReady) {
      ;(window as any).onYouTubeIframeAPIReady = (window as any)[callbackName]
    }
    
  } else {
    // API is already loaded
    createPlayer(videoId)
  }
}

const createPlayer = (videoId: string) => {
  if (!playerContainer.value) {
    isInitializing = false
    return
  }
  
  console.log('Creating player for video:', videoId)
  
  // Destroy any existing players globally to prevent duplicates
  destroyAllYouTubePlayers()
  
  // Clear the container
  playerContainer.value.innerHTML = ''
  
  try {
    player = new (window as any).YT.Player(playerContainer.value, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        controls: 0,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        enablejsapi: 1,
        origin: window.location.origin,
        autoplay: 0,
        fs: 1,
        cc_load_policy: 0,
        disablekb: 0
      },
      events: {
        onReady: (event: any) => {
          console.log('YouTube player ready for:', videoId)
          playerReady.value = true
          isInitializing = false
          try {
            const duration = event.target.getDuration()
            if (duration > 0) {
              maxTime.value = duration
            }
          } catch (e) {
            console.warn('Could not get video duration:', e)
          }
        },
        onStateChange: (event: any) => {
          const state = event.data
          console.log('Player state changed:', state)
          if (state === (window as any).YT.PlayerState.PLAYING) {
            isPlaying.value = true
            startTimeUpdate()
          } else if (state === (window as any).YT.PlayerState.PAUSED || state === (window as any).YT.PlayerState.ENDED) {
            isPlaying.value = false
            stopTimeUpdate()
          }
        },
        onError: (event: any) => {
          console.error('YouTube player error:', event.data)
          playerReady.value = false
          isInitializing = false
        }
      }
    })
  } catch (error) {
    console.error('Error creating YouTube player:', error)
    playerReady.value = false
    isInitializing = false
  }
}

const destroyAllYouTubePlayers = () => {
  // Destroy our current player
  if (player) {
    try {
      player.destroy()
      console.log('Destroyed existing player')
    } catch (e) {
      console.warn('Error destroying previous player:', e)
    }
    player = null
  }
  
  // Reset state
  playerReady.value = false
  isPlaying.value = false
  stopTimeUpdate()
  
  // Find and destroy any orphaned iframes
  const iframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]')
  iframes.forEach((iframe) => {
    try {
      iframe.remove()
      console.log('Removed orphaned YouTube iframe')
    } catch (e) {
      console.warn('Error removing iframe:', e)
    }
  })
}

onMounted(async () => {
  await nextTick()
  // Only initialize if we have video data, let the watcher handle it otherwise
  if (props.videoData?.url) {
    setTimeout(() => {
      initializeYouTubePlayer()
    }, 100)
  }
})

onUnmounted(() => {
  console.log('Component unmounting, cleaning up...')
  destroyAllYouTubePlayers()
  currentVideoId = null
  isInitializing = false
  
  // Clean up global callback
  if ((window as any).onYouTubeIframeAPIReady) {
    delete (window as any).onYouTubeIframeAPIReady
  }
})

watch(() => props.videoData?.url, (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    const newVideoId = extractVideoId(newUrl)
    if (newVideoId && newVideoId !== currentVideoId) {
      console.log('Video URL changed, reinitializing player')
      nextTick(() => {
        setTimeout(() => {
          initializeYouTubePlayer()
        }, 100)
      })
    }
  }
})

defineExpose({
  seekTo
})
</script>

<style scoped>
.video-player-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--muted);
}

.video-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.video-btn {
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  border: 1px solid var(--primary) !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: var(--radius) !important;
  font-family: var(--font-sans) !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important;
  cursor: pointer !important;
  transition: all var(--transition-fast) !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.video-btn:hover:not(:disabled) {
  background: var(--accent) !important;
  border-color: var(--accent) !important;
}

.video-btn:active:not(:disabled) {
  transform: translateY(1px) !important;
}

.video-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

@media (max-width: 1200px) {
  .video-wrapper {
    height: 300px !important;
  }
}

@media (max-width: 768px) {
  .video-controls {
    gap: 0.5rem !important;
  }

  .video-btn {
    padding: 0.5rem 1rem !important;
    font-size: 0.8rem !important;
  }
}
</style>