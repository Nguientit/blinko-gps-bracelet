"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../contexts/CartContext"
import { useAuth } from "../../contexts/AuthContext"
import { useCheckout } from "../../contexts/CheckoutContext"
import { useProfile } from "../../contexts/ProfileContext"
import "./CheckoutPage.css"

export default function CheckoutPage() {
  // Thay vì destructure trực tiếp, kiểm tra context trước
  const checkoutContext = useCheckout()
  if (!checkoutContext) {
    return (
      <div className="checkout-container">
        <h1 className="checkout-title">Thanh toán</h1>
        <div style={{ padding: 32, textAlign: "center" }}>
          <div className="loading-spinner"></div>
          <p>Lỗi: Không thể lấy dữ liệu thanh toán (CheckoutContext chưa khởi tạo).</p>
        </div>
      </div>
    )
  }
  const { cart, clearCart, loading: cartLoading } = useCart()
  const { user } = useAuth()
  const { checkoutInfo, updateCheckoutInfo, selectPaymentMethod, placeOrder, clearCheckout } = checkoutContext
  const { addOrder } = useProfile()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",

    address: user?.address?.street || "",
    city: user?.address?.city || "",
    district: user?.address?.district || "",
    ward: user?.address?.ward || "",

    note: "",
    paymentMethod: "cod",
  })

  // State cho địa chỉ VN
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [useDifferentAddress, setUseDifferentAddress] = useState(false)

  // Lấy danh sách tỉnh/thành phố khi load
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/")
        if (!response.ok) throw new Error("Failed to fetch provinces")
        const data = await response.json()
        setProvinces(data)
      } catch (error) {
        console.error("Error fetching provinces:", error)
        setProvinces([]) // Đặt giá trị mặc định nếu lỗi
      }
    }
    fetchProvinces()
  }, [])

  // Lấy danh sách quận/huyện khi chọn tỉnh/thành phố
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.city) {
        setDistricts([])
        setWards([])
        return
      }
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${formData.city}?depth=2`)
        if (!response.ok) throw new Error("Failed to fetch districts")
        const data = await response.json()
        setDistricts(data.districts || [])
      } catch (error) {
        console.error("Error fetching districts:", error)
        setDistricts([]) // Đặt giá trị mặc định nếu lỗi
      }
    }
    fetchDistricts()
  }, [formData.city])

  // Lấy danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.district) {
        setWards([])
        return
      }
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${formData.district}?depth=2`)
        if (!response.ok) throw new Error("Failed to fetch wards")
        const data = await response.json()
        setWards(data.wards || [])
      } catch (error) {
        console.error("Error fetching wards:", error)
        setWards([]) // Đặt giá trị mặc định nếu lỗi
      }
    }
    fetchWards()
  }, [formData.district])

  // Nếu user đã có dữ liệu địa chỉ, tự động điền vào form và tải danh sách quận/huyện, phường/xã
  useEffect(() => {
    // Kiểm tra nếu user thiếu thông tin cơ bản thì bật useDifferentAddress mặc định
    const missingInfo =
      !user?.phone ||
      !user?.address?.street ||
      !user?.address?.city ||
      !user?.address?.district ||
      !user?.address?.ward;

    setUseDifferentAddress(missingInfo);

    if (user?.address?.city) {
      setFormData((prev) => ({
        ...prev,
        city: user.address.city,
        district: user.address.district,
        ward: user.address.ward,
        address: user.address.street,
      }))

      // Lấy danh sách quận/huyện
      const fetchDistricts = async () => {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/p/${user.address.city}?depth=2`)
          if (!response.ok) throw new Error("Failed to fetch districts")
          const data = await response.json()
          setDistricts(data.districts || [])

          // Nếu đã có quận/huyện, lấy danh sách phường/xã
          if (user.address.district) {
            const districtData = data.districts.find((d) => String(d.code) === String(user.address.district))
            if (districtData) {
              setWards(districtData.wards || [])
            }
          }
        } catch (error) {
          console.error("Error fetching districts or wards:", error)
          setDistricts([])
          setWards([])
        }
      }

      fetchDistricts()
    }
  }, [user])

  // Tính toán lại giá trị đơn hàng dựa trên cart context
  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.variant ? item.product.variant.price : item.product.price
    return sum + price * item.quantity
  }, 0)
  const shipping = 30000
  const total = subtotal + shipping

  const justSubmittedRef = useRef(false);
  const firstRenderRef = useRef(true);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleToggleAddress = () => {
    setUseDifferentAddress((prev) => !prev)

    if (!useDifferentAddress) {
      // Reset to user's saved address when toggling back
      setFormData((prev) => ({
        ...prev,
        city: user?.address?.city || prev.city,
        district: user?.address?.district || prev.district,
        ward: user?.address?.ward || prev.ward,
        address: user?.address?.street || prev.address,
      }))
    }
  }

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      const justFinishedOrder = sessionStorage.getItem("justFinishedOrder") === "true";
      if (!justFinishedOrder && cart.length === 0 && !isProcessing && !orderComplete) {
        navigate("/cart");
      }
      sessionStorage.removeItem("justFinishedOrder");
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    justSubmittedRef.current = true;
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const order = {
      id: `order-${Date.now()}`,
      userId: user?.id || localStorage.getItem("userId"), // Thêm userId vào order
      customer: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: getFullAddress(),
      payment:
        formData.paymentMethod === "cod"
          ? "Thanh toán khi nhận hàng (COD)"
          : formData.paymentMethod === "bank"
            ? "Chuyển khoản ngân hàng"
            : "Thẻ tín dụng/Ghi nợ",
      status: "Chờ xác nhận",
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        variant: item.product.variant ? item.product.variant.name : "",
        variantImage: item.product.variant ? item.product.variant.image : item.product.image,
        quantity: item.quantity,
        price: item.product.variant ? item.product.variant.price : item.product.price,
      })),
      total,
      note: formData.note,
      createdAt: new Date().toISOString(),
    };

    try {
      console.log("Submitting order, before createOrder: ", order);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        // Cố gắng đọc lỗi từ server nếu có
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi gửi đơn hàng lên server");
      }
      console.log("createOrder done");

      addOrder(order);
      console.log("addOrder done");
      sessionStorage.removeItem("checkoutStarted");

      setOrderComplete(true);
      setIsProcessing(false);

      setTimeout(() => {
        sessionStorage.setItem("justFinishedOrder", "true");
        justSubmittedRef.current = false;

        navigate("/", { replace: true });

        setTimeout(() => {
          clearCart();
          clearCheckout();
        }, 1000);
      }, 3000);


    } catch (error) {
      console.error("Error creating order:", error);
      alert("Có lỗi khi lưu đơn hàng lên server. Vui lòng thử lại.");
      setIsProcessing(false);
      justSubmittedRef.current = false;
    }
  };



  const getFullAddress = () => {
    if (useDifferentAddress) {
      const provinceName = provinces.find(p => String(p.code) === String(formData.city))?.name || ""
      const districtName = districts.find(d => String(d.code) === String(formData.district))?.name || ""
      const wardName = wards.find(w => String(w.code) === String(formData.ward))?.name || ""
      return [formData.address, wardName, districtName, provinceName].filter(Boolean).join(", ")
    } else {
      // Địa chỉ mặc định của user
      return [
        user?.address?.street || "",
        user?.address?.ward || "",
        user?.address?.district || "",
        user?.address?.city || ""
      ].filter(Boolean).join(", ")
    }
  }

  if (orderComplete) {
    return (
      <div className="checkout-success-container">
        <div className="checkout-success-content">
          <svg className="checkout-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h1 className="checkout-success-title">Đặt hàng thành công!</h1>
          <p className="checkout-success-message">
            Cảm ơn bạn đã mua hàng tại Blinko. Chúng tôi sẽ liên hệ với bạn sớm nhất.
          </p>
          <p className="checkout-success-redirect">Đang chuyển về trang chủ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Thanh toán</h1>
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="checkout-grid">
          {/* Shipping Information */}
          <div className="checkout-main">
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">Thông tin giao hàng</h2>
              </div>
              <div className="checkout-card-content">
                <div className="checkout-form-row">
                  <div className="checkout-form-group">
                    <label htmlFor="fullName" className="checkout-label">
                      Họ và tên <span className="checkout-required">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="checkout-input"
                      required
                    />
                  </div>
                  <div className="checkout-form-group">
                    <label htmlFor="phone" className="checkout-label">
                      Số điện thoại <span className="checkout-required">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="checkout-input"
                      required
                    />
                  </div>
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="email" className="checkout-label">
                    Email <span className="checkout-required">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="checkout-input"
                    required
                  />
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="address" className="checkout-label">
                    Địa chỉ <span className="checkout-required">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Số nhà, tên đường"
                    className="checkout-input"
                    required
                  />
                </div>

                <div className="checkout-form-group">
                  <label className="checkout-label">
                    <input
                      type="checkbox"
                      checked={useDifferentAddress}
                      onChange={handleToggleAddress}
                      className="checkout-checkbox"
                    />
                    Giao đến địa chỉ khác
                  </label>
                </div>

                {useDifferentAddress ? (
                  <>
                    <div className="checkout-form-row checkout-form-row-3">
                      <div className="checkout-form-group">
                        <label htmlFor="city" className="checkout-label">
                          Tỉnh/Thành phố <span className="checkout-required">*</span>
                        </label>
                        <select
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value, district: "", ward: "" })}
                          className="checkout-input checkout-select"
                          required
                        >
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="checkout-form-group">
                        <label htmlFor="district" className="checkout-label">
                          Quận/Huyện <span className="checkout-required">*</span>
                        </label>
                        <select
                          id="district"
                          name="district"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value, ward: "" })}
                          className="checkout-input checkout-select"
                          required
                          disabled={!formData.city}
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map((district) => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="checkout-form-group">
                        <label htmlFor="ward" className="checkout-label">
                          Phường/Xã <span className="checkout-required">*</span>
                        </label>
                        <select
                          id="ward"
                          name="ward"
                          value={formData.ward}
                          onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                          className="checkout-input checkout-select"
                          required
                          disabled={!formData.district}
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="checkout-form-group">
                      <label className="checkout-label">Địa chỉ mới:</label>
                      <div className="checkout-print-address">
                        {getFullAddress() || <span style={{ color: "#aaa" }}>Vui lòng nhập đầy đủ địa chỉ</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="checkout-form-group">
                    <label className="checkout-label">Địa chỉ chi tiết:</label>
                    <div className="checkout-print-address">
                      {`${user?.address?.street || ""}, ${user?.address?.ward || ""}, ${user?.address?.district || ""}, ${user?.address?.city || ""}`}
                    </div>
                  </div>
                )}

                <div className="checkout-form-group">
                  <label htmlFor="note" className="checkout-label">
                    Ghi chú đơn hàng (tùy chọn)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="checkout-textarea"
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">Phương thức thanh toán</h2>
              </div>
              <div className="checkout-card-content">
                <div className="checkout-payment-options">
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="checkout-radio"
                    />
                    <div className="checkout-payment-content">
                      <svg
                        className="checkout-payment-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <path d="M19 12a7 7 0 1 0-14 0 7 7 0 0 0 14 0" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                      <div>
                        <div className="checkout-payment-title">Thanh toán khi nhận hàng (COD)</div>
                        <div className="checkout-payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</div>
                      </div>
                    </div>
                  </label>

                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === "bank"}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="checkout-radio"
                    />
                    <div className="checkout-payment-content">
                      <svg
                        className="checkout-payment-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M2 6h20" />
                      </svg>
                      <div>
                        <div className="checkout-payment-title">Chuyển khoản ngân hàng</div>
                        <div className="checkout-payment-desc">Chuyển khoản qua ngân hàng</div>
                      </div>
                    </div>
                  </label>

                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="checkout-radio"
                    />
                    <div className="checkout-payment-content">
                      <svg
                        className="checkout-payment-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                      <div>
                        <div className="checkout-payment-title">Thẻ tín dụng/Ghi nợ</div>
                        <div className="checkout-payment-desc">Thanh toán bằng thẻ Visa, Mastercard</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-sidebar">
            <div className="checkout-card checkout-card-sticky">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">Đơn hàng của bạn</h2>
              </div>
              <div className="checkout-card-content">
                <div className="checkout-items">
                  {cart.map((item, idx) => {
                    const isVariant = !!item.product.variant;
                    const name = isVariant
                      ? `${item.product.name} - ${item.product.variant.name}`
                      : item.product.name;
                    const image = isVariant
                      ? item.product.variant.image
                      : item.product.image;
                    const price = isVariant
                      ? item.product.variant.price
                      : item.product.price;
                    return (
                      <div key={idx} className="checkout-item">
                        <div className="checkout-item-image">
                          <img
                            src={image}
                            alt={name}
                            className="checkout-item-img"
                            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
                          />
                        </div>
                        <div className="checkout-item-quantity">{item.quantity}</div>
                        <div className="checkout-item-info">
                          <p className="checkout-item-name">{name}</p>
                          <p className="checkout-item-price">
                            {(price * item.quantity).toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="checkout-divider" />

                <div className="checkout-summary">
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-label">Tạm tính</span>
                    <span className="checkout-summary-value">{subtotal.toLocaleString("vi-VN") + "đ"}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-label">Phí vận chuyển</span>
                    <span className="checkout-summary-value">{shipping.toLocaleString("vi-VN") + "đ"}</span>
                  </div>
                </div>

                <div className="checkout-divider" />

                <div className="checkout-total">
                  <span className="checkout-total-label">Tổng cộng</span>
                  <span className="checkout-total-value">{total.toLocaleString("vi-VN") + "đ"}</span>
                </div>

                <button type="submit" className="checkout-submit-btn" disabled={isProcessing}>
                  {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
                </button>

                <p className="checkout-terms">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <a href="#" className="checkout-terms-link">
                    Điều khoản dịch vụ
                  </a>{" "}
                  của chúng tôi
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
