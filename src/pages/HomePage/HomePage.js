import { useState, useEffect } from "react"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { ArrowRight, Phone, ShieldCheck, Truck, Clock, Mail, Award, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"
import "./HomePage.css"

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false)

  const bannerImages = [
    "/img/Banner5.png",
    "/img/Banner4.png",
    "/img/Banner3.png",
    "/img/Banner2.png",
    "/img/Banner1.png",
    // Thêm các banner khác nếu có
  ];

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Chuyển banner tự động mỗi 5 giây
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 5000);

    return () => {
      clearTimeout(timer)
      clearInterval(bannerInterval)
    }
  }, [])
  return (
    <div className="homepage">
      <Header />

      {/* Hero Section */}
      <section className="hero section">
        <div className="container">
          <div className="hero-grid">
            <div className={`hero-content ${isVisible ? "visible" : ""}`}>
              <span className="badge badge-light">Kết hợp giữa thời trang và định vị</span>

              <h1 className="hero-title">
                Vòng tay định vị <span className="hero-title-gradient">thời trang</span>
              </h1>

              <p className="hero-description">
                Kết hợp hoàn hảo giữa thời trang và công nghệ. Theo dõi vị trí chính xác, bảo vệ an toàn cho bé yêu với thiết kế thời trang.
              </p>

              <div className="hero-buttons">
                <button className="btn btn-primary btn-lg" onClick={() => window.location.href = `/products`}>
                  Khám phá ngay
                  <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </button>
                <Link to="/tutorial" className="btns">
                  <svg
                    height="24"
                    width="24"
                    fill="#FFFFFF"
                    viewBox="0 0 24 24"
                    data-name="Layer 1"
                    id="Layer_1"
                    className="sparkle"
                  >
                    <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
                  </svg>
                  <span className="text">Hướng dẫn sử dụng</span>
                </Link>
              </div>

              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-value">1K+</div>
                  <div className="stat-label">Khách hàng</div>
                </div>
                <div className="stat">
                  <div className="stat-value">98%</div>
                  <div className="stat-label">Độ chính xác</div>
                </div>
                <div className="stat">
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Hỗ trợ</div>
                </div>
              </div>
            </div>

            <div className={`hero-image-container ${isVisible ? "visible" : ""}`}>
              <div className="hero-image-wrapper">
                <div className="hero-image-glow"></div>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentBanner}
                    src={bannerImages[currentBanner]}
                    alt={`Blinko GPS Bracelet Banner ${currentBanner + 1}`}
                    className="hero-image"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </AnimatePresence>

                <div className="floating-indicator top-right animate-bounce">
                  <svg className="indicator-icon blue" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div className="indicator-text">GPS Active</div>
                </div>

                <div className="floating-indicator bottom-left animate-pulse">
                  <svg className="indicator-icon green" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                  <div className="indicator-text">Secured</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title text-balance">Tính năng nổi bật</h2>
            <p className="section-description text-pretty">
              Công nghệ tiên tiến được tích hợp trong thiết kế thời trang và tiện dụng
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#39c8bb">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <h3 className="feature-title">Định vị chính xác</h3>
              <p className="feature-description">GPS độ chính xác cao, theo dõi vị trí real-time với sai số dưới 3m</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#39c8bb">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.7C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
                </svg>
              </div>
              <h3 className="feature-title">Chống nước IP68</h3>
              <p className="feature-description">
                Hoàn toàn chống nước, có thể sử dụng khi bơi lội và các hoạt động nước
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#39c8bb">
                  <path d="M15.67,4H14V2H10V4H8.33C7.6,4 7,4.6 7,5.33V20.67C7,21.4 7.6,22 8.33,22H15.67C16.4,22 17,21.4 17,20.67V5.33C17,4.6 16.4,4 15.67,4M11,20V18H13V20H11M15,16H9V6H15V16Z" />
                </svg>
              </div>
              <h3 className="feature-title">Pin bền bỉ</h3>
              <p className="feature-description">Thời lượng pin lên đến 7 ngày sử dụng liên tục với chế độ tiết kiệm</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#39c8bb">
                  <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.1 5.89,23 7,23H17C18.1,23 19,22.1 19,21V3C19,1.89 18.1,1 17,1Z" />
                </svg>
              </div>
              <h3 className="feature-title">Kết nối thông minh</h3>
              <p className="feature-description">Đồng bộ với smartphone qua Bluetooth, ứng dụng iOS và Android</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title text-balance">Tại sao chọn <span className="logo-b-highlight">Blinko</span>?</h2>
              <p className="section-description text-pretty">
                Sự kết hợp hoàn hảo giữa công nghệ và thời trang, mang đến trải nghiệm tuyệt vời
              </p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon"><Award /></div>
                  <div className="benefit-content">
                    <h3 className="benefit-title">Chất lượng cao cấp</h3>
                    <p className="benefit-description">
                      Sử dụng vật liệu cao cấp, thiết kế tinh tế và bền bỉ theo thời gian
                    </p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon"><Users /></div>
                  <div className="benefit-content">
                    <h3 className="benefit-title">Cộng đồng lớn</h3>
                    <p className="benefit-description">Hơn 10,000 người dùng tin tưởng và sử dụng sản phẩm hàng ngày</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon"><ShieldCheck /></div>
                  <div className="benefit-content">
                    <h3 className="benefit-title">Bảo hành toàn diện</h3>
                    <p className="benefit-description">
                      Bảo hành 2 năm, hỗ trợ kỹ thuật 24/7 và dịch vụ khách hàng tận tâm
                    </p>
                  </div>
                </div>
              </div>

              <a href="/products" className="btn btn-primary btn-lg">
                Xem tất cả sản phẩm
              </a>
            </div>

            <div className="benefits-image">
              <div className="lifestyle-showcase">
                <img src="/person-wearing-gps-bracelet-lifestyle.jpg" alt="Lifestyle" className="lifestyle-image" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn sàng trải nghiệm công nghệ định vị tiên tiến?</h2>
            <p className="cta-description">
              Đặt hàng ngay hôm nay và nhận ưu đãi đặc biệt cho khách hàng đầu tiên. Miễn phí vận chuyển toàn quốc và bảo hành 2 năm.
            </p>

            <div className="cta-buttons">
              <button className="btn btn-light btn-lg">
                Đặt hàng ngay
                <ArrowRight className="btn-icon" size={20} />
              </button>
              <button className="btn btn-outline-light btn-lg">
                Liên hệ tư vấn
                <Phone className="btn-icon" size={20} />
              </button>
            </div>

            <div className="cta-features">
              <div className="cta-feature">
                <ShieldCheck className="feature-icon" size={24} />
                <span>Bảo hành 2 năm</span>
              </div>
              <div className="cta-feature">
                <Truck className="feature-icon" size={24} />
                <span>Miễn phí vận chuyển</span>
              </div>
              <div className="cta-feature">
                <Clock className="feature-icon" size={24} />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>

            <div className="cta-contact">
              <div className="contact-item">
                <Phone size={20} />
                <span>Hotline: 0987654321</span>
              </div>
              <div className="contact-item">
                <Mail size={20} />
                <span>Email: support@Blinko.vn</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage
