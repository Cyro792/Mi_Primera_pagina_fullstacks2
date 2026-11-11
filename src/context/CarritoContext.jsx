import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { iconoProducto } from '../data/catalogo.js'
import {
  agregarAlCarrito,
  cambiarCantidad as cambiarCantidadEn,
  cantidadTotal,
  guardarCarrito,
  leerCarrito,
  quitarDelCarrito,
  totalCarrito,
} from '../utils/carrito.js'

const CarritoContext = createContext(null)

let siguienteVuelo = 1

/**
 * Estado del carrito compartido por toda la aplicación.
 * Se guarda en el navegador, así que no se pierde al recargar ni al cambiar de página.
 */
export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => leerCarrito())
  // "Vuelos": animaciones del producto viajando hacia el ícono del carrito.
  const [vuelos, setVuelos] = useState([])

  useEffect(() => {
    guardarCarrito(items)
  }, [items])

  /** origen: elemento desde donde sale la animación (normalmente el botón "Agregar"). */
  const agregar = useCallback((producto, cantidad = 1, origen = null) => {
    setItems((actuales) => agregarAlCarrito(actuales, producto, cantidad))
    if (origen?.getBoundingClientRect) {
      const { left, top, width, height } = origen.getBoundingClientRect()
      const vuelo = { id: siguienteVuelo++, x: left + width / 2, y: top + height / 2, icono: iconoProducto(producto) }
      setVuelos((actuales) => [...actuales, vuelo])
    }
  }, [])

  const terminarVuelo = useCallback((id) => {
    setVuelos((actuales) => actuales.filter((v) => v.id !== id))
  }, [])

  const cambiarCantidad = useCallback((id, cantidad) => {
    setItems((actuales) => cambiarCantidadEn(actuales, id, cantidad))
  }, [])

  const quitar = useCallback((id) => {
    setItems((actuales) => quitarDelCarrito(actuales, id))
  }, [])

  const vaciar = useCallback(() => setItems([]), [])

  const valor = useMemo(
    () => ({
      items,
      total: totalCarrito(items),
      cantidad: cantidadTotal(items),
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      vuelos,
      terminarVuelo,
    }),
    [items, agregar, cambiarCantidad, quitar, vaciar, vuelos, terminarVuelo],
  )

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

export function useCarrito() {
  const contexto = useContext(CarritoContext)
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  return contexto
}
