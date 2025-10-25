import "./Footer.css"

const Footer = () => {
  const footerSections = [
    {
      title: "Sản phẩm",
      items: ["TechTrack Pro", "StyleGuard Elite", "SmartBand X1"],
    },
    {
      title: "Hỗ trợ",
      items: ["Hướng dẫn sử dụng", "Bảo hành", "Liên hệ", "FAQ"],
    },
    {
      title: "Công ty",
      items: ["Về chúng tôi", "Tuyển dụng", "Tin tức", "Đối tác"],
    },
    {
      title: "Theo dõi",
      items: ["Facebook", "Instagram", "YouTube", "LinkedIn"],
    },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
            <div className="footer-logo-icon">
              <img src="/img/Logo1.png" alt="Logo"/>
            </div>
          </div>
            <p className="footer-tagline">
              Công nghệ định vị thông minh cho cuộc sống an toàn hơn. Bảo vệ những người bạn yêu thương với công nghệ
              tiên tiến nhất.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-sections">
            {footerSections.map((section, index) => (
              <FooterSection key={index} section={section} />
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">© 2024 Blinko. Tất cả quyền được bảo lưu.</div>
          <div className="footer-legal">
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách cookie</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

const FooterSection = ({ section }) => {
  return (
    <div className="footer-section">
      <h4 className="footer-heading">{section.title}</h4>
      <ul className="footer-links">
        {section.items.map((item, index) => (
          <li key={index}>
            <a href="#">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Footer
