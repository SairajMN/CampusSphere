import { User, Event, Notification } from "@/types";
import { Platform } from "react-native";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";
export const API_BASE = DOMAIN
  ? `https://${DOMAIN}/api`
  : Platform.OS === "web"
    ? "/api"
    : "http://localhost:8080/api";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
    me: () => request<{ user: User }>("/auth/me"),
  },

  events: {
    list: () => request<{ events: Event[] }>("/events"),
    get: (id: string) => request<{ event: Event }>(`/events/${id}`),
    create: (data: Partial<Event>) =>
      request<{ event: Event }>("/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string, comment?: string) =>
      request<{ event: Event }>(`/events/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, comment }),
      }),
    register: (id: string) =>
      request<{ isRegistered: boolean }>(`/events/${id}/register`, {
        method: "POST",
      }),
  },

  notifications: {
    list: () => request<{ notifications: Notification[] }>("/notifications"),
    markRead: (id: string) =>
      request<{ ok: boolean }>(`/notifications/${id}/read`, {
        method: "PATCH",
      }),
    markAllRead: () =>
      request<{ ok: boolean }>("/notifications/mark-all-read", {
        method: "POST",
      }),
  },
};
