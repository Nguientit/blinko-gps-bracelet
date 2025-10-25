"use client"

import { useState, useEffect } from "react"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import ProductCard from "../../components/ProductCard/ProductCard"
import { LayoutGrid, List } from 'lucide-react';
import CustomSelect from "../../components/CustomSelect/CustomSelect"
import "./ProductsPage.css"

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 1. Gọi fetch trực tiếp (đã có proxy)
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Lỗi khi tải sản phẩm");

        // 2. Lấy data (đây là object)
        const data = await res.json();

        // 3. Chỉ lấy mảng 'products' từ object đó
        const productsArray = data.products || [];

        setProducts(productsArray);
        setFilteredProducts(productsArray);

      } catch (error) {
        console.error("Error fetching products:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    if (selectedAgeGroup !== "all") {
      filtered = filtered.filter((product) => product.ageGroup === selectedAgeGroup)
    }

    if (selectedPrice !== "all") {
      if (selectedPrice === "lt150") filtered = filtered.filter((product) => product.price < 150000)
      else if (selectedPrice === "150-180") filtered = filtered.filter((product) => product.price >= 150000 && product.price <= 180000)
      else if (selectedPrice === "gt180") filtered = filtered.filter((product) => product.price > 180000)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedAgeGroup, selectedPrice, searchTerm])

  const ageGroups = [
    { value: "all", label: "Tất cả độ tuổi" },
    { value: "3-8 tuổi", label: "3-8 tuổi" },
    { value: "4-12 tuổi", label: "4-12 tuổi" },
    { value: "12-18 tuổi", label: "12-18 tuổi" },
    { value: "13-18 tuổi", label: "13-18 tuổi" },
  ]

  const priceRanges = [
    { value: "all", label: "Tất cả giá" },
    { value: "lt150", label: "Dưới 150.000đ" },
    { value: "150-180", label: "150.000đ - 180.000đ" },
    { value: "gt180", label: "Trên 180.000đ" },
  ]

  if (loading) {
    return (
      <div className="products-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="products-page">
      <Header />

      <main className="products-main">
        <div className="products-hero">
          <div className="container">
            <h1>Vòng Tay Định Vị GPS</h1>
            <p>Khám phá bộ sưu tập vòng tay định vị GPS hiện đại và thông minh</p>
          </div>
        </div>

        <div className="container">
          <div className="products-controls">
            <div className="filters">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="category-filter">
                <CustomSelect
                  options={ageGroups}
                  value={selectedAgeGroup}
                  onChange={setSelectedAgeGroup}
                  placeholder="Select Age Group"
                />
              </div>

              <div className="category-filter">
                <CustomSelect
                  options={priceRanges}
                  value={selectedPrice}
                  onChange={setSelectedPrice}
                  placeholder="Select Price Range"
                />
              </div>
            </div>

            <div className="view-controls">
              <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                <LayoutGrid />
              </button>
              <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                <List />
              </button>
            </div>
          </div>

          <div className="products-results">
            <p>{filteredProducts.length} sản phẩm được tìm thấy</p>
          </div>

          <div className={`products-grid ${viewMode}`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <h3>Không tìm thấy sản phẩm nào</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductsPage
