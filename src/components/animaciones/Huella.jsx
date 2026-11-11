/** Huella de mascota en SVG. Toma el color del texto (currentColor) y es solo decorativa. */
export default function Huella({ tamano = 28, className = '', style }) {
  return (
    <svg className={className} style={style} width={tamano} height={tamano} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
      <ellipse cx="32" cy="43" rx="13" ry="10.5" />
      <ellipse cx="13" cy="30" rx="6" ry="8" />
      <ellipse cx="25" cy="17" rx="6" ry="8" />
      <ellipse cx="39" cy="17" rx="6" ry="8" />
      <ellipse cx="51" cy="30" rx="6" ry="8" />
    </svg>
  )
}
