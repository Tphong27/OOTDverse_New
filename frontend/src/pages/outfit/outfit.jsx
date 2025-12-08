// frontend/src/pages/user/outfit.jsx
import { useState, useEffect } from "react";
import LayoutUser from "@/components/layout/LayoutUser";
import { useOutfit } from "@/context/OutfitContext"; // Import context
import { Plus, Edit, Trash2, Heart, Bookmark, Eye, Star, CalendarCheck } from "lucide-react";

// Giả sử bạn có các components con như OutfitList, OutfitDetail, OutfitForm, v.v.
import OutfitList from "@/components/outfit/OutfitList"; // Component hiển thị list outfits
import OutfitDetail from "@/components/outfit/OutfitDetail"; // Component hiển thị chi tiết outfit
import OutfitForm from "@/components/outfit/OutfitForm"; // Form tạo/cập nhật outfit

export default function OutfitPage() {
  const {
    outfits,
    currentOutfit,
    loading,
    error,
    fetchUserOutfits,
    fetchOutfitById,
    handleCreateOutfit,
    handleUpdateOutfit,
    handleDeleteOutfit,
    handleToggleLike,
    handleToggleSave,
    handleRecordWear,
    handleUpdateRating,
  } = useOutfit();

  const [showForm, setShowForm] = useState(false); // State cho form tạo/edit
  const [editMode, setEditMode] = useState(false); // Edit hay create
  const [filters, setFilters] = useState({}); // Filters cho list

  // Refresh list khi filters thay đổi
  useEffect(() => {
    fetchUserOutfits(filters);
  }, [filters]);

  // Xử lý tạo outfit
  const onCreateOutfit = async (outfitData) => {
    await handleCreateOutfit(outfitData);
    setShowForm(false);
  };

  // Xử lý cập nhật outfit
  const onUpdateOutfit = async (id, outfitData) => {
    await handleUpdateOutfit(id, outfitData);
    setShowForm(false);
    setEditMode(false);
  };

  // Mở form edit
  const openEditForm = (outfit) => {
    setCurrentOutfit(outfit);
    setEditMode(true);
    setShowForm(true);
  };

  // Xử lý xem chi tiết
  const viewOutfit = async (id) => {
    await fetchOutfitById(id);
    // Có thể mở modal hoặc navigate đến detail page
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <LayoutUser>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Outfits Của Tôi</h1>
          <button
            onClick={() => {
              setEditMode(false);
              setShowForm(true);
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" /> Tạo Outfit Mới
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          {/* Thêm select cho sort_by, is_public, etc. */}
          <select
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến</option>
            <option value="rating">Rating cao</option>
            <option value="most_worn">Mặc nhiều</option>
            <option value="recent_worn">Mặc gần đây</option>
          </select>
        </div>

        {/* List Outfits */}
        <OutfitList
          outfits={outfits}
          onView={viewOutfit}
          onEdit={openEditForm}
          onDelete={handleDeleteOutfit}
          onLike={handleToggleLike}
          onSave={handleToggleSave}
          onWear={handleRecordWear}
          onRate={handleUpdateRating}
        />

        {/* Form Modal */}
        {showForm && (
          <OutfitForm
            onSubmit={editMode ? onUpdateOutfit : onCreateOutfit}
            initialData={editMode ? currentOutfit : {}}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Detail Modal (nếu có) */}
        {currentOutfit && !showForm && (
          <OutfitDetail
            outfit={currentOutfit}
            onClose={() => setCurrentOutfit(null)}
            onEdit={openEditForm}
            // Thêm các handler khác nếu cần
          />
        )}
      </div>
    </LayoutUser>
  );
}