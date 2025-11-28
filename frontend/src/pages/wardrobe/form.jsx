// frontend/src/pages/wardrobe/form.jsx
import LayoutUser from "@/components/layout/LayoutUser";
import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { useRouter } from "next/router"; // Dùng router để chuyển trang
import { createWardrobeItem } from "@/services/wardrobeService"; // Import service gọi API

export default function AddItemForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Lưu chuỗi Base64 ảnh

  const [formData, setFormData] = useState({
    name: "",
    category: "Áo", // Giá trị mặc định
    brand: "",
    color: "", // Backend chưa lưu cái này, nhưng cứ để UI nhập cho đẹp
    season: "",
  });

  const categories = ["Áo", "Quần", "Váy", "Giày", "Túi xách", "Phụ kiện"];

  // 1. Xử lý khi chọn ảnh: Chuyển file thành Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (ví dụ giới hạn 2MB để tránh Mongo bị đầy)
      if (file.size > 2 * 1024 * 1024) {
        alert("File ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // Chuỗi Base64 dài ngoằng
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Xử lý khi bấm nút "Lưu"
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (!formData.name || !selectedImage) {
      alert("Vui lòng nhập tên món đồ và chọn ảnh!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuẩn bị cục dữ liệu đúng chuẩn Backend yêu cầu (xem file Item.js)
      const payload = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        imageUrl: selectedImage, // Backend đang chờ field tên là 'imageUrl'
      };

      console.log("Đang gửi dữ liệu...", payload); // Log để debug nếu cần

      // Gọi API
      await createWardrobeItem(payload);

      // Thành công -> Quay về trang danh sách
      alert("Thêm món đồ thành công! 🎉");
      router.push("/wardrobe/wardrobe");
    } catch (error) {
      console.error("Lỗi submit:", error);
      alert("Có lỗi xảy ra khi lưu. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutUser>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Thêm món đồ mới</h1>
          <p className="text-gray-500 mt-1">
            Chụp ảnh hoặc tải lên hình ảnh trang phục của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Khu vực Upload Ảnh */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Hình ảnh trang phục <span className="text-red-500">*</span>
            </label>

            {!selectedImage ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group">
                <div className="p-4 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors mb-3">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Nhấn để tải ảnh lên
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG tối đa 2MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="relative w-full h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Khu vực Thông tin */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên món đồ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Áo sơ mi trắng..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thương hiệu
                </label>
                <input
                  type="text"
                  placeholder="Uniqlo, Zara..."
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Các nút bấm */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Thêm vào tủ đồ"
              )}
            </button>
          </div>
        </form>
      </div>
    </LayoutUser>
  );
}
