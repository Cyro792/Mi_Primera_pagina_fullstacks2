// Punto de entrada que se carga con React.lazy: así Bootstrap solo se descarga al entrar al panel
// y no pisa los estilos de la pantalla de login.
import 'bootstrap/dist/css/bootstrap.min.css'
import './admin.css'
export { default } from './AdminDashboard.jsx'
