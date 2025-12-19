// frontend/src/services/geocodeService.js
import api from "./api";

export async function reverseGeocode(lat, lng) {
  const res = await api.get(
    `/geocode/reverse?lat=${lat}&lng=${lng}`
  );
  return res.data;
}