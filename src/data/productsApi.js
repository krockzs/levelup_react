import axios from "axios";

const API_URL = "https://api.sebaorekind.site/api/products";

export const getProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getProductByCode = async (code) => {
  const response = await axios.get(`${API_URL}/${code}`);
  return response.data;
};