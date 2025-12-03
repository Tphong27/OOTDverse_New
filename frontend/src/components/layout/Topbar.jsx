"use client";
import { useState } from "react";
import { Bell, Menu, Search, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function Topbar({ setIsSidebarOpen }) {
  const router = useRouter();
  // Lấy user và logout từ Context (Reactive State)
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Không cần useEffect để đọc localStorage nữa vì useAuth đã làm việc đó

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ context để xóa state và localStorage
    // Hàm logout trong context đã có router.push('/login')
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-purple-100 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 w-96 border border-gray-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Tìm kiếm outfit, xu hướng..."
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

          {/* User Profile Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="text-right hidden md:block">
                  {/* Hiển thị tên thật từ Context */}
                  <p className="text-sm font-bold text-gray-800">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-purple-600 font-medium">
                    Fashionista
                  </p>
                </div>
                <img
                  // Tạo avatar tự động theo tên người dùng
                  src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random&color=fff`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fade-in-up">
                  <Link
                    href="/user/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                  >
                    <UserIcon className="w-4 h-4 mr-2" /> Hồ sơ
                  </Link>
                  <Link
                    href="/user/changePass"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                  >
                    <UserIcon className="w-4 h-4 mr-2" /> Đổi mật khẩu
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Nếu chưa đăng nhập thì hiện nút này
            <Link
              href="/login"
              className="text-sm font-bold text-purple-600 hover:text-purple-700"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
