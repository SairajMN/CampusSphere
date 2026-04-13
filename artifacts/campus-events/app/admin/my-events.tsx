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
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "submitted", label: "Submitted" },
  { key: "published", label: "Published" },
];

export default function MyEventsScreen() {
  const colors = useColors();
  const { events, currentUser } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const myEvents = events.filter((e) => e.organizerId === currentUser?.id);
  const filtered =
    activeTab === "all" ? myEvents : myEvents.filter((e) => e.status === activeTab);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 12 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Events</Text>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/create-event")}
        >
          <Feather name="plus" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.tabs}
      >
        {STATUS_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? myEvents.length
              : myEvents.filter((e) => e.status === tab.key).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 3,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.key ? colors.primary : colors.mutedForeground,
                    fontWeight: activeTab === tab.key ? "700" : "500",
                  },
                ]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: activeTab === tab.key ? colors.primary : colors.muted }]}>
                  <Text style={[styles.tabBadgeText, { color: activeTab === tab.key ? "#FFF" : colors.mutedForeground }]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.muted }]}>
            <Feather name="calendar" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No events yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Create your first event to get started
            </Text>
            <TouchableOpacity
              style={[styles.emptyAction, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/create-event")}
            >
              <Feather name="plus" size={16} color="#FFF" />
              <Text style={styles.emptyActionText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((event) => <EventCard key={event.id} event={event} />)
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
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
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
  tabBadgeText: { fontSize: 10, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  empty: {
    alignItems: "center",
    padding: 48,
    borderRadius: 16,
    gap: 8,
    marginTop: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: "center", marginBottom: 8 },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyActionText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
});
