// API service for fetching data from database.json
const API_BASE = "src/data/database.json"

class ApiService {
  async fetchData() {
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }
      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  async getProducts() {
    const data = await this.fetchData()
    return data.products || []
  }

  async getProduct(id) {
    const products = await this.getProducts()
    return products.find((product) => product.id === Number.parseInt(id))
  }

  async getUsers() {
    const data = await this.fetchData()
    return data.users || []
  }

  async getCart() {
    const data = await this.fetchData()
    return data.cart || []
  }

  async getFeedback() {
    const data = await this.fetchData()
    return data.feedback || []
  }

  // Simulate API calls for cart operations (in real app, these would be POST/PUT/DELETE)
  async addToCart(product) {
    // In a real app, this would make a POST request
    console.log("Adding to cart:", product)
    return { success: true, message: "Đã thêm vào giỏ hàng" }
  }

  async removeFromCart(productId) {
    // In a real app, this would make a DELETE request
    console.log("Removing from cart:", productId)
    return { success: true, message: "Đã xóa khỏi giỏ hàng" }
  }

  async login(email, password) {
    const users = await this.getUsers()
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) {
      return { success: true, user: { id: user.id, fullName: user.fullName, email: user.email } }
    }
    return { success: false, message: "Email hoặc mật khẩu không đúng" }
  }

  async register(userData) {
    // In a real app, this would make a POST request
    console.log("Registering user:", userData)
    return { success: true, message: "Đăng ký thành công" }
  }
}

export const apiService = new ApiService()
