CREATE SCHEMA IF NOT EXISTS sabor_ecuatoriano;

DROP TABLE IF EXISTS sabor_ecuatoriano.rol CASCADE;
CREATE TABLE sabor_ecuatoriano.rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO sabor_ecuatoriano.rol (nombre) VALUES ('admin'), ('user');

DROP TABLE IF EXISTS sabor_ecuatoriano.categoria CASCADE;
CREATE TABLE sabor_ecuatoriano.categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO sabor_ecuatoriano.categoria (nombre) VALUES
    ('Sopas'), ('Platos fuertes'), ('Mariscos'), ('Desayunos'), ('Bebidas'), ('Snacks'), ('Postres');

ALTER TABLE sabor_ecuatoriano.usuario ADD COLUMN IF NOT EXISTS rol_id INTEGER;

UPDATE sabor_ecuatoriano.usuario u SET rol_id = r.id
FROM sabor_ecuatoriano.rol r WHERE r.nombre = u.role;

UPDATE sabor_ecuatoriano.usuario SET rol_id = 2 WHERE rol_id IS NULL;

ALTER TABLE sabor_ecuatoriano.usuario ALTER COLUMN rol_id SET NOT NULL;
ALTER TABLE sabor_ecuatoriano.usuario ALTER COLUMN rol_id SET DEFAULT 2;

ALTER TABLE sabor_ecuatoriano.usuario DROP CONSTRAINT IF EXISTS usuario_rol_id_fkey;
ALTER TABLE sabor_ecuatoriano.usuario ADD CONSTRAINT usuario_rol_id_fkey
    FOREIGN KEY (rol_id) REFERENCES sabor_ecuatoriano.rol(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE sabor_ecuatoriano.producto ADD COLUMN IF NOT EXISTS categoria_id INTEGER;

UPDATE sabor_ecuatoriano.producto p SET categoria_id = c.id
FROM sabor_ecuatoriano.categoria c WHERE c.nombre = p.categoria;

ALTER TABLE sabor_ecuatoriano.producto DROP CONSTRAINT IF EXISTS producto_categoria_id_fkey;
ALTER TABLE sabor_ecuatoriano.producto ADD CONSTRAINT producto_categoria_id_fkey
    FOREIGN KEY (categoria_id) REFERENCES sabor_ecuatoriano.categoria(id) ON DELETE SET NULL ON UPDATE CASCADE;
