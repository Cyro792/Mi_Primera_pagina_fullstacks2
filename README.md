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

El frontend necesita el backend (`vetsm-backend`), que son cuatro microservicios detrás de un API
Gateway. Primero se levanta el backend con Docker (`docker compose up --build`, ver su README) y
después:

```bash
npm install
npm run dev
```

El sitio queda en <http://localhost:3000>. En desarrollo, Vite redirige las llamadas a `/api` al
gateway en el puerto 8080 (proxy en `vite.config.js`): así el navegador ve un solo sitio, no hay
problemas de CORS y la cookie de la sesión funciona igual que en producción. Si el gateway corre en
otra dirección, se indica con la variable `VITE_PROXY_API`.

**Sin Docker:** si los cuatro microservicios se levantan directo con `java -jar` (puertos 8081 a
8084), se usa `npm run dev:sin-docker`. En ese modo Vite hace de gateway: reparte cada ruta al
servicio que corresponde, con la misma tabla que usa Nginx.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run dev:sin-docker` | Servidor de desarrollo con el backend corriendo sin Docker |
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
├── data/             Ícono y color de cada producto (presentación del catálogo)
├── pages/            Una página por ruta
├── services/         Llamadas a la API REST: cliente HTTP (api.js), auth, perfil, productos,
│                     tarjetas, boletas, citas y administración
├── test/             API falsa en memoria para las pruebas
├── utils/            Funciones puras: carrito, tarjetas, métricas, validaciones y fechas
├── App.jsx           Rutas de la aplicación
└── main.jsx          Punto de entrada
```

## Integración con el backend

Todos los datos vienen de la API REST del backend (`/api/v1`, documentada en Swagger). Las
llamadas se hacen con `fetch` desde `src/services/`; cada archivo corresponde a un recurso:

| Servicio | Endpoints | Usado en |
|---|---|---|
| `auth.js` | `POST /auth/login`, `/auth/registro`, `/auth/refresh`, `/auth/logout`, `PUT /perfil/password` | Login, registro, sesión, cambio de contraseña |
| `perfil.js` | `PUT /perfil` | Mi cuenta → Perfil |
| `productos.js` | `GET /categorias`, `GET/POST/PUT/DELETE /productos` | Tienda, detalle, panel de administración |
| `tarjetas.js` | `GET/POST /tarjetas`, `PATCH /tarjetas/{id}/predeterminada`, `DELETE /tarjetas/{id}` | Pago, Mi cuenta → Tarjetas |
| `boletas.js` | `POST /boletas`, `GET /boletas/mias` | Pago, Mis compras |
| `citas.js` | `POST/GET /citas`, `PUT /citas/{id}`, `PATCH /citas/{id}/estado`, `DELETE /citas/{id}` | Formulario de cita, paneles |
| `admin.js` | `GET /reportes/citas`, `/reportes/ventas`, `/reportes/usuarios` y `/reportes/inventario` (uno por microservicio), `GET/POST /usuarios`, `PATCH /usuarios/{id}/activo` | Panel de administración |

`src/services/api.js` es el cliente HTTP común: agrega el token, convierte los errores del backend
(`{ status, mensaje, errores }`) en `ApiError` para mostrarlos en pantalla (los errores por campo
aparecen bajo cada campo del formulario) y renueva la sesión cuando el token vence.

## Sesión y permisos

- Al iniciar sesión el rol lo define la cuenta: el usuario no elige su perfil. Cada rol entra a
  su página (`ADMIN` → `/admin`, `RECEPCIONISTA` → `/recepcion`, `CLIENTE` → `/tienda`).
- La sesión usa **JWT** (Spring Security en el backend):
  - El **token de acceso** dura 15 minutos y se guarda **solo en memoria** (no en `localStorage`),
    así un script malicioso no lo puede leer. Viaja en la cabecera `Authorization: Bearer ...`.
  - El **token de renovación** lo guarda el navegador en una cookie `HttpOnly` que JavaScript no puede
    leer. Al recargar la página, la aplicación pide `POST /auth/refresh` y recupera la sesión: por
    eso **la sesión no se pierde al recargar**.
  - Si una petición responde 401 porque el token venció, se renueva y se repite sola. Si varias
    peticiones vencen a la vez, se hace una sola renovación (cada cookie sirve una vez).
  - En el navegador solo queda la marca `sanmarcos_sesion_abierta` (sin datos sensibles), que
    además sincroniza el cierre de sesión entre pestañas.
- `RutaProtegida` envía al login a quien no tiene sesión (y lo devuelve después a la página que
  quería ver, si su rol puede verla) y muestra "Acceso restringido" a quien no tiene el rol necesario.
  Es solo la protección visual: **la API revisa el rol en cada petición**.
- El registro público solo crea cuentas de cliente (el backend no acepta un rol en el registro).

### Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@sanmarcos.cl` | `Admin123!` |
| Recepcionista | `recepcion@sanmarcos.cl` | `Recep123!` |
| Cliente | `ana.garcia@correo.cl` | `Cliente123!` |

Las crea el backend al iniciar con el perfil de desarrollo; no son credenciales reales.

## Tienda, carrito y pago

- El catálogo tiene servicios de la clínica (sin stock) y productos (con stock).
- El carrito se guarda en el navegador (no se pierde al recargar) y no permite superar el stock.
- Al pagar se envían solo los productos y las cantidades: el servidor toma los precios de la base de
  datos, descuenta el stock y toma el cliente del token, así nadie puede cambiar lo que paga.
- En `/pago` el cliente elige una tarjeta guardada (solo se le pide el CVV) o ingresa una nueva,
  y puede guardarla en su cuenta. Se valida el número con el algoritmo de Luhn, la marca
  (Visa, Mastercard, American Express, Diners Club), el vencimiento y el largo del CVV.
- Al aprobarse el pago se genera una boleta con su detalle y el medio de pago, visible en "Mis compras".

**El pago es simulado** (en el backend, `PagoService`): no se conecta a ningún banco. Para probar se usan
números de prueba publicados por las marcas, con cualquier vencimiento futuro:

| Número | Resultado |
|---|---|
| `4111 1111 1111 1111` (Visa) | Aprobado |
| `5555 5555 5555 4444` (Mastercard) | Aprobado |
| `3782 822463 10005` (American Express, CVV de 4 dígitos) | Aprobado |
| `4000 0000 0000 0002` | Rechazado por el banco |

### Seguridad de las tarjetas

- **Nunca se guarda el número completo ni el código de seguridad (CVV).** De una tarjeta solo se
  conservan la marca, los últimos 4 dígitos, el titular y el vencimiento. El frontend valida la
  tarjeta antes de enviarla y el backend la vuelve a validar.
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

## Pruebas

`npm test` ejecuta las pruebas con Vitest y Testing Library. Para no depender del servidor, las
pruebas usan una **API falsa** (`src/test/apiFalsa.js`) que reemplaza `fetch` y responde como el
backend: los mismos datos iniciales, las reglas principales (roles, stock, transiciones de las citas,
tarjeta rechazada) y el mismo formato de error. Así cada prueba recorre el código real de las
páginas, los contextos y los servicios.
