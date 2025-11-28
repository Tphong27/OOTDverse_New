"use client";
import { createContext, useContext, useState, useEffect } from "react";
import {
  getWardrobeItems,
  createWardrobeItem,
} from "@/services/wardrobeService";

const WardrobeContext = createContext();

export function WardrobeProvider({ children }) {
  // State lưu danh sách món đồ
  const [items, setItems] = useState([]);

  // State lưu outfit (tạm thời để trống hoặc mock data)
  const [outfits, setOutfits] = useState([]);

  // Load dữ liệu từ Backend khi app khởi động
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getWardrobeItems();
        if (Array.isArray(data)) {
          setItems(data);
        }
      } catch (error) {
        console.error("Lỗi load tủ đồ:", error);
      }
    };
    fetchItems();
  }, []);

  // Hàm thêm món đồ (gọi API + cập nhật state)
  const addItem = async (newItemData) => {
    try {
      // newItemData cần khớp format mà API yêu cầu (name, category, brand, imageUrl)
      const savedItem = await createWardrobeItem({
        name: newItemData.name,
        category: newItemData.category,
        brand: newItemData.brand,
        imageUrl: newItemData.image, // Lưu ý: Backend đang chờ 'imageUrl'
      });

      // Cập nhật state ngay lập tức để giao diện hiển thị
      setItems((prev) => [savedItem, ...prev]);
      return savedItem;
    } catch (error) {
      console.error("Lỗi thêm món đồ:", error);
      throw error;
    }
  };

  // Các hàm phụ trợ (xóa, like...) - Tạm thời xử lý ở Client
  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
    // TODO: Gọi API xóa thật sự
  };

  const toggleFavorite = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  };

  // Outfit functions (Mock tạm thời)
  const saveOutfit = (outfit) => {
    const newOutfit = {
      id: Date.now(),
      ...outfit,
      createdAt: new Date().toISOString(),
    };
    setOutfits([...outfits, newOutfit]);
    return newOutfit;
  };

  const deleteOutfit = (id) => {
    setOutfits(outfits.filter((outfit) => outfit.id !== id));
  };

  return (
    <WardrobeContext.Provider
      value={{
        items,
        outfits,
        addItem,
        deleteItem,
        toggleFavorite,
        saveOutfit,
        deleteOutfit,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error("useWardrobe must be used within WardrobeProvider");
  }
  return context;
}
