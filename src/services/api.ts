import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export const protectedApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
export const transactionPredictionApi = axios.create({
  baseURL: import.meta.env.VITE_API_TRANSACTION_CLASSIFIER_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});
export const transactionExtractionApi = axios.create({
  baseURL: import.meta.env.VITE_API_TRANSACTION_EXTRACTOR_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});
