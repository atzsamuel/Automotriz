# Sistema de Gestión de Inventario Automotriz

## 📋 Índice
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Instalación y Configuración](#instalación-y-configuración)
- [Base de Datos](#base-de-datos)
- [API Endpoints](#api-endpoints)
- [Seguridad y Autenticación](#seguridad-y-autenticación)
- [Modelos de Datos](#modelos-de-datos)
- [Middleware](#middleware)
- [Roles de Usuario](#roles-de-usuario)
- [Logging y Auditoría](#logging-y-auditoría)
- [Uso de la API](#uso-de-la-api)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Descripción del Proyecto

**Sistema de Gestión de Inventario Automotriz** es una aplicación backend robusta desarrollada en Node.js para la gestión integral de inventarios de vehículos. El sistema incluye funcionalidades avanzadas de seguridad como autenticación multi-factor (MFA), protección anti-brute force, sistema de roles granular y auditoría completa de todas las operaciones.

### Características Principales

✅ **Gestión de Inventario de Vehículos**
- CRUD completo de vehículos (Crear, Leer, Actualizar, Eliminar)
- Consultas públicas de inventario
- Eliminación lógica (soft delete) para mantener integridad de datos

✅ **Sistema de Autenticación Robusto**
- Autenticación JWT con tokens de corta duración (2 minutos)
- Autenticación multi-factor (MFA) usando TOTP
- Protección anti-brute force con algoritmo exponential backoff
- Hasheo seguro de contraseñas con bcrypt

✅ **Sistema de Roles Granular**
- **Visitante**: Solo lectura de vehículos
- **Administrador**: CRUD completo de vehículos
- **Super-administrador**: Acceso total + gestión de usuarios + auditoría

✅ **Auditoría y Logging Completo**
- Registro detallado de todas las operaciones
- Tracking de IPs, endpoints, acciones y resultados
- Dashboard de logs para super-administradores

✅ **Seguridad Avanzada**
- Validación de tokens JWT
- Middleware de autorización por roles
- Protección contra ataques de fuerza bruta
- Logs de seguridad para análisis forense

## Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **SQL Server** - Base de datos relacional
- **mssql** - Driver para SQL Server

### Seguridad
- **jsonwebtoken** - Manejo de JWT tokens
- **bcrypt** - Hasheo de contraseñas
- **speakeasy** - Autenticación multi-factor (TOTP)

### Desarrollo
- **nodemon** - Hot reload durante desarrollo
- **dotenv** - Manejo de variables de entorno

## Arquitectura del Sistema

```
backend/
├── src/
│   ├── index.js              # Punto de entrada de la aplicación
│   ├── models/               # Modelos de datos
│   │   ├── db.js            # Configuración de base de datos
│   │   ├── User.js          # Modelo de usuario
│   │   ├── Vehicle.js       # Modelo de vehículo
│   │   └── Log.js           # Modelo de logs
│   ├── routes/              # Definición de rutas API
│   │   ├── auth.js          # Endpoints de autenticación
│   │   ├── users.js         # CRUD de usuarios
│   │   ├── vehicles.js      # CRUD de vehículos
│   │   └── logs.js          # Consulta de logs
│   └── middleware/          # Middleware personalizado
│       ├── auth.js          # Autenticación JWT
│       ├── roles.js         # Autorización por roles
│       ├── logging.js       # Sistema de logs
│       └── backoff.js       # Protección anti-brute force
├── package.json             # Dependencias y scripts
└── README.md               # Documentación del backend
db/
└── scriptinit.sql          # Script de inicialización de BD
```

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- SQL Server
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd Automotriz
```

2. **Instalar dependencias**
```bash
cd backend
npm install
```

3. **Configurar variables de entorno**
Crear un archivo `.env` en la carpeta `backend/` con las siguientes variables:
```env
# Configuración del servidor
PORT=3000

# Configuración de SQL Server
SQL_SERVER_USER=tu_usuario
SQL_SERVER_PASSWORD=tu_contraseña
SQL_SERVER_DATABASE=nombre_base_datos
SQL_SERVER_SERVER=localhost
SQL_SERVER_PORT=1433

# Secreto JWT (generar uno seguro)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
```

4. **Configurar la base de datos**
```bash
# Ejecutar el script de inicialización en SQL Server
sqlcmd -S localhost -d tu_base_datos -i db/scriptinit.sql
```

5. **Ejecutar la aplicación**
```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Base de Datos

### Esquema de la Base de Datos

#### Tabla `Users`
```sql
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    passwordHash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL, -- visitante, administrador, super-administrador
    mfaSecret NVARCHAR(255),
    deleted BIT DEFAULT 0
);
```

#### Tabla `Vehicles`
```sql
CREATE TABLE Vehicles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    marca NVARCHAR(50) NOT NULL,
    modelo NVARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    precio DECIMAL(18,2) NOT NULL,
    deleted BIT DEFAULT 0
);
```

#### Tabla `Logs`
```sql
CREATE TABLE Logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NULL,
    ip NVARCHAR(50),
    endpoint NVARCHAR(100),
    action NVARCHAR(50),
    success BIT,
    timestamp DATETIME DEFAULT GETDATE()
);
```

### Datos de Prueba
El sistema incluye usuarios predeterminados para testing:
- **visitante1** / **123456** (Rol: visitante)
- **admin1** / **123456** (Rol: administrador)
- **superadmin1** / **123456** (Rol: super-administrador, con MFA habilitado)

## API Endpoints

### 🔐 Autenticación (`/auth`)

#### `POST /auth/login`
Primer paso del proceso de autenticación
```json
{
  "username": "admin1",
  "password": "123456"
}
```

**Respuestas:**
- **Sin MFA**: `{ "token": "jwt_token" }`
- **Con MFA**: `{ "mfaRequired": true, "userId": 1 }`

#### `POST /auth/login/mfa`
Segundo paso para usuarios con MFA habilitado
```json
{
  "userId": 1,
  "token": "123456"
}
```

**Respuesta:** `{ "token": "jwt_token" }`

### 🚗 Vehículos (`/vehicles`)

#### `GET /vehicles` (Público)
Obtener lista completa de vehículos disponibles

#### `POST /vehicles` (Admin/Super-admin)
Crear nuevo vehículo
```json
{
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2024,
  "precio": 200000.00
}
```

#### `PUT /vehicles/:id` (Admin/Super-admin)
Actualizar vehículo existente
```json
{
  "marca": "Honda",
  "modelo": "Civic",
  "anio": 2024,
  "precio": 210000.00
}
```

#### `DELETE /vehicles/:id` (Admin/Super-admin)
Eliminar vehículo (eliminación lógica)

### 👥 Usuarios (`/users`) (Solo Super-admin)

#### `GET /users`
Listar todos los usuarios

#### `POST /users`
Crear nuevo usuario

#### `PUT /users/:id`
Actualizar usuario existente

#### `DELETE /users/:id`
Eliminar usuario (eliminación lógica)

### 📊 Logs (`/logs`) (Solo Super-admin)

#### `GET /logs`
Obtener todos los logs de auditoría del sistema

## Seguridad y Autenticación

### Sistema JWT
- **Duración**: 2 minutos (tokens de corta duración para mayor seguridad)
- **Header**: `Authorization: Bearer <token>`
- **Payload**: Incluye `id` y `role` del usuario

### Autenticación Multi-Factor (MFA)
- **Algoritmo**: TOTP (Time-based One-Time Password)
- **Aplicaciones compatibles**: Google Authenticator, Authy
- **Secreto**: `JJVX2ZBWHYQXKYSWNVIFAMCUMV4HIKLQ` (usuario de prueba)

### Protección Anti-Brute Force
- **Algoritmo**: Exponential Backoff
- **Límite**: 5 intentos por minuto por IP
- **Tiempo de espera**: 2^n segundos (donde n = número de intentos)

### Logging de Seguridad
Todas las operaciones críticas se registran con:
- ID del usuario
- Dirección IP
- Endpoint accedido
- Acción realizada
- Resultado (éxito/fallo)
- Timestamp

## Modelos de Datos

### User (Usuario)
```javascript
class User {
  constructor({ id, username, passwordHash, role, mfaSecret, deleted }) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = role; // visitante, administrador, super-administrador
    this.mfaSecret = mfaSecret;
    this.deleted = deleted || false;
  }
}
```

### Vehicle (Vehículo)
```javascript
class Vehicle {
  constructor({ id, marca, modelo, anio, precio, deleted }) {
    this.id = id;
    this.marca = marca;
    this.modelo = modelo;
    this.anio = anio;
    this.precio = precio;
    this.deleted = deleted || false;
  }
}
```

### Log (Registro de Auditoría)
```javascript
class Log {
  constructor({ id, userId, ip, endpoint, action, success, timestamp }) {
    this.id = id;
    this.userId = userId;
    this.ip = ip;
    this.endpoint = endpoint;
    this.action = action;
    this.success = success;
    this.timestamp = timestamp || new Date();
  }
}
```

## Middleware

### `authenticateToken`
- **Propósito**: Validar tokens JWT
- **Uso**: Proteger rutas que requieren autenticación
- **Header requerido**: `Authorization: Bearer <token>`

### `authorizeRoles(...roles)`
- **Propósito**: Validar que el usuario tenga permisos suficientes
- **Parámetros**: Lista de roles permitidos
- **Ejemplo**: `authorizeRoles('administrador', 'super-administrador')`

### `logEvent`
- **Propósito**: Registrar eventos del sistema para auditoría
- **Parámetros**: `{ userId, ip, endpoint, action, success }`
- **Almacenamiento**: Base de datos SQL Server

### `exponentialBackoff`
- **Propósito**: Protección contra ataques de fuerza bruta
- **Límite**: 5 intentos por minuto por IP
- **Algoritmo**: Tiempo de espera = 2^intentos segundos

## Roles de Usuario

### 🟢 Visitante
- **Permisos**: Solo lectura
- **Endpoints accesibles**:
  - `GET /vehicles` - Ver inventario de vehículos

### 🟡 Administrador
- **Permisos**: Gestión completa de vehículos
- **Endpoints accesibles**:
  - `GET /vehicles` - Ver inventario
  - `POST /vehicles` - Crear vehículo
  - `PUT /vehicles/:id` - Actualizar vehículo
  - `DELETE /vehicles/:id` - Eliminar vehículo

### 🔴 Super-administrador
- **Permisos**: Acceso total al sistema
- **Endpoints accesibles**:
  - Todos los endpoints de Administrador
  - `GET /users` - Listar usuarios
  - `POST /users` - Crear usuario
  - `PUT /users/:id` - Actualizar usuario
  - `DELETE /users/:id` - Eliminar usuario
  - `GET /logs` - Ver logs de auditoría

## Logging y Auditoría

El sistema registra automáticamente:

### Eventos de Autenticación
- Intentos de login (exitosos y fallidos)
- Validaciones MFA
- Expiración de tokens

### Operaciones CRUD
- Creación de vehículos
- Actualizaciones de datos
- Eliminaciones lógicas

### Información de Contexto
- Dirección IP del usuario
- Timestamp preciso
- Endpoint accedido
- Resultado de la operación

## Uso de la API

### Ejemplo: Flujo de Autenticación Completo

```bash
# 1. Login inicial
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin1", "password": "123456"}'

# Respuesta: {"mfaRequired": true, "userId": 3}

# 2. Completar MFA (obtener código de Google Authenticator)
curl -X POST http://localhost:3000/auth/login/mfa \
  -H "Content-Type: application/json" \
  -d '{"userId": 3, "token": "123456"}'

# Respuesta: {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### Ejemplo: Operaciones con Vehículos

```bash
# Ver inventario (público)
curl http://localhost:3000/vehicles

# Crear vehículo (requiere autenticación)
curl -X POST http://localhost:3000/vehicles \
  -H "Authorization: Bearer <tu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "BMW",
    "modelo": "X5",
    "anio": 2024,
    "precio": 800000.00
  }'

# Actualizar vehículo
curl -X PUT http://localhost:3000/vehicles/1 \
  -H "Authorization: Bearer <tu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "BMW",
    "modelo": "X5",
    "anio": 2024,
    "precio": 850000.00
  }'

# Eliminar vehículo
curl -X DELETE http://localhost:3000/vehicles/1 \
  -H "Authorization: Bearer <tu_token>"
```

### Ejemplo: Ver Logs de Auditoría

```bash
# Ver todos los logs (solo super-admin)
curl http://localhost:3000/logs \
  -H "Authorization: Bearer <tu_token>"
```

## Códigos de Estado HTTP

- **200** - Operación exitosa
- **201** - Recurso creado exitosamente
- **400** - Datos de entrada inválidos
- **401** - No autenticado / Token inválido
- **403** - Sin permisos suficientes
- **404** - Recurso no encontrado
- **429** - Demasiados intentos (rate limiting)
- **500** - Error interno del servidor

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

### Estándares de Código
- Usar ES6+ features
- Mantener consistencia en el estilo de código
- Incluir comentarios descriptivos
- Seguir el patrón de arquitectura existente

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🛡️ Consideraciones de Seguridad

- **Cambiar secretos por defecto**: Generar nuevos JWT_SECRET y mfaSecret en producción
- **HTTPS obligatorio**: Usar certificados SSL/TLS en producción
- **Configurar CORS**: Restringir orígenes permitidos
- **Rate limiting global**: Implementar límites adicionales por endpoint
- **Monitoreo**: Configurar alertas para actividades sospechosas
- **Backup de logs**: Implementar respaldo automático de logs de auditoría

## 📞 Soporte

Para soporte técnico o preguntas sobre el sistema:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

*Desarrollado para gestión profesional de inventarios automotrices con los más altos estándares de seguridad.*