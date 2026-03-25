import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** Axios instance for the Techcraft property API (public routes under /api/v1). */
export const api = axios.create({
  baseURL,
  headers: { Accept: "application/json" },
  validateStatus: (status) => status >= 200 && status < 300,
});
