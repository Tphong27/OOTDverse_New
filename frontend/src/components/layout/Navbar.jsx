import { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              OOTDverse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Tính năng
            </a>
            <a
              href="#community"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Cộng đồng
            </a>
            <a
              href="#marketplace"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Marketplace
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Đánh giá
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-gray-600 hover:text-purple-600 px-4 py-2 font-medium transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Bắt đầu ngay
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            <a
              href="#features"
              className="block px-3 py-2 text-gray-600 hover:text-purple-600 font-medium"
            >
              Tính năng
            </a>
            <a
              href="#community"
              className="block px-3 py-2 text-gray-600 hover:text-purple-600 font-medium"
            >
              Cộng đồng
            </a>
            <a
              href="#marketplace"
              className="block px-3 py-2 text-gray-600 hover:text-purple-600 font-medium"
            >
              Marketplace
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 text-gray-600 hover:text-purple-600 font-medium"
            >
              Đánh giá
            </a>
            <div className="pt-4 pb-2 border-t border-gray-200">
              <Link
                href="/login"
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-purple-600 font-medium"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="block w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium text-center"
              >
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
