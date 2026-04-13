import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";
import RoleBadge from "@/components/RoleBadge";
import { Event } from "@/types";

const CATEGORIES = ["All", "Technical", "Academic", "Cultural", "Workshop", "Sports", "Talk"];

export default function HomeScreen() {
  const colors = useColors();
  const { currentUser, events, unreadCount } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const publishedEvents = useMemo(() => {
    return events
      .filter((e) => e.status === "published")
      .sort((a, b) => {
        const prio = { urgent: 0, upcoming: 1, regular: 2 };
        return prio[a.priority] - prio[b.priority];
      });
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "All") return publishedEvents;
    return publishedEvents.filter((e) => e.category === activeCategory);
  }, [publishedEvents, activeCategory]);

  const urgentEvents = useMemo(
    () => publishedEvents.filter((e) => e.priority === "urgent"),
    [publishedEvents]
  );

  const myEvents = useMemo(
    () => events.filter((e) => e.isRegistered),
    [events]
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 80 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {greeting()},
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {currentUser?.name.split(" ")[0] ?? "Student"}
          </Text>
          {currentUser && <RoleBadge role={currentUser.role} />}
        </View>
        <TouchableOpacity
          style={[styles.notifButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/notifications")}
        >
          <Feather name="bell" size={20} color={colors.foreground} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction
          icon="camera"
          label="Scan Poster"
          color="#8B5CF6"
          bg="#EDE9FE"
          onPress={() => router.push("/scan")}
        />
        {(currentUser?.role === "staff" ||
          currentUser?.role === "hod" ||
          currentUser?.role === "principal" ||
          currentUser?.role === "cr") && (
          <QuickAction
            icon="plus-circle"
            label="Create Event"
            color="#059669"
            bg="#D1FAE5"
            onPress={() => router.push("/create-event")}
          />
        )}
        <QuickAction
          icon="bell"
          label="Reminders"
          color="#D97706"
          bg="#FEF3C7"
          onPress={() => router.push("/(tabs)/notifications")}
        />
        {(currentUser?.role === "hod" || currentUser?.role === "principal") && (
          <QuickAction
            icon="check-square"
            label="Approvals"
            color="#DC2626"
            bg="#FEE2E2"
            onPress={() => router.push("/admin/approvals")}
          />
        )}
      </View>

      {/* Urgent Events */}
      {urgentEvents.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="zap" size={16} color="#DC2626" />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Urgent
              </Text>
            </View>
          </View>
          {urgentEvents.slice(0, 2).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>
      )}

      {/* My Registered Events */}
      {myEvents.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              My Events
            </Text>
            <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
              {myEvents.length}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalList}>
              {myEvents.map((e) => (
                <MiniEventCard key={e.id} event={e} colors={colors} />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* All Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            All Events
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      activeCategory === cat ? colors.primary : colors.muted,
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCategory(cat);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        activeCategory === cat ? "#FFF" : colors.mutedForeground,
                      fontWeight: activeCategory === cat ? "700" : "500",
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {filteredEvents.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.muted }]}>
            <Feather name="calendar" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No {activeCategory !== "All" ? activeCategory : ""} events found
            </Text>
          </View>
        ) : (
          filteredEvents.slice(0, 5).map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function QuickAction({
  icon,
  label,
  color,
  bg,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color: "#374151" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MiniEventCard({ event, colors }: { event: Event; colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.miniBar, { backgroundColor: colors.primary }]} />
      <View style={styles.miniContent}>
        <Text style={[styles.miniTitle, { color: colors.foreground }]} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={[styles.miniDate, { color: colors.mutedForeground }]}>
          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </Text>
        <View style={[styles.registeredBadge, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="check" size={10} color={colors.primary} />
          <Text style={[styles.registeredBadgeText, { color: colors.primary }]}>Registered</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: { gap: 4 },
  greeting: { fontSize: 14 },
  name: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#FFF" },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  quickAction: { alignItems: "center", gap: 6 },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  sectionCount: { fontSize: 13 },
  seeAll: { fontSize: 13, fontWeight: "600" },
  categoryScroll: { marginBottom: 12 },
  categories: { flexDirection: "row", gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryText: { fontSize: 13 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    gap: 8,
  },
  emptyText: { fontSize: 14 },
  horizontalList: { flexDirection: "row", gap: 12, paddingRight: 16 },
  miniCard: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  miniBar: { height: 4 },
  miniContent: { padding: 12 },
  miniTitle: { fontSize: 13, fontWeight: "600", marginBottom: 4, lineHeight: 18 },
  miniDate: { fontSize: 11, marginBottom: 8 },
  registeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  registeredBadgeText: { fontSize: 10, fontWeight: "700" },
});
