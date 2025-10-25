import React, { createContext, useContext, useState } from "react";
import productsData from "../data/products.json";

const CheckoutContext = createContext();

export const useCheckout = () => useContext(CheckoutContext);

async function saveOrderToServer(order) {
  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error("Failed to save order to server");
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lưu order lên server:", error);
    return null;
  }
}

export const CheckoutProvider = ({ children }) => {
  const [checkoutInfo, setCheckoutInfo] = useState({
    address: "",
    phone: "",
    paymentMethod: "cod",
    note: "",
    orderItems: [],
    total: 0,
    shippingFee: 0,
    discount: 0,
    userId: null,
  });

  // Cập nhật thông tin checkout
  const updateCheckoutInfo = (info) => {
    setCheckoutInfo((prev) => ({ ...prev, ...info }));
  };

  // Xử lý chọn phương thức thanh toán
  const selectPaymentMethod = (method) => {
    setCheckoutInfo((prev) => ({ ...prev, paymentMethod: method }));
  };

  const placeOrder = async () => {
    const detailedOrderItems = checkoutInfo.orderItems.map((item) => {
      const product = productsData.product_detail.find((p) => p.id === item.productId);
      if (!product) return null;

      const variant = product.variants.find((v) => v.name === item.variantName);
      return {
        productId: product.id,
        name: product.name,
        variant: variant?.name || "",
        variantImage: variant?.image || product.image,
        quantity: item.quantity,
        price: variant?.price || product.price,
      };
    }).filter(Boolean);

    const newOrder = {
      id: "order-" + Date.now(),
      customer: checkoutInfo.recipientName || "Không rõ",
      email: checkoutInfo.email || "",
      phone: checkoutInfo.phone || "Không rõ",
      address: checkoutInfo.address,
      payment: checkoutInfo.paymentMethod,
      status: "Chờ xác nhận",
      items: detailedOrderItems,
      total: checkoutInfo.total,
      createdAt: new Date().toISOString(),
    };

    // Gửi order lên server (ghi vào order.json)
    await saveOrderToServer(newOrder);

    // Nếu muốn vẫn lưu local để hiển thị nhanh:
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    localStorage.setItem("orders", JSON.stringify([...orders, newOrder]));

    return newOrder;
  };

  const clearCheckout = () => {
    setCheckoutInfo({
      address: "",
      phone: "",
      paymentMethod: "cod",
      note: "",
      orderItems: [],
      total: 0,
      shippingFee: 0,
      discount: 0,
      userId: null,
    });
  };

  return (
    <CheckoutContext.Provider value={{
      checkoutInfo,
      updateCheckoutInfo,
      selectPaymentMethod,
      placeOrder,
      clearCheckout
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};
