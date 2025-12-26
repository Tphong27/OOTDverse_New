import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useSettings } from "@/context/SettingContext";
import { aiSuggest, createOutfit, getWeather } from "@/services/outfitService";
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
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  Clock,
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
  const [hoveredItem, setHoveredItem] = useState(null); // { sugIdx, itemIdx }
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [weatherData, setWeatherData] = useState(null); // Full weather info
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const handleFetchWeather = async (isAuto = false) => {
    if (!isAuto) setFetchingWeather(true);
    
    const fetchAndUpdate = async (params) => {
      try {
        const res = await getWeather(params);
        if (res.success && res.mappedWeather) {
          setFormData(prev => ({ ...prev, weather: res.mappedWeather }));
          setWeatherData(res);
          setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchAndUpdate({ lat: position.coords.latitude, lon: position.coords.longitude });
          if (!isAuto) setFetchingWeather(false);
        },
        async () => {
          await fetchAndUpdate({ city: "Ho Chi Minh" });
          if (!isAuto) setFetchingWeather(false);
        }
      );
    } else {
      await fetchAndUpdate({ city: "Ho Chi Minh" });
      if (!isAuto) setFetchingWeather(false);
    }
  };

  // Auto-refresh weather every 5 minutes if dashboard is active
  useEffect(() => {
    let interval;
    if (weatherData) {
      interval = setInterval(() => {
        handleFetchWeather(true);
      }, 5 * 60 * 1000); // 5 minutes
    }
    return () => clearInterval(interval);
  }, [weatherData]);

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
          <div className="flex gap-2">
            <select
              value={formData.weather}
              onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
              className="flex-1 p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
            >
              {weathers.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <button
              onClick={handleFetchWeather}
              disabled={fetchingWeather}
              className="px-4 rounded-xl border-2 border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center disabled:opacity-50 group/weather"
              title="Lấy thời tiết hiện tại từ OpenWeather"
            >
              {fetchingWeather ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 group-hover/weather:scale-110 transition-transform" />
              )}
            </button>
          </div>

          {/* Detailed Weather Dashboard */}
          {weatherData && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-100/50 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <MapPin className="w-4 h-4" />
                  <span className="font-bold text-sm">{weatherData.city}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-blue-100 shadow-sm">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Cập nhật: {lastUpdated}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-orange-500">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Nhiệt độ</p>
                    <p className="text-lg font-bold text-gray-800">{weatherData.temp}°C</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-500">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Trạng thái</p>
                    <p className="text-sm font-bold text-gray-800 capitalize leading-tight">
                      {weatherData.condition}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-cyan-500">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Độ ẩm</p>
                    <p className="text-sm font-bold text-gray-800">{weatherData.raw?.main?.humidity}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-teal-500">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Tốc độ gió</p>
                    <p className="text-sm font-bold text-gray-800">{weatherData.raw?.wind?.speed} m/s</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-100/50 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  weatherData.mappedWeather === 'Lạnh' ? 'bg-blue-400' :
                  weatherData.mappedWeather === 'Nắng nóng' ? 'bg-red-400' : 'bg-green-400'
                }`} />
                <p className="text-[11px] text-blue-800 font-semibold">
                  Hệ thống xác định: <span className="uppercase">{weatherData.mappedWeather}</span>
                </p>
              </div>
            </div>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-white rounded-[3rem] shadow-2xl flex flex-col border border-gray-100 hover:shadow-purple-200/50 transition-all duration-700 group/card relative z-10 overflow-visible translate-y-0 hover:-translate-y-2">
            
            {/* View Toggle Tabs - Ultra Modern Compact Pill */}
            <div className="flex bg-gray-100/50 p-1.5 m-6 mb-0 rounded-2xl backdrop-blur-xl z-20 border border-gray-100">
                <button 
                    onClick={() => setActiveViews(prev => ({...prev, [idx]: 'moodboard'}))}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${(!activeViews[idx] || activeViews[idx] === 'moodboard') ? 'bg-white shadow-lg text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Layout className="w-3.5 h-3.5" />
                    Moodboard
                </button>
                <button 
                    disabled={!suggestion.lookbook_url}
                    onClick={() => setActiveViews(prev => ({...prev, [idx]: 'lookbook'}))}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeViews[idx] === 'lookbook' ? 'bg-white shadow-lg text-purple-600' : 'text-gray-500 hover:text-gray-700'} ${!suggestion.lookbook_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <ImageIcon className="w-3.5 h-3.5" />
                    AI LOOKBOOK
                </button>
            </div>

            {/* Visual Preview Area */}
            <div className="p-6 bg-gray-50/20 flex-1 min-h-[580px] relative mt-2 group/area overflow-visible">
                {(!activeViews[idx] || activeViews[idx] === 'moodboard') ? (
                  // MOODBOARD VIEW
                  suggestion.visual_preview ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-[2.5rem] shadow-inner overflow-hidden animate-in fade-in zoom-in duration-700 border border-gray-100">
                       <img 
                          src={suggestion.visual_preview} 
                          alt="Outfit Moodboard"
                          className="max-w-full max-h-full object-contain p-8"
                       />
                       <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md flex items-center gap-2.5 border border-purple-50">
                          <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                          <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">AI Moodboard</span>
                       </div>
                    </div>
                  ) : (
                    // Fallback: SUPER ARTISTIC COLLAGE
                    <div className="h-full relative flex flex-col justify-center items-center">
                      <div className={`relative w-full h-full min-h-[460px] content-center p-4`}>
                        {suggestion.items.map((item, i) => {
  const count = suggestion.items.length;
  
  // 1. Tính toán kích thước dựa trên số lượng để tránh quá to gây lấn át
  let sizeClass = "w-[55%] h-[55%]"; // Mặc định cho 3-4 món
  if (count <= 2) sizeClass = "w-[75%] h-[75%]";
  if (count >= 5) sizeClass = "w-[42%] h-[42%]";

  // 2. Logic vị trí theo tọa độ phần tư (Quadrants) để tránh chồng tâm
  let positionClass = "";
  const rotations = ["rotate-[-3deg]", "rotate-[2deg]", "rotate-[-1deg]", "rotate-[4deg]", "rotate-[-2deg]", "rotate-[1deg]"];
  const rotate = rotations[i % rotations.length];

  if (count === 1) {
    positionClass = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  } else if (count === 2) {
    positionClass = i === 0 ? "top-5 left-5" : "bottom-5 right-5";
  } else {
    // Sắp xếp theo các góc và cạnh để chừa khoảng trống ở giữa hoặc xen kẽ
    switch (i) {
      case 0: positionClass = "top-0 left-0"; break; // Góc trên trái
      case 1: positionClass = "top-0 right-0"; break; // Góc trên phải
      case 2: positionClass = "bottom-0 left-0"; break; // Góc dưới trái
      case 3: positionClass = "bottom-0 right-0"; break; // Góc dưới phải
      case 4: positionClass = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"; break; // Chính giữa (lên trên cùng)
      case 5: positionClass = "top-[25%] left-[10%] z-10"; break; // Xen kẽ
      default: positionClass = "top-1/2 left-1/2";
    }
  }

  return (
    <div 
      key={item._id} 
      className={`absolute transition-all duration-500 ease-out hover:z-[60] group/item cursor-zoom-in ${sizeClass} ${positionClass} ${rotate}`}
      onMouseEnter={() => setHoveredItem({ sugIdx: idx, itemIdx: i })}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-xl border-[4px] border-white group-hover/item:border-purple-400 group-hover/item:scale-110 group-hover/item:rotate-0 transition-all duration-500 relative bg-white">
        <img 
          src={item.image_url} 
          alt={item.item_name} 
          className="w-full h-full object-cover" 
        />
        {/* Lớp overlay nhẹ để phân biệt các item đè lên nhau */}
        <div className="absolute inset-0 bg-black/[0.02] group-hover/item:bg-transparent transition-colors" />
      </div>
      
      {/* Badge tên item nhỏ khi hover vào (Tùy chọn) */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md opacity-0 group-hover/item:opacity-100 transition-opacity z-50 pointer-events-none border border-purple-100">
        <p className="text-[8px] font-bold text-purple-600 whitespace-nowrap uppercase tracking-tighter">
          {item.category_id?.name || 'Item'}
        </p>
      </div>
    </div>
  );
})}

                        {/* CENTERED Hover Zoom Overlay */}
                        {hoveredItem?.sugIdx === idx && (
                          <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 overflow-visible">
                              <div className="bg-white rounded-[3rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] p-6 border border-purple-100 ring-[24px] ring-purple-600/5 ring-inset animate-in zoom-in fade-in duration-300 w-[360px] pointer-events-none">
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-gray-50 border border-gray-100 shadow-inner">
                                  <img 
                                    src={suggestion.items[hoveredItem.itemIdx].image_url} 
                                    alt="Zoomed"
                                    className="w-full h-full object-contain p-4"
                                  />
                                </div>
                                <div className="px-2 pb-2 text-center">
                                  <h4 className="text-xl font-black text-gray-900 leading-tight mb-3 line-clamp-2">
                                    {suggestion.items[hoveredItem.itemIdx].item_name}
                                  </h4>
                                  <div className="inline-flex px-6 py-2.5 bg-purple-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-purple-200">
                                    {suggestion.items[hoveredItem.itemIdx].category_id?.name || 'Item'}
                                  </div>
                                </div>
                              </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex items-center gap-4 px-6 py-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50">
                        <div className="flex -space-x-2">
                             {[1,2,3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-sm" style={{opacity: 1 - i*0.25}} />)}
                        </div>
                        <p className="text-[10px] text-gray-700 font-extrabold uppercase tracking-widest">
                           Di chuột để soi đồ cực nét
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  // LOOKBOOK VIEW
                  <div className="relative w-full h-full rounded-[3rem] shadow-inner overflow-hidden bg-white animate-in fade-in zoom-in duration-700 border border-gray-100">
                    <img 
                        src={suggestion.lookbook_url} 
                        alt="AI Lookbook"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-0 right-0 text-center">
                        <div className="inline-block px-8 py-2.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-2xl">
                             <p className="text-[11px] text-white font-black italic tracking-[0.5em] uppercase">AI VIRTUAL LOOKBOOK</p>
                        </div>
                    </div>
                  </div>
                )}
                
                {/* Floating Item Thumbnails (visual_preview only) */}
                {(!activeViews[idx] || activeViews[idx] === 'moodboard') && suggestion.visual_preview && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex -space-x-5 p-2.5 bg-white/70 backdrop-blur-2xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] opacity-0 group-hover/card:opacity-100 transition-all duration-700 translate-y-8 group-hover/card:translate-y-0 z-30 ring-2 ring-white/50">
                    {suggestion.items.map((item) => (
                      <div key={item._id} className="w-16 h-16 rounded-full border-[6px] border-white overflow-hidden shadow-2xl hover:z-10 hover:scale-125 transition-all duration-500 cursor-zoom-in">
                        <img src={item.image_url} className="w-full h-full object-cover" title={item.item_name} />
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{suggestion.outfit_name}</h3>
                <p className="text-gray-500 text-sm italic font-medium leading-relaxed">
                  <MessageSquare className="w-4 h-4 inline-block mr-2 opacity-50" />
                  "{suggestion.description}"
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 relative overflow-hidden group/rationale">
                 <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/rationale:scale-125 transition-transform duration-500">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                 </div>
                 <p className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Star className="w-3 h-3 fill-purple-600" />
                    Lời khuyên phong cách
                 </p>
                 <p className="text-xs text-purple-900 leading-relaxed font-medium">{suggestion.rationale}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => handleEditOutfit(suggestion)}
                  className="py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2 border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600"
                >
                  <Edit className="w-4 h-4" />
                  Tùy chỉnh
                </button>

                <button 
                  onClick={() => handleSaveOutfit(suggestion, idx)}
                  disabled={savedOutfits.includes(idx)}
                  className={`py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                    savedOutfits.includes(idx)
                    ? "bg-green-100 text-green-700 cursor-default shadow-none"
                    : "bg-gray-900 text-white hover:bg-black hover:-translate-y-1 active:translate-y-0"
                  }`}
                >
                  {savedOutfits.includes(idx) ? (
                    <><Check className="w-4 h-4" /> Đã lưu</>
                  ) : (
                    <><Save className="w-4 h-4" /> Lưu bộ đồ</>
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
