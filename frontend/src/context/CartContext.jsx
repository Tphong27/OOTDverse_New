// frontend/src/context/CartContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user && cartItems.length >= 0) {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Add item to cart
  const addToCart = (listing) => {
    // Check if item already in cart
    const existingItem = cartItems.find(
      (item) => item.listing_id === listing._id
    );

    if (existingItem) {
      return { success: false, message: "Món đồ đã có trong giỏ hàng" };
    }

    // Check if user is trying to buy their own item
    if (listing.seller_id._id === user._id) {
      return { success: false, message: "Không thể mua hàng của chính mình" };
    }

    const cartItem = {
      listing_id: listing._id,
      item_id: listing.item_id._id,
      item_name: listing.item_id.item_name,
      item_image: listing.item_id.image_url,
      category: listing.item_id.category_id?.name || "",
      brand: listing.item_id.brand_id?.name || "",
      price: listing.selling_price,
      shipping_fee: listing.shipping_fee || 0,
      seller_id: listing.seller_id._id,
      seller_name: listing.seller_id.fullName,
      seller_avatar: listing.seller_id.avatar,
      added_at: new Date().toISOString(),
    };

    setCartItems((prev) => [...prev, cartItem]);
    return { success: true, message: "Đã thêm vào giỏ hàng" };
  };

  // Remove item from cart
  const removeFromCart = (listingId) => {
    setCartItems((prev) => prev.filter((item) => item.listing_id !== listingId));
  };

  // Remove multiple items
  const removeItems = (listingIds) => {
    setCartItems((prev) =>
      prev.filter((item) => !listingIds.includes(item.listing_id))
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    if (user) {
      localStorage.removeItem(`cart_${user._id}`);
    }
  };

  // Get cart stats
  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shippingTotal = cartItems.reduce(
    (sum, item) => sum + item.shipping_fee,
    0
  );
  const platformFeeTotal = cartItems.reduce(
    (sum, item) => sum + item.price * 0.05,
    0
  );
  const grandTotal = cartTotal + shippingTotal + platformFeeTotal;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        shippingTotal,
        platformFeeTotal,
        grandTotal,
        addToCart,
        removeFromCart,
        removeItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}