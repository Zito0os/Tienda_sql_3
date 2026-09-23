import 'dotenv/config'
import express from 'express'
import mysql from 'mysql2/promise'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { classifyCustomer, CUSTOMER_TYPE_LABELS } from './lib/customerClassification.js'
import { parseSalesQuery } from './lib/salesQuery.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT) || 5173
const isProduction = process.env.NODE_ENV === 'production'

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'MixShop',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  timezone: 'Z',
})

const app = express()
app.use(express.json())

app.get('/api/admin/dashboard', async (_request, response) => {
  try {
    const [customerRows] = await pool.query(`
      SELECT
        c.Id_cliente AS id,
        c.N_cliente AS name,
        COUNT(v.Id_venta) AS orderCount,
        COALESCE(SUM(p.Precio_producto), 0) AS totalSpent,
        MAX(v.Fecha_venta) AS lastOrder,
        SUM(CASE WHEN DATE_FORMAT(v.Fecha_venta, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m') THEN 1 ELSE 0 END) AS month0,
        SUM(CASE WHEN DATE_FORMAT(v.Fecha_venta, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m') THEN 1 ELSE 0 END) AS month1,
        SUM(CASE WHEN DATE_FORMAT(v.Fecha_venta, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH), '%Y-%m') THEN 1 ELSE 0 END) AS month2,
        SUM(CASE WHEN DATE_FORMAT(v.Fecha_venta, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH), '%Y-%m') THEN 1 ELSE 0 END) AS month3
      FROM Clientes c
      LEFT JOIN Ventas v ON v.Fk_Id_cliente = c.Id_cliente
      LEFT JOIN Productos p ON p.Id_producto = v.Fk_Id_producto
      GROUP BY c.Id_cliente, c.N_cliente
      ORDER BY totalSpent DESC, c.N_cliente ASC
    `)

    const customers = customerRows.map((row) => {
      const customer = {
        id: row.id,
        name: row.name,
        orderCount: Number(row.orderCount) || 0,
        totalSpent: Number(row.totalSpent) || 0,
        lastOrder: row.lastOrder,
        ordersByMonth: [row.month0, row.month1, row.month2, row.month3].map(Number),
      }

      const type = classifyCustomer(customer)
      return { ...customer, type, typeLabel: CUSTOMER_TYPE_LABELS[type] }
    })

    const [productRows] = await pool.query(`
      SELECT
        p.Id_producto AS id,
        p.Nombre_producto AS name,
        COUNT(v.Id_venta) AS unitsSold,
        COALESCE(SUM(p.Precio_producto), 0) AS revenue
      FROM Productos p
      INNER JOIN Ventas v ON v.Fk_Id_producto = p.Id_producto
      GROUP BY p.Id_producto, p.Nombre_producto
      ORDER BY unitsSold DESC, revenue DESC, p.Nombre_producto ASC
      LIMIT 5
    `)

    response.json({
      generatedAt: new Date().toISOString(),
      customers,
      topCustomers: customers.slice(0, 10),
      topProducts: productRows.map((row) => ({
        id: row.id,
        name: row.name,
        unitsSold: Number(row.unitsSold) || 0,
        revenue: Number(row.revenue) || 0,
      })),
    })
  } catch (error) {
    console.error('No se pudieron cargar las métricas:', error.message)
    response.status(503).json({
      error: 'No fue posible conectar con MySQL. Revisa las variables DB_* y ejecuta el seed si necesitas datos de demostración.',
    })
  }
})

app.get('/api/admin/sales', async (request, response) => {
  let options

  try {
    options = parseSalesQuery(request.query)
  } catch (error) {
    return response.status(400).json({ error: error.message })
  }

  const { search, from, to, page, pageSize, sortBy, order } = options
  const filters = []
  const values = []

  if (search) {
    if (/^\d+$/.test(search)) {
      filters.push('(c.N_cliente LIKE ? OR c.Id_cliente = ?)')
      values.push(`%${search}%`, Number(search))
    } else {
      filters.push('c.N_cliente LIKE ?')
      values.push(`%${search}%`)
    }
  }

  if (from) {
    filters.push('v.Fecha_venta >= ?')
    values.push(`${from} 00:00:00`)
  }

  if (to) {
    filters.push('v.Fecha_venta < DATE_ADD(?, INTERVAL 1 DAY)')
    values.push(`${to} 00:00:00`)
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const sortColumn = sortBy === 'amount' ? 'p.Precio_producto' : 'v.Fecha_venta'
  const sortDirection = order === 'asc' ? 'ASC' : 'DESC'
  const offset = (page - 1) * pageSize

  try {
    const [[countRow]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM Ventas v
      INNER JOIN Clientes c ON c.Id_cliente = v.Fk_Id_cliente
      INNER JOIN Productos p ON p.Id_producto = v.Fk_Id_producto
      ${whereClause}
    `, values)

    const total = Number(countRow.total) || 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    const [saleRows] = await pool.query(`
      SELECT
        v.Id_venta AS id,
        v.Fecha_venta AS saleDate,
        c.Id_cliente AS customerId,
        c.N_cliente AS customerName,
        p.Id_producto AS productId,
        p.Nombre_producto AS productName,
        p.Precio_producto AS totalAmount
      FROM Ventas v
      INNER JOIN Clientes c ON c.Id_cliente = v.Fk_Id_cliente
      INNER JOIN Productos p ON p.Id_producto = v.Fk_Id_producto
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}, v.Id_venta DESC
      LIMIT ? OFFSET ?
    `, [...values, pageSize, offset])

    return response.json({
      sales: saleRows.map((row) => ({
        id: row.id,
        saleDate: row.saleDate,
        customer: { id: row.customerId, name: row.customerName },
        products: [{ id: row.productId, name: row.productName }],
        totalAmount: Number(row.totalAmount) || 0,
      })),
      pagination: { page, pageSize, total, totalPages },
      sort: { sortBy, order },
      filters: { search, from, to },
    })
  } catch (error) {
    console.error('No se pudo cargar el historial de ventas:', error.message)
    return response.status(503).json({
      error: 'No fue posible cargar el historial desde MySQL. Revisa la conexión e inténtalo de nuevo.',
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
