-- Datos demostrativos para el panel de MixShop.
-- Ejecutar por separado DESPUÉS de init.sql. Este archivo no modifica init.sql.
-- Es idempotente para los registros cuyo nombre comienza con "[Demo]".

USE MixShop;

-- init.sql elimina Ventas durante su ejecución; el seed la recupera si no existe.
CREATE TABLE IF NOT EXISTS Ventas (
    Id_venta INT PRIMARY KEY AUTO_INCREMENT,
    Fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    Fk_Id_producto INT,
    Fk_Id_cliente INT,
    FOREIGN KEY (Fk_Id_producto) REFERENCES Productos(Id_producto),
    FOREIGN KEY (Fk_Id_cliente) REFERENCES Clientes(Id_cliente)
);

INSERT INTO Productos (Nombre_producto, Precio_producto)
SELECT 'Guitarra Eléctrica Fender Stratocaster', 33545.00
WHERE NOT EXISTS (
    SELECT 1 FROM Productos WHERE Nombre_producto = 'Guitarra Eléctrica Fender Stratocaster'
);

INSERT INTO Productos (Nombre_producto, Precio_producto)
SELECT 'Vinilo Michael Jackson - Thriller', 750.00
WHERE NOT EXISTS (
    SELECT 1 FROM Productos WHERE Nombre_producto = 'Vinilo Michael Jackson - Thriller'
);

INSERT INTO Productos (Nombre_producto, Precio_producto)
SELECT 'Bocina JBL', 3525.00
WHERE NOT EXISTS (
    SELECT 1 FROM Productos WHERE Nombre_producto = 'Bocina JBL'
);

INSERT INTO Productos (Nombre_producto, Precio_producto)
SELECT 'DDJ-400 Mezcladora DJ', 6777.00
WHERE NOT EXISTS (
    SELECT 1 FROM Productos WHERE Nombre_producto = 'DDJ-400 Mezcladora DJ'
);

INSERT INTO Productos (Nombre_producto, Precio_producto)
SELECT 'Auriculares JBL x Tomorrowland', 3500.00
WHERE NOT EXISTS (
    SELECT 1 FROM Productos WHERE Nombre_producto = 'Auriculares JBL x Tomorrowland'
);

INSERT INTO Clientes (N_cliente, T_cliente)
SELECT '[Demo] Valeria Alto', 1
WHERE NOT EXISTS (SELECT 1 FROM Clientes WHERE N_cliente = '[Demo] Valeria Alto');

INSERT INTO Clientes (N_cliente, T_cliente)
SELECT '[Demo] Diego Frecuente', 1
WHERE NOT EXISTS (SELECT 1 FROM Clientes WHERE N_cliente = '[Demo] Diego Frecuente');

INSERT INTO Clientes (N_cliente, T_cliente)
SELECT '[Demo] Renata Normal', 2
WHERE NOT EXISTS (SELECT 1 FROM Clientes WHERE N_cliente = '[Demo] Renata Normal');

INSERT INTO Clientes (N_cliente, T_cliente)
SELECT '[Demo] Omar Normal', 2
WHERE NOT EXISTS (SELECT 1 FROM Clientes WHERE N_cliente = '[Demo] Omar Normal');

INSERT INTO Clientes (N_cliente, T_cliente)
SELECT '[Demo] Sara Normal', 2
WHERE NOT EXISTS (SELECT 1 FROM Clientes WHERE N_cliente = '[Demo] Sara Normal');

INSERT INTO Clientes (N_cliente, T_cliente)
SELECT '[Demo] Lucía Riesgo Bajo', 3
WHERE NOT EXISTS (SELECT 1 FROM Clientes WHERE N_cliente = '[Demo] Lucía Riesgo Bajo');

INSERT INTO Clientes (N_cliente, T_cliente)
SELECT '[Demo] Mateo Riesgo Inactivo', 3
WHERE NOT EXISTS (SELECT 1 FROM Clientes WHERE N_cliente = '[Demo] Mateo Riesgo Inactivo');

DROP TEMPORARY TABLE IF EXISTS Demo_Numeros;
CREATE TEMPORARY TABLE Demo_Numeros (n INT PRIMARY KEY);
INSERT INTO Demo_Numeros (n)
VALUES (1), (2), (3), (4), (5), (6), (7), (8),
       (9), (10), (11), (12), (13), (14), (15), (16);

-- Alto nivel por más de 10 pedidos Y gasto mayor a $20,000.
-- Los pedidos son antiguos a propósito para demostrar que alto nivel tiene prioridad.
INSERT INTO Ventas (Fecha_venta, Fk_Id_producto, Fk_Id_cliente)
SELECT
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (120 + n) DAY),
    p.Id_producto,
    c.Id_cliente
FROM Demo_Numeros d
INNER JOIN Productos p ON p.Nombre_producto = 'Guitarra Eléctrica Fender Stratocaster'
INNER JOIN Clientes c ON c.N_cliente = '[Demo] Valeria Alto'
WHERE d.n <= 12
  AND NOT EXISTS (SELECT 1 FROM Ventas v WHERE v.Fk_Id_cliente = c.Id_cliente);

-- Alto nivel por frecuencia: 4 pedidos en cada uno de los últimos 4 meses calendario.
INSERT INTO Ventas (Fecha_venta, Fk_Id_producto, Fk_Id_cliente)
SELECT
    DATE_SUB(
        DATE_SUB(DATE_FORMAT(CURRENT_DATE, '%Y-%m-15 12:00:00'), INTERVAL FLOOR((n - 1) / 4) MONTH),
        INTERVAL MOD(n - 1, 4) DAY
    ),
    p.Id_producto,
    c.Id_cliente
FROM Demo_Numeros d
INNER JOIN Productos p ON p.Nombre_producto = 'Vinilo Michael Jackson - Thriller'
INNER JOIN Clientes c ON c.N_cliente = '[Demo] Diego Frecuente'
WHERE d.n <= 16
  AND NOT EXISTS (SELECT 1 FROM Ventas v WHERE v.Fk_Id_cliente = c.Id_cliente);

-- Clientes normales: gasto mínimo de $5,000 y actividad durante los últimos 90 días.
INSERT INTO Ventas (Fecha_venta, Fk_Id_producto, Fk_Id_cliente)
SELECT DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (n * 5) DAY), p.Id_producto, c.Id_cliente
FROM Demo_Numeros d
INNER JOIN Productos p ON p.Nombre_producto = 'Bocina JBL'
INNER JOIN Clientes c ON c.N_cliente = '[Demo] Renata Normal'
WHERE d.n <= 3
  AND NOT EXISTS (SELECT 1 FROM Ventas v WHERE v.Fk_Id_cliente = c.Id_cliente);

INSERT INTO Ventas (Fecha_venta, Fk_Id_producto, Fk_Id_cliente)
SELECT DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (n * 9) DAY), p.Id_producto, c.Id_cliente
FROM Demo_Numeros d
INNER JOIN Productos p ON p.Nombre_producto = 'DDJ-400 Mezcladora DJ'
INNER JOIN Clientes c ON c.N_cliente = '[Demo] Omar Normal'
WHERE d.n <= 2
  AND NOT EXISTS (SELECT 1 FROM Ventas v WHERE v.Fk_Id_cliente = c.Id_cliente);

INSERT INTO Ventas (Fecha_venta, Fk_Id_producto, Fk_Id_cliente)
SELECT DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (n * 7) DAY), p.Id_producto, c.Id_cliente
FROM Demo_Numeros d
INNER JOIN Productos p ON p.Nombre_producto = 'Auriculares JBL x Tomorrowland'
INNER JOIN Clientes c ON c.N_cliente = '[Demo] Sara Normal'
WHERE d.n <= 4
  AND NOT EXISTS (SELECT 1 FROM Ventas v WHERE v.Fk_Id_cliente = c.Id_cliente);

-- En riesgo por gasto total menor a $5,000.
INSERT INTO Ventas (Fecha_venta, Fk_Id_producto, Fk_Id_cliente)
SELECT DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (n * 3) DAY), p.Id_producto, c.Id_cliente
FROM Demo_Numeros d
INNER JOIN Productos p ON p.Nombre_producto = 'Vinilo Michael Jackson - Thriller'
INNER JOIN Clientes c ON c.N_cliente = '[Demo] Lucía Riesgo Bajo'
WHERE d.n <= 4
  AND NOT EXISTS (SELECT 1 FROM Ventas v WHERE v.Fk_Id_cliente = c.Id_cliente);

-- En riesgo por inactividad mayor a 90 días, aunque su gasto supera $5,000.
INSERT INTO Ventas (Fecha_venta, Fk_Id_producto, Fk_Id_cliente)
SELECT DATE_SUB(CURRENT_TIMESTAMP, INTERVAL (150 + n) DAY), p.Id_producto, c.Id_cliente
FROM Demo_Numeros d
INNER JOIN Productos p ON p.Nombre_producto = 'DDJ-400 Mezcladora DJ'
INNER JOIN Clientes c ON c.N_cliente = '[Demo] Mateo Riesgo Inactivo'
WHERE d.n <= 2
  AND NOT EXISTS (SELECT 1 FROM Ventas v WHERE v.Fk_Id_cliente = c.Id_cliente);

DROP TEMPORARY TABLE Demo_Numeros;

