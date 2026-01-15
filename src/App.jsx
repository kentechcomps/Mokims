import { useState } from 'react'
import './App.css'
import BundleCard from './components/BundleCard'
import PaymentModal from './components/PaymentModal'
import CategoryFilter from './components/CategoryFilter'
import { bundles, categories } from './data/bundles'

// Starlink Dish SVG Component
const StarlinkDish = () => (
  <svg className="starlink-dish" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dishGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#00ff88', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: '#00ccff', stopOpacity: 1}} />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="45" rx="30" ry="25" fill="url(#dishGradient)" opacity="0.9" />
    <circle cx="50" cy="45" r="28" fill="none" stroke="#00ff88" strokeWidth="0.5" opacity="0.5" />
    <circle cx="50" cy="45" r="20" fill="none" stroke="#00ff88" strokeWidth="0.5" opacity="0.5" />
    <circle cx="50" cy="45" r="12" fill="none" stroke="#00ff88" strokeWidth="0.5" opacity="0.5" />
    <rect x="48" y="65" width="4" height="25" fill="#00ff88" />
    <circle cx="50" cy="40" r="35" fill="none" stroke="#00ccff" strokeWidth="0.8" opacity="0.4" />
    <circle cx="50" cy="40" r="42" fill="none" stroke="#00ff88" strokeWidth="0.6" opacity="0.2" />
  </svg>
)

function App() {
  const [activeCategory, setActiveCategory] = useState('All Bundles')
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const filteredBundles = activeCategory === 'All Bundles' 
    ? bundles 
    : bundles.filter(bundle => bundle.category === activeCategory)

  return (
    <div className="app">
      <div className="background-orbs"></div>
      <header className="app-header">
        <div className="header-content">
          <StarlinkDish />
          <h1 className="header-title">Starlink Data Bundles</h1>
          <p className="header-subtitle">High-speed internet for Kenya</p>
        </div>
      </header>

      <main className="app-main">
        <section className="intro-section">
          <h2>Affordable Data Bundles</h2>
          <p>Select from our wide range of data plans</p>
          <div className="quick-select">
            <button className="quick-btn">Daily</button>
            <button className="quick-btn">Weekly</button>
            <button className="quick-btn">Monthly</button>
            <button className="quick-btn">Unlimited</button>
          </div>
        </section>

        <section className="carrier-support">
          <h3 className="carrier-title">Available on All Networks</h3>
          <div className="carrier-badges">
            <div className="carrier-badge airtel">
              <span className="carrier-icon">📱</span>
              <span className="carrier-name">Airtel</span>
            </div>
            <div className="carrier-badge safaricom">
              <span className="carrier-icon">📡</span>
              <span className="carrier-name">Safaricom</span>
            </div>
          </div>
        </section>

        <CategoryFilter 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <section className="bundles-grid">
          {filteredBundles.map(bundle => (
            <BundleCard key={bundle.id} bundle={bundle} onBuy={(b) => { setSelectedBundle(b); setModalOpen(true) }} />
          ))}
        </section>
        {modalOpen && selectedBundle && (
          <PaymentModal bundle={selectedBundle} onClose={() => { setModalOpen(false); setSelectedBundle(null) }} />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-text">Powered by <span className="footer-brand">clarion labs.ink</span></p>
          <p className="footer-tagline">Futuristic Connectivity Solutions</p>
        </div>
      </footer>
    </div>
  )
}

export default App
