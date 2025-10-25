"use client"

import { useEffect, useState } from "react"
import "./AdminDashboard.css"

export default function RevenueManager() {
  const [dailyRevenue, setDailyRevenue] = useState({})
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/orders`)
      if (!response.ok) throw new Error("Lỗi tải đơn hàng")
      const orders = await response.json()
      calculateRevenue(orders)
    } catch (error) {
      console.error("❌ Lỗi tải doanh thu:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateRevenue = (orders) => {
    const daily = {}
    let total = 0

    orders
      .filter((o) => o.status === "Đã thanh toán" || o.status === "Đã giao")
      .forEach((o) => {
        if (o.createdAt) {
          const date = o.createdAt.split("T")[0]
          daily[date] = (daily[date] || 0) + o.total
          total += o.total
        }
      })

    setDailyRevenue(daily)
    setTotalRevenue(total)
  }

  const sortedRevenueEntries = Object.entries(dailyRevenue).sort(
    ([dateA], [dateB]) => new Date(dateB) - new Date(dateA),
  )

  return (
    <div className="managerSection">
      <h1>Doanh thu theo ngày</h1>
      <p>Chỉ tính các đơn hàng có trạng thái "Đã thanh toán" hoặc "Đã giao".</p>

      {/* Total revenue card */}
      <div className="revenueSummaryCard">
        <h3>Tổng doanh thu</h3>
        <p className="totalRevenue">{totalRevenue.toLocaleString("vi-VN")} ₫</p>
      </div>

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="tableContainer">
          <table className="userTable">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {sortedRevenueEntries.length > 0 ? (
                sortedRevenueEntries.map(([date, amount]) => (
                  <tr key={date}>
                    <td>{date}</td>
                    <td className="revenueAmount">{amount.toLocaleString("vi-VN")} ₫</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", padding: "20px" }}>
                    Chưa có dữ liệu doanh thu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
