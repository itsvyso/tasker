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

// Mock matchMedia and ResizeObserver for jsdom & animation engines
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as any
  }

  if (!(window as any).ResizeObserver) {
    ;(window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
}
