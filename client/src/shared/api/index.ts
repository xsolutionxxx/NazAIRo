import axios from "axios";
import { AuthResponse } from "@/features/auth/api/authResponse";
import store from "@app/store/store";
import { setAuth } from "@/features/auth/model/authSlice";

export const API_URL = "http://localhost:5000/api";

const $api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

// розвантажуємо чергу після refresh
const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve();
  });
  failedQueue = [];
};

const authUrls = ["/login", "/registration", "/refresh"];

$api.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest = authUrls.some((url) =>
      originalRequest.url?.includes(url),
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry &&
      !isAuthRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => $api.request(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._isRetry = true;
      isRefreshing = true;

      try {
        await axios.get<AuthResponse>(`${API_URL}/refresh`, {
          withCredentials: true,
        });
        processQueue(null);
        return $api.request(originalRequest);
      } catch (err) {
        processQueue(err);
        localStorage.removeItem("was_logged_in");
        store.dispatch(setAuth({ isAuth: false, user: null }));
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default $api;
