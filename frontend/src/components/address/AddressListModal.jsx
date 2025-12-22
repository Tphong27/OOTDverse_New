// frontend/src/components/address/AddressListModal.jsx
import { useEffect, useState } from "react";
import { X, Plus, Check, Star, Trash2 } from "lucide-react";
import {
  getMyAddresses,
  setDefaultAddress,
  deleteAddress,
} from "@/services/addressService";
import CreateAddressModal from "./CreateAddressModal";

export default function AddressListModal({ isOpen, onClose, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadAddresses = async () => {
    setLoading(true);
    const res = await getMyAddresses();
    console.log("📦 getMyAddresses response:", res);

    const addressList = Array.isArray(res) ? res : res?.data || [];
    console.log("📋 Parsed addresses:", addressList);

    setAddresses(addressList);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) loadAddresses();
  }, [isOpen]);

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      loadAddresses();
    } catch (error) {
      console.error("Error setting default address:", error);
      alert("Không thể đặt địa chỉ mặc định");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent triggering onSelect

    const address = addresses.find((addr) => addr._id === id);

    // Prevent deleting default address
    if (address?.is_default) {
      alert(
        "Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước."
      );
      return;
    }

    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteAddress(id);

      // Remove from local state
      setAddresses((prev) => prev.filter((addr) => addr._id !== id));

      console.log("✅ Address deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting address:", error);
      alert("Không thể xóa địa chỉ: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddressCreated = async () => {
    console.log("🆕 Address created, reloading list...");

    try {
      const res = await getMyAddresses();
      console.log("📦 Reload response:", res);

      const newAddresses = Array.isArray(res) ? res : res?.data || [];
      console.log("📋 Total addresses after reload:", newAddresses.length);

      if (newAddresses.length > 0) {
        const newestAddress = newAddresses[newAddresses.length - 1];
        console.log("✅ Auto-selecting newest address:", newestAddress);

        setAddresses(newAddresses);
        onSelect(newestAddress);
        setShowCreate(false);
        onClose();

        console.log("✅ Selection complete, modals closed");
      } else {
        console.warn("⚠️ No addresses found after reload");
      }
    } catch (error) {
      console.error("❌ Error in handleAddressCreated:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Address List Modal - z-[100] */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h2 className="font-semibold text-lg">📍 Chọn địa chỉ giao hàng</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
            {loading && (
              <p className="text-sm text-gray-500 text-center">
                Đang tải địa chỉ...
              </p>
            )}

            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="group relative border rounded-2xl p-4 hover:border-pink-500 hover:shadow-md transition-all bg-white"
              >
                {/* Clickable content */}
                <div
                  className="cursor-pointer pr-16"
                  onClick={() => {
                    console.log("📍 Address selected from list:", addr);
                    onSelect(addr);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">
                      {addr.full_name}
                      <span className="text-gray-400 mx-1">•</span>
                      {addr.phone}
                    </p>

                    {addr.is_default && (
                      <span className="flex items-center gap-1 text-xs text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                        <Star size={12} fill="currentColor" /> Mặc định
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {addr.street}
                    {addr.ward?.name && `, ${addr.ward.name}`}
                    {addr.district?.name && `, ${addr.district.name}`}
                    {addr.province?.name && `, ${addr.province.name}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(addr._id, e)}
                    disabled={deletingId === addr._id || addr.is_default}
                    className={`p-2 rounded-full transition ${
                      addr.is_default
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    }`}
                    title={
                      addr.is_default
                        ? "Không thể xóa địa chỉ mặc định"
                        : "Xóa địa chỉ"
                    }
                  >
                    {deletingId === addr._id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>

                  {/* Set default */}
                  {!addr.is_default && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(addr._id);
                      }}
                      className="text-xs text-gray-500 hover:text-pink-600 hover:underline"
                    >
                      Đặt mặc định
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!loading && addresses.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-10">
                Chưa có địa chỉ nào
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-gray-600 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50 transition"
            >
              <Plus size={16} /> Thêm địa chỉ mới
            </button>
          </div>
        </div>
      </div>

      {/* Create Address Modal - z-[110] - Higher than Address List */}
      {showCreate && (
        <CreateAddressModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={handleAddressCreated}
        />
      )}
    </>
  );
}
