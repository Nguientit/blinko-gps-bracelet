import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useAuth } from "../../contexts/AuthContext"
import { Mail, Lock, User, Eye, EyeOff, MapPin, Shield, Smartphone } from "lucide-react"
import "./AuthPage.css"

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const navigate = useNavigate()
  const { login, register } = useAuth()
  // Login form state
  const [loginData, setLoginData] = useState({
    login: "",
    password: "",
    rememberMe: false,
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSwap = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setIsSignUp(!isSignUp)
    setErrors({})
    setTimeout(() => {
      setIsAnimating(false)
    }, 800)
  }

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target
    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target
    setSignupData({
      ...signupData,
      [name]: type === "checkbox" ? checked : value,
    })
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateLogin = () => {
    const newErrors = {}
    if (!loginData.login) newErrors.login = "Tên đăng nhập là bắt buộc"
    if (!loginData.password) newErrors.password = "Mật khẩu là bắt buộc"
    else if (loginData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSignup = () => {
    const newErrors = {}
    if (!signupData.username.trim()) newErrors.username = "Tên đăng nhập là bắt buộc"
    if (!signupData.email) newErrors.email = "Email là bắt buộc"
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = "Email không hợp lệ"
    if (!signupData.password) newErrors.password = "Mật khẩu là bắt buộc"
    else if (signupData.password.length < 8) newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự"
    if (!signupData.confirmPassword) newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc"
    else if (signupData.password !== signupData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    if (!signupData.agreeTerms) newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản sử dụng"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = isSignUp ? validateSignup() : validateLogin()
    if (!isValid) return

    setIsLoading(true)
    setErrors({}) // Clear lỗi cũ

    try {
      let response
      if (isSignUp) {
        response = await register(signupData)
      } else {
        response = await login(loginData)
      }
      // Lưu role và userId vào localStorage
      if (response && response.user) {
        localStorage.setItem("role", response.user.role)
        localStorage.setItem("userId", response.user.id)
      }
      setTimeout(() => {
        navigate("/")
      }, 1000)
    } catch (err) {
      if (Array.isArray(err.errors)) {
        const fieldErrors = {}
        err.errors.forEach((e) => {
          fieldErrors[e.path] = e.msg
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ general: err.message || "Đã có lỗi xảy ra" })
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }
  const handleSocialAuth = (provider) => {
    console.log(`${isSignUp ? "Signup" : "Login"} with ${provider}`)
  }

  return (
    <div className={`swap-auth-container ${isSignUp ? "signup-mode" : "login-mode"} ${isAnimating ? "animating" : ""}`}>
      {/* Background Decorations */}
      <div className="auth-background">
        <div className="bg-decoration decoration-1"></div>
        <div className="bg-decoration decoration-2"></div>
        <div className="bg-decoration decoration-3"></div>
      </div>

      {/* Welcome Panel */}
      <div className={`welcome-panel ${isSignUp ? "right" : "left"}`}>
        <div className="welcome-content">
          <div className="welcome-animation">
            <div className="floating-circle circle-1"></div>
            <div className="floating-circle circle-2"></div>
            <div className="floating-circle circle-3"></div>
          </div>

          <div className="welcome-text">
            <h2>{isSignUp ? "Chào mừng trở lại!" : "Xin chào, Chào mừng!"}</h2>
            <p>{isSignUp ? "Đã có tài khoản?" : "Chưa có tài khoản?"}</p>
            <button className="swap-btn" onClick={handleSwap} disabled={isAnimating}>
              {isSignUp ? "Đăng nhập" : "Đăng ký"}
            </button>
          </div>

          <div className="welcome-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className={`form-panel ${isSignUp ? "left" : "right"}`}>
        <div className="form-container">
          {/* Mobile Welcome Header */}
          <div className="mobile-welcome">
            <h3>{isSignUp ? "Chào mừng trở lại!" : "Xin chào, Chào mừng!"}</h3>
            <p>{isSignUp ? "Đã có tài khoản?" : "Chưa có tài khoản?"}</p>
            <button className="mobile-swap-btn" onClick={handleSwap} disabled={isAnimating}>
              {isSignUp ? "Đăng nhập" : "Đăng ký"}
            </button>
          </div>

          {/* Form Content */}
          <div className="form-content">
            <h1>{isSignUp ? "Đăng ký" : "Đăng nhập"}</h1>

            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && <div className="error-message">{errors.general}</div>}

              {/* Login Form Fields */}
              {!isSignUp && (
                <>
                  <div className="form-group-text">
                    <div className="input-container">
                      <input
                        type="text"
                        name="login"
                        value={loginData.login}
                        onChange={handleLoginChange}
                        className={errors.login ? "error" : ""}
                        placeholder="Tên đăng nhập hoặc Email"
                      />
                      <div className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    </div>
                    {errors.login && <span className="error-message">{errors.login}</span>}
                  </div>

                  <div className="form-group-text">
                    <div className="input-container">
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className={errors.password ? "error" : ""}
                        placeholder="Mật khẩu"
                        required
                      />
                      <div className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                      </div>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-options">
                    <Link to="/forgot-password" className="forgot-link">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </>
              )}

              {/* Signup Form Fields */}
              {isSignUp && (
                <>
                  <div className="form-group-text">
                    <div className="input-container">
                      <input
                        type="text"
                        name="username"
                        value={signupData.username}
                        onChange={handleSignupChange}
                        className={errors.username ? "error" : ""}
                        placeholder="Tên đăng nhập"
                        required
                      />
                      <div className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    </div>
                    {errors.username && <span className="error-message">{errors.username}</span>}
                  </div>

                  <div className="form-group-text">
                    <div className="input-container">
                      <input
                        type="email"
                        name="email"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        className={errors.email ? "error" : ""}
                        placeholder="Email"
                        required
                      />
                      <div className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </div>
                    </div>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group-text">
                    <div className="input-container">
                      <input
                        type="password"
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        className={errors.password ? "error" : ""}
                        placeholder="Mật khẩu"
                        required
                      />
                      <div className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                      </div>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-group-text">
                    <div className="input-container">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        className={errors.confirmPassword ? "error" : ""}
                        placeholder="Xác nhận mật khẩu"
                        required
                      />
                      <div className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                      </div>
                    </div>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>

                  <div className="form-group-text checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={signupData.agreeTerms}
                        onChange={handleSignupChange}
                      />
                      <span className="checkmark"></span>
                      Tôi đồng ý với{" "}
                      <Link to="/terms" className="link">
                        Điều khoản sử dụng
                      </Link>
                    </label>
                    {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                  </div>
                </>
              )}

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? <div class="dot-spinner">
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                </div> : isSignUp ? "Đăng ký" : "Đăng nhập"}
              </button>

              <div className="divider">
                <span>hoặc {isSignUp ? "đăng ký" : "đăng nhập"} với tài khoản</span>
              </div>

              <div className="social-login">
                <button
                  type="button"
                  className="social-btn google"
                  onClick={() => handleSocialAuth("google")}
                  aria-label={`${isSignUp ? "Đăng ký" : "Đăng nhập"} với Google`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Back to Home Link */}
      <Link to="/" className="back-home">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Về trang chủ
      </Link>
    </div>
  )
}

export default AuthPage
