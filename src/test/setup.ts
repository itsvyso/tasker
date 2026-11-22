import '@testing-library/jest-dom'

// Robust Proxy mock for 2D canvas context for testing environment & canvas-confetti
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => {
    return new Proxy({}, {
      get: () => () => {},
    })
  }) as any
}

// Mock scrollIntoView for jsdom
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
