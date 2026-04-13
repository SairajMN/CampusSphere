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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";
import { EventStatus } from "@/types";

const STATUS_TABS = [
  { key: "submitted", label: "Pending Review", color: "#F59E0B" },
  { key: "under_review", label: "Under Review", color: "#3B82F6" },
  { key: "approved", label: "Approved", color: "#22C55E" },
];

export default function ApprovalsScreen() {
  const colors = useColors();
  const { events, updateEventStatus, currentUser } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("submitted");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filteredEvents = events.filter((e) => e.status === activeTab);

  const canApprove =
    currentUser?.role === "hod" || currentUser?.role === "principal";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: topPad + 12,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Approvals
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.tabs}
      >
        {STATUS_TABS.map((tab) => {
          const count = events.filter((e) => e.status === tab.key).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && {
                  borderBottomColor: tab.color,
                  borderBottomWidth: 3,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.key ? tab.color : colors.mutedForeground,
                    fontWeight: activeTab === tab.key ? "700" : "500",
                  },
                ]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: tab.color }]}>
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.muted }]}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No events here
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {activeTab === "submitted"
                ? "No events pending review"
                : activeTab === "under_review"
                ? "No events currently under review"
                : "No approved events yet"}
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <View key={event.id}>
              <EventCard event={event} />
              {canApprove && activeTab === "submitted" && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      updateEventStatus(event.id, "draft", "Needs revision");
                    }}
                  >
                    <Feather name="x" size={14} color="#DC2626" />
                    <Text style={[styles.actionText, { color: "#DC2626" }]}>Request Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#DBEAFE", borderColor: "#93C5FD" }]}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateEventStatus(event.id, "under_review");
                    }}
                  >
                    <Feather name="eye" size={14} color="#2563EB" />
                    <Text style={[styles.actionText, { color: "#2563EB" }]}>Mark Under Review</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#D1FAE5", borderColor: "#6EE7B7" }]}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      updateEventStatus(event.id, "approved");
                    }}
                  >
                    <Feather name="check" size={14} color="#059669" />
                    <Text style={[styles.actionText, { color: "#059669" }]}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
              {canApprove && activeTab === "approved" && (
                <View style={[styles.publishRow, { marginBottom: 8, marginTop: -4 }]}>
                  <TouchableOpacity
                    style={[styles.publishBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      updateEventStatus(event.id, "published");
                    }}
                  >
                    <Feather name="send" size={14} color="#FFF" />
                    <Text style={styles.publishBtnText}>Publish Now</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  tabsScroll: { borderBottomWidth: 1 },
  tabs: { paddingHorizontal: 12, gap: 4 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14 },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  tabBadgeText: { fontSize: 10, fontWeight: "700", color: "#FFF" },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  empty: {
    alignItems: "center",
    padding: 48,
    borderRadius: 16,
    gap: 8,
    marginTop: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: "center" },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: -4,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 100,
  },
  actionText: { fontSize: 12, fontWeight: "700" },
  publishRow: {},
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  publishBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
});
