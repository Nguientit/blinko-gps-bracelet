"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Menu, X, LogOut, BarChart3, Users, Package, ShoppingCart } from "lucide-react"
import "./AdminHeader.css"

const AdminHeader = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [adminStats, setAdminStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
    })
    const [loading, setLoading] = useState(true)

    const getAvatarInitials = (name) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }
    // Lấy dữ liệu admin từ API
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true)

                // Lấy dữ liệu từ các API endpoint
                const [ordersRes, usersRes, productsRes] = await Promise.all([
                    fetch("/api/orders"),
                    fetch("/api/users"),
                    fetch("/api/products"),
                ])

                const orders = await ordersRes.json()
                const users = await usersRes.json()
                const productsData = await productsRes.json()

                const totalOrders = orders.length
                const pendingOrders = orders.filter((o) => o.status === "pending").length
                const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

                setAdminStats({
                    totalOrders,
                    pendingOrders,
                    totalUsers: users.length,
                    totalProducts: productsData.product_detail?.length || 0,
                    totalRevenue,
                })
            } catch (error) {
                console.error("[v0] Error fetching admin data:", error)
            } finally {
                setLoading(false)
            }
        }

        if (user?.role === "admin") {
            fetchAdminData()
        }
    }, [user])

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    // Chỉ hiển thị nếu user là admin
    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <header className="admin-header">
            <div className="admin-header-container">
                {/* Logo */}
                <div className="admin-logo">
                    <BarChart3 size={28} />
                    <span>Blinko Admin</span>
                </div>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="stat-item">
                        <ShoppingCart size={20} />
                        <span>{adminStats.totalOrders}</span>
                    </div>
                    <div className="stat-item">
                        <Package size={20} />
                        <span>{adminStats.totalProducts}</span>
                    </div>
                    <div className="stat-item">
                        <Users size={20} />
                        <span>{adminStats.totalUsers}</span>
                    </div>
                </div>

                {/* User Menu */}
                <div className="admin-user-menu">
                    <div className="admin-user-info">
                        <div className="avatar-circle">
                            {user.avatar ? (
                                <img
                                    src={user.avatar || "/placeholder.svg"}
                                    alt={user.fullName}
                                />
                            ) : (
                                <span className="avatar-initials">
                                    {getAvatarInitials(user.fullName)}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="admin-user-name">{user?.fullName}</p>
                            <p className="admin-user-role">Admin</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-btn" title="Đăng xuất">
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button className="admin-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <nav className="admin-nav-mobile">
                    <a href="/admin/dashboard" className="admin-nav-link-mobile">
                        Dashboard
                    </a>
                    <a href="/admin/orders" className="admin-nav-link-mobile">
                        Đơn hàng ({adminStats.totalOrders})
                    </a>
                    <a href="/admin/products" className="admin-nav-link-mobile">
                        Sản phẩm ({adminStats.totalProducts})
                    </a>
                    <a href="/admin/users" className="admin-nav-link-mobile">
                        Người dùng ({adminStats.totalUsers})
                    </a>
                    <button onClick={handleLogout} className="admin-nav-link-mobile logout">
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </nav>
            )}
        </header>
    )
}

export default AdminHeader
