-- ============================================================
-- 1. Crear schema si no existe
-- ============================================================
CREATE SCHEMA IF NOT EXISTS sabor_ecuatoriano;

-- ============================================================
-- 2. Crear tabla Rol (la dropea y recrea por seguridad)
-- ============================================================
DROP TABLE IF EXISTS sabor_ecuatoriano.rol CASCADE;
CREATE TABLE sabor_ecuatoriano.rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

-- 3. Insertar roles
INSERT INTO sabor_ecuatoriano.rol (nombre) VALUES ('admin'), ('user');

-- ============================================================
-- 4. Crear tabla Categoria (la dropea y recrea por seguridad)
-- ============================================================
DROP TABLE IF EXISTS sabor_ecuatoriano.categoria CASCADE;
CREATE TABLE sabor_ecuatoriano.categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 5. Insertar todas las categorías
INSERT INTO sabor_ecuatoriano.categoria (nombre) VALUES
    ('Sopas'),
    ('Platos fuertes'),
    ('Mariscos'),
    ('Desayunos'),
    ('Bebidas'),
    ('Snacks'),
    ('Postres');

-- ============================================================
-- 6. Verificar que las tablas se crearon correctamente
-- ============================================================
SELECT 'rol' AS tabla, count(*) AS registros FROM sabor_ecuatoriano.rol
UNION ALL
SELECT 'categoria', count(*) FROM sabor_ecuatoriano.categoria;

-- ============================================================
-- 7. Agregar columna rol_id a usuario (si no existe)
-- ============================================================
ALTER TABLE sabor_ecuatoriano.usuario ADD COLUMN IF NOT EXISTS rol_id INTEGER;

-- 8. Poblar rol_id según el string role existente
UPDATE sabor_ecuatoriano.usuario u
SET rol_id = r.id
FROM sabor_ecuatoriano.rol r
WHERE r.nombre = u.role;

-- 9. Asignar default para registros sin role
UPDATE sabor_ecuatoriano.usuario SET rol_id = 2 WHERE rol_id IS NULL;

-- 10. Agregar NOT NULL después de poblar
ALTER TABLE sabor_ecuatoriano.usuario ALTER COLUMN rol_id SET NOT NULL;
ALTER TABLE sabor_ecuatoriano.usuario ALTER COLUMN rol_id SET DEFAULT 2;

-- 11. Agregar FK usuario → rol
ALTER TABLE sabor_ecuatoriano.usuario DROP CONSTRAINT IF EXISTS usuario_rol_id_fkey;
ALTER TABLE sabor_ecuatoriano.usuario ADD CONSTRAINT usuario_rol_id_fkey
    FOREIGN KEY (rol_id) REFERENCES sabor_ecuatoriano.rol(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 12. Agregar columna categoria_id a producto (si no existe)
-- ============================================================
ALTER TABLE sabor_ecuatoriano.producto ADD COLUMN IF NOT EXISTS categoria_id INTEGER;

-- 13. Poblar categoria_id según el string categoria existente
UPDATE sabor_ecuatoriano.producto p
SET categoria_id = c.id
FROM sabor_ecuatoriano.categoria c
WHERE c.nombre = p.categoria;

-- 14. Agregar FK producto → categoria
ALTER TABLE sabor_ecuatoriano.producto DROP CONSTRAINT IF EXISTS producto_categoria_id_fkey;
ALTER TABLE sabor_ecuatoriano.producto ADD CONSTRAINT producto_categoria_id_fkey
    FOREIGN KEY (categoria_id) REFERENCES sabor_ecuatoriano.categoria(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 15. Verificar resultados finales
-- ============================================================
SELECT '--- ROLES ---' AS info;
SELECT * FROM sabor_ecuatoriano.rol;

SELECT '--- CATEGORIAS ---' AS info;
SELECT * FROM sabor_ecuatoriano.categoria;

SELECT '--- USUARIOS (rol_id) ---' AS info;
SELECT id, username, email, role AS role_viejo, rol_id FROM sabor_ecuatoriano.usuario;

SELECT '--- PRODUCTOS (categoria_id) ---' AS info;
SELECT id, nombre, categoria AS categoria_vieja, categoria_id FROM sabor_ecuatoriano.producto LIMIT 10;
