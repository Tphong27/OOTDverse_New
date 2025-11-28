import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { Filter, Plus, Heart } from "lucide-react";
import { getWardrobeItems } from "@/services/wardrobeService"; // <--- Import service

export default function Wardrobe() {
  const [items, setItems] = useState([]); // State chứa dữ liệu thật
  const [loading, setLoading] = useState(true); // Trạng thái đang tải

  // Gọi API khi trang vừa mở
  useEffect(() => {
    const fetchItems = async () => {
      const data = await getWardrobeItems();
      setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  // ... (Giữ nguyên phần render UI bên dưới, nhưng thay biến 'items' giả bằng state 'items' thật)
  // Ví dụ đoạn map:
  return (
    <LayoutUser>
      {/* ... Phần Header giữ nguyên ... */}

      {/* Hiển thị Loading hoặc Danh sách */}
      {loading ? (
        <p className="text-center py-10">Đang tải tủ đồ của bạn...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              {/* Lưu ý: MongoDB dùng _id thay vì id */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.imageUrl || "https://via.placeholder.com/300"} // Fallback ảnh nếu lỗi
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* ... giữ nguyên phần icon trái tim ... */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">{item.brand}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thông báo nếu chưa có đồ */}
      {!loading && items.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          Tủ đồ đang trống. Hãy thêm món đồ đầu tiên nhé!
        </div>
      )}
    </LayoutUser>
  );
}
