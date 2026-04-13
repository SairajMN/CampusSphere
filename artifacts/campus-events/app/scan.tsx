import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ScanResult, Event } from "@/types";

const SCAN_STAGES = [
  { icon: "image", label: "Extracting text from image..." },
  { icon: "search", label: "Detecting event fields..." },
  { icon: "check-circle", label: "Generating draft..." },
];

const MOCK_SCAN_RESULTS: ScanResult = {
  title: "National Level Hackathon",
  date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  time: "09:00",
  venue: "Main Auditorium",
  organizer: "Coding Club",
  description: "48-hour hackathon for students across all departments. Build innovative solutions. Prize pool: ₹50,000.",
  registrationUrl: "https://forms.google.com/hacakthon2026",
  confidence: {
    title: 0.97,
    date: 0.89,
    time: 0.92,
    venue: 0.85,
    organizer: 0.78,
    description: 0.71,
    registrationUrl: 0.95,
  },
};

export default function ScanScreen() {
  const colors = useColors();
  const { currentUser, addEvent } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<"idle" | "scanning" | "review" | "done">("idle");
  const [scanStage, setScanStage] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [editedTime, setEditedTime] = useState("");
  const [editedVenue, setEditedVenue] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const simulateScan = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase("scanning");
    setScanStage(0);

    for (let i = 0; i < SCAN_STAGES.length; i++) {
      await new Promise((r) => setTimeout(r, 900));
      setScanStage(i + 1);
    }

    await new Promise((r) => setTimeout(r, 400));
    setResult(MOCK_SCAN_RESULTS);
    setEditedTitle(MOCK_SCAN_RESULTS.title ?? "");
    setEditedDate(MOCK_SCAN_RESULTS.date ?? "");
    setEditedTime(MOCK_SCAN_RESULTS.time ?? "");
    setEditedVenue(MOCK_SCAN_RESULTS.venue ?? "");
    setEditedDescription(MOCK_SCAN_RESULTS.description ?? "");
    setPhase("review");
  };

  const handleSaveDraft = () => {
    if (!result) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const event: Event = {
      id: Date.now().toString(),
      title: editedTitle || "Untitled Event",
      description: editedDescription,
      date: editedDate,
      time: editedTime,
      venue: editedVenue,
      organizer: currentUser?.name ?? "Unknown",
      organizerId: currentUser?.id ?? "unknown",
      department: currentUser?.department ?? "Unknown",
      status: "draft",
      priority: "regular",
      category: "Technical",
      maxCapacity: undefined,
      registeredCount: 0,
      tags: ["scanned"],
      attachments: [],
      target: { departments: [], years: [], sections: [], includeAll: true },
      registrationUrl: result.registrationUrl,
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      isRegistered: false,
    };

    addEvent(event);
    setPhase("done");
  };

  const confidenceColor = (c: number) => {
    if (c >= 0.9) return "#22C55E";
    if (c >= 0.75) return "#F59E0B";
    return "#EF4444";
  };

  const confidenceLabel = (c: number) => {
    if (c >= 0.9) return "High";
    if (c >= 0.75) return "Medium";
    return "Low";
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Poster Scanner
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {phase === "idle" && (
          <View style={styles.idleSection}>
            <View style={[styles.scanIllustration, { backgroundColor: colors.secondary }]}>
              <View style={[styles.scanFrame, { borderColor: colors.primary }]}>
                <Feather name="image" size={48} color={colors.primary} />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              AI-Powered Poster Scanner
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
              Point your camera at an event poster or upload an image. Our AI will extract event
              details automatically and create a draft for you to review.
            </Text>

            <View style={styles.featureList}>
              {[
                { icon: "zap", label: "3-Stage OCR Processing" },
                { icon: "shield", label: "Confidence Scoring" },
                { icon: "edit-3", label: "Manual Override" },
                { icon: "lock", label: "Always Creates Draft" },
              ].map((f) => (
                <View key={f.label} style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.featureIcon, { backgroundColor: colors.secondary }]}>
                    <Feather name={f.icon as any} size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.featureLabel, { color: colors.foreground }]}>{f.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
                onPress={simulateScan}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={20} color="#FFF" />
                <Text style={styles.uploadBtnText}>Scan with Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadBtnOutline, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={simulateScan}
                activeOpacity={0.8}
              >
                <Feather name="upload" size={18} color={colors.foreground} />
                <Text style={[styles.uploadBtnOutlineText, { color: colors.foreground }]}>
                  Upload Image
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === "scanning" && (
          <View style={styles.scanningSection}>
            <View style={[styles.scanningAnimation, { backgroundColor: colors.secondary }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={[styles.scanningTitle, { color: colors.foreground }]}>
              Analyzing Poster...
            </Text>
            <View style={styles.stageList}>
              {SCAN_STAGES.map((stage, i) => (
                <View key={stage.label} style={styles.stageItem}>
                  <View
                    style={[
                      styles.stageDot,
                      {
                        backgroundColor:
                          i < scanStage
                            ? "#22C55E"
                            : i === scanStage
                            ? colors.primary
                            : colors.muted,
                      },
                    ]}
                  >
                    {i < scanStage ? (
                      <Feather name="check" size={12} color="#FFF" />
                    ) : i === scanStage ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Feather name={stage.icon as any} size={12} color={colors.mutedForeground} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stageLabel,
                      {
                        color:
                          i < scanStage
                            ? "#22C55E"
                            : i === scanStage
                            ? colors.primary
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {stage.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {phase === "review" && result && (
          <View>
            <View style={[styles.successBanner, { backgroundColor: "#D1FAE5" }]}>
              <Feather name="check-circle" size={20} color="#059669" />
              <Text style={[styles.successText, { color: "#059669" }]}>
                Poster analyzed! Review and edit the extracted fields.
              </Text>
            </View>

            <Text style={[styles.reviewTitle, { color: colors.foreground }]}>
              Extracted Data
            </Text>
            <Text style={[styles.reviewSub, { color: colors.mutedForeground }]}>
              Fields are editable. Confidence scores show extraction accuracy.
            </Text>

            {[
              { key: "title", label: "Event Title", value: editedTitle, setter: setEditedTitle },
              { key: "date", label: "Date", value: editedDate, setter: setEditedDate },
              { key: "time", label: "Time", value: editedTime, setter: setEditedTime },
              { key: "venue", label: "Venue", value: editedVenue, setter: setEditedVenue },
            ].map((field) => (
              <View key={field.key} style={[styles.extractedField, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.extractedHeader}>
                  <Text style={[styles.extractedLabel, { color: colors.mutedForeground }]}>
                    {field.label}
                  </Text>
                  {result.confidence[field.key] != null && (
                    <View
                      style={[
                        styles.confidenceBadge,
                        { backgroundColor: confidenceColor(result.confidence[field.key]) + "20" },
                      ]}
                    >
                      <View
                        style={[
                          styles.confDot,
                          { backgroundColor: confidenceColor(result.confidence[field.key]) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.confText,
                          { color: confidenceColor(result.confidence[field.key]) },
                        ]}
                      >
                        {confidenceLabel(result.confidence[field.key])} (
                        {Math.round(result.confidence[field.key] * 100)}%)
                      </Text>
                    </View>
                  )}
                </View>
                <TextInput
                  style={[styles.extractedInput, { color: colors.foreground, borderColor: colors.border }]}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            ))}

            <View style={[styles.extractedField, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.extractedHeader}>
                <Text style={[styles.extractedLabel, { color: colors.mutedForeground }]}>
                  Description
                </Text>
                {result.confidence.description != null && (
                  <View
                    style={[
                      styles.confidenceBadge,
                      { backgroundColor: confidenceColor(result.confidence.description) + "20" },
                    ]}
                  >
                    <View
                      style={[
                        styles.confDot,
                        { backgroundColor: confidenceColor(result.confidence.description) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.confText,
                        { color: confidenceColor(result.confidence.description) },
                      ]}
                    >
                      {confidenceLabel(result.confidence.description)} (
                      {Math.round(result.confidence.description * 100)}%)
                    </Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[styles.extractedTextarea, { color: colors.foreground, borderColor: colors.border }]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Event description..."
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View style={[styles.draftNotice, { backgroundColor: colors.secondary, borderColor: colors.primary + "30" }]}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.draftNoticeText, { color: colors.primary }]}>
                This will be saved as a DRAFT. It will never be auto-published. You can submit it for review after saving.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveDraftBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveDraft}
              activeOpacity={0.8}
            >
              <Feather name="save" size={18} color="#FFF" />
              <Text style={styles.saveDraftText}>Save as Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.discardBtn, { borderColor: colors.border }]}
              onPress={() => setPhase("idle")}
              activeOpacity={0.8}
            >
              <Text style={[styles.discardText, { color: colors.mutedForeground }]}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === "done" && (
          <View style={styles.doneSection}>
            <View style={[styles.doneIcon, { backgroundColor: "#D1FAE5" }]}>
              <Feather name="check-circle" size={48} color="#059669" />
            </View>
            <Text style={[styles.doneTitle, { color: colors.foreground }]}>
              Draft Saved!
            </Text>
            <Text style={[styles.doneDesc, { color: colors.mutedForeground }]}>
              Your event draft has been created. Go to your profile to view and submit it for review.
            </Text>
            <TouchableOpacity
              style={[styles.goHomeBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.replace("/(tabs)")}
              activeOpacity={0.8}
            >
              <Text style={styles.goHomeBtnText}>Back to Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scanAgainBtn, { borderColor: colors.border }]}
              onPress={() => setPhase("idle")}
              activeOpacity={0.8}
            >
              <Text style={[styles.scanAgainText, { color: colors.foreground }]}>Scan Another</Text>
            </TouchableOpacity>
          </View>
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
  content: { paddingHorizontal: 16, paddingTop: 20 },
  idleSection: { alignItems: "center" },
  scanIllustration: {
    width: 160,
    height: 160,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  scanFrame: {
    width: 120,
    height: 120,
    borderWidth: 3,
    borderRadius: 12,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  sectionDesc: { fontSize: 14, textAlign: "center", lineHeight: 21, marginBottom: 24 },
  featureList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
    justifyContent: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: { fontSize: 13, fontWeight: "600" },
  uploadOptions: { width: "100%", gap: 10 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
  },
  uploadBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  uploadBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  uploadBtnOutlineText: { fontSize: 16, fontWeight: "600" },
  scanningSection: { alignItems: "center", paddingTop: 40, gap: 16 },
  scanningAnimation: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  scanningTitle: { fontSize: 22, fontWeight: "800" },
  stageList: { width: "100%", gap: 12, marginTop: 16 },
  stageItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  stageDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stageLabel: { fontSize: 14, fontWeight: "500" },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  successText: { fontSize: 14, fontWeight: "600", flex: 1 },
  reviewTitle: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  reviewSub: { fontSize: 13, marginBottom: 16 },
  extractedField: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  extractedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  extractedLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  confDot: { width: 6, height: 6, borderRadius: 3 },
  confText: { fontSize: 10, fontWeight: "700" },
  extractedInput: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  extractedTextarea: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 80,
  },
  draftNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  draftNoticeText: { fontSize: 13, flex: 1, lineHeight: 19 },
  saveDraftBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  saveDraftText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  discardBtn: {
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  discardText: { fontSize: 14, fontWeight: "600" },
  doneSection: { alignItems: "center", paddingTop: 40, gap: 12 },
  doneIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  doneTitle: { fontSize: 26, fontWeight: "800" },
  doneDesc: { fontSize: 14, textAlign: "center", lineHeight: 21, paddingHorizontal: 16 },
  goHomeBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  goHomeBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  scanAgainBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
  },
  scanAgainText: { fontSize: 16, fontWeight: "600" },
});
