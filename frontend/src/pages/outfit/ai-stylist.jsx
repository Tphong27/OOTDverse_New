import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useSettings } from "@/context/SettingContext";
import { aiSuggest, createOutfit } from "@/services/outfitService";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Shirt,
  Cloud,
  Star,
  User,
  ArrowRight,
  Zap,
  Layout,
  Image as ImageIcon,
  Edit,
  MessageSquare,
} from "lucide-react";
import NextImage from "next/image";

export default function AIStylistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSettings();

  // ===== STATE =====
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]); // Track which ones are saved
  const [activeViews, setActiveViews] = useState({}); // { [idx]: 'moodboard' | 'lookbook' }
  const [retryCountdown, setRetryCountdown] = useState(0); // Countdown for rate limit

  const [formData, setFormData] = useState({
    style: "",
    occasion: "",
    weather: "Mát mẻ",
    skinTone: "Tự nhiên",
    customContext: "", // Optional: Mô tả bổ sung cho AI
  });

  // ===== OPTIONS =====
  const styles = settings.filter((s) => s.type === "style" && s.status === "Active");
  const occasions = settings.filter((s) => s.type === "occasion" && s.status === "Active");
  const weathers = [
    "Nắng nóng",
    "Mát mẻ",
    "Lạnh",
    "Mưa",
    "Gió mạnh",
    "Tuyết",
  ];
  const skinTones = [
    "Trắng sáng",
    "Trung bình",
    "Ngăm đen",
    "Tự nhiên",
  ];

  // ===== HANDLERS =====
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // Countdown effect for rate limit
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryCountdown]);

  const handleSubmit = async () => {
    if (retryCountdown > 0) return; // Prevent submit while countdown active
    
    setLoading(true);
    setError(null);
    try {
      const result = await aiSuggest({
        userId: user._id,
        style: formData.style,
        occasion: formData.occasion,
        weather: formData.weather,
        skin_tone: formData.skinTone,
        custom_context: formData.customContext,
      });

      if (result.success) {
        setSuggestions(result.suggestions);
        setStep(3);
      } else {
        // Check if rate limited
        if (result.retry_after) {
          setRetryCountdown(result.retry_after);
          setError(`Hệ thống AI đang bận. Vui lòng thử lại sau ${result.retry_after} giây.`);
        } else {
          setError(result.error || "Không thể lấy gợi ý từ AI");
        }
      }
    } catch (err) {
      console.error("AI Stylist Error:", err);
      // Check if error response has retry_after
      if (err.response?.data?.retry_after) {
        const retryAfter = err.response.data.retry_after;
        setRetryCountdown(retryAfter);
        setError(`Hệ thống AI đang bận. Vui lòng thử lại sau ${retryAfter} giây.`);
      } else {
        setError(err.response?.data?.error || err.message || "Đã có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async (suggestion, index) => {
    try {
      // Tìm style_id, occasion_id... từ name (giả định matching hoặc lấy từ context)
      // Để đơn giản, ta sẽ tạo outfit với các thông tin gợi ý
      const outfitData = {
        user_id: user._id,
        outfit_name: suggestion.outfit_name,
        description: suggestion.description,
        notes: suggestion.rationale,
        ai_suggested: true,
        is_public: false,
        items: suggestion.items.map((item, idx) => ({
          item_id: item._id,
          display_order: idx,
        })),
        // Có thể map style/occasion nếu tìm thấy ID tương ứng
        style_id: styles.find(s => s.name === formData.style)?._id,
        occasion_id: occasions.find(o => o.name === formData.occasion)?._id,
      };

      const result = await createOutfit(outfitData);
      if (result.success) {
        setSavedOutfits((prev) => [...prev, index]);
        // Thông báo thành công (có thể dùng toast)
      }
    } catch (err) {
      alert("Lỗi khi lưu outfit: " + err.message);
    }
  };

  // Handler để chỉnh sửa outfit trước khi lưu
  const handleEditOutfit = (suggestion) => {
    // Lưu data vào localStorage để form.jsx đọc
    const editData = {
      outfit_name: suggestion.outfit_name,
      description: suggestion.description,
      notes: suggestion.rationale,
      items: suggestion.items.map((item, idx) => ({
        item_id: item._id,
        display_order: idx,
      })),
      style_id: styles.find(s => s.name === formData.style)?._id,
      occasion_id: occasions.find(o => o.name === formData.occasion)?._id,
      ai_suggested: true,
    };
    localStorage.setItem('aiStylistEditData', JSON.stringify(editData));
    router.push('/outfit/form?from=ai-stylist');
  };

  // ===== RENDER HELPERS =====
  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn đang hướng đến phong cách nào?</h2>
        <p className="text-gray-500">Chọn phong cách và dịp bạn sẽ tham gia nhé.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Phong cách
          </label>
          <div className="grid grid-cols-2 gap-3">
            {styles.map((s) => (
              <button
                key={s._id}
                onClick={() => setFormData({ ...formData, style: s.name })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.style === s.name
                    ? "border-purple-600 bg-purple-50 ring-2 ring-purple-100"
                    : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-bold text-gray-900">{s.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Star className="w-4 h-4 text-pink-600" />
            Dịp mặc
          </label>
          <div className="grid grid-cols-2 gap-3">
            {occasions.map((o) => (
              <button
                key={o._id}
                onClick={() => setFormData({ ...formData, occasion: o.name })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.occasion === o.name
                    ? "border-pink-600 bg-pink-50 ring-2 ring-pink-100"
                    : "border-gray-100 hover:border-pink-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-bold text-gray-900">{o.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!formData.style || !formData.occasion}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Tiếp theo
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thêm một chút chi tiết...</h2>
        <p className="text-gray-500">Thông tin này giúp AI gợi ý chính xác hơn cho bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            Thời tiết hôm nay
          </label>
          <select
            value={formData.weather}
            onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
            className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
          >
            {weathers.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-600" />
            Tông da của bạn
          </label>
          <select
            value={formData.skinTone}
            onChange={(e) => setFormData({ ...formData, skinTone: e.target.value })}
            className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium"
          >
            {skinTones.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Optional Context Input */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-green-600" />
          Mô tả thêm <span className="text-gray-400 font-normal">(không bắt buộc)</span>
        </label>
        <textarea
          value={formData.customContext}
          onChange={(e) => setFormData({ ...formData, customContext: e.target.value })}
          placeholder="Ví dụ: Dạo phố ngày mưa, Gặp gỡ đối tác kinh doanh, Picnic cuối tuần với bạn bè..."
          rows={2}
          className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all font-medium text-sm placeholder:text-gray-400 resize-none"
        />
        <p className="text-xs text-gray-400">
          💡 Mô tả chi tiết giúp AI hiểu rõ hơn hoàn cảnh của bạn
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Quay lại
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || retryCountdown > 0}
          className={`px-10 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 group ${
            retryCountdown > 0
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-xl"
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : retryCountdown > 0 ? (
            <>
              <AlertCircle className="w-5 h-5" />
              Thử lại sau {retryCountdown}s
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 group-hover:fill-current" />
              Bắt đầu phối đồ AI
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 mb-4">
             <Sparkles className="w-5 h-5 fill-purple-600" />
             <span className="text-sm font-bold uppercase tracking-widest">Kết quả từ AI Stylist</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Gợi ý dành riêng cho bạn</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Dưới đây là 3 gợi ý tốt nhất từ tủ đồ của bạn cho dịp {formData.occasion}.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-100/50 hover:shadow-2xl transition-all duration-300 group">
            
            {/* View Toggle Tabs */}
            <div className="flex bg-gray-100 p-1 m-4 mb-0 rounded-xl">
                <button 
                    onClick={() => setActiveViews(prev => ({...prev, [idx]: 'moodboard'}))}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${(!activeViews[idx] || activeViews[idx] === 'moodboard') ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Layout className="w-3.5 h-3.5" />
                    Moodboard
                </button>
                <button 
                    disabled={!suggestion.lookbook_url}
                    onClick={() => setActiveViews(prev => ({...prev, [idx]: 'lookbook'}))}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeViews[idx] === 'lookbook' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'} ${!suggestion.lookbook_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <ImageIcon className="w-3.5 h-3.5" />
                    AI Lookbook
                </button>
            </div>

            {/* Visual Preview Area */}
            <div className="p-4 bg-gray-50 flex-1 min-h-[420px] relative group">
                {(!activeViews[idx] || activeViews[idx] === 'moodboard') ? (
                  // MOODBOARD VIEW
                  suggestion.visual_preview ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-xl shadow-inner overflow-hidden animate-in fade-in zoom-in duration-300">
                       <img 
                          src={suggestion.visual_preview} 
                          alt="Outfit Moodboard"
                          className="max-w-full max-h-full object-contain p-2"
                       />
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">AI Moodboard</span>
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 h-full">
                        {suggestion.items.map((item, i) => (
                            <div key={item._id} className={`relative rounded-xl overflow-hidden shadow-sm ${
                                suggestion.items.length === 2 ? 'h-[350px]' : 
                                suggestion.items.length === 3 && i === 0 ? 'col-span-2 h-[200px]' : 'h-[150px]'
                            }`}>
                                <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                  )
                ) : (
                  // LOOKBOOK VIEW
                  <div className="relative w-full h-full rounded-xl shadow-inner overflow-hidden bg-white animate-in fade-in zoom-in duration-300">
                    <img 
                        src={suggestion.lookbook_url} 
                        alt="AI Lookbook"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-[10px] text-white/80 font-medium italic">Ảnh minh họa bởi AI duy nhất cho bạn</p>
                    </div>
                  </div>
                )}
                
                {/* Item Thumbnails overlay when using Moodboard */}
                {(!activeViews[idx] || activeViews[idx] === 'moodboard') && suggestion.visual_preview && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-white/60 backdrop-blur-lg rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                    {suggestion.items.map((item) => (
                      <div key={item._id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm hover:scale-110 transition-transform cursor-help">
                        <img src={item.image_url} className="w-full h-full object-cover" title={item.item_name} />
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">{suggestion.outfit_name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 italic">"{suggestion.description}"</p>
              
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                 <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">Tại sao nên mặc:</p>
                 <p className="text-xs text-purple-700 leading-relaxed">{suggestion.rationale}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Edit Button */}
                <button 
                  onClick={() => handleEditOutfit(suggestion)}
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>

                {/* Save Button */}
                <button 
                  onClick={() => handleSaveOutfit(suggestion, idx)}
                  disabled={savedOutfits.includes(idx)}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    savedOutfits.includes(idx)
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:-translate-y-1"
                  }`}
                >
                  {savedOutfits.includes(idx) ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã lưu
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={() => {
            setStep(1);
            setSuggestions([]);
            setSavedOutfits([]);
          }}
          className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Thử phối lại
        </button>
      </div>
    </div>
  );

  return (
    <LayoutUser>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Progress Bar */}
        <div className="mb-12 relative">
          <div className="flex justify-between items-center max-w-sm mx-auto">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
              step >= 1 ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-gray-200 text-gray-500"
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 transition-all duration-500 ${step >= 2 ? "bg-purple-600" : "bg-gray-200"}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
              step >= 2 ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-gray-200 text-gray-500"
            }`}>
              <Shirt className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 transition-all duration-500 ${step >= 3 ? "bg-purple-600" : "bg-gray-200"}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
              step >= 3 ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-gray-200 text-gray-500"
            }`}>
              <Star className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-25" />
                <div className="relative bg-white rounded-full shadow-xl p-6 border-4 border-purple-600">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI đang phân tích tủ đồ của bạn...</h3>
            <p className="text-gray-500">Chúng tôi đang tìm những món đồ hợp với bạn nhất.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-8 max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderResults()}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(20px); }
          to { transform: translateY(0); }
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(20px); }
          to { transform: translateX(0); }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom;
        }
        .slide-in-from-right-4 {
          animation-name: slide-in-from-right;
        }
      `}</style>
    </LayoutUser>
  );
}
