"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useProduct } from "../../contexts/ProductContext"
import { useCart } from "../../contexts/CartContext"
import "./ProductDetailPage.css"

const ProductDetailPage = () => {
  const { id } = useParams()
  const productContext = useProduct()
  const navigate = useNavigate()
  // Kiểm tra context
  if (!productContext) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Lỗi: Không thể lấy dữ liệu sản phẩm (context chưa khởi tạo).</p>
        </div>
        <Footer />
      </div>
    )
  }

  const { productDetails, loading } = productContext

  // Kiểm tra productDetails
  if (!productDetails || !Array.isArray(productDetails)) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Lỗi: Dữ liệu sản phẩm không hợp lệ.</p>
        </div>
        <Footer />
      </div>
    )
  }

  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [selectedVariant, setSelectedVariant] = useState(null)
  const { addToCart } = useCart()
  const [thumbStart, setThumbStart] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const thumbnailRowRef = useRef(null)

  useEffect(() => {
    const found = productDetails.find(p => p.id === id)
    setProduct(found || null)
    setSelectedVariant(found?.variants?.[0] || null)
  }, [id, productDetails])

  // Tổng hợp tất cả ảnh: ảnh sản phẩm gốc + ảnh các mẫu con
  const allImages = [
    product?.image,
    ...(product?.variants?.map(v => v.image) || [])
  ].filter(Boolean)

  // Kiểm tra loading từ context
  if (loading) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
        <Footer />
      </div>
    )
  }

  // Kiểm tra product
  if (!product) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="container">
          <div className="not-found">
            <h2>Không tìm thấy sản phẩm</h2>
            <Link to="/products" className="back-link">
              ← Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Kiểm tra variants
  if (!product.variants || product.variants.length === 0) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="container">
          <div className="not-found">
            <h2>Sản phẩm chưa có mẫu con (variants).</h2>
            <Link to="/products" className="back-link">
              ← Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      addToCart({
        ...product,
        variant: selectedVariant
      }, quantity)
      setShowModal(true)
    }
  }

  return (
    <div className="product-detail-page">
      <Header />
      {/* Modal thông báo thêm vào giỏ hàng thành công */}
      {showModal && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div className="modal-content" style={{
            background: "#fff", padding: "32px 24px", borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", textAlign: "center"
          }}>
            <svg className="addtocart-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#39c8bb", width: "50px", height: "50px" }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 className="" style={{ color: "#39c8bb", marginTop: "16px" }}>Thêm vào giỏ hàng thành công!</h2>

            {/* --- BỌC 2 NÚT BẰNG DIV NÀY --- */}
            <div className="modal-actions" style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",          /* <-- Tách 2 nút ra */
              marginTop: "24px"     /* <-- Đổi margin-top ra ngoài */
            }}>
              {/* Nút 1: "Đóng" (Style Secondary/Viền) */}
              <button style={{
                padding: "8px 24px",
                background: "#fff",            /* <-- Sửa */
                color: "#39c8bb",            /* <-- Sửa */
                border: "1px solid #39c8bb",  /* <-- Sửa */
                borderRadius: "6px",
                cursor: "pointer"
              }} onClick={() => setShowModal(false)}>
                Đóng
              </button>

              {/* Nút 2: "Đi đến giỏ hàng" (Style Primary/Nền) */}
              <button style={{
                padding: "8px 24px",
                background: "#39c8bb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }} onClick={() => {
                setShowModal(false);
                navigate('/cart'); 
              }}>
                Đi đến giỏ hàng
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="product-detail-main">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>

          <div className="product-detail-content">
            {/* Cột trái: tất cả ảnh sản phẩm gốc + ảnh các mẫu con */}
            <div className="product-images">
              <div className="main-image">
                <img src={allImages[selectedImage] || "/placeholder.svg"} alt={product.name} style={{ width: "100%", height: "auto", borderRadius: "8px", transition: "opacity 0.3s" }} />
              </div>
              <div className="image-thumbnails-row" style={{ position: "relative", marginTop: "12px" }}>
                {/* Thumbnail scroll logic */}
                {(() => {
                  const THUMB_WIDTH = 80;
                  const VISIBLE_COUNT = 6;
                  const totalThumbs = allImages.length;
                  return (
                    <div className="image-thumbnails-buttons">
                      {totalThumbs > VISIBLE_COUNT && (
                        <button
                          className="button-thumbnail"
                          style={{
                            cursor: thumbStart > 0 ? "pointer" : "not-allowed"
                          }}
                          onClick={() => {
                            setThumbStart(Math.max(0, thumbStart - 1));
                            if (thumbnailRowRef.current) {
                              thumbnailRowRef.current.style.transition = "transform 0.3s";
                            }
                          }}
                          disabled={thumbStart === 0}
                        >
                          &#8592;
                        </button>
                      )}
                      <div
                        ref={thumbnailRowRef}
                        style={{
                          display: "flex",
                          overflow: "hidden",
                          width: `${THUMB_WIDTH * VISIBLE_COUNT}px`,
                          minWidth: `${THUMB_WIDTH * VISIBLE_COUNT}px`,
                          transition: "transform 0.3s"
                        }}>
                        {allImages.slice(thumbStart, thumbStart + VISIBLE_COUNT).map((image, index) => {
                          const realIdx = thumbStart + index;
                          return (
                            <button
                              key={realIdx}
                              className={`thumbnail ${selectedImage === realIdx ? "active" : ""}`}
                              onClick={() => setSelectedImage(realIdx)}
                              style={{
                                border: selectedImage === realIdx ? "2px solid #39c8bb" : "1px solid #ccc",
                                transition: "border 0.2s"
                              }}
                            >
                              <img src={image || "/placeholder.svg"} alt={`${product.name} ${realIdx + 1}`} style={{ transition: "opacity 0.3s" }} />
                            </button>
                          );
                        })}
                      </div>
                      {totalThumbs > VISIBLE_COUNT && (
                        <button
                          style={{
                            width: "32px", height: "32px", border: "none", background: "#eee", borderRadius: "50%", marginLeft: "4px", cursor: thumbStart + VISIBLE_COUNT < totalThumbs ? "pointer" : "not-allowed"
                          }}
                          onClick={() => {
                            setThumbStart(Math.min(totalThumbs - VISIBLE_COUNT, thumbStart + 1));
                            if (thumbnailRowRef.current) {
                              thumbnailRowRef.current.style.transition = "transform 0.3s";
                            }
                          }}
                          disabled={thumbStart + VISIBLE_COUNT >= totalThumbs}
                        >
                          &#8594;
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Cột phải: thông tin sản phẩm + danh sách các mẫu con */}
            <div className="product-info">
              <h1>{product.name}</h1>
              <div className="product-price">
                <span className="current-price">{selectedVariant ? selectedVariant.price.toLocaleString("vi-VN") : product.price.toLocaleString("vi-VN")}đ</span>
              </div>
              <br />
              {/* Danh sách các mẫu con (variants) */}
              <div className="product-variants">
                <h3>Các mẫu khác cho bé lựa chọn:</h3>
                <br />
                <div className="variants-select-row">
                  {product.variants && product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      className={`variant-select-btn${selectedVariant?.name === variant.name ? " active" : ""}`}
                      onClick={() => {
                        setSelectedVariant(variant)
                        setSelectedImage(idx + 1) // idx+1 vì ảnh gốc ở vị trí 0, các mẫu con bắt đầu từ 1
                      }}
                      style={{

                        background: selectedVariant?.name === variant.name ? "#e3eeed" : "#fff",
                        border: selectedVariant?.name === variant.name ? "2px solid #39c8bb" : "1px solid #ccc",

                      }}
                    >
                      <img
                        src={variant.image}
                        alt={variant.name}
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginRight: "8px"
                        }}
                      />
                      {variant.name}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: "16px", marginBottom: "16px", fontSize: "14px", color: "#888" }}>
                  Giá: <b>{selectedVariant ? selectedVariant.price.toLocaleString("vi-VN") : product.price.toLocaleString("vi-VN")}đ</b> | Kho: <b>{selectedVariant ? selectedVariant.stock : product.stock}</b>
                </div>
              </div>

              <div className="product-actions">
                <div className="quantity-selector">
                  <label>Số lượng:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(quantity + 1, selectedVariant ? selectedVariant.stock : product.stock))}
                      disabled={quantity >= (selectedVariant ? selectedVariant.stock : product.stock)}
                    >
                      +
                    </button>
                  </div>
                  {selectedVariant && selectedVariant.stock === 0 && (
                    <div style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
                      Ôi hết hàng mất rồi, mong bé thông cảm!
                    </div>
                  )}
                </div>
                <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={!selectedVariant || quantity > (selectedVariant ? selectedVariant.stock : product.stock)}>
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>

          <div className="product-tabs">
            <div className="tab-buttons">
              <button
                className={`tab-product-btn ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
              >
                Mô tả chi tiết
              </button>
              <button
                className={`tab-product-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Đánh giá ({product.reviews || 0})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "description" && (
                <div className="description-content">
                  <h3>Mô tả sản phẩm</h3>
                  <p>{product.description}</p>
                  <br />
                  <div className="product-features">
                    <h4>Tính năng nổi bật:</h4>
                    <ul>
                      {product.features && product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="reviews-content">
                  <h3>Đánh giá từ khách hàng</h3>
                  <div className="reviews-summary">
                    <div className="rating-overview">
                      <span className="big-rating">{product.rating || 0}</span>
                      <div className="stars-large">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < (product.rating || 0) ? "filled" : ""}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <p>{product.reviews || 0} đánh giá</p>
                    </div>
                  </div>
                  <div className="review-form">
                    <h4>Viết đánh giá của bạn</h4>
                    <textarea placeholder="Chia sẻ trải nghiệm của bạn..."></textarea>
                    <button className="submit-review-btn">Gửi đánh giá</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductDetailPage
