import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

const DEMO_ACCOUNTS = [
  {
    email: "principal@university.edu",
    name: "Dr. Sarah Mitchell",
    role: "Principal",
    dept: "Administration",
    color: "#7C3AED",
  },
  {
    email: "hod.cs@university.edu",
    name: "Prof. Rajesh Kumar",
    role: "HOD",
    dept: "Computer Science",
    color: "#0EA5E9",
  },
  {
    email: "staff.cs@university.edu",
    name: "Ms. Priya Sharma",
    role: "Staff",
    dept: "Computer Science",
    color: "#10B981",
  },
  {
    email: "cr.cs3a@university.edu",
    name: "Arjun Patel",
    role: "Class CR",
    dept: "CS – Year 3, Sec A",
    color: "#F59E0B",
  },
];

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setCurrentUser } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "demo">("login");

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await api.auth.login(email.trim(), password);
      await setCurrentUser(user);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError("");
    setLoading(true);
    try {
      const { user } = await api.auth.login(demoEmail, "password123");
      await setCurrentUser(user);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
    hero: { alignItems: "center", paddingTop: 52, paddingBottom: 36 },
    logoBox: {
      width: 76,
      height: 76,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    appName: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 6,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: 14,
      padding: 4,
      marginBottom: 28,
    },
    tab: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 11,
      alignItems: "center",
    },
    tabActive: {
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    tabTextActive: { color: colors.foreground },
    label: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: colors.border,
      marginBottom: 16,
      paddingHorizontal: 14,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    errorBox: {
      backgroundColor: "#FEF2F2",
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: "#FECACA",
    },
    errorText: {
      color: "#DC2626",
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      flex: 1,
    },
    loginBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 4,
    },
    loginBtnText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 22,
      gap: 12,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: {
      color: colors.mutedForeground,
      fontSize: 12,
      fontFamily: "Inter_400Regular",
    },
    hintBox: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    hintText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      lineHeight: 20,
    },
    hintBold: {
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    demoCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    demoAvatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    demoAvatarText: {
      color: "#fff",
      fontSize: 17,
      fontFamily: "Inter_700Bold",
    },
    demoName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    demoDept: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      marginLeft: "auto" as const,
    },
    badgeText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Feather name="calendar" size={38} color="#fff" />
            </View>
            <Text style={styles.appName}>CampusSphere</Text>
            <Text style={styles.tagline}>Manage · Approve · Publish</Text>
          </View>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, activeTab === "login" && styles.tabActive]}
              onPress={() => setActiveTab("login")}
            >
              <Text style={[styles.tabText, activeTab === "login" && styles.tabTextActive]}>
                Sign In
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "demo" && styles.tabActive]}
              onPress={() => setActiveTab("demo")}
            >
              <Text style={[styles.tabText, activeTab === "demo" && styles.tabTextActive]}>
                Demo Accounts
              </Text>
            </Pressable>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {activeTab === "login" ? (
            <>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputRow}>
                <Feather name="mail" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="you@university.edu"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Feather name="lock" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} style={{ padding: 4 }}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <TouchableOpacity
                style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or try a demo account</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  All demo accounts use password: <Text style={styles.hintBold}>password123</Text>
                </Text>
              </View>

              {DEMO_ACCOUNTS.map((acc) => (
                <DemoCard key={acc.email} acc={acc} onPress={() => handleDemoLogin(acc.email)} loading={loading} styles={styles} />
              ))}
            </>
          ) : (
            <>
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  Tap any account to sign in instantly.{"\n"}Password: <Text style={styles.hintBold}>password123</Text>
                </Text>
              </View>
              {DEMO_ACCOUNTS.map((acc) => (
                <DemoCard key={acc.email} acc={acc} onPress={() => handleDemoLogin(acc.email)} loading={loading} styles={styles} />
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DemoCard({
  acc,
  onPress,
  loading,
  styles,
}: {
  acc: (typeof DEMO_ACCOUNTS)[0];
  onPress: () => void;
  loading: boolean;
  styles: ReturnType<typeof StyleSheet.create>;
}) {
  return (
    <TouchableOpacity
      style={styles.demoCard}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.75}
    >
      <View style={[styles.demoAvatar, { backgroundColor: acc.color }]}>
        <Text style={styles.demoAvatarText}>{acc.name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.demoName}>{acc.name}</Text>
        <Text style={styles.demoDept}>{acc.dept}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: acc.color }]}>
        <Text style={styles.badgeText}>{acc.role}</Text>
      </View>
    </TouchableOpacity>
  );
}
