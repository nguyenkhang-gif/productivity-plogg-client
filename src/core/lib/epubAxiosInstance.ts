import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const epubAxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,
  headers: { "Content-Type": "application/json" },
});

export default epubAxiosInstance;
