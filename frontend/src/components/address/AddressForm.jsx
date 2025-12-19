import { useState } from "react";
import MapPicker from "./MapPicker";

export default function AddressForm({ onSubmit }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    location: null,
    place_id: null,
    is_default: true,
  });

  const submit = () => {
    if (!form.location) {
      alert("Vui lòng chọn vị trí trên bản đồ");
      return;
    }

    onSubmit({
      ...form,
      location: form.location,
    });
  };

  return (
    <div className="space-y-3">
      <input
        placeholder="Họ và tên"
        onChange={(e) =>
          setForm({ ...form, full_name: e.target.value })
        }
        className="input"
      />

      <input
        placeholder="Số điện thoại"
        onChange={(e) =>
          setForm({ ...form, phone: e.target.value })
        }
        className="input"
      />

      <MapPicker
        onSelect={(data) => {
          setForm({
            ...form,
            province: data.province,
            district: data.district,
            ward: data.ward,
            street: data.street,
            location: { lat: data.lat, lng: data.lng },
            place_id: data.place_id,
          });
        }}
      />

      <input value={form.street} className="input" readOnly />
      <input value={form.ward} className="input" readOnly />
      <input value={form.district} className="input" readOnly />
      <input value={form.province} className="input" readOnly />

      <label className="flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) =>
            setForm({ ...form, is_default: e.target.checked })
          }
        />
        Đặt làm mặc định
      </label>

      <button
        onClick={submit}
        className="bg-orange-500 text-white py-2 rounded w-full"
      >
        Lưu địa chỉ
      </button>
    </div>
  );
}