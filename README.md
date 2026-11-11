# Veterinaria San Marcos — Frontend

Sitio web y sistema de gestión de la Clínica Veterinaria San Marcos (Rancagua), desarrollado en
React para la asignatura DSY1104 Desarrollo Fullstack II (DuocUC). El backend en Spring Boot
vive en un repositorio aparte (`vetsm-backend`).

## Tecnologías

Las mismas que se usan en el curso:

- **React 19 + Vite**
- **React Router** (`react-router-dom`): navegación entre páginas y rutas protegidas por rol
- **Bootstrap 5 + React Bootstrap**: maquetación y componentes
- **Vitest + Testing Library**: pruebas unitarias y de integración
- **Oxlint**: revisión estática del código

Además:

- **Motion** (`motion/react`): animaciones
- **Leaflet**: mapa con la ubicación de la clínica

## Cómo ejecutar

```bash
npm install
npm run dev
```

El sitio queda en <http://localhost:3000>.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila el sitio para producción en `dist/` |
| `npm run preview` | Sirve la versión compilada |
| `npm test` | Ejecuta todas las pruebas |
| `npm run coverage` | Pruebas con reporte de cobertura |
| `npm run lint` | Revisión estática con Oxlint |

## Páginas

| Ruta | Página | Quién puede entrar |
|---|---|---|
| `/` | Inicio: servicios, equipo, mapa y solicitud de cita | Todos |
| `/tienda` | Catálogo de servicios y productos (filtro `?categoria=`) | Todos |
| `/producto/:id` | Detalle de un producto | Todos |
| `/carrito` | Carrito de compras | Todos (comprar requiere ser cliente) |
| `/pago` | Pago con tarjeta nueva o guardada | Solo `CLIENTE` |
| `/mi-cuenta` | Perfil, avatar, tarjetas guardadas y contraseña (`?seccion=perfil\|tarjetas\|seguridad`) | Solo `CLIENTE` |
| `/mis-compras` | Historial de boletas del cliente | Solo `CLIENTE` |
| `/login` | Inicio de sesión y registro | Todos |
| `/admin` | Panel de administración | Solo `ADMIN` |
| `/recepcion` | Panel de recepción (reservas) | `ADMIN` y `RECEPCIONISTA` |

## Estructura

```text
src/
├── components/       Componentes reutilizables (Navbar, Footer, Mapa, ProductoCard, RutaProtegida)
│   ├── admin/        Componentes del panel de administración
│   ├── cuenta/       Secciones de "Mi cuenta" (perfil, tarjetas, seguridad)
│   ├── pago/         Tarjeta animada, formulario de tarjeta y logos de marcas
│   └── animaciones/  Componentes de animación (aparecer, cascada, huellas, confeti, vuelo al carrito)
├── context/          Estado global: sesión (AuthContext) y carrito (CarritoContext)
├── data/             Catálogo local de la tienda
├── pages/            Una página por ruta
├── services/         Acceso a datos: auth, perfil, productos, tarjetas, pagos, boletas y reservas
├── utils/            Funciones puras: carrito, tarjetas, métricas, validaciones y fechas
├── App.jsx           Rutas de la aplicación
└── main.jsx          Punto de entrada
```

## Sesión y permisos

- Al iniciar sesión el rol lo define la cuenta: el usuario no elige su perfil. Cada rol entra a
  su página (`ADMIN` → `/admin`, `RECEPCIONISTA` → `/recepcion`, `CLIENTE` → `/tienda`).
- La sesión se guarda en el navegador, así que **no se pierde al recargar la página**.
- `RutaProtegida` envía al login a quien no tiene sesión (y lo devuelve después a la página que
  quería ver) y muestra "Acceso restringido" a quien no tiene el rol necesario.
- El registro público solo crea cuentas de cliente.

> **Estado actual:** mientras no se conecte el backend, las cuentas, la sesión, el carrito y las
> compras se guardan en el `localStorage` del navegador y el pago es simulado. Los servicios en
> `src/services/` ya son asíncronos, así que al integrar el backend (API REST con JWT) solo cambia
> su contenido.

### Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@sanmarcos.cl` | `Admin123!` |
| Recepcionista | `recepcion@sanmarcos.cl` | `Recep123!` |
| Cliente | `ana.garcia@correo.cl` | `Cliente123!` |

Solo existen en esta versión de demostración; no son credenciales reales.

## Tienda, carrito y pago

- El catálogo tiene servicios de la clínica (sin stock) y productos (con stock).
- El carrito se guarda en el navegador y no permite superar el stock de un producto.
- En `/pago` el cliente elige una tarjeta guardada (solo se le pide el CVV) o ingresa una nueva,
  y puede guardarla en su cuenta. Se valida el número con el algoritmo de Luhn, la marca
  (Visa, Mastercard, American Express, Diners Club), el vencimiento y el largo del CVV.
- Al aprobarse el pago se genera una boleta con su detalle y el medio de pago, visible en "Mis compras".

**El pago es simulado** (`src/services/pagos.js`): no se conecta a ningún banco. Para probar se usan
números de prueba publicados por las marcas, con cualquier vencimiento futuro:

| Número | Resultado |
|---|---|
| `4111 1111 1111 1111` (Visa) | Aprobado |
| `5555 5555 5555 4444` (Mastercard) | Aprobado |
| `3782 822463 10005` (American Express, CVV de 4 dígitos) | Aprobado |
| `4000 0000 0000 0002` | Rechazado por el banco |

### Seguridad de las tarjetas

- **Nunca se guarda el número completo ni el código de seguridad (CVV).** De una tarjeta solo se
  conservan la marca, los últimos 4 dígitos, el titular y el vencimiento (`datosSeguros` en
  `src/utils/tarjeta.js`). Las pruebas verifican que el número completo no quede almacenado.
- El CVV se pide en cada compra y se borra del formulario después de cada intento.
- En producción, el cobro lo haría una pasarela de pago certificada (PCI DSS), que entrega un
  token en vez de los datos de la tarjeta; el backend guardaría solo ese token y los datos seguros.

## Mi cuenta

Sección de personalización para clientes (`/mi-cuenta`):

- **Perfil:** avatar (ícono y color), nombre, celular, región, comuna y dirección de despacho. El
  avatar se ve en la barra de navegación y se actualiza al guardar.
- **Tarjetas:** agregar tarjetas (sin pedir el CVV), elegir la predeterminada y eliminarlas.
- **Seguridad:** cambiar la contraseña, confirmando la actual.

## Animaciones

- Título de la portada que aparece palabra por palabra, foto con efecto parallax y huellas flotando.
- Secciones y tarjetas que aparecen al hacer scroll, en cascada.
- Contadores que suben desde cero y un rastro de huellas que "camina" entre secciones.
- Barra de progreso de lectura en la parte superior.
- El producto "vuela" en arco hasta el ícono del carrito al agregarlo.
- Confeti de huellas y huesitos al completar una compra.
- Tarjeta de pago en 3D que se inclina con el mouse, cambia de color según la marca, muestra
  cada dígito al escribirlo y gira para mostrar el reverso al escribir el CVV.
- El formulario de pago "se sacude" si hay un error; pantalla de "procesando pago".
- Avatar que rebota al cambiarlo y menú de la cuenta con un indicador que se desliza.
- Transición suave entre páginas.

Quien tiene activada la opción "reducir movimiento" en su sistema no ve las animaciones decorativas.
