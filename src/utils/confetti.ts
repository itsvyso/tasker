import confetti from 'canvas-confetti'

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'],
      disableForReducedMotion: true,
    })
  } catch (err) {
    // Graceful fallback if canvas is not supported (e.g. in test environment)
    console.debug('Confetti disabled or failed:', err)
  }
}
