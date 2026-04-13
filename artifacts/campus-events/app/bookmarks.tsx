import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";

export default function BookmarksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, bookmarks } = useApp();

  const bookmarkedEvents = useMemo(() => {
    return events.filter((e) => bookmarks.includes(e.id) && e.status === "published");
  }, [events, bookmarks]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Feather name="bookmark" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.foreground }]}>
          Saved Events
        </Text>
      </View>

      {bookmarkedEvents.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Feather name="bookmark" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No saved events
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Tap the bookmark icon on any event to save it here
          </Text>
        </View>
      ) : (
        <View>
          {bookmarkedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    borderRadius: 16,
    marginTop: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});