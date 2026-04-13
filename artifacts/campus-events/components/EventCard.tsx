import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Event, EventStatus } from "@/types";

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact" | "featured";
}

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "#94A3B8" },
  submitted: { label: "Submitted", color: "#F59E0B" },
  under_review: { label: "Under Review", color: "#3B82F6" },
  approved: { label: "Approved", color: "#22C55E" },
  published: { label: "Published", color: "#4F46E5" },
  archived: { label: "Archived", color: "#6B7280" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Technical: "#4F46E5",
  Academic: "#0EA5E9",
  Cultural: "#EC4899",
  Workshop: "#10B981",
  Sports: "#F59E0B",
  Talk: "#8B5CF6",
  Other: "#6B7280",
};

export default function EventCard({ event, variant = "default" }: EventCardProps) {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/event/${event.id}`);
  };

  const catColor = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.Other;
  const statusCfg = STATUS_CONFIG[event.status];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const spotsLeft =
    event.maxCapacity != null
      ? event.maxCapacity - event.registeredCount
      : null;

  if (variant === "compact") {
    return (
      <TouchableOpacity
        style={[styles.compact, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.compactAccent, { backgroundColor: catColor }]} />
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={styles.compactMeta}>
            <Feather name="calendar" size={11} color={colors.mutedForeground} />
            <Text style={[styles.compactMetaText, { color: colors.mutedForeground }]}>
              {" "}{formatDate(event.date)} · {event.time}
            </Text>
          </View>
        </View>
        <View style={[styles.compactBadge, { backgroundColor: catColor + "20" }]}>
          <Text style={[styles.compactBadgeText, { color: catColor }]}>{event.category}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.isDark ? "#000" : "#1E1B4B",
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryBar, { backgroundColor: catColor }]}>
        <Text style={styles.categoryText}>{event.category}</Text>
        {event.priority === "urgent" && (
          <View style={styles.urgentBadge}>
            <Feather name="zap" size={10} color="#FFF" />
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + "20" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={13} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {" "}{formatDate(event.date)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={13} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {" "}{event.time}
              {event.endTime ? ` – ${event.endTime}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={13} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {" "}{event.venue}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Feather name="users" size={13} color={colors.mutedForeground} />
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              {" "}{event.registeredCount} registered
            </Text>
            {spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0 && (
              <View style={[styles.spotsTag, { backgroundColor: "#FEF3C7" }]}>
                <Text style={[styles.spotsText, { color: "#D97706" }]}>
                  {spotsLeft} left
                </Text>
              </View>
            )}
            {spotsLeft !== null && spotsLeft <= 0 && (
              <View style={[styles.spotsTag, { backgroundColor: "#FEE2E2" }]}>
                <Text style={[styles.spotsText, { color: "#DC2626" }]}>Full</Text>
              </View>
            )}
          </View>

          <View style={styles.footerRight}>
            <Feather name="eye" size={13} color={colors.mutedForeground} />
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              {" "}{event.viewCount}
            </Text>
            {event.isRegistered && (
              <View style={[styles.registeredTag, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="check-circle" size={11} color={colors.primary} />
                <Text style={[styles.registeredText, { color: colors.primary }]}>Registered</Text>
              </View>
            )}
          </View>
        </View>

        {event.tags.length > 0 && (
          <View style={styles.tags}>
            {event.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  categoryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  body: { padding: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: "700" },
  description: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 5,
    flexWrap: "wrap",
  },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 13 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 12 },
  spotsTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  spotsText: { fontSize: 10, fontWeight: "700" },
  registeredTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 6,
  },
  registeredText: { fontSize: 10, fontWeight: "700" },
  tags: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: { fontSize: 11 },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
  },
  compactAccent: { width: 4, alignSelf: "stretch" },
  compactContent: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  compactTitle: { fontSize: 14, fontWeight: "600", marginBottom: 3 },
  compactMeta: { flexDirection: "row", alignItems: "center" },
  compactMetaText: { fontSize: 12 },
  compactBadge: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  compactBadgeText: { fontSize: 11, fontWeight: "600" },
});
