import 'dotenv/config'
import express from 'express'
import mysql from 'mysql2/promise'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT) || 3001
const isProduction = process.env.NODE_ENV === 'production'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1866uX82',
  database: process.env.DB_NAME || 'MixShop',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  timezone: 'Z',
})

const app = express()
app.use(express.json())

app.get('/api/store/products', async (_request, response) => {
  try {
    const [rows] = await pool.query(`
      SELECT Id_producto AS id, Nombre_producto AS name, Precio_producto AS price
      FROM Productos
      ORDER BY Id_producto ASC
    `)
    return response.json({ products: rows })
  } catch (error) {
    console.error('No se pudieron cargar los productos:', error.message)
    return response.status(503).json({ error: 'No fue posible consultar los productos de MySQL.' })
  }
})

app.get('/api/store/customers', async (_request, response) => {
  try {
    const [rows] = await pool.query(`
      SELECT Id_cliente AS id, N_cliente AS name
      FROM Clientes
      ORDER BY Id_cliente ASC
    `)
    return response.json({ customers: rows })
  } catch (error) {
    console.error('No se pudieron cargar los clientes:', error.message)
    return response.status(503).json({ error: 'No fue posible consultar los clientes de MySQL.' })
  }
})

app.get('/api/admin/customer-metrics', async (request, response) => {
  const customerId = Number(request.query.customerId)

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return response.status(400).json({ error: 'Ingresa un ID de cliente válido.' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM vista_metricas_clientes WHERE Id_cliente = ?',
      [customerId],
    )

    if (!rows.length) return response.status(404).json({ error: 'No existe ese cliente en la vista de métricas.' })
    return response.json({ metrics: rows[0] })
  } catch (error) {
    console.error('No se pudieron cargar las métricas del cliente:', error.message)
    return response.status(503).json({ error: 'No fue posible consultar vista_metricas_clientes.' })
  }
})

app.get('/api/admin/sales-summary', async (_request, response) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM vista_resumen_ventas
      ORDER BY Fecha_venta DESC, Id_venta DESC
    `)
    return response.json({ sales: rows })
  } catch (error) {
    console.error('No se pudo cargar el resumen de ventas:', error.message)
    return response.status(503).json({ error: 'No fue posible consultar vista_resumen_ventas.' })
  }
})

app.get('/api/admin/customer-types', async (request, response) => {
  const requestedType = request.query.type
  const typeId = requestedType === 'all' || requestedType === undefined
    ? null
    : Number(requestedType)

  if (typeId !== null && ![1, 2, 3].includes(typeId)) {
    return response.status(400).json({ error: 'El tipo de cliente debe ser 1, 2 o 3.' })
  }

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM vista_tipos_clientes
       WHERE (? IS NULL OR Tipo_cliente_id = ?)
       ORDER BY Id_cliente ASC`,
      [typeId, typeId],
    )
    return response.json({ customers: rows, selectedType: typeId })
  } catch (error) {
    console.error('No se pudieron cargar los tipos de clientes:', error.message)
    return response.status(503).json({ error: 'No fue posible consultar vista_tipos_clientes.' })
  }
})

app.post('/api/admin/sales', async (request, response) => {
  const customerId = Number(request.body?.customerId)
  const productId = Number(request.body?.productId)

  if (!Number.isInteger(customerId) || customerId <= 0 || !Number.isInteger(productId) || productId <= 0) {
    return response.status(400).json({ error: 'customerId y productId deben ser enteros positivos.' })
  }

  try {
    await pool.query('CALL sp_Ventas_registrar(?, ?)', [customerId, productId])
    return response.status(201).json({ message: 'Venta registrada correctamente.' })
  } catch (error) {
    console.error('No se pudo registrar la venta:', error.message)
    return response.status(503).json({
      error: 'No fue posible registrar la venta. Verifica que el cliente y el producto existan.',
    })
  }
})

if (isProduction) {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*path', (_request, response) => response.sendFile(path.join(__dirname, 'dist', 'index.html')))
} else {
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' })
  app.use(vite.middlewares)
}

app.listen(port, () => {
  console.log(`MixShop disponible en http://localhost:${port}`)
})
