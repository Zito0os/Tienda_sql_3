# MixShop

Tienda de productos musicales hecha con React, Vite y MySQL. La ruta inicial `/` abre el centro de vendedores en `/admin`; la tienda pública permanece disponible en `/tienda`.

## Configuración

1. Ejecuta `init.sql` en MySQL tal como fue entregado.
2. Para cargar datos representativos del panel, ejecuta aparte `seed-demo.sql`.
3. Copia `.env.example` como `.env` y ajusta las credenciales de MySQL.
4. Instala dependencias con `npm install`.
5. Inicia frontend y API juntos con `npm run dev`.
6. Abre `http://localhost:5173/admin`.

El servidor usa `MixShop` como base por defecto. Las variables admitidas son `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `PORT`.

## Clasificación de clientes

El dashboard obtiene las métricas por cliente mediante `sp_Obtener_Metricas_Cliente` y utiliza el valor `T_cliente` almacenado en `Clientes`: `1` es **Normal**, `2` es **En riesgo** y `3` es **Alto nivel**. La actualización automática de ese valor corresponde a `sp_Actualizar_Metricas_Cliente`, invocado por el trigger definido en `init.sql`.

## Historial de ventas

El panel `/admin` muestra las métricas de cada cliente mediante `sp_Obtener_Metricas_Cliente`. La API también expone `POST /api/admin/sales`, que registra ventas con `sp_Ventas_registrar`; el trigger `trg_Ventas_After_Insert` actualiza el tipo del cliente después de cada registro.

Debido al esquema actual, cada registro de `Ventas` corresponde a un pedido de un producto. Si posteriormente se agrega una tabla de detalle de pedido, la API puede agrupar varios productos bajo un mismo pedido sin cambiar la interfaz.

## Comandos

- `npm run dev`: inicia la API y Vite en el mismo puerto.
- `npm run build`: genera la versión de producción.
- `npm test`: verifica los límites y la prioridad de la clasificación.
- `npm start`: sirve la aplicación; con `NODE_ENV=production` utiliza la carpeta `dist`.

