import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarScreen() {
  const colors = useColors();
  const { events } = useApp();
  const insets = useSafeAreaInsets();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split("T")[0]
  );

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {};
    events
      .filter((e) => e.status === "published" || e.status === "approved")
      .forEach((e) => {
        if (!map[e.date]) map[e.date] = [];
        map[e.date].push(e);
      });
    return map;
  }, [events]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);

  const selectedEvents = eventsByDate[selectedDate] ?? [];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

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
      <Text style={[styles.title, { color: colors.foreground }]}>Calendar</Text>

      {/* Month Navigator */}
      <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.foreground }]}>
            {MONTHS[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
            <Feather name="chevron-right" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map((d) => (
            <View key={d} style={styles.dayHeader}>
              <Text style={[styles.dayHeaderText, { color: colors.mutedForeground }]}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasEvents = !!eventsByDate[dateStr];
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();
            const isSelected = dateStr === selectedDate;

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: colors.primary },
                  isToday && !isSelected && { borderWidth: 2, borderColor: colors.primary, borderRadius: 20 },
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isSelected ? "#FFF" : isToday ? colors.primary : colors.foreground },
                    isSelected && { fontWeight: "800" },
                  ]}
                >
                  {day}
                </Text>
                {hasEvents && (
                  <View
                    style={[
                      styles.eventDot,
                      { backgroundColor: isSelected ? "#FFF" : colors.accent },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Date Events */}
      <View style={styles.eventsSection}>
        <Text style={[styles.dateLabel, { color: colors.foreground }]}>
          {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>

        {selectedEvents.length === 0 ? (
          <View style={[styles.noEvents, { backgroundColor: colors.muted }]}>
            <Feather name="calendar" size={28} color={colors.mutedForeground} />
            <Text style={[styles.noEventsText, { color: colors.mutedForeground }]}>
              No events on this day
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.eventCount, { color: colors.mutedForeground }]}>
              {selectedEvents.length} event{selectedEvents.length > 1 ? "s" : ""}
            </Text>
            {selectedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 16 },
  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navBtn: { padding: 8 },
  monthLabel: { fontSize: 18, fontWeight: "800" },
  dayHeaders: { flexDirection: "row", marginBottom: 8 },
  dayHeader: { flex: 1, alignItems: "center" },
  dayHeaderText: { fontSize: 12, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  dayText: { fontSize: 14 },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  eventsSection: {},
  dateLabel: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  eventCount: { fontSize: 13, marginBottom: 12 },
  noEvents: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    gap: 8,
  },
  noEventsText: { fontSize: 14 },
});
