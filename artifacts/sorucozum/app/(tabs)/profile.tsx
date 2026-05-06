import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useUpdateMyStatus } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();

  const statusMutation = useUpdateMyStatus({
    mutation: {
      onSuccess: (data) => {
        updateUser(data as any);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
  });

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkmak istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const isTeacher = user?.role === "teacher";
  const isAvailable = user?.status === "available";

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "web" ? 67 + 20 : 24,
      paddingBottom: Platform.OS === "web" ? 84 + 20 : insets.bottom + 80,
    },
    avatarContainer: {
      alignItems: "center",
      marginBottom: 28,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: isTeacher ? colors.success : colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    avatarText: {
      color: "#fff",
      fontSize: 36,
      fontFamily: "Inter_700Bold",
    },
    userName: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 4,
    },
    roleTag: {
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: isTeacher ? colors.teacherBg : colors.studentBg,
    },
    roleTagText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: isTeacher ? colors.teacherAccent : colors.studentAccent,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowIcon: { fontSize: 18, marginRight: 12, width: 26, textAlign: "center" },
    rowContent: { flex: 1 },
    rowLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 1,
    },
    rowValue: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    statusSection: {
      backgroundColor: isAvailable ? "#F0FDF4" : "#FFF7ED",
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: isAvailable ? "#BBF7D0" : "#FED7AA",
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    statusLeft: { flex: 1 },
    statusTitle: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: isAvailable ? "#065F46" : "#9A3412",
      marginBottom: 3,
    },
    statusDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: isAvailable ? "#059669" : "#EA580C",
    },
    logoutBtn: {
      backgroundColor: "#FEF2F2",
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: "#FECACA",
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
    },
    logoutBtnText: {
      color: colors.destructive,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
  });

  if (!user) return null;

  return (
    <View style={s.container}>
      <View style={s.content}>
        <View style={s.avatarContainer}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.userName}>{user.name}</Text>
          <View style={s.roleTag}>
            <Text style={s.roleTagText}>
              {isTeacher ? "Öğretmen" : "Öğrenci"}
            </Text>
          </View>
        </View>

        <View style={s.section}>
          <View style={s.row}>
            <Text style={s.rowIcon}>📧</Text>
            <View style={s.rowContent}>
              <Text style={s.rowLabel}>E-posta</Text>
              <Text style={s.rowValue}>{user.email}</Text>
            </View>
          </View>
          <View style={s.row}>
            <Text style={s.rowIcon}>🏫</Text>
            <View style={s.rowContent}>
              <Text style={s.rowLabel}>Okul</Text>
              <Text style={s.rowValue}>{user.school}</Text>
            </View>
          </View>
          {isTeacher && user.subject && (
            <View style={[s.row, s.rowLast]}>
              <Text style={s.rowIcon}>📚</Text>
              <View style={s.rowContent}>
                <Text style={s.rowLabel}>Branş</Text>
                <Text style={s.rowValue}>{user.subject}</Text>
              </View>
            </View>
          )}
        </View>

        {isTeacher && (
          <View style={s.statusSection}>
            <View style={s.statusLeft}>
              <Text style={s.statusTitle}>
                {isAvailable ? "Müsaitim" : "Dersteyim"}
              </Text>
              <Text style={s.statusDesc}>
                {isAvailable
                  ? "Yeni sorular alabilirsiniz"
                  : "Şu an soru alamazsınız"}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={(val) => {
                statusMutation.mutate({
                  data: { status: val ? "available" : "busy" },
                });
              }}
              trackColor={{ false: "#FED7AA", true: "#A7F3D0" }}
              thumbColor={isAvailable ? colors.success : "#EA580C"}
            />
          </View>
        )}

        <Pressable
          style={({ pressed }) => [s.logoutBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleLogout}
        >
          <Text style={s.logoutBtnText}>Çıkış Yap</Text>
        </Pressable>
      </View>
    </View>
  );
}
