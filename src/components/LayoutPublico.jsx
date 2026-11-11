import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { motion } from 'motion/react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import BarraProgreso from './animaciones/BarraProgreso.jsx'
import VuelosAlCarrito from './animaciones/VuelosAlCarrito.jsx'

/** Marco común de las páginas públicas: barra de navegación, contenido animado y pie de página. */
export default function LayoutPublico() {
  const { pathname, hash } = useLocation()
  const pagina = useOutlet()

  // Al cambiar de página se vuelve arriba; si la dirección trae #seccion, se baja hasta ella.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }
    const espera = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(espera)
  }, [pathname, hash])

  return (
    <>
      <BarraProgreso />
      <Navbar />
      <motion.main
        key={pathname}
        className={pathname === '/' ? '' : 'pagina'}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {pagina}
      </motion.main>
      <Footer />
      <VuelosAlCarrito />
    </>
  )
}
