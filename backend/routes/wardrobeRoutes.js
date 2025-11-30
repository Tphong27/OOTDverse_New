const express = require("express");
const router = express.Router();
const { getItems, createItem } = require("../controllers/wardrobeController");

// Định nghĩa:
// GET  http://localhost:5000/api/wardrobe  -> Gọi hàm getItems
// POST http://localhost:5000/api/wardrobe  -> Gọi hàm createItem

router.get("/", getItems);
router.post("/", createItem);

module.exports = router;
