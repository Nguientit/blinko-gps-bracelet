"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from 'react-markdown'
import { X } from "lucide-react"
import "./BlinkoBot.css"

export default function BlinkoBot() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(true);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! Mình là BlinkoBot, Mình có thể giúp gì cho bạn hôm nay? Bạn là phụ huynh đang tìm đồng hồ định vị cho con, hay là bạn nhỏ muốn tìm hiểu về sản phẩm nhé?",
      quickReplies: [
        { id: "parent", text: "Mình là phụ huynh", value: "Mình là phụ huynh đang tìm đồng hồ định vị cho con" },
        { id: "child", text: "Tôi muốn mua hàng", value: "Tôi muốn tìm hiểu về sản phẩm" },
        { id: "products", text: "Xem sản phẩm", value: "Mình muốn xem các sản phẩm đồng hồ định vị tiêu biểu" },
        { id: "features", text: "Tính năng nổi bật", value: "Mình muốn biết đồng hồ định vị có những tính năng gì?" },
      ],
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleQuickReply = (value) => {
    setInput(value)
    setTimeout(() => {
      handleSendMessage(value)
    }, 100)
  }

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`)
  }

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/services/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        productCards: data.products,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Xin lỗi, hệ thống đang bảo trì. Vui lòng thử lại sau!",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => handleSendMessage()

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <div
          className="blinko-bubble-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Speech Bubble - Only show on hover */}
          {isHovered && (
            <div className="blinko-speech-bubble">
              <p className="blinko-speech-text">Xin chào! Mình có thể giúp gì cho bạn?</p>
              <div className="blinko-speech-tail" />
            </div>
          )}

          {/* Blinko Icon Button */}
          <button onClick={() => setIsOpen(true)} className="blinko-button" aria-label="Open BlinkoBot chat">
            <img src="../img/Blinko.png" alt="BlinkoBot" width={80} height={80} className="blinko-icon" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="blinko-chat-window">
          {/* Header */}
          <div className="blinko-header">
            <div className="blinko-header-content">
              <div className="blinko-header-avatar">
                <img src="../img/Blinko.png" alt="BlinkoBot" width={50} height={50} className="blinko-avatar-image" />
              </div>
              <div className="blinko-header-info">
                <h3 className="blinko-header-title">BlinkoBot</h3>
                <p className="blinko-header-subtitle">Trợ lý tư vấn thông minh</p>
              </div>
            </div>

            <button onClick={() => setIsOpen(false)} className="blinko-close-button" aria-label="Close chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="blinko-messages">
            <div className="blinko-messages-content">
              {messages.map((message) => (
                <div key={message.id} className={`blinko-message-wrapper blinko-message-${message.role}`}>
                  <div className="blinko-message-bubble">
                    {message.role === "assistant" && (
                      <div className="blinko-message-avatar">
                        <img
                          src="../img/Blinko2.png"
                          alt="BlinkoBot"
                          width={32}
                          height={32}
                          className="blinko-avatar-small"
                        />
                      </div>
                    )}
                    <div className={`blinko-message-text blinko-message-text-${message.role}`}>
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {message.quickReplies && message.quickReplies.length > 0 && (
                    <div className="blinko-quick-replies">
                      {message.quickReplies.map((reply) => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReply(reply.value)}
                          className="blinko-quick-reply-button"
                        >
                          {reply.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Cards */}
                  {message.productCards && message.productCards.length > 0 && (
                    <div className="blinko-product-cards">
                      {message.productCards.map((product) => (
                        <div
                          key={product.id}
                          className="blinko-product-card"
                          onClick={() => handleProductClick(product.id)}
                        >
                          <div className="blinko-product-image-wrapper">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="blinko-product-image"
                            />
                          </div>
                          <div className="blinko-product-info">
                            <h4 className="blinko-product-name">{product.name}</h4>
                            <p className="blinko-product-description">{product.description}</p>
                            <span className="blinko-product-price">{product.price.toLocaleString("vi-VN")}đ</span>
                          </div>
                          <button
                            className="blinko-product-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProductClick(product.id)
                            }}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="blinko-message-wrapper blinko-message-assistant">
                  <div className="blinko-message-bubble">
                    <div className="blinko-message-avatar">
                      <img src="../img/Blinko2.png" alt="BlinkoBot" width={20} height={20} className="blinko-avatar-small" />
                    </div>
                    <div className="blinko-loading">
                      <span className="blinko-loading-dot"></span>
                      <span className="blinko-loading-dot"></span>
                      <span className="blinko-loading-dot"></span>
                      <span className="blinko-loading-text">Đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="blinko-input-container">
            <div className="blinko-input-wrapper">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="blinko-input"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="blinko-send-button"
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}