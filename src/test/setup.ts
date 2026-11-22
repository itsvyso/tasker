import '@testing-library/jest-dom'

// Mock canvas getContext for tests
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null
}
