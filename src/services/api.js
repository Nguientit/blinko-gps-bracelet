// // API Service for GPS Bracelet Store
// const API_BASE_URL = "../data/database.json"
// const ORDER_API_URL = "http://localhost:5000/api/orders"

// class ApiService {
//   constructor() {
//     this.data = null
//     this.lastFetch = 0
//     this.cacheTime = 5000 // 5 seconds cache
//   }

//   async fetchData() {
//     const now = Date.now()
//     if (this.data && now - this.lastFetch < this.cacheTime) {
//       return this.data
//     }

//     try {
//       const response = await fetch(API_BASE_URL)
//       if (!response.ok) {
//         throw new Error("Network response was not ok")
//       }
//       this.data = await response.json()
//       this.lastFetch = now
//       return this.data
//     } catch (error) {
//       console.error("Error fetching data:", error)
//       throw error
//     }
//   }

//   async getProducts() {
//     try {
//       const data = await this.fetchData()
//       return data.products || []
//     } catch (error) {
//       console.error("Error fetching products:", error)
//       return []
//     }
//   }

//   async getProductById(id) {
//     try {
//       const products = await this.getProducts()
//       return products.find((product) => product.id === Number.parseInt(id))
//     } catch (error) {
//       console.error("Error fetching product:", error)
//       return null
//     }
//   }

//   async getFeedbacks() {
//     try {
//       const data = await this.fetchData()
//       return data.feedback || []
//     } catch (error) {
//       console.error("Error fetching feedback:", error)
//       return []
//     }
//   }

//   async submitFeedback(feedbackData) {
//     try {
//       // In a real app, this would make a POST request to save feedback
//       // For now, we'll simulate success and store in localStorage for persistence
//       const existingFeedbacks = JSON.parse(localStorage.getItem("userFeedbacks") || "[]")
//       const newFeedback = {
//         ...feedbackData,
//         id: Date.now(),
//         date: new Date().toISOString(),
//         verified: false,
//       }
//       existingFeedbacks.push(newFeedback)
//       localStorage.setItem("userFeedbacks", JSON.stringify(existingFeedbacks))

//       return {
//         success: true,
//         message: "Đánh giá đã được gửi thành công",
//         feedback: newFeedback,
//       }
//     } catch (error) {
//       console.error("Error submitting feedback:", error)
//       return {
//         success: false,
//         message: "Có lỗi xảy ra khi gửi đánh giá",
//       }
//     }
//   }

//   async login(email, password) {
//     try {
//       const data = await this.fetchData()
//       const users = data.users || []

//       const localUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
//       const allUsers = [...users, ...localUsers]

//       const user = allUsers.find((u) => u.email === email && u.password === password)

//       if (user) {
//         localStorage.setItem(
//           "currentUser",
//           JSON.stringify({
//             id: user.id,
//             name: user.name,
//             email: user.email,
//           }),
//         )

//         return {
//           success: true,
//           user: { id: user.id, name: user.name, email: user.email },
//         }
//       } else {
//         return {
//           success: false,
//           message: "Email hoặc mật khẩu không đúng",
//         }
//       }
//     } catch (error) {
//       console.error("Error during login:", error)
//       return {
//         success: false,
//         message: "Có lỗi xảy ra khi đăng nhập",
//       }
//     }
//   }

//   async register(userData) {
//     try {
//       // Check if user already exists
//       const data = await this.fetchData()
//       const existingUsers = data.users || []
//       const localUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
//       const allUsers = [...existingUsers, ...localUsers]

//       if (allUsers.find((user) => user.email === userData.email)) {
//         return {
//           success: false,
//           message: "Email này đã được đăng ký",
//         }
//       }

//       // Create new user
//       const newUser = {
//         id: Date.now(),
//         name: userData.name,
//         email: userData.email,
//         password: userData.password,
//         createdAt: new Date().toISOString(),
//       }

//       // Save to localStorage (in real app, this would be a POST request)
//       localUsers.push(newUser)
//       localStorage.setItem("registeredUsers", JSON.stringify(localUsers))

//       return {
//         success: true,
//         message: "Đăng ký thành công",
//         user: { id: newUser.id, name: newUser.name, email: newUser.email },
//       }
//     } catch (error) {
//       console.error("Error during registration:", error)
//       return {
//         success: false,
//         message: "Có lỗi xảy ra khi đăng ký",
//       }
//     }
//   }

//   getCurrentUser() {
//     try {
//       const user = localStorage.getItem("currentUser")
//       return user ? JSON.parse(user) : null
//     } catch (error) {
//       console.error("Error getting current user:", error)
//       return null
//     }
//   }

//   logout() {
//     localStorage.removeItem("currentUser")
//     return { success: true }
//   }

//   formatPrice(price) {
//     return new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(price)
//   }

//   // Lấy danh sách order từ server (json-server hoặc backend)
//   async getOrders() {
//     try {
//       const response = await fetch(ORDER_API_URL)
//       if (!response.ok) throw new Error("Network response was not ok")
//       const data = await response.json()
//       return Array.isArray(data) ? data : (data.orders || [])
//     } catch (error) {
//       console.error("Error fetching orders:", error)
//       return []
//     }
//   }

//   // Thêm order mới lên server (json-server hoặc backend)
//   async createOrder(orderData) {
//     try {
//       const response = await fetch(ORDER_API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(orderData),
//       });

//       if (!response.ok) throw new Error("Network response was not ok");

//       const savedOrder = await response.json();
//       console.log("Order saved to server:", savedOrder);
//       return savedOrder;
//     } catch (error) {
//       console.error("Error creating order:", error);

//       const localOrders = JSON.parse(localStorage.getItem("localOrders") || "[]");
//       localOrders.push(orderData);
//       localStorage.setItem("localOrders", JSON.stringify(localOrders));

//       return orderData;
//     }
//   }

// }

// export const apiService = new ApiService()

// export const getProducts = () => apiService.getProducts()
// export const getProductById = (id) => apiService.getProductById(id)
// export const getFeedbacks = () => apiService.getFeedbacks()
// export const submitFeedback = (feedbackData) => apiService.submitFeedback(feedbackData)
// export const login = (email, password) => apiService.login(email, password)
// export const register = (userData) => apiService.register(userData)
// export const getCurrentUser = () => apiService.getCurrentUser()
// export const logout = () => apiService.logout()
// export const formatPrice = (price) => apiService.formatPrice(price)
// export const getOrders = () => apiService.getOrders()
// export const createOrder = (orderData) => apiService.createOrder(orderData)