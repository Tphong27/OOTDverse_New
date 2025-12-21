// frontend/src/components/address/CreateAddressModal.jsx
import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { reverseGeocode } from "@/services/geocodeService";
import { createAddress } from "@/services/addressService";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

export default function CreateAddressModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    street: "",
    province: { code: "", name: "" },
    district: { code: "", name: "" },
    ward: { code: "", name: "" },
    location: null, // Đổi từ object sang null
    place_id: "",
    type: "HOME",
    is_default: false,
  });

  const [loading, setLoading] = useState(false);

  // ✅ Sửa hàm này để nhận lat, lng từ MapPicker
  const handlePickLocation = async ({ lat, lng }) => {
    try {
      setLoading(true);
      console.log("🗺️ Đang reverse geocode:", { lat, lng });

      const data = await reverseGeocode(lat, lng);

      console.log("📍 Reverse geocode RAW result:", data);
      console.log("📍 Address object:", data?.address);
      console.log("📍 Display name:", data?.display_name);

      if (!data || !data.address) {
        console.error("❌ Invalid geocode response:", data);
        alert("Không thể lấy địa chỉ từ vị trí này");
        setLoading(false);
        return;
      }

      const address = data.address;

      // ✅ Parse địa chỉ từ OpenStreetMap
      const newForm = {
        ...form,
        street: address.road || address.suburb || data.name || "Không xác định",
        province: {
          code: "",
          name: address.state || address.province || "",
        },
        district: {
          code: "",
          name: address.city_district || address.city || address.town || "",
        },
        ward: {
          code: "",
          name: address.suburb || address.village || address.hamlet || "",
        },
        location: { lat, lng }, // ✅ Lưu đúng format
        place_id: data.place_id?.toString() || "",
      };

      console.log("✅ Form updated:", newForm);
      setForm(newForm);
      setLoading(false);
    } catch (error) {
      console.error("❌ Reverse geocode error:", error);
      alert("Lỗi khi lấy địa chỉ: " + error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // ✅ Validation chính xác
    if (!form.full_name || !form.phone || !form.location) {
      alert("Vui lòng nhập đầy đủ thông tin và chọn vị trí trên bản đồ");
      return;
    }

    if (!form.street || !form.province.name) {
      alert("Không thể xác định địa chỉ. Vui lòng chọn lại vị trí trên bản đồ");
      return;
    }

    try {
      console.log("📤 Submitting address:", form);

      await createAddress({
        full_name: form.full_name,
        phone: form.phone,
        street: form.street,
        province: form.province,
        district: form.district,
        ward: form.ward,
        location: form.location, // { lat, lng }
        place_id: form.place_id,
        type: form.type,
        is_default: form.is_default,
      });

      alert("✅ Thêm địa chỉ thành công!");
      onCreated?.();
      onClose();
    } catch (error) {
      console.error("❌ Create address error:", error);
      alert("Lỗi khi thêm địa chỉ: " + error.message);
    }
  };

  if (!isOpen) return null;

  // ✅ Hiển thị địa chỉ đầy đủ
  const fullAddress = [
    form.street,
    form.ward.name,
    form.district.name,
    form.province.name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="font-bold">Thêm địa chỉ mới</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            placeholder="Họ tên"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full border p-3 rounded-lg"
          />

          <input
            placeholder="Số điện thoại (VD: 0912345678)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border p-3 rounded-lg"
          />

          <div className="space-y-2">
            <p className="font-semibold flex gap-1 items-center">
              <MapPin size={16} /> Chọn vị trí trên bản đồ
            </p>
            {loading && (
              <p className="text-sm text-blue-600">Đang lấy địa chỉ...</p>
            )}
            <MapPicker onChange={handlePickLocation} />
          </div>

          {/* ✅ Hiển thị địa chỉ đã chọn */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Địa chỉ đã chọn:</p>
            {fullAddress ? (
              <p className="text-sm">{fullAddress}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Nhấn vào bản đồ để chọn vị trí
              </p>
            )}
          </div>

          {/* ✅ Các trường chi tiết (optional edit) */}
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600">
              Chỉnh sửa chi tiết (nếu cần)
            </summary>
            <div className="mt-2 space-y-2">
              <input
                placeholder="Số nhà, tên đường"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
              <input
                placeholder="Phường/Xã"
                value={form.ward.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ward: { ...form.ward, name: e.target.value },
                  })
                }
                className="w-full border p-2 rounded text-sm"
              />
              <input
                placeholder="Quận/Huyện"
                value={form.district.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    district: { ...form.district, name: e.target.value },
                  })
                }
                className="w-full border p-2 rounded text-sm"
              />
              <input
                placeholder="Tỉnh/Thành phố"
                value={form.province.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    province: { ...form.province, name: e.target.value },
                  })
                }
                className="w-full border p-2 rounded text-sm"
              />
            </div>
          </details>

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) =>
                setForm({ ...form, is_default: e.target.checked })
              }
            />
            Đặt làm địa chỉ mặc định
          </label>
        </div>

        <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.location}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Lưu địa chỉ
          </button>
        </div>
      </div>
    </div>
  );
}