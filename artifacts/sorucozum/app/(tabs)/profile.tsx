import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useUpdateMyAvatar, useUpdateMyStatus } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const [avatarLoading, setAvatarLoading] = useState(false);

  const statusMutation = useUpdateMyStatus({
    mutation: {
      onSuccess: (data) => {
        updateUser(data as any);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
  });

  const avatarMutation = useUpdateMyAvatar({
    mutation: {
      onSuccess: (data) => {
        updateUser(data as any);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setAvatarLoading(false);
      },
      onError: () => {
        setAvatarLoading(false);
        Alert.alert("Hata", "Fotoğraf yüklenemedi, tekrar deneyin.");
      },
    },
  });

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri iznine ihtiyaç var.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setAvatarLoading(true);
      const { base64, mimeType } = result.assets[0];
      avatarMutation.mutate({
        data: { avatarData: `data:${mimeType || "image/jpeg"};base64,${base64}` },
      });
    }
  };

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
    avatarWrapper: {
      position: "relative",
      marginBottom: 12,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: isTeacher ? colors.success : colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarImage: {
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    avatarEditBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    avatarEditIcon: { fontSize: 14 },
    avatarLoading: {
      position: "absolute",
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: "#fff",
      fontSize: 38,
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
      marginBottom: 6,
    },
    roleTagText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: isTeacher ? colors.teacherAccent : colors.studentAccent,
    },
    changePhotoText: {
      color: colors.primary,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
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
    rowLast: { borderBottomWidth: 0 },
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
          <Pressable style={s.avatarWrapper} onPress={handlePickPhoto}>
            {user.avatarData ? (
              <Image source={{ uri: user.avatarData }} style={s.avatarImage} />
            ) : (
              <View style={s.avatar}>
                <Text style={s.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            {avatarLoading && (
              <View style={s.avatarLoading}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            <View style={s.avatarEditBadge}>
              <Text style={s.avatarEditIcon}>📷</Text>
            </View>
          </Pressable>
          <Text style={s.userName}>{user.name}</Text>
          <View style={s.roleTag}>
            <Text style={s.roleTagText}>{isTeacher ? "Öğretmen" : "Öğrenci"}</Text>
          </View>
          <Pressable onPress={handlePickPhoto}>
            <Text style={s.changePhotoText}>Fotoğrafı Değiştir</Text>
          </Pressable>
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
