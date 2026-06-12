-- 1. Crear tabla Rol
CREATE TABLE IF NOT EXISTS sabor_ecuatoriano.rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

-- 2. Insertar roles
INSERT INTO sabor_ecuatoriano.rol (nombre) VALUES ('admin'), ('user')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Crear tabla Categoria
CREATE TABLE IF NOT EXISTS sabor_ecuatoriano.categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 4. Insertar categorías desde los productos existentes
INSERT INTO sabor_ecuatoriano.categoria (nombre)
SELECT DISTINCT categoria FROM sabor_ecuatoriano.producto WHERE categoria IS NOT NULL
ON CONFLICT (nombre) DO NOTHING;

-- 5. Agregar columna rol_id a usuario
ALTER TABLE sabor_ecuatoriano.usuario ADD COLUMN IF NOT EXISTS rol_id INTEGER NOT NULL DEFAULT 2;

-- 6. Migrar datos existentes: asignar rol_id según el string role
UPDATE sabor_ecuatoriano.usuario SET rol_id = r.id
FROM sabor_ecuatoriano.rol r
WHERE r.nombre = sabor_ecuatoriano.usuario.role;

-- 7. Agregar FK de usuario → rol
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'usuario_rol_id_fkey' AND table_schema = 'sabor_ecuatoriano'
    ) THEN
        ALTER TABLE sabor_ecuatoriano.usuario ADD CONSTRAINT usuario_rol_id_fkey
        FOREIGN KEY (rol_id) REFERENCES sabor_ecuatoriano.rol(id) ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- 8. Agregar columna categoria_id a producto
ALTER TABLE sabor_ecuatoriano.producto ADD COLUMN IF NOT EXISTS categoria_id INTEGER;

-- 9. Migrar datos existentes: asignar categoria_id según el string categoria
UPDATE sabor_ecuatoriano.producto SET categoria_id = c.id
FROM sabor_ecuatoriano.categoria c
WHERE c.nombre = sabor_ecuatoriano.producto.categoria;

-- 10. Agregar FK de producto → categoria
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'producto_categoria_id_fkey' AND table_schema = 'sabor_ecuatoriano'
    ) THEN
        ALTER TABLE sabor_ecuatoriano.producto ADD CONSTRAINT producto_categoria_id_fkey
        FOREIGN KEY (categoria_id) REFERENCES sabor_ecuatoriano.categoria(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 11. (Opcional) Eliminar columnas viejas de texto — solo si quieres limpiar
-- ALTER TABLE sabor_ecuatoriano.usuario DROP COLUMN IF EXISTS role;
-- ALTER TABLE sabor_ecuatoriano.producto DROP COLUMN IF EXISTS categoria;

-- 12. (Opcional) Seed de categorías faltantes si el listado debe ser completo
INSERT INTO sabor_ecuatoriano.categoria (nombre) VALUES
('Sopas'), ('Platos fuertes'), ('Mariscos'), ('Desayunos'), ('Bebidas'), ('Snacks'), ('Postres')
ON CONFLICT (nombre) DO NOTHING;
