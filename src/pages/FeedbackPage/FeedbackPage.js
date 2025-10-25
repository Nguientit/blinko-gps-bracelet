"use client"

import { useState, useEffect } from "react"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import FeedbackModal from "../../components/Modal/FeedbackModal"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./FeedbackPage.css"

const FeedbackPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filterRating, setFilterRating] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    message: "",
  })
  const [userFeedback, setUserFeedback] = useState(null)
  const [showCount, setShowCount] = useState(3)

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        // Only fill if the form field is empty and user data exists
        name: prevData.name || user.fullName || "", // Use fullName from AuthContext
        email: prevData.email || user.email || "",
      }));

      // Check for existing feedback using the logged-in user's email
      if (feedbacks.length > 0) { // Check only if feedbacks are loaded
        const found = feedbacks.find((f) => f.userEmail === user.email);
        setUserFeedback(found || null);
      }
    } else {
      // Optional: Clear name/email if user logs out while on the page
      // setFormData(prevData => ({ ...prevData, name: "", email: "" }));
      setUserFeedback(null); // Clear existing feedback check if user logs out
    }
    // Run when user changes OR when feedbacks load (to check existing feedback)
  }, [user, feedbacks]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const data = await fetch("/api/feedback")
        if (!data.ok) throw new Error("Failed to fetch feedbacks");
        const feedbackList = await data.json()
        setFeedbacks(feedbackList)
        setLoading(false)

        // Kiểm tra nếu user đã gửi feedback (theo email)
        if (formData.email) {
          const found = feedbackList.find((f) => f.userEmail === formData.email)
          setUserFeedback(found || null)
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error)
        setLoading(false)
      }
    }
    fetchFeedbacks()
  }, [formData.email])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const newFeedback = {
        userName: formData.name,
        userEmail: formData.email,
        rating: formData.rating,
        comment: formData.message,
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFeedback),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.message || "Có lỗi xảy ra, vui lòng thử lại!")
        setSubmitting(false)
        return
      }

      const result = await res.json()
      setFeedbacks([result.feedback, ...feedbacks])
      setUserFeedback(result.feedback)
      setFormData({
        name: user?.fullName || "",
        email: user?.email || "",
        rating: 5,
        title: "",
        message: "",
      })
      setShowModal(true)
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng thử lại!")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredFeedbacks =
    filterRating === "all"
      ? feedbacks
      : feedbacks.filter((feedback) => feedback.rating === Number.parseInt(filterRating))

  const averageRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length).toFixed(1)
      : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: feedbacks.filter((feedback) => feedback.rating === rating).length,
    percentage:
      feedbacks.length > 0
        ? ((feedbacks.filter((feedback) => feedback.rating === rating).length / feedbacks.length) * 100).toFixed(0)
        : 0,
  }))

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    // Ưu tiên feedback mới nhất (theo ngày, giảm dần)
    const dateA = new Date(a.date || a.createdAt || 0);
    const dateB = new Date(b.date || b.createdAt || 0);
    return dateB - dateA;
  });

  const displayedFeedbacks = sortedFeedbacks.slice(0, showCount);

  const handleShowMore = () => {
    setShowCount((prev) => prev + 3);
  };

  return (
    <div className="feedback-page">
      <Header />
      <main className="feedback-main">
        <div className="feedback-hero">
          <div className="container">
            <h1>Đánh giá từ khách hàng</h1>
            <p>Chia sẻ trải nghiệm của bạn và đọc những đánh giá từ cộng đồng</p>
          </div>
        </div>
        <div className="container">
          <div className="feedback-content">
            <div className="feedback-form-section">
              <div className="form-card">
                <h2>Viết đánh giá của bạn</h2>
                {userFeedback ? (
                  <div className="already-feedback">
                    <p>
                      Bạn đã gửi đánh giá với email <b>{userFeedback.userEmail}</b>.<br />
                      Nếu muốn sửa hoặc xóa, vui lòng liên hệ quản trị viên.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Họ và tên *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập địa chỉ email"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Đánh giá *</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${star <= formData.rating ? "active" : ""}`}
                            onClick={() => setFormData({ ...formData, rating: star })}
                          >
                            ★
                          </button>
                        ))}
                        <span className="rating-text">({formData.rating} sao)</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Nội dung đánh giá *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="5"
                        placeholder="Chia sẻ chi tiết về trải nghiệm sử dụng sản phẩm hoặc trang web chúng tôi sẽ có gắng cải thiện chất lượng dịch vụ..."
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="feedback-list-section">
              <div className="feedback-stats">
                <div className="stats-overview">
                  <div className="average-rating">
                    <span className="big-rating">{averageRating}</span>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`star ${star <= Math.round(averageRating) ? "filled" : ""}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p>{feedbacks.length} đánh giá</p>
                  </div>

                  <div className="rating-breakdown">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="rating-bar">
                        <span className="rating-label">{rating} sao</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="rating-count">({count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="feedback-filters">
                <label>Lọc theo đánh giá:</label>
                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                  <option value="all">Tất cả</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>

              <div className="feedback-list">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải đánh giá...</p>
                  </div>
                ) : displayedFeedbacks.length > 0 ? (
                  <>
                    {displayedFeedbacks.map((feedback) => (
                      <div key={feedback.id} className="feedback-item">
                        <div className="feedback-header">
                          <div className="user-info">
                            <div className="user-feedback-avatar">
                              {feedback.userName && typeof feedback.userName === "string"
                                ? feedback.userName
                                    .split(" ")
                                    .filter((w) => w.length > 0)
                                    .map((w) => w[0].toUpperCase())
                                    .slice(0, 2)
                                    .join("")
                                : "?"}
                            </div>
                            <div>
                              <h4>{feedback.userName || "Ẩn danh"}</h4>
                              <div className="feedback-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} className={`star ${star <= (feedback.rating || 0) ? "filled" : ""}`}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="feedback-date">
                            {feedback.date ? new Date(feedback.date).toLocaleDateString("vi-VN") : ""}
                            {feedback.verified && <span className="verified-badge">✓ Đã xác thực</span>}
                          </div>
                        </div>
                        <div className="feedback-message-content">
                          <p>{feedback.comment || "Không có nội dung"}</p>
                        </div>
                      </div>
                    ))}
                    {showCount < sortedFeedbacks.length && (
                      <div style={{ textAlign: "center", margin: "18px 0" }}>
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: "8px 24px",
                            borderRadius: "6px",
                            background: "#e6f9f7",
                            color: "#39c8bb",
                            border: "1px solid #b2ebe4",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                          onClick={handleShowMore}
                        >
                          Xem thêm đánh giá
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-feedback">
                    <p>Không có đánh giá nào phù hợp với bộ lọc</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <FeedbackModal isOpen={showModal} onClose={() => setShowModal(false)} onNavigate={() => navigate("/")} />

      <Footer />
    </div>
  )
}

export default FeedbackPage
