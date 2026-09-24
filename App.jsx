import { useEffect, useState } from 'react'
import './App.css'

const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
})

async function requestJson(url, options) {
  const response = await fetch(url, options)
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'No se pudo completar la solicitud.')
  return body
}

function App() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [buyingProduct, setBuyingProduct] = useState(null)

  useEffect(() => {
    Promise.all([
      requestJson('/api/store/products'),
      requestJson('/api/store/customers'),
    ])
      .then(([productData, customerData]) => {
        setProducts(productData.products)
        setCustomers(customerData.customers)
        setStatus('success')
      })
      .catch((requestError) => {
        setError(requestError.message)
        setStatus('error')
      })
  }, [])

  const registerSale = async (product) => {
    if (!selectedCustomer) {
      setError('Selecciona un cliente antes de comprar.')
      return
    }

    setBuyingProduct(product.id)
    setError('')
    setMessage('')

    try {
      await requestJson('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: Number(selectedCustomer), productId: product.id }),
      })
      const customer = customers.find((item) => item.id === Number(selectedCustomer))
      setMessage(`Venta registrada para ${customer?.name || 'el cliente seleccionado'}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBuyingProduct(null)
    }
  }

  return (
    <div className="sales-app">
      <header className="sales-header">
        <div>
          <span className="sales-kicker">MixShop</span>
          <h1>Registro de ventas</h1>
          <p>Selecciona un cliente y registra su producto.</p>
        </div>
        <a className="admin-link" href="/admin">Panel admin</a>
      </header>

      <main>
        <section className="customer-picker" aria-labelledby="customer-picker-title">
          <div>
            <span className="sales-kicker">Cliente actual</span>
            <h2 id="customer-picker-title">¿A quién se registra la venta?</h2>
          </div>
          <label htmlFor="customer-select">Cliente</label>
          <select id="customer-select" value={selectedCustomer} onChange={(event) => { setSelectedCustomer(event.target.value); setMessage(''); setError('') }} disabled={status !== 'success'}>
            <option value="">Selecciona un cliente</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>#{customer.id} · {customer.name}</option>)}
          </select>
        </section>

        {status === 'loading' && <p className="state-message">Cargando productos y clientes...</p>}
        {status === 'error' && <p className="state-message error-message">{error}</p>}
        {message && <p className="state-message success-message">{message}</p>}
        {error && status === 'success' && <p className="state-message error-message">{error}</p>}

        {status === 'success' && (
          <section className="catalog" aria-labelledby="catalog-title">
            <div className="catalog-heading">
              <div>
                <span className="sales-kicker">Productos disponibles</span>
                <h2 id="catalog-title">Catálogo</h2>
              </div>
              <span>{products.length} productos</span>
            </div>
            <div className="sales-product-grid">
              {products.map((product) => (
                <article className="sales-product-card" key={product.id}>
                  <div className="product-number">{String(product.id).padStart(2, '0')}</div>
                  <div className="product-copy">
                    <span>Producto registrado</span>
                    <h3>{product.name}</h3>
                    <strong>{currency.format(Number(product.price))}</strong>
                  </div>
                  <button type="button" onClick={() => registerSale(product)} disabled={buyingProduct === product.id}>
                    {buyingProduct === product.id ? 'Registrando...' : 'Comprar'}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
