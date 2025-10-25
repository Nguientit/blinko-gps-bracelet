"use client"
import { ShoppingCart, Package, Users, BarChart3, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./AdminDashboard.css"

export default function Sidebar({ setActiveSection, activeSection }) {
  const navigate = useNavigate()

  const items = [
    { key: "orders", label: "Quản lý đơn hàng", icon: ShoppingCart },
    { key: "products", label: "Quản lý sản phẩm", icon: Package },
    { key: "users", label: "Quản lý tài khoản", icon: Users },
    { key: "revenue", label: "Doanh thu", icon: BarChart3 },
  ]

  return (
    <aside className="pmx-sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              className={`pmx-sidebar-btn ${activeSection === item.key ? "active" : ""}`}
              onClick={() => setActiveSection(item.key)}
              title={item.label}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="pmx-sidebar-btn logout" onClick={() => navigate("/")}>
          <LogOut size={20} />
          <span>Thoát Admin</span>
        </button>
      </div>
    </aside>
  )
}
