# Backend Node.js - Gestión de Inventario Automotriz

## Descripción

Sistema backend para la gestión de inventario automotriz con autenticación robusta, MFA, protección anti-brute force, auditoría y logging. Utiliza Node.js, Express y SQL Server.

## Características

- Autenticación con cifrado de contraseña y JWT
- Multi-Factor Authentication (MFA)
- Protección anti-brute force (Exponential Backoff)
- Sistema de auditoría y logging
- Roles: Visitante, Administrador, Super-administrador
- CRUD de inventario automotriz (con soft delete)
- Dashboard de métricas y logs

## Instalación

1. Clona el repositorio
2. Instala dependencias con `npm install`
3. Configura la conexión a SQL Server en el archivo `.env`
4. Ejecuta el servidor con `npm start`

## Estructura Base

- `/src` Código fuente principal
- `/src/models` Modelos de datos
- `/src/routes` Endpoints
- `/src/controllers` Lógica de negocio
- `/src/middleware` Seguridad y logging

## Endpoints principales

### Autenticación y MFA

**POST /auth/login**

> Login con usuario y contraseña. Si el usuario tiene MFA, responde `{ mfaRequired: true, userId }`.

```
{
	"username": "admin1",
	"password": "prueba123"
}
```

**POST /auth/login/mfa**

> Segundo paso de login. Envía el código generado por Google Authenticator.

```
{
	"userId": 2,
	"token": "123456"
}
```

### Inventario de vehículos

**GET /vehicles**

> Consulta pública de vehículos (no requiere autenticación).

**POST /vehicles**

> Crear vehículo (requiere token JWT de administrador o super-administrador).

```
{
	"marca": "Nissan",
	"modelo": "Sentra",
	"anio": 2021,
	"precio": 190000.00
}
```

**PUT /vehicles/:id**

> Actualizar vehículo (requiere token JWT de administrador o super-administrador).

```
{
	"marca": "Nissan",
	"modelo": "Sentra",
	"anio": 2022,
	"precio": 200000.00
}
```

**DELETE /vehicles/:id**

> Eliminar vehículo (soft delete, requiere token JWT de administrador o super-administrador).

### Usuarios (solo super-administrador)

**GET /users**

> Listar usuarios.

**POST /users**

> Crear usuario.

```
{
	"username": "nuevo_usuario",
	"password": "nueva_contraseña",
	"role": "visitante"
}
```

**PUT /users/:id**

> Actualizar usuario.

**DELETE /users/:id**

> Eliminar usuario (soft delete).

### Auditoría y métricas

**GET /logs**

> Ver todos los logs y métricas (solo super-administrador).

## Flujo de autenticación y uso en frontend

1. El usuario ingresa usuario y contraseña en el frontend.
2. El frontend envía los datos a `/auth/login`.
3. Si la respuesta es `{ mfaRequired: true, userId }`, solicita el código MFA al usuario y lo envía a `/auth/login/mfa`.
4. Si la autenticación es exitosa, el backend responde con un token JWT.
5. El frontend guarda el token JWT y lo envía en el header `Authorization: Bearer TOKEN` para acceder a los endpoints protegidos.
6. Los endpoints de inventario y usuarios requieren el token JWT y el rol adecuado.
7. El super-administrador puede consultar logs y métricas en `/logs`.

## Notas

- El backend implementa protección anti-brute force en el login.
- Todos los cambios y accesos relevantes quedan registrados en la tabla `Logs`.
- Para MFA, el usuario debe tener el campo `mfaSecret` configurado y usar Google Authenticator.

# Frontend Next.js - Gestión de Inventario Automotriz

Aplicación **frontend** para consumir el backend de inventario automotriz. Incluye login con **JWT + MFA**, control de roles y CRUD de vehículos.

---

## 🚀 Stack

- Next.js 14+
- React 18
- TypeScript
- Tailwind CSS
- Axios (API calls)
- Zustand o Context API (estado global)

---

## 📦 Scripts

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm start        # servir build
```

---

## 🔧 Variables de entorno

Archivo `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

---

## 🗂️ Estructura básica

```
src/
 ├─ app/          # rutas Next.js (login, mfa, dashboard, vehicles, users)
 ├─ components/   # UI reutilizable
 ├─ lib/          # api.ts, guards, helpers
 ├─ store/        # auth store
 └─ styles/       # Tailwind
```

---

## 🔒 Flujo de autenticación

1. Usuario ingresa credenciales en `/login`.
2. Si requiere MFA → redirige a `/mfa`.
3. Al validar, se guarda el **JWT** en `sessionStorage`.
4. Axios añade `Authorization: Bearer TOKEN` en cada request.
5. Guardas de rol controlan acceso (visitante, admin, super).

---

## 🧩 Ejemplo de cliente API (`src/lib/api.ts`)

```ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 🚗 Ejemplo de página protegida

```tsx
"use client";
import { RequireAuth } from "@/lib/guards";

export default function VehiclesPage() {
  return (
    <RequireAuth role="visitante">
      <h1>Listado de Vehículos</h1>
    </RequireAuth>
  );
}
```

---

## ✅ Notas

- Usa **Zod + React Hook Form** para validación.
- Navbar muestra rol y permite logout.
- Roles:
  - Visitante → solo lectura
  - Admin → CRUD vehículos
  - Super → usuarios y logs
