// components/checkout/CheckoutAddressSection.jsx
import { useEffect, useState } from "react";
import AddressListModal from "../address/AddressListModal";

export default function CheckoutAddressSection() {
  const [address, setAddress] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchDefault();
  }, []);

  const fetchDefault = async () => {
    const res = await fetch("/api/addresses/default", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setAddress(data);
  };

  return (
    <div className="bg-white rounded-xl p-4 border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Địa chỉ nhận hàng</h3>
        <button
          className="text-blue-600 text-sm"
          onClick={() => setOpen(true)}
        >
          Thay đổi
        </button>
      </div>

      {address ? (
        <div>
          <p className="font-medium">
            {address.full_name} | {address.phone}
          </p>
          <p className="text-sm text-gray-600">
            {address.street}, {address.ward}, {address.district}, {address.province}
          </p>
        </div>
      ) : (
        <p className="text-sm text-red-500">
          Vui lòng thêm địa chỉ nhận hàng
        </p>
      )}

      <AddressListModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(addr) => {
          setAddress(addr);
          setOpen(false);
        }}
      />
    </div>
  );
}