"use client"
import { X, CheckCircle } from "lucide-react"
import "./FeedbackModal.css"

const FeedbackModal = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-body">
          <CheckCircle size={64} className="modal-icon" />
          <h2>Cảm ơn bạn!</h2>
          <p>Đánh giá của bạn đã được gửi thành công.</p>
          <p className="modal-subtitle">Ý kiến của bạn rất quan trọng và giúp chúng tôi cải thiện dịch vụ.</p>
        </div>

        <div className="modal-actions">
          <button className="modal-btn primary" onClick={onNavigate}>
            Tiếp tục mua sắm
          </button>
          <button className="modal-btn secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
