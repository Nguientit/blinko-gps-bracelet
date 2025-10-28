"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Link } from "react-router-dom"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import "./TutorialPage.css"

export default function TutorialPage() {
    const [expandedStep, setExpandedStep] = useState(null)
    const [expandedImage, setExpandedImage] = useState(null)

    const steps = [
        {
            number: 1,
            title: "Đặt thiết bị gần iPhone",
            description: "Đặt thiết bị 'blinko' gần iPhone hoặc các thiết bị Apple khác.",
            images: [],
        },
        {
            number: 2,
            title: "Kiểm tra thông báo",
            description: "Kiểm tra và cho phép ứng dụng 'Tìm' thông báo.",
            images: ["/tutorials/1.png"],
        },
        {
            number: 3,
            title: "Bật Bluetooth và kết nối Internet",
            description: "Bật Bluetooth trên iPhone và kết nối đến Internet.",
            images: ["/tutorials/2.png"],
        },
        {
            number: 4,
            title: "Rút dây cách điện của thiết bị",
            description: "Rút dây cách điện của 'blinko', thiết bị sẽ bật lên cùng với tiếng bíp.",
            images: ["/tutorials/3.png"],
        },
        {
            number: 5,
            title: "Mở ứng dụng Tìm",
            description: "Mở ứng dụng 'Tìm' trên iPhone của bạn.",
            images: ["/tutorials/4.png"],
        },
        {
            number: 6,
            title: "Thêm vật dụng",
            description:
                "Trong ứng dụng 'Tìm', nhấn vào 'Vật dụng' tiếp theo nhấn vào 'Thêm vật dụng' rồi chọn 'Vật dụng được hỗ trợ khác'.",
            images: ["/tutorials/6.png", "/tutorials/7.png"],
        },
        {
            number: 7,
            title: "Tìm kiếm và kết nối Siindoo Tag",
            description: "Tìm kiếm module tag tên là 'siindoo Tag', nhấn 'Kết nối'.",
            images: ["/tutorials/8.png"],
        },
        {
            number: 8,
            title: "Đặt tên và chọn biểu tượng",
            description: "Đặt tên cho thiết bị 'blinko' và chọn một biểu tượng cảm xúc, sau đó nhấn 'Tiếp tục'.",
            images: ["/tutorials/9.png", "/tutorials/10.png"],
        },
        {
            number: 9,
            title: "Xác nhận thêm vào Apple ID",
            description:
                "Ứng dụng 'Tìm kiếm của tôi' sẽ yêu cầu xác nhận để thêm thiết bị 'blinko' vào tài khoản Apple ID của bạn. Nhấn 'Đồng ý'.",
            images: [],
        },
        {
            number: 10,
            title: "Hoàn tất cài đặt",
            description: "Nhấn 'Hoàn tất', và 'blinko' của bạn sẽ được cài đặt và sẵn sàng sử dụng.",
            images: ["/tutorials/11.png", "/tutorials/12.png"],
        },
    ]

    return (
        <div className="tutorial-page">
            {/* Header */}
            <Header />
            <header className="tutorial-header">
                <div className="tutorial-container">
                    <h1 className="tutorial-page-title">Hướng dẫn sử dụng Blinko</h1>
                    <p className="tutorial-page-subtitle">Theo dõi 9 bước đơn giản để thiết lập thiết bị của bạn</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="tutorial-main">
                <div className="tutorial-container">
                    {/* Steps Grid */}
                    <div className="steps-grid">
                        {steps.map((step) => (
                            <div key={step.number} className={`step-card ${expandedStep === step.number ? "expanded" : ""}`}>
                                {/* Step Header */}
                                <div
                                    className="step-header"
                                    onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                                >
                                    <div className="step-number-badge">{step.number}</div>
                                    <div className="step-header-content">
                                        <h3 className="step-title">{step.title}</h3>
                                        <p className="step-preview">{step.description.substring(0, 60)}...</p>
                                    </div>
                                    <ChevronDown className={`step-chevron ${expandedStep === step.number ? "rotated" : ""}`} />
                                </div>

                                {/* Step Content */}
                                {expandedStep === step.number && (
                                    <div className="step-content">
                                        {step.images && step.images.length > 0 && (
                                            <div className="step-image-container">
                                                {step.images.map((image, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={image || "/placeholder.svg"}
                                                        alt={`${step.title} - Ảnh ${idx + 1}`}
                                                        className="step-image"
                                                        onClick={() => setExpandedImage(image)}
                                                        style={{ cursor: "pointer" }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <div className="step-description">
                                            <p>{step.description}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Timeline View */}
                    <div className="timeline-section">
                        <h2 className="timeline-title">Quy trình cài đặt</h2>
                        <div className="timeline">
                            {steps.map((step, index) => (
                                <div key={step.number} className="timeline-item">
                                    <div className="timeline-marker">
                                        <div className="timeline-dot">{step.number}</div>
                                        {index < steps.length - 1 && <div className="timeline-line"></div>}
                                    </div>
                                    <div className="timeline-content">
                                        <h4 className="timeline-step-title">{step.title}</h4>
                                        <p className="timeline-step-description">{step.description}</p>
                                        {step.images && step.images.length > 0 && (
                                            <div className="timeline-images">
                                                {step.images.map((image, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={image || "/placeholder.svg"}
                                                        alt={`${step.title} - Ảnh ${idx + 1}`}
                                                        className="timeline-image"
                                                        onClick={() => setExpandedImage(image)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="tutorial-cta">
                        <h2 className="cta-title">Sẵn sàng bắt đầu?</h2>
                        <p className="cta-description">
                            Nếu bạn gặp bất kỳ vấn đề nào trong quá trình cài đặt, vui lòng liên hệ với chúng tôi.
                        </p>
                        <div className="cta-buttons">
                            <Link href="/products" className="cta-button primary">
                                Mua Blinko ngay
                            </Link>
                            <a
                                href="https://www.facebook.com/profile.php?id=61581991141698"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cta-button secondary"
                            >
                                Liên hệ hỗ trợ
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {expandedImage && (
                <div className="image-lightbox" onClick={() => setExpandedImage(null)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setExpandedImage(null)}>
                            <X size={24} />
                        </button>
                        <img src={expandedImage || "/placeholder.svg"} alt="Expanded view" className="lightbox-image" />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}
