// testGetItems.js
const mongoose = require("mongoose");
require("dotenv").config();

const { getItems } = require("./controllers/wardrobeController");

// Mock req, res
const req = {};
const res = {
  json: (data) => {
    console.log("KẾT QUẢ GET ITEMS:");
    console.log(data);
  },
  status: function (code) {
    this.statusCode = code;
    return this;
  },
};

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối DB");

    // Gọi thẳng controller
    await getItems(req, res);

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

main();
