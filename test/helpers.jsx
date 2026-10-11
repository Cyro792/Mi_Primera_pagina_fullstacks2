import { act } from 'react'
import { createRoot } from 'react-dom/client'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Monta un componente en un <div> real del DOM del navegador (Karma corre en Chrome).
export function montar(elemento) {
  const contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  const root = createRoot(contenedor)
  act(() => root.render(elemento))
  return {
    contenedor,
    desmontar() {
      act(() => root.unmount())
      contenedor.remove()
    },
  }
}

export function clic(elemento) {
  act(() => {
    elemento.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

// React controla el valor de los inputs: hay que usar el setter nativo y disparar el evento.
export function escribir(elemento, valor) {
  const esSelect = elemento instanceof HTMLSelectElement
  const proto = esSelect ? HTMLSelectElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(elemento, valor)
  act(() => {
    elemento.dispatchEvent(new Event(esSelect ? 'change' : 'input', { bubbles: true }))
  })
}

export function enviar(formulario) {
  act(() => {
    formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
}
