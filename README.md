# Sabor Ecuatoriano — Reto 2 (Full Stack)

Plataforma e-commerce derivada del Reto 1 (carrito de compras), transformada en una solución **cliente-servidor** con API REST, persistencia en **SQL Server** mediante **Prisma ORM**, autenticación **JWT**, roles **admin/user** y frontend **MVC** que consume la API.

## Descripción del sistema

Sistema de pedidos online para gastronomía ecuatoriana. Los visitantes consultan el catálogo público; los usuarios autenticados confirman pedidos que se almacenan en base de datos; los administradores gestionan productos y consultan todos los pedidos.

---

## Arquitectura MVC

### Frontend (`/frontend`)

```
frontend/
├── index.html
├── assets/styles.css
├── models/          → consumo API, auth, carrito (localStorage)
├── views/           → renderizado DOM (catálogo, carrito, admin, pedidos)
└── controllers/     → eventos, flujos, navegación
```

### Backend (`/server`)

```
server/
├── index.js
├── app.js
├── logger.js
├── routes/          → definición de endpoints
├── controllers/     → lógica HTTP
├── models/          → acceso a datos (Prisma)
├── middleware/      → JWT, roles, CORS, validación, errores
└── prisma/          → schema, seed, migraciones
```

---

## Requisitos previos

- **Node.js** 18+
- **SQL Server** (Express o Developer) con una base de datos creada, por ejemplo `SaborEcuatoriano`
- **Live Server** (VS Code/Cursor) u otro servidor estático para el frontend en `http://localhost:5500`

---

## Cómo ejecutar

### 1. Base de datos

Crea la base en SQL Server:

```sql
CREATE DATABASE SaborEcuatoriano;
```

### 2. Backend

```bash
cd server
copy .env.example .env
# Edita .env con tu DATABASE_URL, JWT_SECRET y CORS_ORIGIN

npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

El API quedará en `http://localhost:3000`.

### 3. Frontend

Abre la carpeta `frontend/` con **Live Server** (puerto 5500 por defecto).

Asegúrate de que `CORS_ORIGIN` en `.env` coincida con la URL del frontend.

---

## Usuarios de prueba (seed)

| Rol   | Email                        | Contraseña  |
|-------|------------------------------|-------------|
| admin | admin@saborecuatoriano.ec    | Admin123!   |
| user  | user@saborecuatoriano.ec     | User12345   |

---

## Endpoints y roles

| Método | Endpoint | Auth | Rol |
|--------|----------|------|-----|
| POST | `/api/auth/register` | No | — |
| POST | `/api/auth/login` | No | — |
| GET | `/api/auth/me` | JWT | user/admin |
| GET | `/api/productos` | No | — |
| GET | `/api/productos/:id` | No | — |
| POST | `/api/productos` | JWT | **admin** |
| PUT | `/api/productos/:id` | JWT | **admin** |
| DELETE | `/api/productos/:id` | JWT | **admin** |
| POST | `/api/pedidos` | JWT | user/admin |
| GET | `/api/pedidos/mis-pedidos` | JWT | user/admin |
| GET | `/api/pedidos` | JWT | **admin** |
| GET | `/api/health` | No | — |

### Ejemplos probados

**Login admin:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{"email":"admin@saborecuatoriano.ec","password":"Admin123!"}
```

**Crear producto (admin):**
```http
POST http://localhost:3000/api/productos
Authorization: Bearer <token_admin>
Content-Type: application/json

{"nombre":"Fanesca","precio":9.5,"stock":20,"categoria":"Sopas"}
```

**User intenta crear producto → 403 Forbidden**

**Confirmar pedido:**
```http
POST http://localhost:3000/api/pedidos
Authorization: Bearer <token_user>
Content-Type: application/json

{"items":[{"productoId":1,"cantidad":2,"precioUnitario":8.5}]}
```

---

## Medidas de seguridad (OWASP)

### 1. Broken Access Control (A01)
- **Riesgo:** Usuarios sin rol admin podrían crear/editar productos o ver todos los pedidos.
- **Mitigación:** Middleware `authenticate` + `authorize('admin')` en rutas sensibles. El frontend oculta el panel admin si `role !== 'admin'`.

### 2. Cryptographic Failures (A02)
- **Riesgo:** Contraseñas o tokens expuestos.
- **Mitigación:** Contraseñas con **bcrypt** (12 rounds). JWT firmado con `JWT_SECRET`. Nunca se devuelve `passwordHash` al cliente.

### 3. Injection (A03)
- **Riesgo:** Entradas maliciosas en formularios o parámetros.
- **Mitigación:** **express-validator** en body/params. **Prisma** usa consultas parametrizadas (sin SQL crudo). Sanitización con `.trim()`, `.escape()`, `.normalizeEmail()`.

### Otras medidas
- **CORS** restringido a `CORS_ORIGIN` (no `*`).
- **Error handler** centralizado sin exponer stack trace en producción.
- `app.disable('x-powered-by')`.
- Validación de stock en transacción al crear pedidos.

---

## Pruebas mínimas (checklist)

- [ ] Login admin → obtiene token JWT
- [ ] Crear producto como admin → 201
- [ ] Login user → POST producto → **403**
- [ ] Catálogo visible en frontend (GET público)
- [ ] Carrito agrega/quita y persiste en localStorage
- [ ] Confirmar pedido (user logueado) → registro en BD
- [ ] Admin ve todos los pedidos en panel

---

## Entrega

Comprimir el proyecto como:

`Reto2_Apellido_Nombre.zip`

Incluir: `frontend/`, `server/`, `prisma/`, `.env.example` (sin `.env` real).
