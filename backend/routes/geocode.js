const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/reverse", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          format: "json",
          lat,
          lon: lng,
        },
        headers: {
          "User-Agent": "OOTDverse/1.0 (contact@email.com)",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reverse geocode failed" });
  }
});

module.exports = router;
