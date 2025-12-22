// backend/routes/geocode.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/reverse", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      error: "Missing lat or lng",
    });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          format: "json",
          lat,
          lon: lng,
          addressdetails: 1,
          accept_language: "vi",
        },
        headers: {
          "User-Agent": "OOTDverse/1.0 (contact@email.com)",
        },
      }
    );

    console.log("✅ Nominatim response:", response.data);

    // Wrap response giống các API khác
    res.json({
      success: true,
      data: response.data, // Wrap vào data
    });
  } catch (err) {
    console.error("❌ Reverse geocode error:", err.message);
    res.status(500).json({
      success: false,
      error: "Reverse geocode failed",
      details: err.message,
    });
  }
});

module.exports = router;
