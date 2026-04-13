import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { EventStatus } from "@/types";

const CATEGORIES = ["Technical", "Academic", "Cultural", "Workshop", "Sports", "Talk", "Other"];
const DEPARTMENTS = ["All", "Computer Science", "Electronics", "Mechanical", "Civil", "MBA", "MCA"];
const STEPS = ["Details", "Target", "Settings", "Review"];

export default function CreateEventScreen() {
  const colors = useColors();
  const { currentUser, addEvent, refreshEvents, refreshNotifications } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(["All"]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [maxCapacity, setMaxCapacity] = useState("");
  const [fee, setFee] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [regDeadline, setRegDeadline] = useState("");
  const [tags, setTags] = useState("");
  const [includeAll, setIncludeAll] = useState(true);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const isStep0Valid = title.trim() && description.trim() && date && time && venue;
  const canNext = step === 0 ? !!isStep0Valid : true;

  const handleNext = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else router.back();
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const { event } = await api.events.create({
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        endTime: endTime || undefined,
        venue: venue.trim(),
        organizer: currentUser?.name ?? "Unknown",
        department: currentUser?.department ?? "Unknown",
        priority: "regular",
        category,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        target: {
          departments: includeAll ? [] : selectedDepts.filter((d) => d !== "All"),
          years: selectedYears,
          sections: [],
          includeAll,
        },
        registrationUrl: registrationUrl || undefined,
        registrationDeadline: regDeadline || undefined,
        fee: fee ? parseFloat(fee) : 0,
      });
      addEvent(event);
      await Promise.all([refreshEvents(), refreshNotifications()]);
    } catch (err) {
      // If API fails, still navigate away
    } finally {
      setSubmitting(false);
    }
    router.replace("/(tabs)");
  };

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
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Event</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      <View style={[styles.stepIndicator, { backgroundColor: colors.card }]}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    i < step
                      ? colors.success
                      : i === step
                      ? colors.primary
                      : colors.muted,
                },
              ]}
            >
              {i < step ? (
                <Feather name="check" size={12} color="#FFF" />
              ) : (
                <Text style={styles.stepDotText}>{i + 1}</Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                {
                  color: i === step ? colors.primary : colors.mutedForeground,
                  fontWeight: i === step ? "700" : "400",
                },
              ]}
            >
              {s}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Event Details</Text>

            <FormField label="Event Title *" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="e.g. Annual Hackathon 2026"
                placeholderTextColor={colors.mutedForeground}
                value={title}
                onChangeText={setTitle}
              />
            </FormField>

            <FormField label="Description *" colors={colors}>
              <TextInput
                style={[styles.textarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Describe the event, what attendees can expect..."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </FormField>

            <View style={styles.row}>
              <FormField label="Date *" colors={colors} style={styles.flex1}>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.mutedForeground}
                  value={date}
                  onChangeText={setDate}
                />
              </FormField>
              <FormField label="Start Time *" colors={colors} style={styles.flex1}>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.mutedForeground}
                  value={time}
                  onChangeText={setTime}
                />
              </FormField>
            </View>

            <FormField label="End Time" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="HH:MM (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={endTime}
                onChangeText={setEndTime}
              />
            </FormField>

            <FormField label="Venue *" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="e.g. Main Auditorium"
                placeholderTextColor={colors.mutedForeground}
                value={venue}
                onChangeText={setVenue}
              />
            </FormField>

            <FormField label="Category" colors={colors}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chips}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            category === cat ? colors.primary : colors.muted,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: category === cat ? "#FFF" : colors.mutedForeground },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </FormField>

            <FormField label="Tags (comma separated)" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="e.g. tech, hackathon, AI"
                placeholderTextColor={colors.mutedForeground}
                value={tags}
                onChangeText={setTags}
              />
            </FormField>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Target Audience</Text>

            <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>
                  Include All Students
                </Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                  Event visible to entire campus
                </Text>
              </View>
              <Switch
                value={includeAll}
                onValueChange={setIncludeAll}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>

            {!includeAll && (
              <>
                <FormField label="Departments" colors={colors}>
                  <View style={styles.multiSelect}>
                    {DEPARTMENTS.filter((d) => d !== "All").map((dept) => (
                      <TouchableOpacity
                        key={dept}
                        style={[
                          styles.multiChip,
                          {
                            backgroundColor: selectedDepts.includes(dept)
                              ? colors.primary
                              : colors.muted,
                            borderColor: selectedDepts.includes(dept)
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedDepts((prev) =>
                            prev.includes(dept)
                              ? prev.filter((d) => d !== dept)
                              : [...prev, dept]
                          );
                        }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: selectedDepts.includes(dept) ? "#FFF" : colors.mutedForeground },
                          ]}
                        >
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </FormField>

                <FormField label="Years" colors={colors}>
                  <View style={styles.yearsRow}>
                    {[1, 2, 3, 4].map((y) => (
                      <TouchableOpacity
                        key={y}
                        style={[
                          styles.yearBtn,
                          {
                            backgroundColor: selectedYears.includes(y)
                              ? colors.primary
                              : colors.muted,
                          },
                        ]}
                        onPress={() => {
                          setSelectedYears((prev) =>
                            prev.includes(y) ? prev.filter((yr) => yr !== y) : [...prev, y]
                          );
                        }}
                      >
                        <Text
                          style={[
                            styles.yearText,
                            { color: selectedYears.includes(y) ? "#FFF" : colors.mutedForeground },
                          ]}
                        >
                          Year {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </FormField>
              </>
            )}
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Settings</Text>

            <FormField label="Max Capacity" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="e.g. 200 (leave empty for unlimited)"
                placeholderTextColor={colors.mutedForeground}
                value={maxCapacity}
                onChangeText={setMaxCapacity}
                keyboardType="numeric"
              />
            </FormField>

            <FormField label="Entry Fee (₹)" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="0 for free events"
                placeholderTextColor={colors.mutedForeground}
                value={fee}
                onChangeText={setFee}
                keyboardType="numeric"
              />
            </FormField>

            <FormField label="Registration URL" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="https://forms.google.com/..."
                placeholderTextColor={colors.mutedForeground}
                value={registrationUrl}
                onChangeText={setRegistrationUrl}
                autoCapitalize="none"
              />
            </FormField>

            <FormField label="Registration Deadline" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.mutedForeground}
                value={regDeadline}
                onChangeText={setRegDeadline}
              />
            </FormField>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Submit</Text>

            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ReviewRow label="Title" value={title} colors={colors} />
              <ReviewRow label="Date" value={date} colors={colors} />
              <ReviewRow label="Time" value={`${time}${endTime ? ` – ${endTime}` : ""}`} colors={colors} />
              <ReviewRow label="Venue" value={venue} colors={colors} />
              <ReviewRow label="Category" value={category} colors={colors} />
              <ReviewRow label="Capacity" value={maxCapacity || "Unlimited"} colors={colors} />
              <ReviewRow label="Fee" value={fee ? `₹${fee}` : "Free"} colors={colors} />
              <ReviewRow
                label="Audience"
                value={
                  includeAll
                    ? "All students"
                    : selectedDepts.join(", ") || "No department selected"
                }
                colors={colors}
              />
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.primary + "30" }]}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>
                {currentUser?.role === "cr" || currentUser?.role === "staff"
                  ? "This event will be submitted for HOD/Principal review before publishing."
                  : "This event will be saved as a draft. You can submit it for approval later."}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
          },
        ]}
      >
        {step > 0 && (
          <TouchableOpacity
            style={[styles.navBackBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}
            onPress={handleBack}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
            <Text style={[styles.navBackText, { color: colors.foreground }]}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.navNextBtn,
            { backgroundColor: canNext ? colors.primary : colors.muted, flex: step > 0 ? 1 : undefined },
          ]}
          onPress={step === STEPS.length - 1 ? handleSubmit : handleNext}
          disabled={!canNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.navNextText, { color: canNext ? "#FFF" : colors.mutedForeground }]}>
            {step === STEPS.length - 1 ? "Submit Event" : "Continue"}
          </Text>
          <Feather
            name={step === STEPS.length - 1 ? "send" : "arrow-right"}
            size={18}
            color={canNext ? "#FFF" : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FormField({
  label,
  children,
  colors,
  style,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
  style?: object;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {children}
    </View>
  );
}

function ReviewRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.reviewRow}>
      <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.reviewValue, { color: colors.foreground }]} numberOfLines={1}>
        {value || "—"}
      </Text>
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
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  stepLabel: { fontSize: 10 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  stepContent: {},
  stepTitle: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
  },
  row: { flexDirection: "row", gap: 12 },
  flex1: { flex: 1 },
  chips: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "600" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  toggleLabel: { fontSize: 15, fontWeight: "600" },
  toggleSub: { fontSize: 12, marginTop: 2 },
  multiSelect: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  multiChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  yearsRow: { flexDirection: "row", gap: 8 },
  yearBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  yearText: { fontSize: 13, fontWeight: "600" },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  reviewLabel: { fontSize: 13, fontWeight: "600" },
  reviewValue: { fontSize: 13, flex: 1, textAlign: "right", marginLeft: 16 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: { fontSize: 13, flex: 1, lineHeight: 19 },
  bottomNav: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  navBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  navBackText: { fontSize: 15, fontWeight: "600" },
  navNextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    minWidth: 140,
  },
  navNextText: { fontSize: 15, fontWeight: "700" },
});
