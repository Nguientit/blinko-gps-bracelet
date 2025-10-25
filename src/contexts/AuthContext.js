"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async ({ login, password }) => {
    // Gọi API backend mới thay vì đọc database.json trực tiếp
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Sai tên đăng nhập hoặc mật khẩu")
    }
    const data = await res.json()
    const found = data.user
    if (!found) {
      throw new Error("Sai tên đăng nhập hoặc mật khẩu")
    }
    // Lưu thông tin user vào localStorage
    localStorage.setItem("user", JSON.stringify(found))
    localStorage.setItem("userId", found.id)
    localStorage.setItem("role", found.role)
    setUser(found)
    return { user: found }
  }

  const register = async ({ username, email, password }) => {
    // Gọi API backend mới thay vì chỉ lưu local
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Đăng ký thất bại")
    }
    const data = await res.json()
    const newUser = data.user
    localStorage.setItem("user", JSON.stringify(newUser))
    localStorage.setItem("userId", newUser.id)
    localStorage.setItem("role", newUser.role)
    setUser(newUser)
    return { user: newUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
