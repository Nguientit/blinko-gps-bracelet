"use client"

import { useState, useEffect } from "react"
import { useProfile } from "../../contexts/ProfileContext"
import { useNavigate } from "react-router-dom"
import { ShoppingBag, Calendar, Package, ArrowRight } from "lucide-react"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useFeedback } from "../../contexts/FeedbackContext"
import "./MyOrderPage.css"

const MyOrderPage = () => {
  const { profile, initialLoading, orders, fetchOrders, loading: apiLoading } = useProfile()
  const navigate = useNavigate()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [error, setError] = useState(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const { checkHasFeedback } = useFeedback()

  useEffect(() => {
    if (!initialLoading && !profile) {
      navigate("/auth")
    } else if (!initialLoading && profile && fetchOrders) {
      fetchOrders(profile.id).catch(err => {
        console.error("Lỗi tải đơn hàng:", err);
        setError(err.message || "Không thể tải lịch sử đơn hàng");
      });
    }
  }, [initialLoading, profile, navigate, fetchOrders])

  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     try {
  //       setLoading(true)
  //       setError(null)
  //       // Lấy đúng danh sách đơn hàng theo userId
  //       const userId = profile?.id || localStorage.getItem("userId")
  //       if (!userId) {
  //         setOrders([])
  //         setLoading(false)
  //         return
  //       }
  //       const res = await fetch(`/api/orders?userId=${userId}`)
  //       if (!res.ok) {
  //         throw new Error("Không thể tải lịch sử đơn hàng")
  //       }
  //       const data = await res.json()
  //       setOrders(data)
  //     } catch (err) {
  //       console.error("Lỗi tải đơn hàng:", err)
  //       setError(err.message)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   if (profile) {
  //     fetchOrders()
  //   }
  // }, [profile])

  useEffect(() => {
    const runCheck = async () => {
      if (profile?.email && orders.length > 0 && checkHasFeedback) {
        try {
          const hasFeedback = await checkHasFeedback(profile.email);
          if (!hasFeedback) {
            setShowFeedbackModal(true)
          }
        } catch (err) {
          console.error("Lỗi kiểm tra feedback:", err)
        }
      }
    }

    runCheck()
  }, [profile, orders, checkHasFeedback])

  const handleOrderClick = (order) => {
    setSelectedOrder((prevOrder) => (prevOrder?.id === order.id ? null : order))
  }

  if (initialLoading) {
    return (
      <div className="my-order-page">
        <Header />
        <main className="orders-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Đang tải dữ liệu người dùng...</p>
          {/* Bạn có thể thêm spinner ở đây */}
        </main>
        <Footer />
      </div>
    );
  }

  if (apiLoading && orders.length === 0) {
    return (
      <div className="my-order-page">
        <Header />
        <main className="orders-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Đang tải lịch sử đơn hàng...</p>
          {/* Bạn có thể thêm spinner ở đây */}
        </main>
        <Footer />
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="my-order-page">
        <Header />
        <main className="orders-container" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <p>Lỗi: {error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusClass = (status) => {
    if (!status) return "status-badge"
    const s = status.toLowerCase()
    if (s.includes("chờ xác nhận")) return "status-badge cho-xac-nhan"
    if (s.includes("đang giao")) return "status-badge dang-giao-hang"
    if (s.includes("shipping")) return "status-badge shipping"
    if (s.includes("delivered") || s.includes("đã giao")) return "status-badge da-giao"
    return "status-badge"
  }

  return (
    <div className="my-order-page">
      <Header />

      <main className="orders-container">
        <div className="orders-header">
          <h1>Đơn hàng của tôi</h1>
          <p className="orders-count">Tổng cộng: {orders.length} đơn hàng</p>
        </div>
        {showFeedbackModal && (
          <div className="feedback-reminder-banner">
            <div className="feedback-reminder-content">
              <span>
                Bạn chưa gửi đánh giá cho trải nghiệm mua hàng. Hãy{" "}
                <a href="/feedback" className="feedback-reminder-link">
                  gửi đánh giá
                </a>{" "}
                để giúp <span className="logo-b-highlight">Blinko</span> cải thiện dịch vụ!
              </span>
              <button
                className="feedback-reminder-close"
                onClick={() => setShowFeedbackModal(false)}
                title="Đóng"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {orders.length === 0 && !apiLoading ? (
          <div className="empty-orders">
            <ShoppingBag size={64} />
            <h2>Chưa có đơn hàng nào</h2>
            <p>Hãy mua sắm ngay để tạo đơn hàng đầu tiên của bạn</p>
            <button className="shop-btn" onClick={() => navigate("/products")}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="orders-content">
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? "active" : ""}`}
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="order-card-header">
                    <div className="order-info">
                      <h3>Đơn hàng #{order.id}</h3>
                      <p className="order-date">
                        <Calendar size={14} />
                        {new Date(order.createdAt || order.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="order-status">
                      <span className={getStatusClass(order.status)}>{order.status}</span>
                    </div>
                  </div>
                  <div className="order-card-footer">
                    <p className="order-total">Tổng cộng: {order.total?.toLocaleString("vi-VN") || "0"} đ</p>
                    <p className="order-items">
                      <Package size={14} />
                      {order.items?.length || 0} sản phẩm
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {!selectedOrder ? (
              <div className="order-detail-empty">
                <ShoppingBag size={64} />
                <h2>Chọn một đơn hàng</h2>
                <p>Nhấp vào một đơn hàng từ danh sách bên trái để xem chi tiết</p>
              </div>
            ) : (
              <div className="order-detail-container">
                <div className="order-detail">
                  <div className="detail-header">
                    <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                    <p className="detail-date">
                      {new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="detail-recipient">
                    <h3>Thông tin người nhận</h3>
                    <p>
                      <strong>Tên:</strong> {selectedOrder.customer || selectedOrder.recipientName || "Không rõ"}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {selectedOrder.phone || "Không rõ"}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.email || "Không rõ"}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {selectedOrder.address || "Không rõ"}
                    </p>
                    {selectedOrder.note && (
                      <p>
                        <strong>Ghi chú:</strong> {selectedOrder.note}
                      </p>
                    )}
                  </div>

                  <div className="detail-items">
                    <h3>Sản phẩm</h3>
                    <div className="items-list">
                      {selectedOrder.items.map((item, index) => (
                        <div key={`${selectedOrder.id}-${item.productId || item.id}-${index}`} className="detail-item">
                          <img src={item.variantImage || item.image} alt={item.name} className="item-image" />
                          <div className="item-info">
                            <h4>{item.name}</h4>
                            {(item.variant || item.variantName) && (
                              <p className="item-variant">Phân loại: {item.variant || item.variantName}</p>
                            )}
                            <p className="item-sku">SKU: {item.productId || item.id}</p>
                          </div>
                          <div className="item-quantity">
                            <span>x{item.quantity}</span>
                          </div>
                          <div className="item-price">{(item.price * item.quantity).toLocaleString("vi-VN")} đ</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="detail-summary">
                    <div className="summary-row">
                      <span>Tổng tiền hàng:</span>
                      <span>{selectedOrder.total?.toLocaleString("vi-VN") || "0"} đ</span>
                    </div>
                    <div className="summary-row">
                      <span>Phí vận chuyển:</span>
                      <span>Miễn phí</span>
                    </div>
                    <div className="summary-row total">
                      <span>Tổng cộng:</span>
                      <span>{selectedOrder.total?.toLocaleString("vi-VN") || "0"} đ</span>
                    </div>
                  </div>

                  <div className="detail-actions">
                    <button className="action-btn primary" onClick={() => navigate("/products")}>
                      <ShoppingBag size={18} />
                      Tiếp tục mua sắm
                    </button>
                    <button className="action-btn secondary" onClick={() => setSelectedOrder(null)}>
                      <ArrowRight size={18} />
                      Quay lại
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default MyOrderPage
