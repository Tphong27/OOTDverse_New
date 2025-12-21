// frontend/src/components/address/AddressListModal.jsx
import { useEffect, useState } from "react";
import { X, Plus, Check, Star } from "lucide-react";
import {
  getMyAddresses,
  setDefaultAddress,
} from "@/services/addressService";
import CreateAddressModal from "./CreateAddressModal";

export default function AddressListModal({
  isOpen,
  onClose,
  onSelect,
}) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);
    const res = await getMyAddresses();
    setAddresses(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) loadAddresses();
  }, [isOpen]);

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
    loadAddresses();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-bold text-lg">Chọn địa chỉ giao hàng</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {loading && <p className="text-sm">Đang tải...</p>}

            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="border rounded-xl p-3 flex justify-between hover:border-pink-500"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    onSelect(addr);
                    onClose();
                  }}
                >
                  <p className="font-semibold">
                    {addr.full_name} | {addr.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addr.street}
                  </p>

                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs text-pink-600 mt-1">
                      <Star size={12} /> Mặc định
                    </span>
                  )}
                </div>

                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs text-gray-500 hover:text-pink-600"
                  >
                    Đặt mặc định
                  </button>
                )}
              </div>
            ))}

            {addresses.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                Chưa có địa chỉ nào
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 border rounded-xl py-2 hover:border-pink-500"
            >
              <Plus size={16} /> Thêm địa chỉ mới
            </button>
          </div>
        </div>
      </div>

      {/* Create Address */}
      <CreateAddressModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={loadAddresses}
      />
    </>
  );
}
