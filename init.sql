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
        (SELECT SUM(uv.Precio_producto) FROM Ultimas_ventas) AS Consumo_reciente,
        -- nuemro de pedidos de mes 1, mes 2, mes 3 y mes 4
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 0 THEN 1 END) AS Pedidos_mes_Act,
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 1 THEN 1 END) AS Pedidos_mes_1,
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 2 THEN 1 END) AS Pedidos_mes_2,
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 3 THEN 1 END) AS Pedidos_mes_3,
        COUNT(CASE WHEN TIMESTAMPDIFF (MONTH, v.Fecha_venta, CURRENT_TIMESTAMP) = 4 THEN 1 END) AS Pedidos_mes_4

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




-- SE CREARA TRIGUER PARA PARA ACTUALIZAR TIPO DE CLIENTE SEGUN METRICAS


SELECT * FROM vista_resumen_ventas;

SELECT * FROM vista_resumen_ventas WHERE Cliente = 'Carlos Hernandez';
