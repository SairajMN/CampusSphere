import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { UserRole } from "@/types";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string; bg: string; icon: string }
> = {
  principal: {
    label: "Principal",
    color: "#7C3AED",
    bg: "#EDE9FE",
    icon: "shield",
  },
  hod: { label: "HOD", color: "#1D4ED8", bg: "#DBEAFE", icon: "briefcase" },
  staff: { label: "Staff", color: "#047857", bg: "#D1FAE5", icon: "user-check" },
  cr: { label: "Class CR", color: "#B45309", bg: "#FEF3C7", icon: "users" },
};

export default function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Feather name={cfg.icon as any} size={11} color={cfg.color} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  label: { fontSize: 11, fontWeight: "700" },
});
