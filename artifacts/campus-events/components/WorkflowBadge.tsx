import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { EventStatus } from "@/types";

const STEPS: { key: EventStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "published", label: "Published" },
];

const STATUS_INDEX: Record<EventStatus, number> = {
  draft: 0,
  submitted: 1,
  under_review: 2,
  approved: 3,
  published: 4,
  archived: 4,
};

export default function WorkflowBadge({ status }: { status: EventStatus }) {
  const currentIdx = STATUS_INDEX[status];

  return (
    <View style={styles.container}>
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isLast = i === STEPS.length - 1;

        return (
          <View key={step.key} style={styles.stepWrapper}>
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                {isCompleted ? (
                  <Feather name="check" size={10} color="#fff" />
                ) : (
                  <View
                    style={[
                      styles.dotInner,
                      isCurrent && styles.dotInnerCurrent,
                    ]}
                  />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.label,
                isCompleted && styles.labelCompleted,
                isCurrent && styles.labelCurrent,
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  stepWrapper: {
    flex: 1,
    alignItems: "flex-start",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  dotCompleted: {
    backgroundColor: "#4F46E5",
  },
  dotCurrent: {
    backgroundColor: "#4F46E5",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#94A3B8",
  },
  dotInnerCurrent: {
    backgroundColor: "#fff",
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: -2,
  },
  lineCompleted: {
    backgroundColor: "#4F46E5",
  },
  label: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "500",
  },
  labelCompleted: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  labelCurrent: {
    color: "#4F46E5",
    fontWeight: "700",
  },
});
