import { useEffect, useMemo, useState } from 'react'
import './App.css'

const categories = ['Todo', 'Instrumentos', 'Viniles', 'Bocinas', 'Mezcladoras', 'Mixers', 'Accesorios']

const products = [
  {
    id: 1,
    name: 'Guitarra Electrica Fender Stratocaster',
    price: 33545.00,
    oldPrice: 38576.75,
    category: 'Instrumentos',
    badge: 'Top Seller',
    rating: 4.9,
    tone: 'guitar',
    image:
      'https://guitarpoint.de/app/uploads/products/1976-fender-stratocaster-black/1976-Fender-Stratocaster-Black-S768888_17.jpg',
    desc: 'Sonido clásico, gran respuesta y sensación de prestigio para cada set.',
  },
  {
    id: 2,
    name: 'Vinilo Linkin Park - Meteora',
    price: 562.00,
    oldPrice: 646.30,
    category: 'Viniles',
    badge: 'Colección',
    rating: 4.8,
    tone: 'vinyl',
    image:
      'https://tse3.mm.bing.net/th/id/OIP._7HAesvqYEJxgi56x_2MdwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    desc: 'Un disco de colección con producción premium y vibra nocturna.',
  },
  {
    id: 3,
    name: 'Bocina JBL',
    price: 3525.00,
    oldPrice: 4053.75,
    category: 'Bocinas',
    badge: 'Nuevo',
    rating: 4.9,
    tone: 'speaker',
    image: 'https://m.media-amazon.com/images/I/71fUKwPvfdL._AC_.jpg',
    desc: 'Potencia y claridad para fiestas, estudios y sesiones en casa.',
  },
  {
    id: 4,
    name: 'DDJ-400 Mezcladora DJ',
    price: 6777.00,
    oldPrice: 7793.55,
    category: 'Mezcladoras',
    badge: 'Pro',
    rating: 5.0,
    tone: 'mixer',
    image:
      'https://th.bing.com/th/id/R.27c93816ecd5ec06cfd7bcfdc398b494?rik=R8FTro5B%2fes8%2fA&pid=ImgRaw&r=0',
    desc: 'Maneja transiciones suaves con control total y gran presencia DJ.',
  },
  {
    id: 5,
    name: 'Auriculares JBL x Tomorroland',
    price: 3500.00,
    oldPrice: 4025.00,
    category: 'Accesorios',
    badge: 'Hot',
    rating: 4.7,
    tone: 'audio',
    image: 'https://puntoahorro.com/wp-content/uploads/AURICULARES-JBL-LIVE-660NC-2.jpg',
    desc: 'Aislamiento excelente para producir, mezclar y escuchar sin distracciones.',
  },
  {
    id: 6,
    name: 'Sintetizador Roland V-Synth GT',
    price: 222140.00,
    oldPrice: 255461.00,
    category: 'Instrumentos',
    badge: 'Limited',
    rating: 4.9,
    tone: 'synth',
    image:
      'https://http2.mlstatic.com/sintetizador-roland-v-synthgt-D_NQ_NP_3585-MLM4469805751_062013-F.jpg',
    desc: 'Crea texturas, sonidos épicos y melodías con libertad total.',
  },
  {
    id: 7,
    name: 'Guitarra Acustica Profesional',
    price: 6699.00,
    oldPrice: 7703.85,
    category: 'Instrumentos',
    badge: 'Premium',
    rating: 4.9,
    tone: 'guitar',
    image:
      'https://lacarnemagazine.com/wp-content/uploads/2020/06/mejores-guitarras-acusticas-web-1200x675.jpg',
    desc: 'Diseño agresivo, respuesta rápida y un tono brillante para riffs intensos.',
  },
  {
    id: 8,
    name: 'Bocinas KALI',
    price: 15472.00,
    oldPrice: 17792.80,
    category: 'Bocinas',
    badge: 'Popular',
    rating: 4.8,
    tone: 'speaker',
    image:
      'https://m.media-amazon.com/images/I/81b1xLYm4aL._AC_SL1500_.jpg',
    desc: 'Sonido envolvente para casa, creatividad y sesiones de mezcla con energía.',
  },
  {
    id: 9,
    name: 'Equipo de sonido T.I. PRO',
    price: 180000.00,
    oldPrice: 207000.00,
    category: 'Bocinas',
    badge: 'Nuevo',
    rating: 4.7,
    tone: 'speaker',
    image:
      'https://image.made-in-china.com/203f0j00ijgoOQMzkscA/T-I-PRO-Audio-Professional-Stage-Sound-Equipment-DJ-Concert-Stage-Line-Array-Two-Way-Double-6-5-Inch-Speakers-Set.webp',
    desc: 'Potencia limpia y gran alcance para fiestas o práctica sin límites.',
  },
  {
    id: 10,
    name: 'Auriculares JBL tour One m3',
    price: 3200.00,
    oldPrice: 3680.00,
    category: 'Accesorios',
    badge: 'Top',
    rating: 4.9,
    tone: 'audio',
    image:
      'https://comprarmag.com/wp-content/uploads/2025/08/JBL-Tour-One-M3-Smart-Tx-Wireless-Over-Ear-Noise-Cancelling-Headphones-with-Smart-Transmitter-1030x1030.jpeg',
    desc: 'Cancelación activa, confort total y audio impecable para producción y escucha.',
  },
  {
    id: 11,
    name: 'Airpods Cancelacion de Ruido APPLE',
    price: 3100.00,
    oldPrice: 3565.00,
    category: 'Accesorios',
    badge: 'HOT',
    rating: 4.8,
    tone: 'audio',
    image:
      'https://th.bing.com/th?id=OPHS.Hkq6zap0bg%2fU3Q474C474&w=212&h=212&c=17&pid=21.1',
    desc: 'Reference sound para mezcla, master y largas sesiones sin fatiga.',
  },
  {
    id: 12,
    name: 'Sintetizador Korg Minilogue',
    price: 15000.00,
    oldPrice: 17250.00,
    category: 'Instrumentos',
    badge: 'Analógico',
    rating: 4.8,
    tone: 'synth',
    image:
      'https://tse2.mm.bing.net/th/id/OIP.2pr8hjz6q7aY10PGPj5JGgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    desc: 'Osciladores analógicos con carácter warm y posibilidades creativas infinitas.',
  },
  {
    id: 13,
    name: 'Sintetizador Moog Subsequent 37',
    price: 44300.00,
    oldPrice: 50945.00,
    category: 'Instrumentos',
    badge: 'Limited',
    rating: 5.0,
    tone: 'synth',
    image:
      'https://www.chicagomusicexchange.com/cdn/shop/products/moog-keyboards-and-synths-synths-analog-synths-moog-subsequent-37-synthesizer-lps-sub-006-01-u5-29418957766791.jpg?v=1658786361&width=1946',
    desc: 'Un sintetizador para sonidos expresivos, profundos y totalmente únicos.',
  },
  {
    id: 14,
    name: 'Mezcladora Pioneer DDJ-1000',
    price: 22400.00,
    oldPrice: 25760.00,
    category: 'Mezcladoras',
    badge: 'HOT',
    rating: 4.9,
    tone: 'mixer',
    image:
      'https://c1.zzounds.com/media/productmedia/fit,2018by3200/quality,85/ddj-1000-front-angle-4248536ef136914b9a601c6fcd2c121a.jpg',
    desc: 'Transiciones suaves y control total para DJ performance profesional.',
  },
  {
    id: 15,
    name: 'Pioneer CDJ-3000X',
    price: 180000.00,
    oldPrice: 207000.00,
    category: 'Mezcladoras',
    badge: 'Pro',
    rating: 4.9,
    tone: 'mixer',
    image:
      'https://tse4.mm.bing.net/th/id/OIP.RhiJFwPjVvTUEytHmaJKZgHaDi?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    desc: 'Sonido detallado, construcción sólida y gran control para cada sesión.',
  },
  {
    id: 16,
    name: 'Mini Mixer Audio',
    price: 1800.00,
    oldPrice: 2070.00,
    category: 'Mixers',
    badge: 'Scratch',
    rating: 5.0,
    tone: 'mixer',
    image:
      'https://m.media-amazon.com/images/I/81dRQSKnYdL._AC_SL1500_.jpg',
    desc: 'Diseñado para DJs que buscan control manual, respuesta precisa y estilo.',
  },
  {
    id: 17,
    name: 'Mixer Denon DJ X185',
    price: 25000.00,
    oldPrice: 28750.00,
    category: 'Mixers',
    badge: 'Live',
    rating: 4.8,
    tone: 'mixer',
    image:
      'https://tse4.mm.bing.net/th/id/OIP.ZV99ExqxcCb_xQf-5FuxGgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    desc: 'Muy útil para setups de live set y DJing con estilo y potencia.',
  },
  {
    id: 18,
    name: 'Vinilo Michael Jackson - Thriller',
    price: 750.00,
    oldPrice: 862.50,
    category: 'Viniles',
    badge: 'Colección',
    rating: 4.9,
    tone: 'vinyl',
    image:
      'https://tse3.mm.bing.net/th/id/OIP.Jwq4a0U8l92t8gX7mvlpGgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    desc: 'Edición clásica para coleccionistas que quieren una pieza única.',
  },
  {
    id: 19,
    name: 'Vinilo Twisted Sister - Stay Hungry',
    price: 900.00,
    oldPrice: 1035.00,
    category: 'Viniles',
    badge: 'Colección',
    rating: 4.9,
    tone: 'vinyl',
    image:
      'https://tse4.mm.bing.net/th/id/OIP.YT2B9HCsd5bN3S39z5cbdgHaFn?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    desc: 'Calidad sonora premium con vibra futurista y mucha presencia.',
  },
  {
    id: 20,
    name: 'Vinilo AC/DC - Live',
    price: 1500.00,
    oldPrice: 1725.00,
    category: 'Viniles',
    badge: 'Colección',
    rating: 4.8,
    tone: 'vinyl',
    image:
      'https://www.d2fy.es/cdn/shop/products/acdc-2lp-vinilo-dorado-live-ed-50-aniversario-485775_1200x.jpg?v=1708516450',
    desc: 'Un vinilo con identidad, carácter y energía para cualquier colección.',
  },
  {
    id: 21,
    name: 'Vinilo Green day - American Idiot',
    price: 850.00,
    oldPrice: 977.50,
    category: 'Viniles',
    badge: 'Colección',
    rating: 4.8,
    tone: 'vinyl',
    image:
      'https://musikpop.uy/cdn/shop/files/51O1fnUvouL._UF1000_1000_QL80.jpg?v=1756090570&width=1445',
    desc: 'El detalle perfecto para coleccionistas y amantes de la música rock.',
  },
  {
    id: 22,
    name: 'Vinilo Avril Lavigne - Let Go',
    price: 1025.00,
    oldPrice: 1178.75,
    category: 'Viniles',
    badge: 'Colección',
    rating: 4.8,
    tone: 'vinyl',
    image:
      'https://topicashop.com/cdn/shop/files/vinilo-avril-lavigne-let-go-2301627.jpg?v=1755191617&width=1445',
    desc: 'Un clásico para disfrutar en alta fidelidad para fans de Avril Lavigne.',
  },
]

const features = [
  {
    icon: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&q=80',
    title: 'Envío express',
    text: 'Recibe tu pedido en 48 horas en zonas seleccionadas.',
  },
  {
    icon: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=200&q=80',
    title: 'Garantía',
    text: 'Todo producto cuenta con protección y soporte especializado.',
  },
  {
    icon: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80',
    title: 'Curación musical',
    text: 'Equipos seleccionados por artistas, DJs y productores.',
  },
]

const toSafeNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const isValidCartProduct = (product) =>
  Boolean(product?.id && product?.name?.trim() && toSafeNumber(product.price) > 0)

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Todo')
  const [cartItems, setCartItems] = useState([])
  const [pendingProduct, setPendingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState('')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0 })

  useEffect(() => {
    if (!selectedProduct) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedProduct(null)
        setDragState({ isDragging: false, startX: 0, startY: 0 })
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedProduct])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todo') return products
    if (selectedCategory === 'Hot') return products.filter((product) => product.badge.toLowerCase() === 'hot')
    return products.filter((product) => product.category === selectedCategory)
  }, [selectedCategory])

  const validCartItems = cartItems.filter(isValidCartProduct)
  const cartCount = validCartItems.reduce((total, item) => total + toSafeNumber(item.quantity), 0)
  const cartTotal = validCartItems.reduce(
    (sum, item) => sum + toSafeNumber(item.price) * toSafeNumber(item.quantity),
    0,
  )

  const addProductToCart = (product) => {
    if (!isValidCartProduct(product)) return

    const safeProduct = {
      ...product,
      price: toSafeNumber(product?.price),
      oldPrice: toSafeNumber(product?.oldPrice),
    }

    setCartItems((items) => {
      const existingItem = items.find((item) => item.id === safeProduct.id)

      if (existingItem) {
        return items.map((item) =>
          item.id === safeProduct.id
            ? { ...item, quantity: toSafeNumber(item.quantity) + 1, price: toSafeNumber(item.price) }
            : item,
        )
      }

      return [...items, { ...safeProduct, quantity: 1 }]
    })

    setIsCartOpen(true)
  }

  const handleAddToCartRequest = (product) => {
    setPendingProduct(product)
  }

  const handleConfirmAdd = (confirmed) => {
    if (confirmed && pendingProduct) {
      addProductToCart(pendingProduct)
    }

    setPendingProduct(null)
  }

  const handleQuantityChange = (productId, change) => {
    setCartItems((items) =>
      items
        .map((item) => {
          if (item.id !== productId) return item

          const nextQuantity = toSafeNumber(item.quantity) + change
          return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null
        })
        .filter(Boolean),
    )
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems((items) => items.filter((item) => item.id !== productId))
  }

  const handleBuyNow = (product = null) => {
    if (product) {
      addProductToCart(product)
      setSelectedProduct(null)
      setPurchaseMessage('Pedido confirmado. ¡Gracias por apoyar a MixShop!')
      setTimeout(() => setPurchaseMessage(''), 2200)
      return
    }

    if (!validCartItems.length) return

    setPurchaseMessage('Pedido confirmado. ¡Gracias por apoyar a MixShop!')
    setTimeout(() => setPurchaseMessage(''), 2200)
  }

  const handleImageDragStart = (event) => {
    setDragState({ isDragging: true, startX: event.clientX, startY: event.clientY })
  }

  const handleImageDragMove = (event) => {
    if (!dragState.isDragging) return

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY

    setDragOffset((current) => ({
      x: current.x + deltaX,
      y: current.y + deltaY,
    }))

    setDragState({ isDragging: true, startX: event.clientX, startY: event.clientY })
  }

  const handleImageDragEnd = () => {
    setDragState({ isDragging: false, startX: 0, startY: 0 })
  }

  return (
    <div className="app-shell">
      {pendingProduct && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p className="confirm-title">¿Quieres agregar “{pendingProduct.name}” al carrito?</p>
            <div className="confirm-actions">
              <button type="button" className="confirm-btn confirm-yes" onClick={() => handleConfirmAdd(true)}>
                Sí
              </button>
              <button type="button" className="confirm-btn confirm-no" onClick={() => handleConfirmAdd(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="product-detail-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-detail-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="detail-close" onClick={() => setSelectedProduct(null)}>
              ×
            </button>

            <div
              className={`detail-image-wrap ${dragState.isDragging ? 'dragging' : ''}`}
              onMouseDown={handleImageDragStart}
              onMouseMove={handleImageDragMove}
              onMouseUp={handleImageDragEnd}
              onMouseLeave={handleImageDragEnd}
            >
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.25)` }}
              />
            </div>

            <div className="detail-content">
              <span className="detail-badge">{selectedProduct.badge}</span>
              <h2>{selectedProduct.name}</h2>

              <div className="detail-rating">
                <span>★ {selectedProduct.rating}</span>
                <small>{selectedProduct.category}</small>
              </div>

              <div className="price-row detail-price-row">
                <strong>${selectedProduct.price}</strong>
                <span>${selectedProduct.oldPrice}</span>
              </div>

              <p>{selectedProduct.desc}</p>

              <ul className="detail-specs">
                <li>Envío express en 24–48 horas</li>
                <li>Garantía oficial del fabricante</li>
                <li>Devoluciones fáciles dentro de 30 días</li>
              </ul>

              <div className="detail-actions">
                <button type="button" className="primary-btn" onClick={() => handleBuyNow(selectedProduct)}>
                  Comprar ahora
                </button>
                <button type="button" className="secondary-btn" onClick={() => handleAddToCartRequest(selectedProduct)}>
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside className={isCartOpen ? 'cart-panel open' : 'cart-panel'}>
        <div className="cart-header">
          <h3>Tu carrito</h3>
          <button type="button" className="close-cart" onClick={() => setIsCartOpen(false)}>
            ×
          </button>
        </div>

        {validCartItems.length === 0 ? (
          <p className="empty-cart">Tu carrito está vacío.</p>
        ) : (
          <>
            <div className="cart-list">
              {validCartItems.map((item) => (
                <div className="cart-item" key={`${item.id}-${item.name}`}>
                  <div className="cart-item-emoji">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item-copy">
                    <strong>{item.name}</strong>
                    <span>${toSafeNumber(item.price) * toSafeNumber(item.quantity)}</span>
                  </div>

                  <div className="cart-item-controls">
                    <button type="button" onClick={() => handleQuantityChange(item.id, -1)}>
                      −
                    </button>
                    <span>{toSafeNumber(item.quantity)}</span>
                    <button type="button" onClick={() => handleQuantityChange(item.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>${cartTotal}</strong>
              </div>

              <button type="button" className="purchase-btn" onClick={handleBuyNow}>
                Comprar ahora
              </button>
            </div>
          </>
        )}

        {purchaseMessage && <div className="purchase-success">{purchaseMessage}</div>}
      </aside>

      <header className="topbar">
        <div className="brand-wrap">
          <div className="logo-mark">M</div>
          <div>
            <p className="brand-name">MixShop</p>
            <span className="brand-tag">sound • style • soul</span>
          </div>
        </div>

        <nav className="nav-links" aria-label="Navegación principal">
          <a href="#catalogo">Catálogo</a>
          <a href="#destacados">Destacados</a>
          <a href="#soporte">Soporte</a>
          <a href="/admin">Panel admin</a>
        </nav>

        <button type="button" className="cart-button" onClick={() => setIsCartOpen(true)}>
          Carrito <span>{cartCount}</span>
        </button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Tu tienda de música en movimiento</p>
            <h1>Vibra con equipo que hace sonar cada idea.</h1>
            <p className="hero-text">
              Instrumentos, vinilos, bocinas, mezcladoras y accesorios para crear, bailar y compartir tu sonido con libertad.
            </p>

            <div className="cta-row">
              <a href="#catalogo" className="primary-btn">Explorar catálogo</a>
              <button
                type="button"
                className={selectedCategory === 'Hot' ? 'secondary-btn active' : 'secondary-btn'}
                onClick={() => {
                  setSelectedCategory('Hot')
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Hot list
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>12k+</strong>
                <span>Artists</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>Rating</span>
              </div>
              <div>
                <strong>24h</strong>
                <span>Envio</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Visual promocional de MixShop">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="promo-card promo-main">
              <span className="mini-label">Live set</span>
              <h3>Studio Wave</h3>
              <p>Equipos premium para crear, mezclar y dirigir cada momento.</p>
            </div>
            <div className="promo-card promo-mini">
              <span>🔥 Oferta</span>
              <strong>-30%</strong>
            </div>
          </div>
        </section>

        <section className="catalog-section" id="catalogo">
          <div className="section-head">
            <div>
              <p className="eyebrow">Catálogo</p>
              <h2>Encuentra lo que hace vibrar a tu creatividad</h2>
            </div>
            <span className="section-pill">{filteredProducts.length} productos</span>
          </div>

          <div className="category-tabs" aria-label="Filtros de categoría">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? 'tab active' : 'tab'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="products-grid" id="destacados">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id} onClick={() => setSelectedProduct(product)}>
                <div className={`product-visual ${product.tone}`}>
                  <img src={product.image} alt={product.name} />
                  <small>{product.badge}</small>
                </div>

                <div className="product-info">
                  <div className="meta-row">
                    <span>{product.category}</span>
                    <span>★ {product.rating}</span>
                  </div>

                  <h3>{product.name}</h3>
                  <p>{product.desc}</p>

                  <div className="price-row">
                    <strong>${product.price}</strong>
                    <span>${product.oldPrice}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleAddToCartRequest(product)
                    }}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-section" id="soporte">
          <div className="section-head narrow">
            <div>
              <p className="eyebrow">Por qué elegir MixShop</p>
              <h2>Todo para crear sin límites</h2>
            </div>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon">
                  <img src={feature.icon} alt={feature.title} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="deal-banner">
          <div>
            <p className="eyebrow">Bundle especial</p>
            <h2>Mix Pack Creator</h2>
            <p>Instrumento + bocina + accesorios por menos del 20% del valor normal.</p>
          </div>
          <button type="button">Comprar ahora</button>
        </section>
      </main>

      <footer className="site-footer">
        <p>MixShop © 2026</p>
        <div>
          <a href="#">Instagram</a>
          <a href="#">Spotify</a>
          <a href="#">Contacto</a>
        </div>
      </footer>
    </div>
  )
}

export default App
