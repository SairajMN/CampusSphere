import React from "react";
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

const DEPT_COLORS = ["#4F46E5", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

export default function AnalyticsScreen() {
  const colors = useColors();
  const { events } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const totalEvents = events.length;
  const published = events.filter((e) => e.status === "published").length;
  const pending = events.filter(
    (e) => e.status === "submitted" || e.status === "under_review"
  ).length;
  const drafts = events.filter((e) => e.status === "draft").length;
  const totalViews = events.reduce((sum, e) => sum + e.viewCount, 0);
  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);

  // Category breakdown
  const catBreakdown = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + 1;
    return acc;
  }, {});

  const topEvents = [...events]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  const maxViews = topEvents[0]?.viewCount ?? 1;

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Grid */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
        <View style={styles.kpiGrid}>
          <KpiCard
            icon="calendar"
            label="Total Events"
            value={totalEvents}
            color="#4F46E5"
            bg="#EEF2FF"
            colors={colors}
          />
          <KpiCard
            icon="send"
            label="Published"
            value={published}
            color="#22C55E"
            bg="#F0FDF4"
            colors={colors}
          />
          <KpiCard
            icon="clock"
            label="Pending"
            value={pending}
            color="#F59E0B"
            bg="#FFFBEB"
            colors={colors}
          />
          <KpiCard
            icon="edit-3"
            label="Drafts"
            value={drafts}
            color="#94A3B8"
            bg="#F8FAFC"
            colors={colors}
          />
        </View>

        {/* Engagement Row */}
        <View style={styles.engagementRow}>
          <View
            style={[
              styles.engagementCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="eye" size={22} color={colors.primary} />
            <Text style={[styles.engValue, { color: colors.foreground }]}>
              {totalViews.toLocaleString()}
            </Text>
            <Text style={[styles.engLabel, { color: colors.mutedForeground }]}>Total Views</Text>
          </View>
          <View
            style={[
              styles.engagementCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="user-plus" size={22} color="#EC4899" />
            <Text style={[styles.engValue, { color: colors.foreground }]}>
              {totalRegistrations.toLocaleString()}
            </Text>
            <Text style={[styles.engLabel, { color: colors.mutedForeground }]}>Registrations</Text>
          </View>
          <View
            style={[
              styles.engagementCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="trending-up" size={22} color="#10B981" />
            <Text style={[styles.engValue, { color: colors.foreground }]}>
              {totalViews > 0
                ? `${Math.round((totalRegistrations / totalViews) * 100)}%`
                : "0%"}
            </Text>
            <Text style={[styles.engLabel, { color: colors.mutedForeground }]}>Conversion</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Events by Category
        </Text>
        <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {Object.entries(catBreakdown).map(([cat, count], i) => (
            <View key={cat} style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }]} />
              <Text style={[styles.breakdownLabel, { color: colors.foreground }]}>
                {cat}
              </Text>
              <View style={styles.breakdownBarContainer}>
                <View
                  style={[
                    styles.breakdownBar,
                    {
                      backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length],
                      width: `${(count / totalEvents) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.breakdownCount, { color: colors.mutedForeground }]}>
                {count}
              </Text>
            </View>
          ))}
        </View>

        {/* Top Events */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Events by Views</Text>
        <View style={[styles.topEventsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {topEvents.map((event, i) => (
            <View key={event.id}>
              <View style={styles.topEventRow}>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : colors.muted },
                  ]}
                >
                  <Text style={[styles.rankText, { color: i <= 1 ? "#FFF" : colors.mutedForeground }]}>
                    #{i + 1}
                  </Text>
                </View>
                <View style={styles.topEventInfo}>
                  <Text style={[styles.topEventTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <View style={styles.topEventMeta}>
                    <View
                      style={[
                        styles.viewBar,
                        {
                          backgroundColor: colors.primary,
                          width: `${(event.viewCount / maxViews) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.topEventStats}>
                  <Text style={[styles.viewCount, { color: colors.foreground }]}>
                    {event.viewCount}
                  </Text>
                  <Text style={[styles.viewsLabel, { color: colors.mutedForeground }]}>views</Text>
                </View>
              </View>
              {i < topEvents.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* Status Breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Workflow Pipeline
        </Text>
        <View style={[styles.pipelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Draft", count: drafts, color: "#94A3B8" },
            { label: "Submitted", count: events.filter((e) => e.status === "submitted").length, color: "#F59E0B" },
            { label: "Under Review", count: events.filter((e) => e.status === "under_review").length, color: "#3B82F6" },
            { label: "Approved", count: events.filter((e) => e.status === "approved").length, color: "#22C55E" },
            { label: "Published", count: published, color: "#4F46E5" },
          ].map((stage, i, arr) => (
            <React.Fragment key={stage.label}>
              <View style={styles.pipelineStage}>
                <View style={[styles.pipelineDot, { backgroundColor: stage.color }]}>
                  <Text style={styles.pipelineCount}>{stage.count}</Text>
                </View>
                <Text style={[styles.pipelineLabel, { color: colors.mutedForeground }]}>
                  {stage.label}
                </Text>
              </View>
              {i < arr.length - 1 && (
                <Feather name="arrow-right" size={16} color={colors.border} style={{ marginHorizontal: 4, marginTop: -14 }} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
  bg,
  colors,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  bg: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.kpiCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.kpiIcon, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.kpiValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{label}</Text>
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
  content: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12, marginTop: 8 },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: "44%",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiValue: { fontSize: 28, fontWeight: "800" },
  kpiLabel: { fontSize: 12 },
  engagementRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  engagementCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  engValue: { fontSize: 20, fontWeight: "800" },
  engLabel: { fontSize: 10, textAlign: "center" },
  breakdownCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  breakdownDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { fontSize: 13, fontWeight: "500", width: 80 },
  breakdownBarContainer: { flex: 1, height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" },
  breakdownBar: { height: 8, borderRadius: 4 },
  breakdownCount: { fontSize: 12, fontWeight: "600", width: 24, textAlign: "right" },
  topEventsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  topEventRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 12, fontWeight: "800" },
  topEventInfo: { flex: 1 },
  topEventTitle: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  topEventMeta: { height: 4, backgroundColor: "#F1F5F9", borderRadius: 2, overflow: "hidden" },
  viewBar: { height: 4, borderRadius: 2 },
  topEventStats: { alignItems: "flex-end" },
  viewCount: { fontSize: 16, fontWeight: "800" },
  viewsLabel: { fontSize: 10 },
  divider: { height: 1 },
  pipelineCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  pipelineStage: { alignItems: "center", gap: 6 },
  pipelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pipelineCount: { fontSize: 14, fontWeight: "800", color: "#FFF" },
  pipelineLabel: { fontSize: 10 },
});
