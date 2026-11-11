import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconoMarcador from 'leaflet/dist/images/marker-icon.png'
import iconoMarcador2x from 'leaflet/dist/images/marker-icon-2x.png'
import sombraMarcador from 'leaflet/dist/images/marker-shadow.png'

// Leaflet no encuentra solo las imágenes del marcador cuando se empaqueta con Vite.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: iconoMarcador2x, iconUrl: iconoMarcador, shadowUrl: sombraMarcador })

const CLINICA = [-34.165319, -70.738949]

/** Mapa interactivo (Leaflet + OpenStreetMap) con la ubicación de la clínica. */
export default function Mapa() {
  const contenedor = useRef(null)
  const mapa = useRef(null)

  useEffect(() => {
    if (!contenedor.current || mapa.current) return undefined

    const instancia = L.map(contenedor.current, { center: CLINICA, zoom: 15, zoomControl: true, scrollWheelZoom: false })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(instancia)

    L.marker(CLINICA)
      .addTo(instancia)
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.4;">
          <strong style="color: #2A6049; font-size: 15px;">Clínica Veterinaria San Marcos</strong><br/>
          Av. Libertador Gral. Bernardo O'Higgins, Rancagua<br/>
          <span style="color: #666;">Lun - Vie: 9:00 - 21:00 | Urgencias 24h</span>
        </div>`,
      )
      .openPopup()

    mapa.current = instancia
    const ajuste = setTimeout(() => instancia.invalidateSize(), 250)

    return () => {
      clearTimeout(ajuste)
      instancia.remove()
      mapa.current = null
    }
  }, [])

  return <div ref={contenedor} className="mapa" role="application" aria-label="Mapa con la ubicación de la clínica" />
}
