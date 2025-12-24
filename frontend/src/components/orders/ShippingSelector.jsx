// frontend/src/components/orders/ShippingSelector.jsx
import { useState, useEffect } from "react";
import { Truck, Clock, MapPin, CheckCircle, Loader } from "lucide-react";
import api from "@/services/api";

export default function ShippingSelector({ 
  listing, 
  buyerAddress, 
  onSelect,
  selectedMethod 
}) {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔄 ShippingSelector useEffect triggered");
    console.log("📦 Listing:", listing);
    console.log("📍 Address:", buyerAddress);
    
    if (listing && buyerAddress) {
      fetchShippingOptions();
    } else {
      console.warn("⚠️ Missing listing or address");
    }
  }, [listing, buyerAddress]);

  const fetchShippingOptions = async () => {
    console.log("🚚 === FETCH SHIPPING OPTIONS START ===");
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        listing_id: listing._id,
        address_id: buyerAddress._id,
      };

      console.log("📤 About to call API with:", requestData);
      console.log("📤 Using api from:", typeof api);
      console.log("📤 api.defaults.baseURL:", api.defaults.baseURL);

      const response = await api.post(
        "/api/marketplace/shipping/calculate",
        requestData
      );

      console.log("✅ Response received:", response);

      if (response.success && response.data) {
        console.log("✅ Setting shipping options:", response.data);
        setShippingOptions(response.data);
        
        // Auto-select first option if none selected
        if (!selectedMethod && response.data.length > 0) {
          console.log("✅ Auto-selecting first option:", response.data[0]);
          onSelect(response.data[0]);
        }
      } else {
        throw new Error(response.error || "Không thể tải phương thức vận chuyển");
      }
    } catch (err) {
      console.error("❌ === FETCH SHIPPING OPTIONS ERROR ===");
      console.error("❌ Error:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error data:", err.data);
      setError(err.message || err.error || "Không thể tải phương thức vận chuyển");
    } finally {
      setLoading(false);
      console.log("🏁 === FETCH SHIPPING OPTIONS END ===");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getMethodIcon = (type) => {
    if (type === "meetup") return "🤝";
    if (type === "self") return "🚗";
    return "📦";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader className="animate-spin" size={20} />
          <span>Đang tính phí vận chuyển...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 text-sm font-medium mb-2">Lỗi vận chuyển</p>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchShippingOptions}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (shippingOptions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800 text-sm">
          Người bán không hỗ trợ giao hàng đến địa chỉ này
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Truck size={20} />
        Chọn phương thức vận chuyển
      </h3>

      <div className="grid gap-3">
        {shippingOptions.map((option) => {
          const isSelected = selectedMethod?.id === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                console.log("🎯 Option selected:", option);
                onSelect(option);
              }}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200 hover:border-pink-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getMethodIcon(option.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {option.name}
                      </p>
                      
                      {option.eta && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Clock size={14} />
                          {option.eta.min_days === option.eta.max_days
                            ? `${option.eta.min_days} ngày`
                            : `${option.eta.min_days}-${option.eta.max_days} ngày`}
                        </p>
                      )}

                      {option.note && (
                        <p className="text-xs text-gray-500 mt-1">
                          {option.note}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-pink-600">
                        {option.fee === 0 ? "Miễn phí" : formatPrice(option.fee)}
                      </p>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="text-pink-500" size={24} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {listing.shipping_config?.shipping_note && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              {listing.shipping_config.shipping_note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}