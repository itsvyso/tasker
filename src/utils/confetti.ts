import confetti from 'canvas-confetti'

/**
 * Refined, sleek micro-spark celebration with delicate violet and indigo tones.
 * Avoids loud full-screen confetti bursts while still providing satisfying feedback.
 */
export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 24,
      spread: 45,
      startVelocity: 28,
      ticks: 120,
      gravity: 1.1,
      scalar: 0.7,
      origin: { y: 0.75 },
      colors: ['#8B5CF6', '#A855F7', '#6366F1', '#38BDF8', '#C084FC'],
      disableForReducedMotion: true,
    })
  } catch (err) {
    // Graceful fallback if canvas is not supported (e.g. in test environment)
    console.debug('Confetti disabled or failed:', err)
  }
}
