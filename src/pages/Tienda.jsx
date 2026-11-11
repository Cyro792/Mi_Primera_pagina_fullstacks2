import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import { AnimatePresence, motion } from 'motion/react'
import ProductoCard from '../components/ProductoCard.jsx'
import Aparecer from '../components/animaciones/Aparecer.jsx'
import Huella from '../components/animaciones/Huella.jsx'
import { listarCategorias, listarProductos } from '../services/productos.js'

function Cargando() {
  return (
    <div className="cargando" role="status" aria-label="Cargando productos">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2], y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}>
          <Huella tamano={26} />
        </motion.span>
      ))}
    </div>
  )
}

/** Tienda: catálogo de servicios y productos, con filtro por categoría (?categoria=) y buscador. */
export default function Tienda() {
  const [parametros, setParametros] = useSearchParams()
  const categoriaId = Number(parametros.get('categoria')) || null

  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState(null)
  const [texto, setTexto] = useState('')

  useEffect(() => {
    let vigente = true
    Promise.all([listarCategorias(), listarProductos()]).then(([cats, prods]) => {
      if (!vigente) return
      setCategorias(cats)
      setProductos(prods)
    })
    return () => {
      vigente = false
    }
  }, [])

  const elegirCategoria = (id) => setParametros(id ? { categoria: String(id) } : {})

  const busqueda = texto.trim().toLowerCase()
  const visibles = (productos ?? []).filter(
    (p) =>
      (!categoriaId || p.categoriaId === categoriaId) &&
      (!busqueda || p.nombre.toLowerCase().includes(busqueda) || p.descripcion.toLowerCase().includes(busqueda)),
  )

  return (
    <>
      <header className="cabecera-pagina">
        <Container className="contenedor">
          <Aparecer>
            <p className="sobretitulo">Tienda San Marcos</p>
            <h1 className="font-display cabecera-titulo">Todo para el bienestar de tu mascota</h1>
            <p className="texto-suave mb-0" style={{ maxWidth: '36rem' }}>
              Compra servicios de la clínica y productos seleccionados por nuestro equipo veterinario.
            </p>
          </Aparecer>
        </Container>
      </header>

      <section className="seccion pt-4">
        <Container className="contenedor">
          <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between mb-4">
            <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
              <button type="button" className={`filtro${!categoriaId ? ' filtro--activo' : ''}`} aria-pressed={!categoriaId} onClick={() => elegirCategoria(null)}>
                Todo
              </button>
              {categorias.map((c) => (
                <button key={c.id} type="button" className={`filtro${categoriaId === c.id ? ' filtro--activo' : ''}`} aria-pressed={categoriaId === c.id} onClick={() => elegirCategoria(c.id)}>
                  {c.nombre}
                </button>
              ))}
            </div>
            <Form.Control
              type="search"
              className="campo buscador"
              placeholder="Buscar en la tienda…"
              aria-label="Buscar productos"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>

          {productos === null ? (
            <Cargando />
          ) : visibles.length === 0 ? (
            <p className="text-center texto-suave py-5">No encontramos productos que coincidan con tu búsqueda.</p>
          ) : (
            <div className="row g-4">
              {/* popLayout: al filtrar, las tarjetas que quedan se reacomodan con animación. */}
              <AnimatePresence mode="popLayout">
                {visibles.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    className="col-sm-6 col-lg-4 col-xl-3"
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductoCard producto={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
