// frontend/src/services/geocodeService.js
import api from "./api";

export async function reverseGeocode(lat, lng) {
  try {
    // api.get() trả về response.data (do interceptor)
    const data = await api.get("/api/geocode/reverse", {
      params: { lat, lng },
    });
    
    console.log("🔍 geocodeService - data:", data);
    console.log("🔍 geocodeService - data.success:", data.success);
    console.log("🔍 geocodeService - data.data:", data.data);
    
    // data = {success: true, data: {...}}
    if (!data || data.success === false) {
      throw new Error(data?.error || "Reverse geocode failed");
    }
    
    console.log("✅ geocodeService - Returning:", data.data);
    return data.data; // Nominatim object
  } catch (error) {
    console.error("❌ Reverse geocode error:", error);
    throw error;
  }
}