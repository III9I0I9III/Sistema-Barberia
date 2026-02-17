# Barbados Barber Shop - Backend API

## Instalación

### 1. Requisitos previos
- PHP 7.4+
- MySQL 5.7+ o MariaDB
- Apache o Nginx
- Composer (opcional)

### 2. Configurar la base de datos

1. Inicia MySQL/MariaDB
2. Ejecuta el script SQL para crear la base de datos:
```bash
mysql -u root -p < database.sql
```

O ejecútalo manualmente desde tu gestor de base de datos (phpMyAdmin, MySQL Workbench, etc.)

### 3. Configurar la conexión a la base de datos

Edita el archivo `config/database.php` y actualiza las credenciales:

```php
private $host = 'localhost';
private $db_name = 'barbados_db';
private $username = 'tu_usuario';
private $password = 'tu_contraseña';
```

### 4. Configurar el servidor web

#### Opción A: Apache
1. Coloca la carpeta `backend` en el directorio web (ej: `htdocs` en XAMPP)
2. Asegúrate de que `mod_rewrite` esté habilitado
3. El archivo `.htaccess` ya está configurado

#### Opción B: PHP Built-in Server (para desarrollo)
```bash
cd backend/api
php -S localhost:8000
```

### 5. Configurar el frontend

Edita `src/services/api.ts` y actualiza la URL base:
```typescript
const API_BASE_URL = 'http://localhost/backend/api'; // o tu URL
```

## Estructura de la API

### Autenticación
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión

### Servicios
- `GET /services` - Obtener todos los servicios
- `POST /services` - Crear servicio (admin)

### Productos
- `GET /products` - Obtener todos los productos
- `POST /products` - Crear producto (admin)

### Barberos
- `GET /barbers` - Obtener todos los barberos

### Usuarios
- `GET /profile` - Obtener perfil del usuario
- `PUT /profile` - Actualizar perfil
- `POST /change-password` - Cambiar contraseña
- `DELETE /delete-account` - Eliminar cuenta
- `GET /users` - Obtener todos los usuarios (admin)

### Reservas
- `GET /bookings` - Obtener reservas
- `POST /bookings` - Crear reserva
- `PUT /bookings/:id` - Actualizar reserva
- `DELETE /bookings/:id` - Eliminar reserva

### Chat
- `GET /messages` - Obtener mensajes
- `GET /messages?receiver_id=:id` - Obtener conversación
- `POST /messages` - Enviar mensaje

### Estadísticas
- `GET /stats` - Obtener estadísticas (admin)

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@test.com | 123456 |
| Barbero | barbero1@test.com | 123456 |
| Barbero | barbero2@test.com | 123456 |
| Cliente | cliente@test.com | 123456 |
| Cliente | cliente2@test.com | 123456 |

## Seguridad

- Todas las rutas protegidas requieren token JWT en el header `Authorization: Bearer <token>`
- Las contraseñas se almacenan hasheadas con password_hash()
- CORS configurado para permitir solicitudes desde el frontend
