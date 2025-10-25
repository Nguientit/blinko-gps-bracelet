import React, { createContext, useContext, useEffect, useState } from "react";

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔁 Gọi API từ serverless /api/products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
        const data = await res.json();

        // Nếu backend trả về { products, product_detail }
        // thì ta tách ra, nếu chỉ trả mảng sản phẩm thì vẫn hoạt động
        setProducts(data.products || data || []);
        setProductDetails(data.product_detail || data.products || []);
      } catch (err) {
        console.error("[ProductContext] Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 📦 Lấy chi tiết sản phẩm theo id (nếu đã tải hết)
  const getProductDetailById = (id) => {
    return (
      productDetails.find((p) => p.id === id) ||
      products.find((p) => p.id === id)
    );
  };

  // ⚡ Lấy chi tiết sản phẩm qua API (nếu chưa có trong context)
  const fetchProductById = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
      return await res.json();
    } catch (err) {
      console.error("[ProductContext] Fetch product by id error:", err);
      return null;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        productDetails,
        getProductDetailById,
        fetchProductById,
        loading,
        error,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
