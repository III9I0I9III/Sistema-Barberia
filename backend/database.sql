-- Base de datos para Barbados Barber Shop
CREATE DATABASE IF NOT EXISTS barbados_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barbados_db;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('client', 'barber', 'admin') DEFAULT 'client',
    avatar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Barberos (detalles adicionales)
CREATE TABLE IF NOT EXISTS barbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialty VARCHAR(100) NULL,
    bio TEXT NULL,
    working_hours JSON NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Servicios
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duración en minutos',
    image VARCHAR(255) NULL,
    category VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(255) NULL,
    category VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    barber_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Chat/Mensajes
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Pedidos (futura implementación)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Detalles de Pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para mejor rendimiento
CREATE INDEX idx_bookings_date ON bookings(booking_date, booking_time);
CREATE INDEX idx_messages_users ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Insertar datos iniciales

-- Insertar servicios
INSERT INTO services (name, description, price, duration, category) VALUES
('Corte Clásico', 'Corte de pelo tradicional con acabado perfecto', 15.00, 30, 'Corte'),
('Corte Moderno', 'Corte de pelo con técnicas modernas y tendencias', 20.00, 45, 'Corte'),
('Afeitado Tradicional', 'Afeitado con navaja y toalla caliente', 12.00, 25, 'Afeitado'),
('Afeitado Moderno', 'Afeitado con máquina y productos premium', 10.00, 20, 'Afeitado'),
('Barba y Bigote', 'Recorte y diseño de barba y bigote', 12.00, 25, 'Barba'),
('Tratamiento Facial', 'Limpieza facial con productos especializados', 25.00, 45, 'Tratamiento'),
('Combo Corte + Barba', 'Corte de pelo más recorte de barba', 25.00, 60, 'Combo'),
('Combo Premium', 'Corte + Afeitado + Tratamiento facial', 50.00, 90, 'Combo');

-- Insertar productos
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
('Cepillo de Barba', 'Cepillo de cerdas naturales para barba', 8.99, 45, 'Herramientas');

-- Insertar usuarios de prueba (contraseñas: 123456)
INSERT INTO users (name, email, password, phone, role) VALUES
('Administrador', 'admin@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0001', 'admin'),
('Carlos Ruiz', 'barbero1@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0002', 'barber'),
('Miguel Ángel', 'barbero2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-0003', 'barber'),
('Juan Pérez', 'cliente@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-1234', 'client'),
('María López', 'cliente2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555-5678', 'client');

-- Insertar detalles de barberos
INSERT INTO barbers (user_id, specialty, bio) VALUES
(2, 'Cortes modernos y fading', 'Con más de 8 años de experiencia, especializado en cortes modernos y técnicas de fading.'),
(3, 'Afeitado tradicional y barba', 'Especialista en afeitado tradicional con navaja y diseño de barba.');
