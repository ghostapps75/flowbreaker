/**
 * Haptic feedback simulation utility.
 */
export function triggerHaptic(type = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10)
        break
      case 'medium':
        navigator.vibrate(25)
        break
      case 'heavy':
        navigator.vibrate(45)
        break
      case 'success':
        navigator.vibrate([15, 30, 40])
        break
      case 'error':
        navigator.vibrate([40, 50, 40])
        break
      default:
        navigator.vibrate(15)
    }
  } catch (err) {
    // Ignore unsupported vibration failures
  }
}
