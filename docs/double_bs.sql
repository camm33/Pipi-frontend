CREATE DATABASE Double_P;
USE Double_P;

CREATE TABLE rol (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nom_rol VARCHAR(100)
);


CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    username VARCHAR(100),
    email VARCHAR(100),
    contrasena VARCHAR(255),
    talla VARCHAR(5),
    fecha_nacimiento DATE,
    foto VARCHAR(1000) NOT NULL,
    id_rol INT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    CONSTRAINT unique_username UNIQUE (username)
);

ALTER TABLE usuario
ADD COLUMN primer_nombre VARCHAR(100) AFTER id_usuario,
ADD COLUMN segundo_nombre VARCHAR(100) AFTER primer_nombre,
ADD COLUMN primer_apellido VARCHAR(100) AFTER segundo_nombre,
ADD COLUMN segundo_apellido VARCHAR(100) AFTER primer_apellido;

ALTER TABLE usuario DROP COLUMN nombre;

ALTER TABLE usuario MODIFY foto VARCHAR(255) NOT NULL DEFAULT 'default.jpg';


select * from usuario;



CREATE TABLE publicacion (
    id_publicacion INT PRIMARY KEY AUTO_INCREMENT,
    descripcion TEXT,
    estado ENUM("Disponible", "No Disponible"),
    tipo_publicacion ENUM("Venta", "Intercambio"),
    fecha_publicacion DATE,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE prenda (
    id_prenda INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    descripcion_prenda TEXT,
    talla VARCHAR(10),
    foto VARCHAR(1000) NULL,
    foto2 VARCHAR(1000) NULL,
    foto3 VARCHAR(1000) NULL,
    foto4 VARCHAR(1000) NULL,
    valor INT,
    id_publicacion INT,
    FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion)
);

CREATE TABLE pago (
    id_pago INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_publicacion INT NOT NULL,
    monto INT,
    metodo_pago ENUM("Nequi", "Daviplata", "PSE", "Efecty", "Bancolombia", "Visa", "MasterCard", "Codensa", "Davivienda", "Av Villas"),
    estado_pago ENUM("PENDIENTE", "PROCESO", "COMPLETADO"),
    fecha_pago DATETIME,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion)
);


CREATE TABLE valoracion (
    id_valoracion INT PRIMARY KEY AUTO_INCREMENT,
    usuario_valorado_id INT,
    puntaje INT CHECK (puntaje BETWEEN 1 AND 5),
    FOREIGN KEY (usuario_valorado_id) REFERENCES usuario(id_usuario)
);

INSERT INTO rol (nom_rol) VALUES
('Administrador'), ('Usuario');

select * from usuario;

INSERT INTO usuario (nombre, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol) VALUES
('Luisa Buitrago', 'luisa_B', 'luisa2000buitrago@gmail.com', 'fernanda', 'S', '2000-08-05', 'fernandita.jpg',  2),
('Mateo Rojas', 'mateo_r', 'mateo@gmail.com', 'clave123', 'M', '1999-05-20', 'foto2.jpg', 2),
('Sofía López', 'sofia_l', 'sofia@gmail.com', 'clave123', 'L', '2001-07-30', 'foto3.jpg', 2),
('Tomás Díaz', 'tomas_d', 'tomas@gmail.com', 'clave123', 'XL', '1998-12-01', 'foto4.jpg', 2),
('Isabela Ruiz', 'isabela_r', 'isa@gmail.com', 'clave123', 'XS', '2003-03-12', 'foto5.jpg', 2),
('Samuel Torres', 'samuel_t', 'sam@gmail.com', 'clave123', 'XXL', '1997-09-11', 'foto6.jpg', 2),
('Camila Pérez', 'camila_p', 'cami@gmail.com', 'clave123', 'M', '2002-06-24', 'foto7.jpg', 2),
('Juan Castillo', 'juan_c', 'juan@gmail.com', 'clave123', 'L', '2000-10-10', 'foto8.jpg', 2),
('Daniela Vargas', 'daniela_v', 'daniela@gmail.com', 'clave123', 'S', '2001-02-02', 'foto9.jpg', 2),
('Andrés Mejía', 'andres_m', 'andres@gmail.com', 'clave123', 'XL', '1995-04-04', 'foto10.jpg', 2),
('Laura Acosta', 'laura_a', 'laura@gmail.com', 'clave123', 'XS', '2002-11-23', 'foto11.jpg', 2),
('Carlos Bernal', 'carlos_b', 'carlos@gmail.com', 'clave123', 'M', '2003-08-16', 'foto12.jpg', 2),
('Valentina Silva', 'valen_s', 'valen@gmail.com', 'clave123', 'S', '2000-03-03', 'foto13.jpg', 2),
('Felipe Moreno', 'felipe_m', 'felipe@gmail.com', 'clave123', 'L', '1998-05-06', 'foto14.jpg', 2),
('Mariana Flores', 'mariana_f', 'mari@gmail.com', 'clave123', 'XXL', '1997-10-17', 'foto15.jpg', 2),
('Julián Pardo', 'julian_p', 'julian@gmail.com', 'clave123', 'M', '1996-12-20', 'foto16.jpg', 2),
('Natalia Herrera', 'natalia_h', 'nata@gmail.com', 'clave123', 'S', '2004-01-01', 'foto17.jpg', 2),
('Sebastián Ramírez', 'sebastian_r', 'sebas@gmail.com', 'clave123', 'L', '1999-07-07', 'foto18.jpg', 2),
('Gabriela Orozco', 'gabriela_o', 'gaby@gmail.com', 'clave123', 'XL', '2001-09-09', 'foto19.jpg', 2),
('David Guzmán', 'david_g', 'david@gmail.com', 'clave123', 'XXL', '2000-06-06', 'foto20.jpg', 2);


DELIMITER $$

CREATE PROCEDURE actualizar_perfil(
    IN p_id_usuario INT,
    IN p_talla VARCHAR(10),
    IN p_foto VARCHAR(255),
    IN p_contrasena VARCHAR(100)
)
BEGIN
    UPDATE usuario
    SET talla = p_talla,
        foto = p_foto,
        contrasena = p_contrasena
    WHERE id_usuario = p_id_usuario;
END $$

CREATE PROCEDURE crear_publicacion_prenda (
    IN p_descripcion TEXT,
    IN p_estado VARCHAR(50),
    IN p_tipo_publicacion VARCHAR(50),
    IN p_fecha_publicacion DATE,
    IN p_id_usuario INT,
    IN p_nombre VARCHAR(100),
    IN p_descripcion_prenda TEXT,
    IN p_talla VARCHAR(10),
    IN p_foto VARCHAR(255),
    IN p_foto2 VARCHAR(255),
    IN p_foto3 VARCHAR(255),
    IN p_foto4 VARCHAR(255),
    IN p_valor DECIMAL(10,2)
)
BEGIN
    INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario)
    VALUES (p_descripcion, p_estado, p_tipo_publicacion, p_fecha_publicacion, p_id_usuario);

    SET @last_id_publicacion = LAST_INSERT_ID();

    INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, foto2, foto3, foto4, valor, id_publicacion)
    VALUES (p_nombre, p_descripcion_prenda, p_talla, p_foto, p_foto2, p_foto3, p_foto4, p_valor, @last_id_publicacion);
END $$

DELIMITER ;

CREATE OR REPLACE VIEW vista_publicaciones AS
SELECT 
    p.id_publicacion,
    p.descripcion AS descripcion_publicacion,
    p.estado,
    p.tipo_publicacion,
    p.fecha_publicacion,
    pr.id_prenda,
    pr.nombre AS nombre_prenda,
    pr.descripcion_prenda,
    pr.talla,
    pr.foto,
    pr.valor,
    p.id_usuario
FROM publicacion p
JOIN prenda pr ON p.id_publicacion = pr.id_publicacion;

CREATE OR REPLACE VIEW vista_valoracion AS
SELECT 
    u.id_usuario,
    u.nombre AS nombre_usuario,
    AVG(v.puntaje) AS promedio_valoracion
FROM usuario u
LEFT JOIN valoracion v 
       ON u.id_usuario = v.usuario_valorado_id
GROUP BY u.id_usuario, u.nombre;

CREATE OR REPLACE VIEW vista_mi_perfil AS
SELECT 
    u.id_usuario,
    u.nombre AS nombre_usuario,
    u.username AS username_usuario,
    u.foto AS foto_usuario,
    p.id_publicacion,
    pr.id_prenda,
    pr.nombre AS nombre_prenda,
    pr.foto AS foto_prenda,
    vv.promedio_valoracion
FROM usuario u
JOIN publicacion p ON u.id_usuario = p.id_usuario
JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
LEFT JOIN (
    SELECT 
        v.usuario_valorado_id,
        AVG(v.puntaje) AS promedio_valoracion
    FROM valoracion v
    GROUP BY v.usuario_valorado_id
) vv ON u.id_usuario = vv.usuario_valorado_id;

CREATE OR REPLACE VIEW vista_otros_perfiles AS
SELECT 
    u.id_usuario,
    u.username AS username_usuario,
    u.foto AS foto_usuario,
    p.id_publicacion,
    pr.id_prenda,
    pr.nombre AS nombre_prenda,
    pr.foto AS foto_prenda,
    vv.promedio_valoracion
FROM usuario u
JOIN publicacion p ON u.id_usuario = p.id_usuario
JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
LEFT JOIN (
    SELECT 
        v.usuario_valorado_id,
        AVG(v.puntaje) AS promedio_valoracion
    FROM valoracion v
    GROUP BY v.usuario_valorado_id
) vv ON u.id_usuario = vv.usuario_valorado_id;


-- PANEL ADMINISTRADOR

CREATE OR REPLACE VIEW vista_total_usuarios AS
SELECT COUNT(*) AS total_usuarios
FROM usuario;

CREATE OR REPLACE VIEW vista_publicaciones_activas AS
SELECT COUNT(*) AS publicaciones_activas
FROM publicacion
WHERE estado = 'Disponible';

CREATE OR REPLACE VIEW vista_numero_usuarios AS
SELECT COUNT(*) AS numero_usuarios
FROM usuario
WHERE id_rol = 2;

CREATE OR REPLACE VIEW vista_numero_administradores AS
SELECT COUNT(*) AS numero_administradores
FROM usuario
WHERE id_rol = 1;

SELECT tipo_publicacion, COUNT(*) AS total
FROM publicacion
WHERE estado = 'Disponible'
GROUP BY tipo_publicacion;
