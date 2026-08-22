import axios from "axios";

/**
 * Browser-side API client. Points at the Next proxy rather than Express
 * directly, so no api-key and no bearer token exist in client code - the
 * proxy adds both from server-only env and the HttpOnly cookie.
 */
export const api = axios.create({ baseURL: "/api/proxy" });

/**
 * Auth deliberately bypasses the proxy. Only a Next route handler can set or
 * clear an HttpOnly cookie, so login, OTP and logout have their own endpoints
 * rather than being forwarded straight through to Express.
 */
export const authApi = axios.create({ baseURL: "/api/auth" });

export default api;
