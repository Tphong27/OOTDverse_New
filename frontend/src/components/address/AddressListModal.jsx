// frontend/src/components/address/AddressListModal.jsx
import { useEffect, useState } from "react";
import { X, Plus, Check, Star, Trash2 } from "lucide-react";
import { getMyAddresses, setDefaultAddress, deleteAddress } from "@/services/addressService";
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
    
    const addressList = Array.isArray(res) ? res : (res?.data || []);
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
    
    const address = addresses.find(addr => addr._id === id);
    
    // Prevent deleting default address
    if (address?.is_default) {
      alert("Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước.");
      return;
    }

    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteAddress(id);
      
      // Remove from local state
      setAddresses(prev => prev.filter(addr => addr._id !== id));
      
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
      
      const newAddresses = Array.isArray(res) ? res : (res?.data || []);
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
      <div className="fixed inset-0 bg-black/40 z-[100] flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h2 className="font-bold text-lg">Chọn địa chỉ giao hàng</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {loading && <p className="text-sm">Đang tải...</p>}

            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="border rounded-xl p-3 hover:border-pink-500 transition-colors relative group"
              >
                <div
                  className="cursor-pointer flex-1 pr-12"
                  onClick={() => {
                    console.log("📍 Address selected from list:", addr);
                    onSelect(addr);
                    onClose();
                  }}
                >
                  <p className="font-semibold">
                    {addr.full_name} | {addr.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addr.street}
                    {addr.ward?.name && `, ${addr.ward.name}`}
                    {addr.district?.name && `, ${addr.district.name}`}
                    {addr.province?.name && `, ${addr.province.name}`}
                  </p>

                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs text-pink-600 mt-1">
                      <Star size={12} fill="currentColor" /> Mặc định
                    </span>
                  )}
                </div>

                {/* Action Buttons - Positioned absolutely */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(addr._id, e)}
                    disabled={deletingId === addr._id || addr.is_default}
                    className={`p-2 rounded-lg transition-all ${
                      addr.is_default
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-red-500 hover:bg-red-50 hover:text-red-600"
                    }`}
                    title={addr.is_default ? "Không thể xóa địa chỉ mặc định" : "Xóa địa chỉ"}
                  >
                    {deletingId === addr._id ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>

                  {/* Set Default Button */}
                  {!addr.is_default && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(addr._id);
                      }}
                      className="text-xs text-gray-500 hover:text-pink-600 px-2 py-1 rounded hover:bg-pink-50 transition-colors"
                    >
                      Đặt mặc định
                    </button>
                  )}
                </div>
              </div>
            ))}

            {addresses.length === 0 && !loading && (
              <p className="text-sm text-gray-500 text-center py-8">
                Chưa có địa chỉ nào
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex-shrink-0">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 border rounded-xl py-2 hover:border-pink-500 transition-colors"
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