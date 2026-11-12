import '@testing-library/jest-dom'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { guardarToken } from './services/api.js'
import { instalarApiFalsa } from './test/apiFalsa.js'

// En las pruebas las animaciones terminan al instante: así no hay que esperarlas.
MotionGlobalConfig.skipAnimations = true

// jsdom no trae estas APIs del navegador; las animaciones y el scroll las necesitan.

// Simula que todo elemento observado ya está visible (para las animaciones "al aparecer").
class IntersectionObserverFalso {
  constructor(callback) {
    this.callback = callback
  }
  observe(elemento) {
    this.callback([{ isIntersecting: true, intersectionRatio: 1, target: elemento }], this)
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

class ResizeObserverFalso {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver = IntersectionObserverFalso
globalThis.ResizeObserver = ResizeObserverFalso

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

// Cada prueba parte con una API falsa nueva (los mismos datos iniciales que el backend) y sin sesión.
beforeEach(() => {
  instalarApiFalsa()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  guardarToken(null)
  vi.restoreAllMocks()
})
