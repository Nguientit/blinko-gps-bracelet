// File: AdminDashboard.js
import React, { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import UserManager from "./UserManager/UserManager"
import ProductManager from "./ProductManager/ProductManager"
import OrderManager from "./OrderManager/OrderManager"
import RevenueManager from "./RevenueManager"
import Header from "../../components/Header/AdminHeader"
import Footer from "../../components/Footer/Footer"
import "./AdminDashboard.css"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("adminActiveSection") || "users"
  })

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <UserManager />
      case "products":
        return <ProductManager />
      case "orders":
        return <OrderManager />
      case "revenue":
        return <RevenueManager />
      default:
        return <UserManager />
    }
  }

  useEffect(() => {
    localStorage.setItem("adminActiveSection", activeSection)
  }, [activeSection])

  return (
    <div className="pmx-admin-container">
      <Header />
      <div className="pmx-admin-main">
        <Sidebar
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />

        <div className="pmx-admin-content">
          {renderSection()}
        </div>
      </div>

    </div>
  )
}
