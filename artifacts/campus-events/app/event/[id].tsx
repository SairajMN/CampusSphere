import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import WorkflowBadge from "@/components/WorkflowBadge";

export default function EventDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, currentUser, registerForEvent, updateEventStatus } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canApprove =
    currentUser?.role === "hod" || currentUser?.role === "principal";
  const canEdit =
    currentUser?.id === event.organizerId || currentUser?.role === "principal";

  const spotsLeft =
    event.maxCapacity != null ? event.maxCapacity - event.registeredCount : null;

  const handleRegister = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    registerForEvent(event.id);
  };

  const handleApprove = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateEventStatus(event.id, "approved");
  };

  const handlePublish = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateEventStatus(event.id, "published");
  };

  const handleReject = () => {
    updateEventStatus(event.id, "draft", "Needs revision");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 8,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color={colors.foreground} />
        <Text style={[styles.backText, { color: colors.foreground }]}>Back</Text>
      </TouchableOpacity>

      {/* Category & Priority */}
      <View style={styles.topRow}>
        <View style={[styles.catChip, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.catText, { color: colors.primary }]}>{event.category}</Text>
        </View>
        {event.priority === "urgent" && (
          <View style={[styles.urgentChip, { backgroundColor: "#FEE2E2" }]}>
            <Feather name="zap" size={11} color="#DC2626" />
            <Text style={[styles.urgentText, { color: "#DC2626" }]}>URGENT</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.foreground }]}>{event.title}</Text>

      {/* Organizer */}
      <View style={styles.organizerRow}>
        <View style={[styles.organizerAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.organizerAvatarText}>
            {event.organizer.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </Text>
        </View>
        <View>
          <Text style={[styles.organizerName, { color: colors.foreground }]}>
            {event.organizer}
          </Text>
          <Text style={[styles.organizerDept, { color: colors.mutedForeground }]}>
            {event.department}
          </Text>
        </View>
      </View>

      {/* Workflow */}
      <View style={[styles.workflowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.workflowLabel, { color: colors.mutedForeground }]}>
          Approval Status
        </Text>
        <WorkflowBadge status={event.status} />
      </View>

      {/* Details Card */}
      <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <DetailRow icon="calendar" label="Date" value={formatDate(event.date)} colors={colors} />
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
        <DetailRow
          icon="clock"
          label="Time"
          value={`${event.time}${event.endTime ? ` – ${event.endTime}` : ""}`}
          colors={colors}
        />
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
        <DetailRow icon="map-pin" label="Venue" value={event.venue} colors={colors} />
        {event.registrationDeadline && (
          <>
            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
            <DetailRow
              icon="alert-circle"
              label="Reg. Deadline"
              value={new Date(event.registrationDeadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              colors={colors}
              valueColor="#DC2626"
            />
          </>
        )}
        {event.fee !== undefined && event.fee > 0 && (
          <>
            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
            <DetailRow
              icon="credit-card"
              label="Entry Fee"
              value={`₹${event.fee}`}
              colors={colors}
            />
          </>
        )}
        {event.maxCapacity && (
          <>
            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
            <DetailRow
              icon="users"
              label="Capacity"
              value={`${event.registeredCount} / ${event.maxCapacity} registered`}
              colors={colors}
              valueColor={spotsLeft !== null && spotsLeft <= 5 ? "#DC2626" : undefined}
            />
          </>
        )}
      </View>

      {/* Description */}
      <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.descLabel, { color: colors.mutedForeground }]}>About</Text>
        <Text style={[styles.description, { color: colors.foreground }]}>
          {event.description}
        </Text>
      </View>

      {/* Tags */}
      {event.tags.length > 0 && (
        <View style={styles.tagsSection}>
          {event.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="eye" size={16} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>{event.viewCount}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Views</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="users" size={16} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>{event.registeredCount}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Registered</Text>
        </View>
        {event.maxCapacity && (
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="percent" size={16} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {Math.round((event.registeredCount / event.maxCapacity) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Fill Rate</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {event.status === "published" && (
        <TouchableOpacity
          style={[
            styles.registerBtn,
            {
              backgroundColor: event.isRegistered ? colors.muted : colors.primary,
              borderColor: event.isRegistered ? colors.border : colors.primary,
            },
          ]}
          onPress={handleRegister}
          disabled={spotsLeft !== null && spotsLeft <= 0 && !event.isRegistered}
          activeOpacity={0.8}
        >
          <Feather
            name={event.isRegistered ? "check-circle" : "user-plus"}
            size={18}
            color={event.isRegistered ? colors.foreground : "#FFF"}
          />
          <Text
            style={[
              styles.registerBtnText,
              { color: event.isRegistered ? colors.foreground : "#FFF" },
            ]}
          >
            {event.isRegistered
              ? "Registered"
              : spotsLeft !== null && spotsLeft <= 0
              ? "Event Full"
              : "Register Now"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Admin Approval Actions */}
      {canApprove &&
        (event.status === "submitted" || event.status === "under_review") && (
          <View style={styles.adminActions}>
            <Text style={[styles.adminLabel, { color: colors.mutedForeground }]}>
              Admin Actions
            </Text>
            <View style={styles.adminBtns}>
              <TouchableOpacity
                style={[styles.rejectBtn, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}
                onPress={handleReject}
                activeOpacity={0.8}
              >
                <Feather name="x-circle" size={16} color="#DC2626" />
                <Text style={[styles.adminBtnText, { color: "#DC2626" }]}>Request Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.approveBtn, { backgroundColor: "#D1FAE5", borderColor: "#6EE7B7" }]}
                onPress={handleApprove}
                activeOpacity={0.8}
              >
                <Feather name="check-circle" size={16} color="#059669" />
                <Text style={[styles.adminBtnText, { color: "#059669" }]}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      {canApprove && event.status === "approved" && (
        <View style={styles.adminActions}>
          <Text style={[styles.adminLabel, { color: colors.mutedForeground }]}>
            Admin Actions
          </Text>
          <TouchableOpacity
            style={[styles.publishBtn, { backgroundColor: colors.primary }]}
            onPress={handlePublish}
            activeOpacity={0.8}
          >
            <Feather name="send" size={16} color="#FFF" />
            <Text style={styles.publishBtnText}>Publish Event</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon as any} size={16} color={colors.primary} />
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: valueColor ?? colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: { fontSize: 18, fontWeight: "700" },
  backLink: { fontSize: 15, fontWeight: "600" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: "600" },
  topRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  catChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  catText: { fontSize: 12, fontWeight: "700" },
  urgentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  urgentText: { fontSize: 11, fontWeight: "800" },
  title: { fontSize: 26, fontWeight: "800", lineHeight: 34, marginBottom: 14 },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  organizerAvatarText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  organizerName: { fontSize: 14, fontWeight: "700" },
  organizerDept: { fontSize: 12 },
  workflowCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  workflowLabel: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", marginBottom: 1 },
  detailValue: { fontSize: 14, fontWeight: "600" },
  rowDivider: { height: 1 },
  descCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  descLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 23 },
  tagsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tagText: { fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11 },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  registerBtnText: { fontSize: 16, fontWeight: "700" },
  adminActions: { marginBottom: 12 },
  adminLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  adminBtns: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  adminBtnText: { fontSize: 14, fontWeight: "700" },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
  },
  publishBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
});
