"use client"

import React, { useEffect, useState } from "react"
import { CheckCircle, Truck, XCircle, Clock, Download } from "lucide-react"
import "./OrderManager.css"

export default function OrderManager() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState("Tất cả")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders`)
      if (!response.ok) throw new Error("Lỗi tải đơn hàng")
      const data = await response.json()
      setOrders(data)
      setError(null)
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error("Lỗi cập nhật trạng thái")
      await fetchOrders()
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    }
  }

  const filteredOrders = orders.filter((o) => filter === "Tất cả" || o.status === filter)

  const formatDate = (iso) => {
    const date = new Date(iso)
    return date.toLocaleString("vi-VN", { hour12: false })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Đã giao":
        return <CheckCircle size={16} className="status-icon delivered" />
      case "Đang giao hàng":
        return <Truck size={16} className="status-icon delivering" />
      case "Đã hủy":
        return <XCircle size={16} className="status-icon cancelled" />
      default:
        return <Clock size={16} className="status-icon pending" />
    }
  }

  if (loading)
    return (
      <div className="order-container">
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  if (error)
    return (
      <div className="order-container">
        <p style={{ color: "red" }}>Lỗi: {error}</p>
      </div>
    )

  return (
    <div className="order-container">
      <div className="order-header">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Tổng cộng: {orders.length} đơn hàng</p>
        </div>
        <button className="order-export-btn">
          <Download size={18} />
          Xuất dữ liệu
        </button>
      </div>

      <div className="order-tabs">
        {["Tất cả", "Chờ xác nhận", "Đang giao hàng", "Đã giao", "Đã thanh toán", "Đã hủy"].map((tab) => (
          <button key={tab} className={`tab-btn ${filter === tab ? "active" : ""}`} onClick={() => setFilter(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="order-table-wrapper">
        <table className="order-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Địa chỉ</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <React.Fragment key={o.id}>
                <tr>
                  <td className="order-id">#{o.id}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{o.customer}</div>
                      <div className="customer-email">{o.email}</div>
                    </div>
                  </td>
                  <td>{o.address}</td>
                  <td>{o.payment}</td>
                  <td>
                    <span className={`status-tag ${o.status.toLowerCase().replace(/\s+/g, "-")}`}>
                      {getStatusIcon(o.status)}
                      {o.status}
                    </span>
                  </td>
                  <td className="order-total">{o.total.toLocaleString("vi-VN")} ₫</td>
                  <td className="order-date-pmx">{formatDate(o.createdAt)}</td>
                  <td>
                    <div className="action-group">
                      <button
                        className="action-btn confirm"
                        onClick={() => updateStatus(o.id, "Đã thanh toán")}
                        title="Xác nhận"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        className="action-btn deliver"
                        onClick={() => updateStatus(o.id, "Đã giao")}
                        title="Giao hàng"
                      >
                        <Truck size={16} />
                      </button>
                      <button className="action-btn cancel" onClick={() => updateStatus(o.id, "Đã hủy")} title="Hủy">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="product-detail-row">
                  <td colSpan="8">
                    <div className="product-detail-box">
                      <h4>Sản phẩm trong đơn hàng</h4>
                      <table className="item-table">
                        <thead>
                          <tr>
                            <th>Ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Phiên bản</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Tổng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.items.map((item) => (
                            <tr key={item.productId}>
                              <td>
                                <img
                                  src={item.variantImage || "/fallback.png"}
                                  alt={item.name}
                                  className="item-thumb-small"
                                  onError={(e) => (e.target.src = "/fallback.png")}
                                />
                              </td>
                              <td>{item.name}</td>
                              <td>{item.variant || "Không có"}</td>
                              <td>{item.quantity}</td>
                              <td>{item.price.toLocaleString("vi-VN")} ₫</td>
                              <td>{(item.quantity * item.price).toLocaleString("vi-VN")} ₫</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="order-note">Dữ liệu được lưu trên server</p>
    </div>
  )
}
