"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useProfile } from "../../contexts/ProfileContext"
import { useNavigate } from "react-router-dom"
import { User, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import "./ProfilePage.css"

const ProfilePage = () => {
  const { user } = useAuth()
  const { profile, updateProfile, loading } = useProfile()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      ward: "",
      district: "",
      city: "",
    },
  })

  useEffect(() => {
    if (!user) {
      navigate("/auth")
      return
    }

    setFormData({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || {
        street: "",
        ward: "",
        district: "",
        city: "",
      },
    })
  }, [profile, user, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
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

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="profile-page">
      <Header />

      <main className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar || "/placeholder.svg"} alt={user.fullName} />
            ) : (
              <span>{getAvatarInitials(user.fullName)}</span>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{formData.fullName || formData.email}</h1>
            <p className="profile-email">{formData.email}</p>
          </div>
          <button
            className={`edit-btn ${isEditing ? "cancel" : ""}`}
            onClick={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
          >
            {isEditing ? <X size={20} /> : <Edit2 size={20} />}
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Thông tin cá nhân</h2>

            <div className="profile-form">
              <div className="form-group">
                <label>
                  <User size={18} />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={18} />
                  Email
                </label>
                <input type="email" name="email" value={formData.email} disabled placeholder="Email" />
              </div>

              <div className="form-group">
                <label>
                  <Phone size={18} />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={18} />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Số nhà, tên đường"
                />
                <input
                  type="text"
                  name="address.ward"
                  value={formData.address.ward}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Phường/Xã"
                />
                <input
                  type="text"
                  name="address.district"
                  value={formData.address.district}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Quận/Huyện"
                />
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Tỉnh/Thành phố"
                />
              </div>

              {isEditing && (
                <button className="save-btn" onClick={handleSave} disabled={loading}>
                  <Save size={18} />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
