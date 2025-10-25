"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useCart } from "../../contexts/CartContext"
import { useAuth } from "../../contexts/AuthContext"
import "./CartPage.css"

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("success") // "success" | "login"
  const navigate = useNavigate()

  // Tính tổng tiền
  const getCartTotal = () => {
    return cart.reduce(
      (sum, item) =>
        sum +
        (item.product.variant ? item.product.variant.price : item.product.price) *
        item.quantity,
      0
    )
  }

  const shippingFee = 30000
  const subtotal = getCartTotal()
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount + shippingFee

  const handlePromoCode = () => {
    const validCodes = {
      WELCOME10: 10,
      SAVE20: 20,
      NEWUSER: 15,
    }

    if (validCodes[promoCode.toUpperCase()]) {
      setDiscount(validCodes[promoCode.toUpperCase()])
      alert(
        `Áp dụng mã giảm giá thành công! Giảm ${validCodes[promoCode.toUpperCase()]}%`
      )
    } else {
      alert("Mã giảm giá không hợp lệ!")
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      setModalType("login")
      setShowModal(true)
      return
    }
    setIsCheckingOut(true)
    sessionStorage.removeItem("justFinishedOrder")
    navigate("/checkout")
  }

  // If cart is empty, show empty UI. But also show debug info if user just finished order
  if (cart.length === 0) {
    const justFinished = sessionStorage.getItem("justFinishedOrder") === "true"
    return (
      <div className="cart-page">
        <Header />
        <main className="cart-main">
          <div className="container">
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>{justFinished ? "Cảm ơn. Đơn hàng vừa hoàn tất" : "Giỏ hàng trống"}</h2>
              <p>
                {justFinished
                  ? "Bạn vừa đặt hàng. Đang chuyển hướng hoặc bạn có thể tiếp tục mua sắm."
                  : "Bạn chưa có sản phẩm nào trong giỏ hàng"}
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
                <Link to="/products" className="continue-shopping-btn">
                  Tiếp tục mua sắm
                </Link>
                {!justFinished && (
                  <button
                    className="home-shopping-btn"
                    onClick={() => navigate("/")}
                  >
                    Về trang chủ
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="cart-page">
      <Header />
      {showModal && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div className="modal-content" style={{
            background: "#fff", padding: "32px 24px", borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", textAlign: "center"
          }}>
            {modalType === "success" ? (
              <>
                <svg className="addtocart-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#39c8bb", width: "50px", height: "50px" }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h2 className="" style={{ color: "#39c8bb", marginTop: "16px" }}>Thêm vào giỏ hàng thành công!</h2>
                <div className="modal-actions" style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  marginTop: "24px"
                }}>
                  <button style={{
                    padding: "8px 24px",
                    background: "#fff",
                    color: "#39c8bb",
                    border: "1px solid #39c8bb",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }} onClick={() => setShowModal(false)}>
                    Đóng
                  </button>
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
              </>
            ) : (
              <>
                <h2 style={{ color: "#e53e3e", marginBottom: 16 }}>Bạn cần đăng nhập để thanh toán</h2>
                <div className="modal-actions" style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  marginTop: "24px"
                }}>
                  <button style={{
                    padding: "8px 24px",
                    background: "#39c8bb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }} onClick={() => {
                    setShowModal(false);
                    navigate("/auth");
                  }}>
                    Đăng nhập ngay
                  </button>
                  <button style={{
                    padding: "8px 24px",
                    background: "#fff",
                    color: "#39c8bb",
                    border: "1px solid #39c8bb",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }} onClick={() => setShowModal(false)}>
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <main className="cart-main">
        <div className="container">
          <div className="cart-header">
            <h1>Giỏ hàng của bạn</h1>
            <p>{cart.length} sản phẩm</p>
          </div>

          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item, idx) => (
                <div key={idx} className="cart-item">
                  <div className="item-image">
                    <img
                      src={
                        item.product.variant
                          ? item.product.variant.image
                          : item.product.image
                      }
                      alt={item.product.name}
                    />
                  </div>

                  <div className="item-details">
                    <h3>{item.product.name}</h3>
                    {item.product.variant && (
                      <div className="item-variant">
                        Phân loại: {item.product.variant.name}
                      </div>
                    )}
                    <p className="item-category">{item.product.category}</p>
                    <div className="item-price">
                      {(item.product.variant ? item.product.variant.price : item.product.price).toLocaleString("vi-VN")}đ
                    </div>
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      disabled={item.quantity >= (item.product.variant ? item.product.variant.stock : item.product.stock)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    {((item.product.variant ? item.product.variant.price : item.product.price) * item.quantity).toLocaleString("vi-VN")}đ
                  </div>

                  <button
                    onClick={() => removeFromCart(idx)}
                    className="remove-btn"
                    title="Xóa sản phẩm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Tóm tắt đơn hàng</h3>

                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>

                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Giảm giá ({discount}%):</span>
                    <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Tổng cộng:</span>
                  <span>{total.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="promo-code">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button onClick={handlePromoCode} className="apply-promo-btn">
                    Áp dụng
                  </button>
                </div>

                <button onClick={handleCheckout} disabled={isCheckingOut} className="checkout-btn">
                  {isCheckingOut ? "Đang xử lý..." : "Thanh toán"}
                </button>

                <Link to="/products" className="continue-shopping">
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CartPage
