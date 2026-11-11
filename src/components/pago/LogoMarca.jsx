import { MARCAS } from '../../utils/tarjeta.js'

/**
 * Logo dibujado con CSS de la marca de la tarjeta (sin imágenes externas).
 * decorativo: cuando el nombre de la marca ya está escrito al lado, el logo se oculta a los lectores de pantalla.
 */
export default function LogoMarca({ marca, className = '', decorativo = false }) {
  const nombre = MARCAS[marca]?.nombre ?? 'Tarjeta'
  const clase = `logo-marca ${className}`
  const accesible = decorativo ? { 'aria-hidden': true } : { role: 'img', 'aria-label': nombre }
  if (marca === 'MASTERCARD') {
    return (
      <span className={`${clase} logo-marca--mc`} {...accesible}>
        <span />
        <span />
      </span>
    )
  }
  if (marca === 'VISA') return <span className={`${clase} logo-marca--visa`} {...accesible}>VISA</span>
  if (marca === 'AMEX') return <span className={`${clase} logo-marca--amex`} {...accesible}>AMEX</span>
  if (marca === 'DINERS') return <span className={`${clase} logo-marca--diners`} {...accesible}>Diners Club</span>
  return <span className={`${clase} logo-marca--generica`} {...accesible}>💳</span>
}
