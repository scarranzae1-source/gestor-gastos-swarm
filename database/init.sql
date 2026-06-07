DROP DATABASE IF EXISTS gestor_gastos;
CREATE DATABASE gestor_gastos;
USE gestor_gastos;

-- 1. TABLA DE USUARIOS
CREATE TABLE usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 2. TABLA DE MOVIMIENTOS (Con conexión real al usuario)
CREATE TABLE movimientos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL, -- No puede ser nulo, todo gasto debe tener un dueño
    tipo ENUM('INGRESO','GASTO') NOT NULL,
    categoria VARCHAR(100),
    descripcion VARCHAR(255),
    monto DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 👈 CLAVE: Esto une el "usuario_id" de movimientos con el "id" de la tabla usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);