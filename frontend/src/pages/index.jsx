import {
  ShoppingBag,
  Users,
  Camera,
  Heart,
  Star,
  ArrowRight,
  Sparkles,
  Wand2,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";

export default function HomePage() {
  const images = [
    "/assets/fashion1.png",
    "/assets/fashion2.png",
    "/assets/fashion3.png",
    "/assets/fashion4.png",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const features = [
    {
      icon: <Camera className="w-8 h-8 text-purple-600" />,
      title: "Thử đồ ảo AR",
      description: "Thử đồ trực tuyến với công nghệ AR và AI hiện đại",
      link: "/tryon",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Cộng đồng sôi động",
      description: "Chia sẻ outfit và nhận cảm hứng từ cộng đồng",
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-purple-600" />,
      title: "Marketplace",
      description: "Mua bán sản phẩm thời trang trong marketplace",
      link: "/marketplace/marketplace",
    },
    {
      icon: <Heart className="w-8 h-8 text-purple-600" />,
      title: "Tủ đồ cá nhân",
      description: "Quản lý và sắp xếp tủ quần áo của bạn thông minh",
      link: "/wardrobe/wardrobe",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "Fashion Blogger",
      content:
        "OOTDverse đã thay đổi hoàn toàn cách tôi lên ý tưởng outfit. Tính năng thử đồ ảo quá tuyệt vời!",
      rating: 5,
    },
    {
      name: "Trần Hoàng Long",
      role: "Người yêu thời trang",
      content:
        "Cộng đồng ở đây thật sự năng động. Tôi đã khám phá được rất nhiều phong cách và thương hiệu mới.",
      rating: 5,
    },
    {
      name: "Lê Thu Hà",
      role: "Fashion Designer",
      content:
        "Là nhà thiết kế, tôi thấy nền tảng này giúp tôi hiểu rõ hơn về xu hướng và sở thích của người dùng.",
      rating: 5,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 bg-gradient-to-b from-purple-50 via-pink-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-5 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 rounded-full">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium text-purple-700">
                  Tủ đồ thông minh thế hệ mới
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Biến tủ quần áo thành thế giới thời trang của riêng bạn
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg">
                OOTDverse kết hợp AI và AR để giúp bạn quản lý tủ đồ, phối
                outfit thông minh, thử đồ online và kết nối với cộng đồng yêu
                thời trang.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-base sm:text-lg font-medium inline-flex items-center justify-center transition-all">
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Tạo tủ đồ miễn phí
                </a>
                <a href="/marketplace" className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-base sm:text-lg font-medium inline-flex items-center justify-center transition-all">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Khám phá Marketplace
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-6 lg:gap-8 pt-4">
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">
                    10,000+
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">Người dùng</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-600">
                    50,000+
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">Outfit đã tạo</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">
                    5,000+
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">Sản phẩm</p>
                </div>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl sm:rounded-3xl blur-3xl opacity-20"></div>
              <img
                src={images[currentImage]}
                alt="Fashion wardrobe"
                className="relative rounded-2xl sm:rounded-3xl shadow-2xl w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - CẬP NHẬT PHẦN NÀY */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn OOTDverse?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trải nghiệm tương lai của thời trang với các tính năng đổi mới
              được thiết kế để nâng tầm phong cách của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <a
                key={index}
                href={feature.link}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section
        id="community"
        className="py-20 bg-gradient-to-b from-white to-purple-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Cộng đồng OOTDverse
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kết nối với hàng nghìn bạn trẻ yêu thời trang, chia sẻ outfit và
              tham gia các thử thách thú vị
            </p>
          </div>

          {/* Community Posts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Post 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop"
                  alt="Top Stylist"
                  className="w-full h-64 object-cover"
                />
                <span className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Top Stylist
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Minh Anh</p>
                    <p className="text-sm text-gray-500">@minhanh_style</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Streetwear vibes cho ngày đi chơi 🐝
                </p>
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5" />
                    <span>234</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&auto=format&fit=crop"
                  alt="Rising Star"
                  className="w-full h-64 object-cover"
                />
                <span className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Rising Star
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Thu Thảo</p>
                    <p className="text-sm text-gray-500">@thuthao.ootd</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">Casual but make it chic 💖</p>
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5" />
                    <span>189</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&auto=format&fit=crop"
                  alt="Challenge Winner"
                  className="w-full h-64 object-cover"
                />
                <span className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Challenge Winner
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Đức Anh</p>
                    <p className="text-sm text-gray-500">@ducanh.fashion</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Mix 7 ngày với 7 món đồ - Day 3 🔥
                </p>
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5" />
                    <span>312</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-purple-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-2">
                Bảng xếp hạng
              </h3>
              <p className="text-gray-600">
                Outfit hot nhất tuần được vote bởi cộng đồng
              </p>
            </div>

            <div className="bg-pink-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-pink-600 mb-2">
                Thử thách
              </h3>
              <p className="text-gray-600">
                Tham gia các challenge thú vị và nhận phần thưởng
              </p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-600 mb-2">Kết nối</h3>
              <p className="text-gray-600">
                Follow và tương tác với những người có cùng phong cách
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="/register"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center transition-all shadow-lg hover:shadow-xl"
            >
              Tham gia cộng đồng ngay
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Người dùng nói gì về chúng tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn người yêu thời trang đã thay đổi phong
              cách với OOTDverse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section
        id="marketplace"
        className="py-20 bg-gradient-to-b from-purple-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Marketplace
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mua bán và trao đổi quần áo trong cộng đồng - Thời trang bền vững,
              tiết kiệm và sáng tạo
            </p>
          </div>

          {/* Marketplace Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Mua bán dễ dàng
              </h3>
              <p className="text-gray-600">
                Đăng bán quần áo không dùng đến với vài cú click
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Trao đổi thông minh
              </h3>
              <p className="text-gray-600">
                Swap đồ với người khác để làm mới tủ quần áo
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Thanh toán an toàn
              </h3>
              <p className="text-gray-600">
                Hỗ trợ QR Code và ví điện tử phổ biến
              </p>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Product 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="relative">
                <img
                  src="assets/denim.png"
                  alt="Áo khoác Denim"
                  className="w-full h-64 object-cover"
                />
                <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Như mới
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Áo khoác Denim
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-bold text-purple-600">
                    250,000đ
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    450,000đ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Minh Anh</span>
                </div>
              </div>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop"
                  alt="Váy vintage"
                  className="w-full h-64 object-cover"
                />
                <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Tốt
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Váy vintage
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-bold text-purple-600">
                    180,000đ
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    350,000đ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Thu Thảo</span>
                </div>
              </div>
            </div>

            {/* Product 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&auto=format&fit=crop"
                  alt="Giày sneaker"
                  className="w-full h-64 object-cover"
                />
                <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Như mới
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Giày sneaker
                </h3>
                <div className="mb-3">
                  <span className="text-lg font-bold text-pink-600">
                    Trao đổi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Đức Anh</span>
                </div>
              </div>
            </div>

            {/* Product 4 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="relative">
                <img
                  src="assets/tuixach.png"
                  alt="Túi xách mini"
                  className="w-full h-64 object-cover"
                />
                <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Tốt
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Túi xách</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-bold text-purple-600">
                    120,000đ
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    280,000đ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Lan Anh</span>
                </div>
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center">
            <button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-xl text-lg font-semibold inline-flex items-center transition-all">
              Xem thêm sản phẩm
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Về OOTDverse
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                OOTDverse là nền tảng thời trang thông minh kết hợp công nghệ AI
                và AR, giúp bạn quản lý tủ đồ hiệu quả và khám phá phong cách cá
                nhân.
              </p>
              <p className="text-lg text-gray-600">
                Chúng tôi tin rằng mỗi người đều có một phong cách riêng biệt,
                và sứ mệnh của chúng tôi là giúp bạn khám phá và thể hiện nó một
                cách tự tin nhất.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop"
                alt="About OOTDverse"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sẵn sàng thay đổi phong cách của bạn?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Tham gia OOTDverse ngay hôm nay và khám phá thế giới thời trang đầy
            khả năng mới.
          </p>
          <a
            href="/register"
            className="bg-white text-purple-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center"
          >
            Bắt đầu ngay
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>
    </Layout>
  );
}
