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

CREATE PROCEDURE sp_Tipo_de_Cliente(
    IN p_id_cliente INT,
    OUT p_tipo_cliente VARCHAR(100)
BEGIN
    SELECT T_cliente INTO p_tipo_cliente
    FROM Clientes
    WHERE Id_cliente = p_id_cliente;
END $$
)

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_Ventas_registrar;
CALL sp_Ventas_registrar(3, 2);
CALL sp_Ventas_registrar(7, 4);

CREATE VIEW vista_resumen_ventas AS
SELECT 
    v.Id_venta,
    v.Fecha_venta,
    c.N_cliente AS Cliente,
    c.T_cliente AS Telefono,
    p.Nombre_producto AS Producto,
    p.Precio_producto AS Precio
FROM Ventas v
INNER JOIN Clientes c ON v.Fk_Id_cliente = c.Id_cliente
INNER JOIN Productos p ON v.Fk_Id_producto = p.Id_producto;




SELECT * FROM vista_resumen_ventas;

SELECT * FROM vista_resumen_ventas WHERE Cliente = 'Carlos Hernandez';
