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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import RoleBadge from "@/components/RoleBadge";

export default function ProfileScreen() {
  const colors = useColors();
  const { currentUser, setCurrentUser, events } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const myCreatedEvents = events.filter((e) => e.organizerId === currentUser?.id);
  const myRegistered = events.filter((e) => e.isRegistered);

  const handleLogout = () => {
    const doLogout = async () => {
      try { await import("@/lib/api").then((m) => m.api.auth.logout()); } catch {}
      await setCurrentUser(null);
      router.replace("/login");
    };

    if (Platform.OS !== "web") {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: doLogout },
      ]);
    } else {
      doLogout();
    }
  };

  const MENU_ITEMS = [
    {
      icon: "calendar",
      label: "My Created Events",
      value: `${myCreatedEvents.length} events`,
      onPress: () => router.push("/admin/my-events"),
    },
    {
      icon: "bookmark",
      label: "Registered Events",
      value: `${myRegistered.length} events`,
      onPress: () => {},
    },
    ...(currentUser?.role === "hod" || currentUser?.role === "principal"
      ? [
          {
            icon: "check-square",
            label: "Pending Approvals",
            value: `${events.filter((e) => e.status === "submitted" || e.status === "under_review").length}`,
            onPress: () => router.push("/admin/approvals"),
          },
        ]
      : []),
    {
      icon: "bar-chart-2",
      label: "Analytics",
      value: "",
      onPress: () => router.push("/admin/analytics"),
    },
    {
      icon: "settings",
      label: "Settings",
      value: "",
      onPress: () => {},
    },
    {
      icon: "help-circle",
      label: "Help & Support",
      value: "",
      onPress: () => {},
    },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {currentUser?.name.split(" ").map((w) => w[0]).join("").slice(0, 2) ?? "?"}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {currentUser?.name ?? "—"}
        </Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>
          {currentUser?.email ?? "—"}
        </Text>
        <Text style={[styles.dept, { color: colors.mutedForeground }]}>
          {currentUser?.department}
          {currentUser?.year ? ` · Year ${currentUser.year}` : ""}
          {currentUser?.section ? `, Section ${currentUser.section}` : ""}
        </Text>
        {currentUser?.role && (
          <View style={styles.roleRow}>
            <RoleBadge role={currentUser.role} />
          </View>
        )}

        {/* Stats */}
        <View style={[styles.stats, { borderTopColor: colors.border }]}>
          <StatItem value={myCreatedEvents.length} label="Created" colors={colors} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatItem value={myRegistered.length} label="Registered" colors={colors} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatItem
            value={myCreatedEvents.reduce((sum, e) => sum + e.viewCount, 0)}
            label="Total Views"
            colors={colors}
          />
        </View>
      </View>

      {/* Menu */}
      <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MENU_ITEMS.map((item, i) => (
          <React.Fragment key={item.label}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                item.onPress();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.muted }]}>
                <Feather name={item.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <View style={styles.menuRight}>
                {item.value ? (
                  <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>
                    {item.value}
                  </Text>
                ) : null}
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
            </TouchableOpacity>
            {i < MENU_ITEMS.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30" }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatItem({
  value,
  label,
  colors,
}: {
  value: number;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16 },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#FFF" },
  name: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  email: { fontSize: 13, marginBottom: 4 },
  dept: { fontSize: 13, marginBottom: 10 },
  roleRow: { marginBottom: 16 },
  stats: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 16,
    width: "100%",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, alignSelf: "stretch" },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  menuValue: { fontSize: 13 },
  divider: { height: 1, marginLeft: 64 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  signOutText: { fontSize: 16, fontWeight: "700" },
});
