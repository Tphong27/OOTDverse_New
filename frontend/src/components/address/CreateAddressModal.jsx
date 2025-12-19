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
    province: "",
    district: "",
    ward: "",
    street: "",
    type: "home",
    is_default: false,
    location: {
      lat: null,
      lng: null,
    },
  });

  const handlePickLocation = async (latlng) => {
    try {
      const data = await reverseGeocode(latlng.lat, latlng.lng);

      setForm((f) => ({
        ...f,
        street: data.address.road || "",
        ward: data.address.suburb || "",
        district: data.address.city_district || "",
        province: data.address.state || "",
        location: {
          lat: latlng.lat,
          lng: latlng.lng,
        },
      }));
    } catch (err) {
      console.error("Reverse geocode failed");
    }
  };

  const handleSubmit = async () => {
    if (!form.location.lat || !form.location.lng) {
      alert("Vui lòng chọn vị trí trên bản đồ");
      return;
    }

    try {
      await createAddress(form);
      onCreated?.();
      onClose();
    } catch (err) {
      alert(err.message || "Tạo địa chỉ thất bại");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl">
        <div className="flex justify-between p-4 border-b">
          <h2 className="font-bold">Thêm địa chỉ mới</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            placeholder="Họ tên"
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full border p-3 rounded-lg"
          />
          <input
            placeholder="Số điện thoại"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border p-3 rounded-lg"
          />

          <div className="space-y-2">
            <p className="font-semibold flex gap-1 items-center">
              <MapPin size={16} /> Chọn vị trí
            </p>
            <MapPicker onChange={handlePickLocation} />
          </div>

          <textarea
            value={form.street}
            readOnly
            className="w-full border p-3 rounded-lg text-sm"
          />

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              onChange={(e) =>
                setForm({ ...form, is_default: e.target.checked })
              }
            />
            Đặt làm mặc định
          </label>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg"
          >
            Lưu địa chỉ
          </button>
        </div>
      </div>
    </div>
  );
}
