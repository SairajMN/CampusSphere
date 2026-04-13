import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import NotificationItem from "@/components/NotificationItem";
import { NotificationPriority } from "@/types";

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Unread", value: "unread" },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useApp();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("all");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "all") return true;
    return n.priority === filter;
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPad + 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text style={[styles.unreadLabel, { color: colors.mutedForeground }]}>
                {unreadCount} unread
              </Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.markAllBtn, { backgroundColor: colors.secondary }]}
              onPress={markAllRead}
            >
              <Feather name="check-circle" size={14} color={colors.primary} />
              <Text style={[styles.markAllText, { color: colors.primary }]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <View style={styles.filters}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      filter === f.value ? colors.primary : colors.muted,
                  },
                ]}
                onPress={() => setFilter(f.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        filter === f.value ? "#FFF" : colors.mutedForeground,
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.muted }]}>
            <Feather name="bell-off" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              All caught up!
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No notifications to show
            </Text>
          </View>
        ) : (
          filtered.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onPress={markNotificationRead}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "800" },
  unreadLabel: { fontSize: 13, marginTop: 2 },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  markAllText: { fontSize: 12, fontWeight: "600" },
  filterScroll: { marginBottom: 16 },
  filters: { flexDirection: "row", gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: "600" },
  empty: {
    alignItems: "center",
    padding: 48,
    borderRadius: 16,
    gap: 8,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14 },
});
