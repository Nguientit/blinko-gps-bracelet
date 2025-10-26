import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import { ProductProvider } from './contexts/ProductContext'
import { CheckoutProvider } from './contexts/CheckoutContext'
import { ProfileProvider } from "./contexts/ProfileContext"
import { FeedbackProvider } from "./contexts/FeedbackContext"
import { OrderProvider } from "./contexts/OrderContext"
import HomePage from "./pages/HomePage/HomePage"
import ProductsPage from "./pages/ProductsPage/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage"
import AuthPage from "./pages/AuthPage/AuthPage"
import CartPage from "./pages/CartPage/CartPage"
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage"
import FeedbackPage from "./pages/FeedbackPage/FeedbackPage"
import BlinkoBot from "./pages/BlinkoBot/BlinkoBot"
import ProfilePage from "./pages/ProfilePage/ProfilePage"
import MyOrderPage from "./pages/ProfilePage/MyOrderPage"
import AdminDashboard from "./pages/AdminPages/AdminDashBoard"
import ScrollToTop from "./components/ScrollToTop"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <FeedbackProvider>
          <CartProvider>
            <ProfileProvider>
              <ProductProvider>
                <CheckoutProvider>
                  <Router>
                    <ScrollToTop />
                    <div className="App">
                      <Routes>
                        <Route path="/" element={
                          <>
                            <HomePage />
                            <BlinkoBot />
                          </>
                        } />
                        <Route path="/products" element={
                          <>
                            <ProductsPage />
                            <BlinkoBot />
                          </>
                        } />
                        <Route path="/products/:id" element={
                          <>
                            <ProductDetailPage />
                            <BlinkoBot />
                          </>
                        } />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/feedback" element={<FeedbackPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/myorder" element={<MyOrderPage />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      </Routes>
                    </div>
                  </Router>
                </CheckoutProvider>
              </ProductProvider>
            </ProfileProvider>
          </CartProvider>
        </FeedbackProvider>
      </OrderProvider>
    </AuthProvider>
  )
}

export default App
