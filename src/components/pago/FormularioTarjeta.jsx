import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { detectarMarca, formatearNumero, formatearVencimiento, MARCAS, soloDigitos } from '../../utils/tarjeta.js'

/**
 * Campos de una tarjeta. Es controlado: el componente padre guarda los valores y los errores.
 * Da formato mientras se escribe (grupos de 4 dígitos, MM/AA) y avisa cuándo se edita el CVV
 * para que la vista previa gire y muestre el reverso.
 */
export default function FormularioTarjeta({ valores, onCambiar, errores = {}, pedirCvv = true, onEditandoCvv = () => {}, prefijo = 'tarjeta' }) {
  const marca = detectarMarca(valores.numero)
  const largoCvv = MARCAS[marca]?.cvv ?? 4

  const campo = (nombre) => ({
    id: `${prefijo}-${nombre}`,
    className: 'campo',
    isInvalid: Boolean(errores[nombre]),
    'aria-describedby': errores[nombre] ? `${prefijo}-${nombre}-error` : undefined,
  })
  const error = (nombre) =>
    errores[nombre] && (
      <Form.Control.Feedback type="invalid" id={`${prefijo}-${nombre}-error`}>
        {errores[nombre]}
      </Form.Control.Feedback>
    )

  return (
    <div className="d-grid gap-3">
      <div>
        <Form.Label htmlFor={`${prefijo}-numero`} className="etiqueta-campo">Número de la tarjeta</Form.Label>
        <Form.Control
          {...campo('numero')}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          value={valores.numero}
          onChange={(e) => onCambiar('numero', formatearNumero(e.target.value))}
        />
        {error('numero')}
      </div>

      <div>
        <Form.Label htmlFor={`${prefijo}-titular`} className="etiqueta-campo">Nombre del titular</Form.Label>
        <Form.Control
          {...campo('titular')}
          autoComplete="cc-name"
          placeholder="Como aparece en la tarjeta"
          value={valores.titular}
          onChange={(e) => onCambiar('titular', e.target.value.slice(0, 26))}
        />
        {error('titular')}
      </div>

      <Row className="g-3">
        <Col xs={pedirCvv ? 6 : 12}>
          <Form.Label htmlFor={`${prefijo}-vencimiento`} className="etiqueta-campo">Vencimiento (MM/AA)</Form.Label>
          <Form.Control
            {...campo('vencimiento')}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={valores.vencimiento}
            onChange={(e) => onCambiar('vencimiento', formatearVencimiento(e.target.value))}
          />
          {error('vencimiento')}
        </Col>
        {pedirCvv && (
          <Col xs={6}>
            <Form.Label htmlFor={`${prefijo}-cvv`} className="etiqueta-campo">Código de seguridad (CVV)</Form.Label>
            <Form.Control
              {...campo('cvv')}
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder={'•'.repeat(MARCAS[marca]?.cvv ?? 3)}
              value={valores.cvv}
              onFocus={() => onEditandoCvv(true)}
              onBlur={() => onEditandoCvv(false)}
              onChange={(e) => onCambiar('cvv', soloDigitos(e.target.value).slice(0, largoCvv))}
            />
            {error('cvv')}
          </Col>
        )}
      </Row>
    </div>
  )
}
