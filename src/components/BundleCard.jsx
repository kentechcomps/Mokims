import '../styles/BundleCard.css';

export default function BundleCard({ bundle, onBuy }) {
  const handleBuy = () => {
    if (onBuy) return onBuy(bundle)
    alert(`Added "${bundle.duration} - ${bundle.data}" to cart!\nPrice: ${bundle.currency} ${bundle.price}`);
  };

  return (
    <div className="bundle-card">
      {bundle.tag && <span className={`tag tag-${bundle.tag.toLowerCase()}`}>{bundle.tag}</span>}
      
      <div className="card-content">
        <h3 className="bundle-title">{bundle.duration} - {bundle.data}</h3>
        <p className="bundle-description">{bundle.description}</p>
        
        <div className="price-section">
          <div className="price">
            <span className="currency">{bundle.currency}</span>
            <span className="amount">{bundle.price}</span>
          </div>
          <p className="currency-label">Kenyan Shillings</p>
        </div>
        
        <button className="buy-btn" onClick={handleBuy}>BUY</button>
      </div>
    </div>
  );
}
