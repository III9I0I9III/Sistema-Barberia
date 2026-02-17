-- Script de migración inicial para PostgreSQL
-- Crea el esquema completo para la aplicación Barbados Barber Shop.

-- Habilitar extensión para funciones de criptografía, útil para generar UUIDs si se necesitara.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Creación de Tipos ENUM personalizados para roles y estados.
-- Esto asegura la integridad de los datos en las columnas correspondientes.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('client', 'barber', 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'completed');
  END IF;
END $$;

-- Tabla de Usuarios (users)
-- Almacena la información de todos los participantes del sistema.
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'client',
  avatar VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Función de Trigger para actualizar automáticamente el campo `updated_at`
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asignar el Trigger a la tabla de usuarios
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Tabla de Barberos (barbers)
-- Contiene detalles específicos de los usuarios que tienen el rol de barbero.
CREATE TABLE IF NOT EXISTS barbers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  specialty VARCHAR(100),
  bio TEXT,
  working_hours JSONB, -- JSONB es más eficiente que JSON en PostgreSQL
  CONSTRAINT fk_barbers_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Servicios (services)
-- Catálogo de los servicios ofrecidos por la barbería.
CREATE TABLE IF NOT EXISTS services (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration INT NOT NULL, -- Duración en minutos
  image VARCHAR(255),
  category VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de Productos (products)
-- Catálogo de los productos en venta.
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255),
  category VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de Reservas (bookings)
-- Almacena las citas de los clientes con los barberos.
CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  barber_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_barber FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Tabla de Mensajes (messages)
-- Almacena la comunicación entre usuarios (chat).
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Pedidos (orders)
-- Almacena los pedidos de productos realizados por los usuarios.
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Detalles de Pedido (order_items)
-- Relaciona los productos y cantidades con un pedido específico.
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- --- ÍNDICES ---
-- Se crean para optimizar las consultas más frecuentes.
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date, booking_time);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- --- INSERCIÓN DE DATOS INICIALES (SEEDING) ---
-- `ON CONFLICT DO NOTHING` previene errores si los datos ya existen, haciendo el script repetible.

INSERT INTO services (name, description, price, duration, category) VALUES
('Corte Clásico', 'Corte de pelo tradicional con acabado perfecto', 15.00, 30, 'Corte'),
('Corte Moderno', 'Corte de pelo con técnicas modernas y tendencias', 20.00, 45, 'Corte'),
('Afeitado Tradicional', 'Afeitado con navaja y toalla caliente', 12.00, 25, 'Afeitado'),
('Afeitado Moderno', 'Afeitado con máquina y productos premium', 10.00, 20, 'Afeitado'),
('Barba y Bigote', 'Recorte y diseño de barba y bigote', 12.00, 25, 'Barba'),
('Tratamiento Facial', 'Limpieza facial con productos especializados', 25.00, 45, 'Tratamiento'),
('Combo Corte + Barba', 'Corte de pelo más recorte de barba', 25.00, 60, 'Combo'),
('Combo Premium', 'Corte + Afeitado + Tratamiento facial', 50.00, 90, 'Combo')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category) VALUES
('Cera Fijante Strong', 'Cera para peinar con fijación fuerte y acabado mate', 12.99, 50, 'Cuidado Capilar'),
('Pomada Wax', 'Pomada de cera para peinar con fijación media', 14.99, 35, 'Cuidado Capilar'),
('Gel Ultra Fuerte', 'Gel para peinar con fijación ultra fuerte', 9.99, 40, 'Cuidado Capilar'),
('Champú Anti-Caída', 'Champú especializado para prevenir la caída del pelo', 18.50, 25, 'Champús'),
('Champú Voluminizador', 'Champú que aporta volumen y cuerpo al cabello', 15.99, 30, 'Champús'),
('Acondicionador Hidratante', 'Acondicionador para cabello seco y dañado', 14.50, 35, 'Acondicionadores'),
('Aceite para Barba', 'Aceite hidratante para barba y piel', 16.99, 20, 'Cuidado de Barba'),
('Bálsamo para Barba', 'Bálsamo para suavizar y dar forma a la barba', 13.99, 25, 'Cuidado de Barba'),
('Set de Navajas', 'Set de 3 navajas profesionales', 45.00, 15, 'Herramientas'),
('Cepillo de Barba', 'Cepillo de cerdas naturales para barba', 8.99, 45, 'Herramientas')
ON CONFLICT DO NOTHING;

-- Se usa el mismo hash de Bcrypt para la contraseña "123456", que es compatible con password_verify() en PHP.
INSERT INTO users (name, email, password, phone, role) VALUES
('Administrador', 'admin@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0001', 'admin'),
('Carlos Ruiz', 'barbero1@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0002', 'barber'),
('Miguel Ángel', 'barbero2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0003', 'barber'),
('Juan Pérez', 'cliente@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-1234', 'client'),
('María López', 'cliente2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-5678', 'client')
ON CONFLICT (email) DO NOTHING;

-- Insertar detalles de barberos buscando el ID del usuario por su email.
-- Esto hace que la inserción no dependa del orden o de IDs fijos.
INSERT INTO barbers (user_id, specialty, bio)
SELECT u.id, 'Cortes modernos y fading', 'Con más de 8 años de experiencia, especializado en cortes modernos y técnicas de fading.'
FROM users u WHERE u.email = 'barbero1@test.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO barbers (user_id, specialty, bio)
SELECT u.id, 'Afeitado tradicional y barba', 'Especialista en afeitado tradicional con navaja y diseño de barba.'
FROM users u WHERE u.email = 'barbero2@test.com'
ON CONFLICT (user_id) DO NOTHING;