"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Kiểm tra đăng nhập khi load trang lần đầu
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? localStorage.getItem("currentUser")
        : null;
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Lỗi parse user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  // 2. Hàm Đăng nhập (Gọi hàm này ở trang Login)
  const login = (userData, token) => {
    // ⭐ QUAN TRỌNG: Lưu cả user data VÀ token
    const userWithToken = {
      ...userData,
      token, // JWT token từ backend
    };
    
    localStorage.setItem("currentUser", JSON.stringify(userWithToken));
    setUser(userWithToken);
  };

  // 3. Hàm Đăng xuất
  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/login");
  };

  // 4. Hàm update user info (không mất token)
  const updateUser = (updatedData) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updatedData,
        token: user.token, // Giữ nguyên token
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  // 5. Hàm kiểm tra token còn hạn không
  const isTokenValid = () => {
    if (!user || !user.token) return false;
    
    try {
      // Decode JWT token (phần payload)
      const tokenParts = user.token.split(".");
      if (tokenParts.length !== 3) return false;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      
      return Date.now() < expirationTime;
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  };

  // Thêm cờ kiểm tra quyền truy cập (Access Control)
  const isAdmin = user?.role?.name === "Admin";
  const isCustomer = user?.role?.name === "Customer";
  const isAuthenticated = user !== null && isTokenValid();

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading,
        isAdmin,
        isCustomer,
        isAuthenticated,
        isTokenValid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}