import api from "./api";

export const getMyAddresses = () =>
  api.get("/api/addresses");

export const getDefaultAddress = () =>
  api.get("/api/addresses/default");

export const createAddress = (data) =>
  api.post("/api/addresses", data);

export const setDefaultAddress = (id) =>
  api.put(`/api/addresses/${id}/default`);
