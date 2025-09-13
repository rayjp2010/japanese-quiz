import { ref, computed, onMounted } from 'vue'

const isDarkMode = ref(true)

export function useTheme() {
  const theme = computed(() => isDarkMode.value ? 'dark' : 'light')
  
  const initializeTheme = () => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      isDarkMode.value = false
      document.body.classList.add('light-mode')
    } else {
      isDarkMode.value = true
      document.body.classList.remove('light-mode')
    }
  }
  
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    
    if (isDarkMode.value) {
      document.body.classList.remove('light-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.add('light-mode')
      localStorage.setItem('theme', 'light')
    }
  }
  
  return {
    isDarkMode: computed(() => isDarkMode.value),
    theme,
    initializeTheme,
    toggleTheme
  }
}