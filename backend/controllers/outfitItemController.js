const OutfitItem = require("../models/OutfitItem");
const Outfit = require("../models/Outfit");
const Item = require("../models/Item");

// ========================================
// 1. ADD ITEM TO OUTFIT
// ========================================
exports.addItemToOutfit = async (req, res) => {
  try {
    const { outfitId } = req.params;
    const {
      item_id,
      layer_position,
      display_order,
      styling_note,
      is_optional,
    } = req.body;

    // Kiểm tra outfit tồn tại
    const outfit = await Outfit.findById(outfitId);
    if (!outfit) {
      return res.status(404).json({ success: false, error: "Outfit không tồn tại" });
    }

    // Kiểm tra item tồn tại
    const item = await Item.findById(item_id).populate("category_id");
    if (!item) {
      return res.status(404).json({ success: false, error: "Item không tồn tại" });
    }

    // Kiểm tra item đã có trong outfit chưa
    const existingItem = await OutfitItem.findOne({
      outfit_id: outfitId,
      item_id: item_id,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: "Item đã có trong outfit này",
      });
    }

    // Kiểm tra số lượng items hiện tại
    const currentItemCount = await OutfitItem.countDocuments({ outfit_id: outfitId });
    if (currentItemCount >= 15) {
      return res.status(400).json({
        success: false,
        error: "Outfit đã đạt giới hạn 15 items",
      });
    }

    // Tạo outfit item mới
    const outfitItem = new OutfitItem({
      outfit_id: outfitId,
      item_id,
      layer_position: layer_position || null,
      display_order: display_order !== undefined ? display_order : currentItemCount,
      styling_note: styling_note || null,
      is_optional: is_optional || false,
    });

    await outfitItem.save();

    // Populate và trả về
    const populatedItem = await OutfitItem.findById(outfitItem._id)
      .populate({
        path: "item_id",
        populate: { path: "category_id", select: "name value priority" }
      });

    res.status(201).json({
      success: true,
      message: "Thêm item vào outfit thành công",
      data: populatedItem,
    });
  } catch (error) {
    console.error("Lỗi thêm item vào outfit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 2. REMOVE ITEM FROM OUTFIT
// ========================================
exports.removeItemFromOutfit = async (req, res) => {
  try {
    const { outfitId, itemId } = req.params;

    const outfitItem = await OutfitItem.findOne({
      outfit_id: outfitId,
      item_id: itemId,
    });

    if (!outfitItem) {
      return res.status(404).json({
        success: false,
        error: "Item không có trong outfit này",
      });
    }

    // Kiểm tra số lượng items còn lại
    const currentItemCount = await OutfitItem.countDocuments({ outfit_id: outfitId });
    if (currentItemCount <= 2) {
      return res.status(400).json({
        success: false,
        error: "Outfit phải có ít nhất 2 items",
      });
    }

    await OutfitItem.findByIdAndDelete(outfitItem._id);

    res.json({
      success: true,
      message: "Xóa item khỏi outfit thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa item khỏi outfit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 3. UPDATE OUTFIT ITEM
// ========================================
exports.updateOutfitItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      layer_position,
      display_order,
      styling_note,
      is_optional,
    } = req.body;

    const outfitItem = await OutfitItem.findById(id);
    if (!outfitItem) {
      return res.status(404).json({
        success: false,
        error: "Outfit item không tồn tại",
      });
    }

    // Update fields
    if (layer_position !== undefined) outfitItem.layer_position = layer_position;
    if (display_order !== undefined) outfitItem.display_order = display_order;
    if (styling_note !== undefined) outfitItem.styling_note = styling_note;
    if (is_optional !== undefined) outfitItem.is_optional = is_optional;

    await outfitItem.save();

    // Populate và trả về
    const updatedItem = await OutfitItem.findById(id)
      .populate({
        path: "item_id",
        populate: { path: "category_id", select: "name value priority" }
      });

    res.json({
      success: true,
      message: "Cập nhật outfit item thành công",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Lỗi cập nhật outfit item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 4. REORDER OUTFIT ITEMS
// ========================================
exports.reorderOutfitItems = async (req, res) => {
  try {
    const { outfitId } = req.params;
    const { items } = req.body; // Array of { item_id, display_order }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Items array là bắt buộc",
      });
    }

    // Kiểm tra outfit tồn tại
    const outfit = await Outfit.findById(outfitId);
    if (!outfit) {
      return res.status(404).json({ success: false, error: "Outfit không tồn tại" });
    }

    // Batch update display_order
    const updatePromises = items.map((item) =>
      OutfitItem.findOneAndUpdate(
        { outfit_id: outfitId, item_id: item.item_id },
        { display_order: item.display_order },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Lấy danh sách items đã được sắp xếp
    const sortedItems = await OutfitItem.find({ outfit_id: outfitId })
      .populate({
        path: "item_id",
        populate: { path: "category_id", select: "name value priority" }
      })
      .sort({ display_order: 1 });

    res.json({
      success: true,
      message: "Sắp xếp lại items thành công",
      data: sortedItems,
    });
  } catch (error) {
    console.error("Lỗi sắp xếp lại items:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 5. GET OUTFIT ITEMS
// ========================================
exports.getOutfitItems = async (req, res) => {
  try {
    const { outfitId } = req.params;

    const items = await OutfitItem.find({ outfit_id: outfitId })
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value priority" },
          { path: "brand_id", select: "name value" },
          { path: "color_id", select: "name value" },
        ],
      })
      .sort({ display_order: 1 });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Lỗi lấy outfit items:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 6. TOGGLE OPTIONAL STATUS
// ========================================
exports.toggleOptional = async (req, res) => {
  try {
    const { id } = req.params;

    const outfitItem = await OutfitItem.findById(id);
    if (!outfitItem) {
      return res.status(404).json({
        success: false,
        error: "Outfit item không tồn tại",
      });
    }

    await outfitItem.toggleOptional();

    res.json({
      success: true,
      message: `Item đã được đánh dấu ${outfitItem.is_optional ? "optional" : "required"}`,
      data: { is_optional: outfitItem.is_optional },
    });
  } catch (error) {
    console.error("Lỗi toggle optional:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 7. BULK ADD ITEMS TO OUTFIT
// ========================================
exports.bulkAddItems = async (req, res) => {
  try {
    const { outfitId } = req.params;
    const { items } = req.body; // Array of item objects

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Items array là bắt buộc",
      });
    }

    // Kiểm tra outfit tồn tại
    const outfit = await Outfit.findById(outfitId);
    if (!outfit) {
      return res.status(404).json({ success: false, error: "Outfit không tồn tại" });
    }

    // Kiểm tra số lượng hiện tại + số lượng thêm vào
    const currentItemCount = await OutfitItem.countDocuments({ outfit_id: outfitId });
    if (currentItemCount + items.length > 15) {
      return res.status(400).json({
        success: false,
        error: `Không thể thêm ${items.length} items. Giới hạn là 15 items/outfit`,
      });
    }

    // Kiểm tra duplicate items
    const itemIds = items.map((i) => i.item_id);
    const existingItems = await OutfitItem.find({
      outfit_id: outfitId,
      item_id: { $in: itemIds },
    });

    if (existingItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Một hoặc nhiều items đã có trong outfit",
      });
    }

    // Tạo outfit items (KHÔNG CẦN body_position_id)
    const outfitItemsData = items.map((item, index) => ({
      outfit_id: outfitId,
      item_id: item.item_id,
      layer_position: item.layer_position || null,
      display_order: item.display_order !== undefined ? item.display_order : currentItemCount + index,
      styling_note: item.styling_note || null,
      is_optional: item.is_optional || false,
    }));

    const createdItems = await OutfitItem.insertMany(outfitItemsData);

    // Populate
    const populatedItems = await OutfitItem.find({
      _id: { $in: createdItems.map((i) => i._id) },
    })
      .populate({
        path: "item_id",
        populate: { path: "category_id", select: "name value priority" }
      })
      .sort({ display_order: 1 });

    res.status(201).json({
      success: true,
      message: `Thêm ${items.length} items vào outfit thành công`,
      data: populatedItems,
    });
  } catch (error) {
    console.error("Lỗi bulk add items:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};