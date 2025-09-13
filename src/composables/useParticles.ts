import { onMounted, onUnmounted } from 'vue'

let particleInterval: number | null = null

export function useParticles() {
  const createParticleSystem = () => {
    const container = document.getElementById('particleContainer')
    if (!container) return

    particleInterval = window.setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance each interval
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = Math.random() * window.innerWidth + 'px'
        particle.style.top = '-10px'
        particle.style.background = 'var(--accent)'
        particle.style.opacity = '0.1'
        particle.style.animationDuration = '6s'

        container.appendChild(particle)

        setTimeout(() => particle.remove(), 6000)
      }
    }, 400)
  }

  const createSuccessParticles = () => {
    const container = document.getElementById('particleContainer')
    if (!container) return

    // Create more obvious and impressive particle bursts
    const burstTypes = ['gentle', 'rise', 'sparkle', 'confetti', 'stars']

    for (let burst = 0; burst < 5; burst++) {
      setTimeout(() => {
        const burstType = burstTypes[burst % burstTypes.length]
        const centerX = Math.random() * (window.innerWidth - 200) + 100
        const centerY = Math.random() * (window.innerHeight / 3) + 100

        createProfessionalBurst(container, burstType, centerX, centerY)
      }, burst * 200)
    }

    // Add screen-wide celebration effect
    createCelebrationOverlay()
  }

  const createProfessionalBurst = (container: HTMLElement, type: string, centerX: number, centerY: number) => {
    const colors = ['#2563eb', '#1d4ed8', '#1e40af', '#3b82f6', '#60a5fa', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']

    switch(type) {
      case 'gentle':
        createGentleBurst(container, colors, centerX, centerY)
        break
      case 'rise':
        createRiseBurst(container, colors, centerX, centerY)
        break
      case 'sparkle':
        createSparkleBurst(container, colors, centerX, centerY)
        break
      case 'confetti':
        createConfettiBurst(container, colors, centerX, centerY)
        break
      case 'stars':
        createStarsBurst(container, colors, centerX, centerY)
        break
    }
  }

  const createConfettiBurst = (container: HTMLElement, colors: string[], centerX: number, centerY: number) => {
    const shapes = ['🎉', '🎊', '🏆', '⚡', '💎', '🌈']
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div')
      const shape = shapes[Math.floor(Math.random() * shapes.length)]

      particle.innerHTML = shape
      particle.style.cssText = `
        position: fixed;
        font-size: ${Math.random() * 20 + 15}px;
        pointer-events: none;
        z-index: 9999;
        left: ${centerX + Math.random() * 300 - 150}px;
        top: ${centerY - 50}px;
      `

      container.appendChild(particle)

      const fallDistance = Math.random() * 400 + 200
      const sway = Math.random() * 100 - 50

      particle.animate([
        {
          transform: 'translateY(0) translateX(0) rotate(0deg)',
          opacity: 1
        },
        {
          transform: `translateY(${fallDistance}px) translateX(${sway}px) rotate(360deg)`,
          opacity: 0
        }
      ], {
        duration: 3000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => particle.remove()
    }
  }

  const createStarsBurst = (container: HTMLElement, colors: string[], centerX: number, centerY: number) => {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]

      particle.innerHTML = '⭐'
      particle.style.cssText = `
        position: fixed;
        color: ${color};
        font-size: ${Math.random() * 30 + 20}px;
        pointer-events: none;
        z-index: 9999;
        left: ${centerX}px;
        top: ${centerY}px;
        filter: drop-shadow(0 0 10px ${color});
      `

      container.appendChild(particle)

      const angle = (i / 8) * Math.PI * 2
      const distance = Math.random() * 200 + 100
      const endX = Math.cos(angle) * distance
      const endY = Math.sin(angle) * distance

      particle.animate([
        {
          transform: 'translate(0, 0) scale(0) rotate(0deg)',
          opacity: 0
        },
        {
          transform: 'translate(0, 0) scale(1) rotate(180deg)',
          opacity: 1,
          offset: 0.3
        },
        {
          transform: `translate(${endX}px, ${endY}px) scale(0) rotate(720deg)`,
          opacity: 0
        }
      ], {
        duration: 2500,
        easing: 'ease-out'
      }).onfinish = () => particle.remove()
    }
  }

  const createCelebrationOverlay = () => {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.1));
      z-index: 9998;
      pointer-events: none;
    `

    document.body.appendChild(overlay)

    overlay.animate([
      { opacity: 0 },
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 1000,
      easing: 'ease-in-out'
    }).onfinish = () => overlay.remove()
  }

  const createGentleBurst = (container: HTMLElement, colors: string[], centerX: number, centerY: number) => {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 8 + 4

      const angle = (i / 20) * Math.PI * 2
      const velocity = Math.random() * 120 + 80
      const endX = centerX + Math.cos(angle) * velocity
      const endY = centerY + Math.sin(angle) * velocity

      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
        left: ${centerX}px;
        top: ${centerY}px;
        box-shadow: 0 0 10px ${color};
      `

      container.appendChild(particle)

      particle.animate([
        {
          transform: 'translate(0, 0) scale(1)',
          opacity: 1
        },
        {
          transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: 2000,
        easing: 'ease-out'
      }).onfinish = () => particle.remove()
    }
  }

  const createRiseBurst = (container: HTMLElement, colors: string[], centerX: number, centerY: number) => {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const particle = document.createElement('div')
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = Math.random() * 6 + 3

        particle.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          opacity: 1;
          left: ${centerX + Math.random() * 80 - 40}px;
          top: ${centerY}px;
          box-shadow: 0 0 15px ${color};
        `

        container.appendChild(particle)

        particle.animate([
          { transform: 'translateY(0)', opacity: 1 },
          { transform: 'translateY(-250px)', opacity: 0 }
        ], {
          duration: 3000,
          easing: 'ease-out'
        }).onfinish = () => particle.remove()
      }, i * 80)
    }
  }

  const createSparkleBurst = (container: HTMLElement, colors: string[], centerX: number, centerY: number) => {
    const sparkleShapes = ['✦', '✨', '⭐', '🌟', '💫', '✧']
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]
      const shape = sparkleShapes[Math.floor(Math.random() * sparkleShapes.length)]

      particle.innerHTML = shape
      particle.style.cssText = `
        position: fixed;
        color: ${color};
        font-size: ${Math.random() * 24 + 16}px;
        pointer-events: none;
        z-index: 9999;
        left: ${centerX + Math.random() * 200 - 100}px;
        top: ${centerY + Math.random() * 200 - 100}px;
        text-shadow: 0 0 10px ${color};
      `

      container.appendChild(particle)

      particle.animate([
        {
          transform: 'scale(0) rotate(0deg)',
          opacity: 1
        },
        {
          transform: 'scale(2) rotate(360deg)',
          opacity: 0
        }
      ], {
        duration: 2000,
        easing: 'ease-out'
      }).onfinish = () => particle.remove()
    }
  }

  const showNotification = (message: string, type: string = 'info') => {
    const container = document.getElementById('notifications')
    if (!container) return

    const notification = document.createElement('div')

    const colors = {
      success: 'var(--success)',
      error: 'var(--destructive)',
      info: 'var(--secondary)',
      warning: 'var(--warning)'
    }

    notification.style.cssText = `
      background: ${colors[type as keyof typeof colors] || colors.info};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius);
      margin-bottom: 0.5rem;
      box-shadow: var(--shadow-soft);
      font-weight: 500;
      font-size: 0.9rem;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
    `

    notification.textContent = message
    notification.onclick = () => notification.remove()

    container.appendChild(notification)

    setTimeout(() => notification.remove(), 4000)
  }

  const stopParticleSystem = () => {
    if (particleInterval) {
      clearInterval(particleInterval)
      particleInterval = null
    }
  }

  return {
    createParticleSystem,
    createSuccessParticles,
    showNotification,
    stopParticleSystem
  }
} 