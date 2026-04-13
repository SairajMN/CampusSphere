import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { User, Event, Notification, EventStatus } from "@/types";
import { api } from "@/lib/api";

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  events: Event[];
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  addEvent: (event: Event) => void;
  updateEventStatus: (id: string, status: EventStatus, comment?: string) => void;
  deleteEvent: (id: string) => void;
  registerForEvent: (eventId: string) => void;
  refreshEvents: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshEvents = useCallback(async () => {
    try {
      const { events: fetched } = await api.events.list();
      setEvents(fetched);
    } catch {
      // keep existing
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const { notifications: fetched } = await api.notifications.list();
      setNotifications(fetched);
    } catch {
      // keep existing
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // Try to restore session from API
        const { user } = await api.auth.me();
        setCurrentUserState(user);
        await AsyncStorage.setItem("currentUser", JSON.stringify(user));
        await Promise.all([refreshEvents(), refreshNotifications()]);
      } catch {
        // Fall back to stored user
        try {
          const saved = await AsyncStorage.getItem("currentUser");
          if (saved) {
            setCurrentUserState(JSON.parse(saved));
            await Promise.all([refreshEvents(), refreshNotifications()]);
          }
        } catch {}
      }
      setIsLoading(false);
    };
    init();
  }, [refreshEvents, refreshNotifications]);

  const setCurrentUser = useCallback(async (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      await AsyncStorage.setItem("currentUser", JSON.stringify(user));
      await Promise.all([refreshEvents(), refreshNotifications()]);
    } else {
      await AsyncStorage.removeItem("currentUser");
      setEvents([]);
      setNotifications([]);
    }
  }, [refreshEvents, refreshNotifications]);

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await api.notifications.markRead(id);
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.notifications.markAllRead();
    } catch {}
  }, []);

  const addEvent = useCallback(async (event: Event) => {
    setEvents((prev) => [event, ...prev]);
    try {
      await refreshNotifications();
    } catch {}
  }, [refreshNotifications]);

  const updateEventStatus = useCallback(
    async (id: string, status: EventStatus, comment?: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status,
                approvedAt:
                  status === "approved" ? new Date().toISOString() : e.approvedAt,
              }
            : e
        )
      );
      try {
        await api.events.updateStatus(id, status, comment);
        await Promise.all([refreshEvents(), refreshNotifications()]);
      } catch {}
    },
    [refreshEvents, refreshNotifications]
  );

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const registerForEvent = useCallback(async (eventId: string) => {
    // Optimistic update
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              isRegistered: !e.isRegistered,
              registeredCount: e.isRegistered
                ? e.registeredCount - 1
                : e.registeredCount + 1,
            }
          : e
      )
    );
    try {
      const { isRegistered } = await api.events.register(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, isRegistered } : e))
      );
    } catch {
      // Revert optimistic update
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                isRegistered: !e.isRegistered,
                registeredCount: e.isRegistered
                  ? e.registeredCount - 1
                  : e.registeredCount + 1,
              }
            : e
        )
      );
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        events,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllRead,
        addEvent,
        updateEventStatus,
        deleteEvent,
        registerForEvent,
        refreshEvents,
        refreshNotifications,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
