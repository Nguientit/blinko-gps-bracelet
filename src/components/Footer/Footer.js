import "./Footer.css"

const Footer = () => {
  const footerSections = [
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
      items: [
        {
          label: "Facebook",
          url: "https://www.facebook.com/profile.php?id=61581991141698",
        },
      ],
    },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <img src="/img/Logo1.png" alt="Logo" />
              </div>
            </div>
            <p className="footer-tagline">
              Công nghệ định vị thông minh cho cuộc sống an toàn hơn. Bảo vệ những người bạn yêu thương với công nghệ
              tiên tiến nhất.
            </p>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/profile.php?id=61581991141698"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 30 30"
                  fill="#FFFFFF"
                >
                  <path d="M15,3C8.373,3,3,8.373,3,15c0,6.016,4.432,10.984,10.206,11.852V18.18h-2.969v-3.154h2.969v-2.099
  c0-3.475,1.693-5,4.581-5c1.383,0,2.115,0.103,2.461,0.149v2.753h-1.97c-1.226,0-1.654,1.163-1.654,2.473v1.724h3.593L19.73,18.18
  h-3.106v8.697C22.481,26.083,27,21.075,27,15C27,8.373,21.627,3,15,3z"></path>
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
          <div className="footer-copyright">© 2025 Blinko. Tất cả quyền được bảo lưu.</div>
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
            {typeof item === "string" ? (
              <a href="#">{item}</a>
            ) : (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Footer
