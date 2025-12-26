// frontend/src/components/orders/MeetUpManager.jsx
import { useState } from "react";
import { 
  MapPin, Calendar, Clock, MessageCircle, CheckCircle, 
  XCircle, AlertCircle, Navigation 
} from "lucide-react";

export default function MeetUpManager({ order, role, onUpdate }) {
  const [showCounterProposal, setShowCounterProposal] = useState(false);
  const [counterProposal, setCounterProposal] = useState({
    location_name: "",
    address: "",
    proposed_time: "",
    note: "",
  });

  const meetup = order.meetup_info;
  const isBuyer = role === "buyer";
  const isSeller = role === "seller";

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAccept = async () => {
    // Call API to accept meet up proposal
    try {
      // await acceptMeetUpProposal(order._id);
      if (onUpdate) onUpdate({ action: "accept_meetup" });
    } catch (error) {
      console.error("Error accepting proposal:", error);
    }
  };

  const handleCounterPropose = async () => {
    // Call API to send counter proposal
    try {
      // await counterProposeMeetUp(order._id, counterProposal);
      if (onUpdate) onUpdate({ action: "counter_propose", data: counterProposal });
      setShowCounterProposal(false);
    } catch (error) {
      console.error("Error sending counter proposal:", error);
    }
  };

  const handleConfirmMet = async () => {
    // Call API to confirm met
    try {
      // await confirmMeetUp(order._id, role);
      if (onUpdate) onUpdate({ action: "confirm_met", role });
    } catch (error) {
      console.error("Error confirming met:", error);
    }
  };

  if (!meetup) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">🤝</span>
        Thông tin gặp mặt
      </h3>

      {/* Status */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          meetup.status === "confirmed" ? "bg-green-100 text-green-800" :
          meetup.status === "pending" ? "bg-yellow-100 text-yellow-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {meetup.status === "pending" && "Chờ xác nhận"}
          {meetup.status === "proposed" && "Đã đề xuất"}
          {meetup.status === "confirmed" && "Đã xác nhận"}
          {meetup.status === "completed" && "Đã gặp mặt"}
        </span>
      </div>

      {/* Buyer's Proposal */}
      {meetup.buyer_proposal && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-purple-800 uppercase mb-3">
            📍 Đề xuất từ người mua
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {meetup.buyer_proposal.location_name}
                </p>
                {meetup.buyer_proposal.address && (
                  <p className="text-gray-600 text-xs">
                    {meetup.buyer_proposal.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-purple-600" />
              <p className="text-gray-900">
                {formatDateTime(meetup.buyer_proposal.proposed_time)}
              </p>
            </div>
            {meetup.buyer_proposal.note && (
              <div className="flex items-start gap-2">
                <MessageCircle size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 italic">"{meetup.buyer_proposal.note}"</p>
              </div>
            )}
          </div>

          {/* Seller Actions */}
          {isSeller && meetup.status === "pending" && !meetup.seller_response && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Đồng ý
              </button>
              <button
                onClick={() => setShowCounterProposal(true)}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Đề xuất khác
              </button>
            </div>
          )}
        </div>
      )}

      {/* Seller's Counter Proposal */}
      {meetup.seller_response?.counter_proposal && (
        <div className="bg-white rounded-lg p-4 mb-4 border-2 border-yellow-200">
          <p className="text-xs font-semibold text-yellow-800 uppercase mb-3">
            💬 Đề xuất từ người bán
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {meetup.seller_response.counter_proposal.location_name}
                </p>
                {meetup.seller_response.counter_proposal.address && (
                  <p className="text-gray-600 text-xs">
                    {meetup.seller_response.counter_proposal.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-yellow-600" />
              <p className="text-gray-900">
                {formatDateTime(meetup.seller_response.counter_proposal.proposed_time)}
              </p>
            </div>
            {meetup.seller_response.counter_proposal.note && (
              <div className="flex items-start gap-2">
                <MessageCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 italic">
                  "{meetup.seller_response.counter_proposal.note}"
                </p>
              </div>
            )}
          </div>

          {/* Buyer Actions for Counter Proposal */}
          {isBuyer && meetup.status === "proposed" && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
              >
                Đồng ý
              </button>
              <button
                onClick={() => setShowCounterProposal(true)}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
              >
                Đề xuất lại
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmed Location */}
      {meetup.confirmed_location && (
        <div className="bg-green-50 rounded-lg p-4 mb-4 border-2 border-green-300">
          <p className="text-xs font-semibold text-green-800 uppercase mb-3 flex items-center gap-2">
            <CheckCircle size={16} />
            Đã xác nhận
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {meetup.confirmed_location.location_name}
                </p>
                {meetup.confirmed_location.address && (
                  <p className="text-gray-600 text-xs">
                    {meetup.confirmed_location.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-green-600" />
              <p className="text-gray-900 font-semibold">
                {formatDateTime(meetup.confirmed_location.meeting_time)}
              </p>
            </div>
          </div>

          {/* Confirm Met Button */}
          {meetup.status === "confirmed" && !meetup.met_confirmation?.[`${role}_confirmed`] && (
            <button
              onClick={handleConfirmMet}
              className="mt-4 w-full py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              Xác nhận đã gặp mặt
            </button>
          )}

          {/* Met Confirmation Status */}
          {meetup.met_confirmation && (
            <div className="mt-4 pt-4 border-t border-green-300 space-y-2">
              <p className="text-xs font-semibold text-green-800 uppercase">
                Xác nhận gặp mặt:
              </p>
              <div className="flex items-center gap-2 text-sm">
                {meetup.met_confirmation.buyer_confirmed ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-gray-400" />
                )}
                <span className={meetup.met_confirmation.buyer_confirmed ? "text-green-700 font-medium" : "text-gray-600"}>
                  Người mua đã xác nhận
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {meetup.met_confirmation.seller_confirmed ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-gray-400" />
                )}
                <span className={meetup.met_confirmation.seller_confirmed ? "text-green-700 font-medium" : "text-gray-600"}>
                  Người bán đã xác nhận
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Counter Proposal Form */}
      {showCounterProposal && (
        <div className="bg-white rounded-lg p-4 border-2 border-yellow-300">
          <h4 className="font-semibold mb-3">Đề xuất địa điểm/thời gian khác</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tên địa điểm"
              value={counterProposal.location_name}
              onChange={(e) =>
                setCounterProposal({ ...counterProposal, location_name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="text"
              placeholder="Địa chỉ"
              value={counterProposal.address}
              onChange={(e) =>
                setCounterProposal({ ...counterProposal, address: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="datetime-local"
              value={counterProposal.proposed_time}
              onChange={(e) =>
                setCounterProposal({ ...counterProposal, proposed_time: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
            />
            <textarea
              placeholder="Ghi chú"
              value={counterProposal.note}
              onChange={(e) =>
                setCounterProposal({ ...counterProposal, note: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCounterPropose}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
              >
                Gửi đề xuất
              </button>
              <button
                onClick={() => setShowCounterProposal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}