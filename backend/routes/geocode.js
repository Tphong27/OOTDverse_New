const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.get("/reverse", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat/lng" });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "OOTDverse/1.0 (contact@email.com)",
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Reverse geocode failed" });
  }
});

module.exports = router;
