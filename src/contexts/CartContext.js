"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

function getUserId() {
  // Ưu tiên lấy userId từ localStorage (đã được AuthContext lưu khi login qua API)
  return localStorage.getItem("userId")
}

function getCartKey() {
  const userId = getUserId()
  return userId ? `cart_${userId}` : "cart_guest"
}

function loadCart() {
  const key = getCartKey()
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

function saveCart(cart) {
  const key = getCartKey()
  localStorage.setItem(key, JSON.stringify(cart))
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true);
  // Load cart khi user thay đổi
  useEffect(() => {
    setLoading(true);
    setCart(loadCart())
    setLoading(false);

    // Listen for userId changes (login/logout)
    const onStorage = () => {
      setLoading(true);
      setCart(loadCart());
      setLoading(false);
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [localStorage.getItem("userId")])

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (!product.variant || (item.product.variant && item.product.variant.name === product.variant.name)),
      )
      let newCart
      if (existIdx > -1) {
        // Cộng dồn số lượng, không vượt quá stock
        const maxStock = product.variant ? product.variant.stock : product.stock
        const newQty = Math.min(prev[existIdx].quantity + quantity, maxStock)
        newCart = [...prev]
        newCart[existIdx] = { ...newCart[existIdx], quantity: newQty }
      } else {
        newCart = [...prev, { product, quantity }]
      }
      saveCart(newCart)
      return newCart
    })
  }

  const updateQuantity = (index, quantity) => {
    setCart((prev) => {
      if (index < 0 || index >= prev.length) return prev
      const item = prev[index]
      const maxStock = item.product.variant ? item.product.variant.stock : item.product.stock
      const newQty = Math.max(1, Math.min(quantity, maxStock))
      const newCart = [...prev]
      newCart[index] = { ...item, quantity: newQty }
      saveCart(newCart)
      return newCart
    })
  }

  const removeFromCart = (index) => {
    setCart((prev) => {
      const newCart = prev.filter((_, i) => i !== index)
      saveCart(newCart)
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    saveCart([])
  }

  const getCart = () => cart

  const getCartTotal = () => {
    return cart.reduce(
      (sum, item) =>
        sum +
        (item.product.variant ? item.product.variant.price : item.product.price) * item.quantity,
      0
    )
  }

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCart,
    getCartTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
