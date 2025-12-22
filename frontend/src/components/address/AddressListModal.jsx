// frontend/src/components/address/AddressListModal.jsx
import { useEffect, useState } from "react";
import { X, Plus, Check, Star } from "lucide-react";
import { getMyAddresses, setDefaultAddress } from "@/services/addressService";
import CreateAddressModal from "./CreateAddressModal";

export default function AddressListModal({ isOpen, onClose, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);
    const res = await getMyAddresses();
    console.log("📦 getMyAddresses response:", res);
    
    // ✅ Handle different response formats
    const addressList = Array.isArray(res) ? res : (res?.data || []);
    console.log("📋 Parsed addresses:", addressList);
    
    setAddresses(addressList);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) loadAddresses();
  }, [isOpen]);

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
    loadAddresses();
  };

  // ✅ Handle address created - reload and auto-select new address
  const handleAddressCreated = async () => {
    console.log("🆕 Address created, reloading list...");
    
    try {
      // Reload addresses
      const res = await getMyAddresses();
      console.log("📦 Reload response:", res);
      
      // ✅ Handle different response formats
      const newAddresses = Array.isArray(res) ? res : (res?.data || []);
      console.log("📋 Total addresses after reload:", newAddresses.length);
      console.log("📋 Addresses array:", newAddresses);
      
      if (newAddresses.length > 0) {
        // Get the most recently created address (last one)
        const newestAddress = newAddresses[newAddresses.length - 1];
        console.log("✅ Auto-selecting newest address:", newestAddress);
        
        // Update local state
        setAddresses(newAddresses);
        
        // Auto-select the newest address
        onSelect(newestAddress);
        
        // Close modals
        setShowCreate(false);
        onClose();
        
        console.log("✅ Selection complete, modals closed");
      } else {
        console.warn("⚠️ No addresses found after reload");
        console.warn("⚠️ Raw response:", res);
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
                className="border rounded-xl p-3 flex justify-between hover:border-pink-500 transition-colors"
              >
                <div
                  className="cursor-pointer flex-1"
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

                {!addr.is_default && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(addr._id);
                    }}
                    className="text-xs text-gray-500 hover:text-pink-600 ml-2"
                  >
                    Đặt mặc định
                  </button>
                )}
              </div>
            ))}

            {addresses.length === 0 && !loading && (
              <p className="text-sm text-gray-500 text-center">
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