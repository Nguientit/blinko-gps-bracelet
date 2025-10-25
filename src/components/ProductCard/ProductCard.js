"use client"
import { useCart } from "../../contexts/CartContext"
import "./ProductCard.css"

const ProductCard = ({ product, viewMode = "grid" }) => {
  const { addToCart } = useCart()

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const handleAddToCart = () => {
    addToCart(product)
    alert("Đã thêm sản phẩm vào giỏ hàng!")
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case "premium":
        return "Cao cấp"
      case "smart":
        return "Thông minh"
      case "basic":
        return "Cơ bản"
      default:
        return category
    }
  }

  return (
    <div className={`product-card card ${viewMode === "list" ? "product-card-list" : ""}`}>
      <div className={`product-image-container ${viewMode === "list" ? "list-image" : ""}`}>
        <div className="product-image-wrapper" onClick={() => window.location.href = `/products/${product.id}`}>
          <img
            src={product.image || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            className="product-image"
          />
        </div>
      </div>

      <div className={`product-content ${viewMode === "list" ? "list-content" : ""}`}>
        <div className="product-info">
          <div className="product-header">
            <h3 className="product-title" onClick={() => window.location.href = `/products/${product.id}`}>{product.name}</h3>
            <span className={`badge badge-${product.category}`}>{getCategoryLabel(product.category)}</span>
          </div>

          <p className="product-description">{product.description}</p>

          {/* Features */}
          <div className="product-features">
            {product.features.map((feature, index) => (
              <span key={index} className="feature-tag">
                {feature}
              </span>
            ))}
          </div>

          {/* Rating */}
          {/* <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="star filled">
                  ★
                </span>
              ))}
            </div>
            <span className="rating-text">(4.8)</span>
          </div> */}
        </div>

        <div className="product-footer">
          <div className="product-pricing">
            <div className="product-price">{formatPrice(product.price)}</div>
          </div>
          <div className="product-actions">
            <a href={`/products/${product.id}`} className="btn btn-outline">
              Chi tiết
            </a>
            <button
              onClick={() => window.location.href = `/products/${product.id}`}
              className="btn btn-primary"
            >
              Mua ngay
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProductCard
