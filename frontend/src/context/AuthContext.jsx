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
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi parse user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  // 2. Hàm Đăng nhập (Gọi hàm này ở trang Login)
  const login = (userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData); // Cập nhật state ngay lập tức -> Các context khác sẽ biết
  };

  // 3. Hàm Đăng xuất
  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/login");
  };

  // Thêm cờ kiểm tra quyền truy cập (Access Control)
  const isAdmin = user?.role?.name === "Admin";
  const isCustomer = user?.role?.name === "Customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAdmin,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
