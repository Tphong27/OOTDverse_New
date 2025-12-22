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
    location: null,
    place_id: "",
    type: "HOME",
    is_default: false,
  });

  const [loading, setLoading] = useState(false);

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
        location: { lat, lng },
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
    // Validation
    if (!form.full_name || !form.phone || !form.location) {
      alert("Vui lòng nhập đầy đủ thông tin và chọn vị trí trên bản đồ");
      return;
    }

    if (!form.street || !form.province.name) {
      alert("Không thể xác định địa chỉ. Vui lòng chọn lại vị trí trên bản đồ");
      return;
    }

    try {
      setLoading(true);
      console.log("📤 Submitting address:", form);

      const response = await createAddress({
        full_name: form.full_name,
        phone: form.phone,
        street: form.street,
        province: form.province,
        district: form.district,
        ward: form.ward,
        location: form.location,
        place_id: form.place_id,
        type: form.type,
        is_default: form.is_default,
      });

      console.log("✅ Address created successfully:", response);

      // ✅ Reset form
      setForm({
        full_name: "",
        phone: "",
        street: "",
        province: { code: "", name: "" },
        district: { code: "", name: "" },
        ward: { code: "", name: "" },
        location: null,
        place_id: "",
        type: "HOME",
        is_default: false,
      });

      alert("✅ Thêm địa chỉ thành công!");

      // ✅ CRITICAL: Call onCreated callback
      if (onCreated) {
        console.log("🔔 Calling onCreated callback...");
        onCreated();
      } else {
        console.warn("⚠️ onCreated callback is not provided!");
      }

      // ✅ Close modal after callback
      onClose();
    } catch (error) {
      console.error("❌ Create address error:", error);
      alert("Lỗi khi thêm địa chỉ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fullAddress = [
    form.street,
    form.ward.name,
    form.district.name,
    form.province.name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    // z-[110] - Higher than AddressListModal (z-[100])
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between p-4 border-b flex-shrink-0">
          <h2 className="font-bold">Thêm địa chỉ mới</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
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

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.location || loading}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu địa chỉ"}
          </button>
        </div>
      </div>
    </div>
  );
}