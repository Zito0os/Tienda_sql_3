# MixShop

Tienda de productos musicales hecha con React, Vite y MySQL. La tienda pública se mantiene en `/` y el centro de vendedores está disponible en `/admin`.

## Configuración

1. Ejecuta `init.sql` en MySQL tal como fue entregado.
2. Para cargar datos representativos del panel, ejecuta aparte `seed-demo.sql`.
3. Copia `.env.example` como `.env` y ajusta las credenciales de MySQL.
4. Instala dependencias con `npm install`.
5. Inicia frontend y API juntos con `npm run dev`.
6. Abre `http://localhost:5173/admin`.

El servidor usa `MixShop` como base por defecto. Las variables admitidas son `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `PORT`.

## Clasificación de clientes

La API calcula las categorías en este orden:

1. **Alto nivel:** más de 10 pedidos y más de $20,000 MXN de gasto, o al menos 4 pedidos en cada uno de los cuatro meses calendario más recientes.
2. **En riesgo:** menos de $5,000 MXN de gasto o más de 90 días desde el último pedido.
3. **Normal:** cualquier otro caso.

La primera regla tiene prioridad. Un cliente de alto nivel no se reclasifica como cliente en riesgo.

## Comandos

- `npm run dev`: inicia la API y Vite en el mismo puerto.
- `npm run build`: genera la versión de producción.
- `npm test`: verifica los límites y la prioridad de la clasificación.
- `npm start`: sirve la aplicación; con `NODE_ENV=production` utiliza la carpeta `dist`.

