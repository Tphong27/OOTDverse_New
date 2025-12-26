// frontend/src/components/orders/MeetUpSelector.jsx
import { useState, useEffect } from "react";
import { MapPin, Calendar, Clock, MessageCircle, AlertCircle, CheckCircle } from "lucide-react";

export default function MeetUpSelector({ sellerInfo, buyerAddress, onSelect, selectedData }) {
  const [meetUpData, setMeetUpData] = useState({
    location_type: "buyer_address", // "buyer_address" | "custom"
    location_name: "",
    address: "",
    coordinates: {
      lat: buyerAddress.location?.coordinates?.[1] || 0,
      lng: buyerAddress.location?.coordinates?.[0] || 0,
    },
    proposed_date: "",
    proposed_time: "",
    note: "",
  });

  // Format buyer's address
  const formatBuyerAddress = () => {
    if (!buyerAddress) return "";
    const parts = [
      buyerAddress.street,
      buyerAddress.ward?.name || buyerAddress.ward,
      buyerAddress.district?.name || buyerAddress.district,
      buyerAddress.province?.name || buyerAddress.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Initialize with buyer's address
  useEffect(() => {
    const initial = {
      location_type: "buyer_address",
      location_name: "Địa chỉ của tôi",
      address: formatBuyerAddress(),
      coordinates: {
        lat: buyerAddress.location?.coordinates?.[1] || 0,
        lng: buyerAddress.location?.coordinates?.[0] || 0,
      },
      proposed_date: "",
      proposed_time: "",
      note: "",
    };
    setMeetUpData(initial);
    onSelect(initial);
  }, []);

  // Get min date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Handle location type selection
  const handleLocationTypeSelect = (type) => {
    let updated = { ...meetUpData, location_type: type };

    if (type === "buyer_address") {
      updated = {
        ...updated,
        location_name: "Địa chỉ của tôi",
        address: formatBuyerAddress(),
        coordinates: {
          lat: buyerAddress.location?.coordinates?.[1] || 0,
          lng: buyerAddress.location?.coordinates?.[0] || 0,
        },
      };
    } else {
      updated = {
        ...updated,
        location_name: "",
        address: "",
      };
    }

    setMeetUpData(updated);
    onSelect(updated);
  };

  const handleDateChange = (date) => {
    const updated = {
      ...meetUpData,
      proposed_date: date,
    };
    setMeetUpData(updated);
    onSelect(updated);
  };

  const handleTimeChange = (time) => {
    const updated = {
      ...meetUpData,
      proposed_time: time,
    };
    setMeetUpData(updated);
    onSelect(updated);
  };

  const handleNoteChange = (e) => {
    const updated = {
      ...meetUpData,
      note: e.target.value,
    };
    setMeetUpData(updated);
    onSelect(updated);
  };

  const handleCustomLocationChange = (field, value) => {
    const updated = {
      ...meetUpData,
      [field]: value,
    };
    setMeetUpData(updated);
    onSelect(updated);
  };

  // Combine date and time for display
  const getProposedDateTime = () => {
    if (!meetUpData.proposed_date || !meetUpData.proposed_time) return null;
    return new Date(`${meetUpData.proposed_date}T${meetUpData.proposed_time}`);
  };

  const proposedDateTime = getProposedDateTime();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-2xl">🤝</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Gặp mặt trực tiếp</h3>
          <p className="text-sm text-gray-600">
            Chọn địa điểm và thời gian để gặp người bán
          </p>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-white rounded-lg p-3 mb-4 flex items-center gap-3">
        <img
          src={sellerInfo.seller_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerInfo.seller_name)}`}
          alt={sellerInfo.seller_name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-gray-900">{sellerInfo.seller_name}</p>
          <p className="text-xs text-gray-600">Người bán</p>
        </div>
      </div>

      {/* Location Selection */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin size={16} />
          Địa điểm gặp mặt
        </label>

        {/* Option 1: Use buyer's address */}
        <button
          type="button"
          onClick={() => handleLocationTypeSelect("buyer_address")}
          className={`w-full text-left p-4 rounded-lg border-2 transition-all mb-3 ${
            meetUpData.location_type === "buyer_address"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-300 bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 mb-1">
                📍 Địa chỉ của tôi
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {formatBuyerAddress()}
              </p>
              <p className="text-xs text-purple-600 mt-2">
                ✅ Khuyến nghị: Gặp mặt tại địa chỉ bạn đã chọn
              </p>
            </div>
          </div>
        </button>

        {/* Option 2: Custom location */}
        <button
          type="button"
          onClick={() => handleLocationTypeSelect("custom")}
          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
            meetUpData.location_type === "custom"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-300 bg-white"
          }`}
        >
          <p className="text-sm font-medium text-gray-900">
            ✏️ Địa điểm khác (tùy chỉnh)
          </p>
        </button>

        {/* Custom location inputs */}
        {meetUpData.location_type === "custom" && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Tên địa điểm (vd: Vincom, Starbucks, Công viên...)"
              value={meetUpData.location_name}
              onChange={(e) => handleCustomLocationChange("location_name", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Địa chỉ cụ thể"
              value={meetUpData.address}
              onChange={(e) => handleCustomLocationChange("address", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Date & Time Selection */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar size={16} />
          Thời gian gặp mặt
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Date Picker */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ngày</label>
            <input
              type="date"
              value={meetUpData.proposed_date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Giờ</label>
            <input
              type="time"
              value={meetUpData.proposed_time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick time suggestions */}
        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-2">Gợi ý giờ:</p>
          <div className="flex flex-wrap gap-2">
            {["09:00", "10:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeChange(time)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  meetUpData.proposed_time === time
                    ? "bg-purple-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-purple-500"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <MessageCircle size={16} />
          Ghi chú cho người bán (tùy chọn)
        </label>
        <textarea
          value={meetUpData.note}
          onChange={handleNoteChange}
          rows={3}
          placeholder="Ví dụ: Tôi sẽ mặc áo đỏ, đợi ở cổng chính, gọi điện khi đến..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Validation Alert */}
      {(!meetUpData.location_name || !meetUpData.proposed_date || !meetUpData.proposed_time) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Vui lòng chọn đầy đủ địa điểm, ngày và giờ để tiếp tục
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {meetUpData.location_name && proposedDateTime && (
        <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
          <p className="text-xs font-semibold text-purple-800 uppercase mb-3 flex items-center gap-1">
            <CheckCircle size={14} />
            Thông tin gặp mặt (đề xuất)
          </p>
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">{meetUpData.location_name}</p>
                {meetUpData.address && (
                  <p className="text-gray-600 text-sm mt-1">{meetUpData.address}</p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-2">
              <Clock size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  {proposedDateTime.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Lúc {proposedDateTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Note */}
            {meetUpData.note && (
              <div className="flex items-start gap-2">
                <MessageCircle size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm italic">"{meetUpData.note}"</p>
              </div>
            )}
          </div>

          {/* Info banner */}
          <div className="mt-4 pt-3 border-t border-purple-200">
            <p className="text-xs text-purple-700 flex items-start gap-2">
              <span>ℹ️</span>
              <span>
                Người bán sẽ nhận được đề xuất này và có thể <strong>xác nhận</strong> hoặc <strong>đề xuất thời gian/địa điểm khác</strong>. 
                Bạn sẽ nhận thông báo khi có phản hồi.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}