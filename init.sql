CREATE DATABASE MixShop;
USE Mixshop;


CREATE TABLE Clientes (
    Id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    N_cliente VARCHAR(100),
    T_cliente INT
);

CREATE TABLE Productos (
    Id_producto INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_producto VARCHAR(100),
    Precio_producto DECIMAL(10,2)
);

CREATE TABLE Ventas (
    Id_venta INT PRIMARY KEY AUTO_INCREMENT,
    Fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    Fk_Id_producto INT,
    Fk_Id_cliente INT,

    FOREIGN KEY (Fk_Id_producto)
        REFERENCES Productos(Id_producto),

    FOREIGN KEY (Fk_Id_cliente)
        REFERENCES Clientes(Id_cliente)
);
drop table Ventas;




INSERT INTO Productos (Nombre_producto, Precio_producto)
VALUES
('Coca-Cola 600ml', 18.00),
('Sabritas Originales', 22.00),
('Pepsi 600ml', 17.00),
('Galletas Oreo', 25.00),
('Pan Blanco Bimbo', 42.00),
('Leche Lala 1L', 28.00),
('Agua Ciel 1L', 15.00),
('Chocolate Carlos V', 14.00),
('Doritos Nacho', 23.00),
('Jugo Del Valle 1L', 30.00);


INSERT INTO Clientes (N_cliente, T_cliente)
VALUES
('Juan Perez', '1'),
('Maria Gonzalez', '1'),
('Carlos Hernandez', '1'),
('Ana Martinez', '1'),
('Luis Rodriguez', '2'),
('Sofia Lopez', '2'),
('Miguel Torres', '2'),
('Laura Ramirez', '3'),
('Daniel Flores', '3'),
('Fernanda Castillo', '3');



DELIMITER $$





DELIMITER $$

CREATE PROCEDURE sp_Ventas_registrar(
    IN p_id_cliente INT,
    IN p_id_producto INT
)
BEGIN

    INSERT INTO Ventas(Fk_Id_producto, Fk_Id_cliente)
    VALUES(p_id_producto, p_id_cliente);

END $$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE sp_Obtener_Metricas_Cliente(
    IN p_id_cliente INT
)
    
BEGIN

-- La tabla temporal
DROP TEMPORARY TABLE IF EXISTS Ultimas_ventas;
CREATE TEMPORARY TABLE Ultimas_ventas (
                Fk_id_venta INT,
                Precio_producto DECIMAL(10,2),
                Fecha_venta DATETIME
        );
            INSERT INTO Ultimas_ventas

                SELECT
                    v.Id_venta,
                    p.Precio_producto,
                    v.Fecha_venta

                FROM Ventas v
                INNER JOIN Productos p ON v.Fk_Id_producto = p.Id_producto
                WHERE v.Fk_Id_cliente = p_id_cliente
                ORDER BY v.Fecha_venta DESC
                LIMIT 10;

    SELECT
        c.Id_cliente,
        c.T_cliente AS Tipo_de_cliente,
        -- Cantidad de ventas
        COUNT(v.Id_venta) AS Total_ventas,
        -- Consumo total
        SUM(p.Precio_producto) AS Total_consumo,
        -- Fecha ultimo pedido
        MAX(v.Fecha_venta) AS Ultima_Fecha_pedido,
        -- Consumo reciente en ultimos 10 pedidos
        -- (SELECT SUM(uv.Precio_producto) FROM Ultimas_ventas) AS Consumo_reciente,
		SUM(uv.Precio_producto) AS Consumo_reciente,
        -- nuemro de pedidos de mes 1, mes 2, mes 3 y mes 4
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 0 THEN 1 END) AS Pedidos_mes_Act,
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 1 THEN 1 END) AS Pedidos_mes_1,
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 2 THEN 1 END) AS Pedidos_mes_2,
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 3 THEN 1 END) AS Pedidos_mes_3
        -- COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 4 THEN 1 END) AS Pedidos_mes_4

    FROM Clientes c
    LEFT JOIN Ventas v ON c.Id_cliente = v.Fk_Id_cliente
    LEFT JOIN Productos p ON v.Fk_Id_producto = p.Id_producto
    LEFT JOIN Ultimas_ventas uv ON v.Id_venta = uv.Fk_id_venta
    WHERE c.Id_cliente = p_id_cliente
    GROUP BY c.Id_cliente, c.T_cliente;

END $$

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_Ventas_registrar; --Esto no va antes de crear el procedimiento?
CALL sp_Ventas_registrar(3, 2);
CALL sp_Ventas_registrar(7, 4);

CREATE VIEW vista_resumen_ventas AS
SELECT 
    v.Id_venta,
    v.Fecha_venta,
    c.N_cliente AS Cliente,
    c.T_cliente AS Telefono, -- Que pdo con esto?
    p.Nombre_producto AS Producto,
    p.Precio_producto AS Precio
FROM Ventas v
INNER JOIN Clientes c ON v.Fk_Id_cliente = c.Id_cliente
INNER JOIN Productos p ON v.Fk_Id_producto = p.Id_producto;

-- VISTA TIPO CLIENTE
CREATE OR REPLACE VIEW vista_tipos_clientes AS
SELECT 
    Id_cliente,
    N_cliente AS Nombre_cliente,
    T_cliente AS Tipo_cliente_id,
    CASE T_cliente
        WHEN 1 THEN 'Bueno'
        WHEN 2 THEN 'Medio'
        WHEN 3 THEN 'Malo'
        ELSE 'Sin Clasificar'
    END AS Tipo_cliente_descripcion
FROM Clientes;

SELECT * FROM vista_tipos_clientes;

SELECT * 
FROM vista_tipos_clientes 
WHERE Tipo_cliente_id IN (2);



-- SE CREARA TRIGUER PARA PARA ACTUALIZAR TIPO DE CLIENTE SEGUN METRICAS


SELECT * FROM vista_resumen_ventas;

SELECT * FROM vista_resumen_ventas WHERE Cliente = 'Carlos Hernandez';



-- SELECT ORDER BY
SELECT 
    v.Id_venta,
    v.Fecha_venta,
    p.Nombre_producto,
    p.Precio_producto
FROM Ventas v
INNER JOIN Productos p ON v.Fk_Id_producto = p.Id_producto
ORDER BY p.Precio_producto DESC;
-- SELECT GROUP BY
SELECT 
    Fk_Id_producto AS Id_Producto, 
    COUNT(*) AS Total_Veces_Vendido
FROM Ventas
GROUP BY Fk_Id_producto;
-- VISTA DE TODOS LOS CLIENTES

select * from vista_metricas_clientes;
SELECT * FROM vista_metricas_clientes WHERE Tipo_de_cliente = 3;

CREATE OR REPLACE VIEW vista_metricas_clientes AS
SELECT
    c.Id_cliente,
    c.N_cliente AS Nombre_cliente,
    c.T_cliente AS Tipo_de_cliente,
    
    -- Cantidad total de ventas del cliente
    COUNT(v.Id_venta) AS Total_ventas,
    
    -- Consumo total
    COALESCE(SUM(p.Precio_producto), 0.00) AS Total_consumo,
    
    -- Fecha del último pedido
    MAX(v.Fecha_venta) AS Ultima_Fecha_pedido,
    
    -- Consumo reciente en las últimas 10 ventas del cliente
    COALESCE((
        SELECT SUM(sub_p.Precio_producto)
        FROM (
            SELECT p_sub.Precio_producto
            FROM Ventas v_sub
            INNER JOIN Productos p_sub ON v_sub.Fk_Id_producto = p_sub.Id_producto
            WHERE v_sub.Fk_Id_cliente = c.Id_cliente
            ORDER BY v_sub.Fecha_venta DESC
            LIMIT 10
        ) AS sub_p
    ), 0.00) AS Consumo_reciente_ultimos_10,
    
    -- Conteo de pedidos por mes de antigüedad
    COUNT(CASE WHEN TIMESTAMPDIFF(MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 0 THEN 1 END) AS Pedidos_mes_Act,
    COUNT(CASE WHEN TIMESTAMPDIFF(MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 1 THEN 1 END) AS Pedidos_mes_1,
    COUNT(CASE WHEN TIMESTAMPDIFF(MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 2 THEN 1 END) AS Pedidos_mes_2,
    COUNT(CASE WHEN TIMESTAMPDIFF(MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 3 THEN 1 END) AS Pedidos_mes_3

FROM Clientes c
LEFT JOIN Ventas v ON c.Id_cliente = v.Fk_Id_cliente
LEFT JOIN Productos p ON v.Fk_Id_producto = p.Id_producto
GROUP BY c.Id_cliente, c.N_cliente, c.T_cliente;
-- datos insertados
INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(1, 1, NOW() - INTERVAL 5 DAY),
(1, 6, NOW() - INTERVAL 12 DAY),
(1, 14, NOW() - INTERVAL 20 DAY),
(1, 15, NOW() - INTERVAL 28 DAY),
(1, 13, NOW() - INTERVAL 35 DAY),
(1, 9, NOW() - INTERVAL 42 DAY),
(1, 1, NOW() - INTERVAL 50 DAY),
(1, 6, NOW() - INTERVAL 65 DAY),
(1, 14, NOW() - INTERVAL 75 DAY),
(1, 15, NOW() - INTERVAL 85 DAY),
(1, 9, NOW() - INTERVAL 100 DAY),
(1, 13, NOW() - INTERVAL 115 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(2, 17, NOW() - INTERVAL 2 DAY),
(2, 1, NOW() - INTERVAL 8 DAY),
(2, 8, NOW() - INTERVAL 15 DAY),
(2, 14, NOW() - INTERVAL 22 DAY),
(2, 6, NOW() - INTERVAL 32 DAY),
(2, 13, NOW() - INTERVAL 40 DAY),
(2, 15, NOW() - INTERVAL 48 DAY),
(2, 1, NOW() - INTERVAL 55 DAY),
(2, 9, NOW() - INTERVAL 62 DAY),
(2, 14, NOW() - INTERVAL 70 DAY),
(2, 17, NOW() - INTERVAL 78 DAY),
(2, 6, NOW() - INTERVAL 85 DAY),
(2, 13, NOW() - INTERVAL 92 DAY),
(2, 1, NOW() - INTERVAL 100 DAY),
(2, 15, NOW() - INTERVAL 108 DAY),
(2, 9, NOW() - INTERVAL 115 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(3, 6, NOW() - INTERVAL 3 DAY),
(3, 9, NOW() - INTERVAL 10 DAY),
(3, 15, NOW() - INTERVAL 18 DAY),
(3, 13, NOW() - INTERVAL 25 DAY),
(3, 1, NOW() - INTERVAL 38 DAY),
(3, 17, NOW() - INTERVAL 45 DAY),
(3, 14, NOW() - INTERVAL 52 DAY),
(3, 6, NOW() - INTERVAL 68 DAY),
(3, 9, NOW() - INTERVAL 76 DAY),
(3, 15, NOW() - INTERVAL 95 DAY),
(3, 13, NOW() - INTERVAL 105 DAY),
(3, 1, NOW() - INTERVAL 118 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(4, 15, NOW() - INTERVAL 1 DAY),
(4, 14, NOW() - INTERVAL 7 DAY),
(4, 1, NOW() - INTERVAL 14 DAY),
(4, 17, NOW() - INTERVAL 21 DAY),
(4, 6, NOW() - INTERVAL 33 DAY),
(4, 9, NOW() - INTERVAL 41 DAY),
(4, 13, NOW() - INTERVAL 49 DAY),
(4, 15, NOW() - INTERVAL 56 DAY),
(4, 1, NOW() - INTERVAL 63 DAY),
(4, 14, NOW() - INTERVAL 71 DAY),
(4, 17, NOW() - INTERVAL 79 DAY),
(4, 6, NOW() - INTERVAL 86 DAY),
(4, 9, NOW() - INTERVAL 93 DAY),
(4, 13, NOW() - INTERVAL 101 DAY),
(4, 15, NOW() - INTERVAL 109 DAY),
(4, 1, NOW() - INTERVAL 116 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(5, 4, NOW() - INTERVAL 4 DAY),
(5, 3, NOW() - INTERVAL 18 DAY),
(5, 7, NOW() - INTERVAL 35 DAY),
(5, 12, NOW() - INTERVAL 60 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(6, 12, NOW() - INTERVAL 10 DAY),
(6, 5, NOW() - INTERVAL 25 DAY),
(6, 4, NOW() - INTERVAL 45 DAY),
(6, 7, NOW() - INTERVAL 70 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(7, 8, NOW() - INTERVAL 12 DAY),
(7, 10, NOW() - INTERVAL 28 DAY),
(7, 11, NOW() - INTERVAL 50 DAY),
(7, 3, NOW() - INTERVAL 80 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(8, 2, NOW() - INTERVAL 100 DAY),
(8, 18, NOW() - INTERVAL 110 DAY),
(8, 16, NOW() - INTERVAL 125 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(9, 20, NOW() - INTERVAL 105 DAY),
(9, 21, NOW() - INTERVAL 120 DAY),
(9, 10, NOW() - INTERVAL 135 DAY);

INSERT INTO Ventas (Fk_Id_cliente, Fk_Id_producto, Fecha_venta) VALUES
(10, 22, NOW() - INTERVAL 95 DAY),
(10, 19, NOW() - INTERVAL 115 DAY),
(10, 11, NOW() - INTERVAL 130 DAY);