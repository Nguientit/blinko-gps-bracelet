import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { Link, useNavigate } from "react-router-dom";
import "./Header.css"

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAvatarDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleAvatarDropdown = () => {
    setIsAvatarDropdownOpen(!isAvatarDropdownOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsAvatarDropdownOpen(false)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navigateToProfile = () => {
    setIsAvatarDropdownOpen(false)
    if (user?.role === "admin") {
      navigate("/admin/dashboard")
    } else {
      navigate("/profile")
    }
  }

  const navigateToMyOrders = () => {
    setIsAvatarDropdownOpen(false)
    navigate("/myorder")
  }

  const navigateToDashboard = () => {
    setIsAvatarDropdownOpen(false)
    navigate("/admin/dashboard")
  }

  const getAvatarInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <img src="/img/Logo1.png" alt="Logo" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {/* Menu links */}
            <ul className="nav-links">
              <li><Link to="/" onClick={closeMenu}>Trang chủ</Link></li>
              <li><Link to="/products" onClick={closeMenu}>Sản phẩm</Link></li>
              <li><Link to="/feedback" onClick={closeMenu}>Đánh giá</Link></li>
            </ul>

            {/* Auth + Cart group */}
            <div className="nav-actions">
              <div className="nav-buttons">
                {user ? (
                  <div className="user-section" ref={dropdownRef}>
                    <div className="user-avatar" onClick={toggleAvatarDropdown}>
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

                    </div>

                    {/* Avatar Dropdown */}
                    <div className={`avatar-dropdown ${isAvatarDropdownOpen ? "open" : ""}`}>
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">
                          {user.avatar ? (
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.fullName}
                            />
                          ) : (
                            <span>{getAvatarInitials(user.fullName)}</span>
                          )}
                        </div>
                        <div className="dropdown-user-info">
                          <p className="dropdown-name">{user.fullName}</p>
                          <p className="dropdown-email">{user.email}</p>
                          <span className={`role-badge ${user.role}`}>
                            {user.role === "admin" ? "Admin" : "Customer"}
                          </span>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      <div className="dropdown-menu">
                        {user.role === "admin" ? (
                          <>
                            <button className="dropdown-item" onClick={navigateToDashboard}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                              </svg>
                              Admin Dashboard
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="dropdown-item" onClick={navigateToProfile}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                              Thông tin cá nhân
                            </button>
                            <button className="dropdown-item" onClick={navigateToMyOrders}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v12z" />
                              </svg>
                              Đơn hàng của tôi
                            </button>
                          </>
                        )}



                        <div className="dropdown-divider"></div>

                        <button className="dropdown-item logout" onClick={handleLogout}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to="/auth" className="btn btn-outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                    </svg>
                    Đăng nhập
                  </Link>
                )}
              </div>
              {/* Cart button */}
              <div className="btn-wrapper">
                <Link to="/cart" className="btn btn-outline cart-btn-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
                  </svg>
                  Giỏ hàng
                </Link>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </div>
            </div>
          </nav>


          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <span className={`hamburger ${isMenuOpen ? "active" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? "open" : ""}`}>
          <ul className="mobile-nav-links">
            <ul className="nav-links">
              <li>
                <Link to="/" onClick={closeMenu}>Trang chủ</Link>
              </li>
              <li>
                <Link to="/products" onClick={closeMenu}>Sản phẩm</Link>
              </li>
              <li>
                <Link to="/feedback" onClick={closeMenu}>Đánh giá</Link>
              </li>
            </ul>

            {user ? (
              <>
                <li className="mobile-user-info-separator"></li>
                <li className="mobile-user-info">
                  <div className="mobile-avatar">
                    {user.avatar ? (
                      <img src={user.avatar || "/placeholder.svg"} alt={user.fullName} />
                    ) : (
                      <span>{getAvatarInitials(user.fullName)}</span>
                    )}
                  </div>
                  <div className="mobile-user-details">
                    <p className="mobile-user-name">{user.fullName}</p>
                    <p className="mobile-user-email">{user.email}</p>
                    <span className={`role-badge ${user.role}`}>{user.role === "admin" ? "Admin" : "Customer"}</span>
                  </div>
                </li>
                <li>
                  <button className="mobile-menu-item" onClick={navigateToProfile}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                    </svg>
                    {user.role === "admin" ? "Admin Dashboard" : "Thông tin cá nhân"}
                  </button>
                </li>
                <li>
                  <button className="mobile-menu-item" onClick={navigateToMyOrders}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v12z" />
                    </svg>
                    Đơn hàng của tôi
                  </button>
                </li>
                <li>
                  <button className="mobile-menu-item logout" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17,12H7V10H17V12M17,6H7V8H17V6M20,20H4V4H10V2H4A2,2 0 0,0 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V14H20V20Z" />
                    </svg>
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/auth" className="btn btn-outline">
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="btn btn-outline cart-btn-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
                    </svg>
                    Giỏ hàng
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="mobile-header-actions">
          <Link to="/cart" className="mobile-cart-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
            </svg>
            {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
