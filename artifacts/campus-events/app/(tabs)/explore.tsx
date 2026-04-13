import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";

const SORT_OPTIONS = ["Date", "Popularity", "Capacity"];
const STATUS_FILTERS = ["All", "Published", "Upcoming"] as const;

export default function ExploreScreen() {
  const colors = useColors();
  const { events } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Date");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = useMemo(() => {
    let list = events.filter(
      (e) => e.status === "published" || e.status === "approved"
    );

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "Date") {
      list = [...list].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (sortBy === "Popularity") {
      list = [...list].sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortBy === "Capacity") {
      list = [...list].sort((a, b) => b.registeredCount - a.registeredCount);
    }

    return list;
  }, [events, search, sortBy, statusFilter]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPad + 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Explore Events</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {filtered.length} events available
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search events, venues, tags..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.mutedForeground }]}>Sort:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        sortBy === opt ? colors.primary : colors.muted,
                    },
                  ]}
                  onPress={() => setSortBy(opt)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: sortBy === opt ? "#FFF" : colors.mutedForeground },
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.muted }]}>
            <Feather name="search" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No events found
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try different keywords or filters
            </Text>
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
  content: { paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  filterLabel: { fontSize: 13, fontWeight: "600" },
  chips: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "600" },
  empty: {
    alignItems: "center",
    padding: 48,
    borderRadius: 16,
    gap: 8,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
