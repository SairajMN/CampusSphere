import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Notification, NotificationPriority } from "@/types";

const PRIORITY_CONFIG: Record<
  NotificationPriority,
  { color: string; bg: string; icon: string }
> = {
  critical: { color: "#DC2626", bg: "#FEE2E2", icon: "alert-circle" },
  high: { color: "#D97706", bg: "#FEF3C7", icon: "bell" },
  medium: { color: "#2563EB", bg: "#DBEAFE", icon: "info" },
  low: { color: "#6B7280", bg: "#F3F4F6", icon: "message-circle" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  notification: Notification;
  onPress: (id: string) => void;
}

export default function NotificationItem({ notification, onPress }: Props) {
  const colors = useColors();
  const cfg = PRIORITY_CONFIG[notification.priority];

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(notification.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: notification.isRead ? colors.card : colors.secondary,
          borderColor: notification.isRead ? colors.border : colors.primary + "30",
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: cfg.bg }]}>
        <Feather name={cfg.icon as any} size={18} color={cfg.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              { color: colors.foreground, fontWeight: notification.isRead ? "500" : "700" },
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            {timeAgo(notification.createdAt)}
          </Text>
        </View>
        <Text style={[styles.body, { color: colors.mutedForeground }]} numberOfLines={2}>
          {notification.body}
        </Text>
        <View style={styles.footer}>
          <View style={[styles.priorityTag, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.priorityText, { color: cfg.color }]}>
              {notification.priority.toUpperCase()}
            </Text>
          </View>
          {!notification.isRead && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 3,
  },
  title: { fontSize: 14, flex: 1 },
  time: { fontSize: 11 },
  body: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
