import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useRegister } from "@workspace/api-client-react";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUBJECTS = [
  "Matematik",
  "Geometri",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Türkçe",
  "Edebiyat",
  "Tarih",
  "Coğrafya",
  "İngilizce",
  "Felsefe",
  "Din Kültürü",
];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuth();
  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");

  const registerMutation = useRegister({
    mutation: {
      onSuccess: async (data) => {
        await setAuth(data.token, data.user as any);
        if (data.user.role === "teacher") {
          router.replace("/(tabs)/pool");
        } else {
          router.replace("/(tabs)");
        }
      },
      onError: (err: any) => {
        setError(err?.response?.data?.error || "Kayıt başarısız");
      },
    },
  });

  const handleRegister = () => {
    setError("");
    if (!name || !email || !password || !school) {
      setError("Tüm alanları doldurun");
      return;
    }
    if (!role) {
      setError("Rol seçin");
      return;
    }
    if (role === "teacher" && !subject) {
      setError("Branşınızı seçin");
      return;
    }
    registerMutation.mutate({
      data: { name, email, password, role, school, subject: subject || undefined },
    });
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: insets.top + 24,
      paddingBottom: insets.bottom + 24,
    },
    back: { marginBottom: 24 },
    backText: { color: colors.primary, fontSize: 15, fontFamily: "Inter_600SemiBold" },
    title: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 12,
    },
    roleRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
    roleCard: {
      flex: 1,
      padding: 18,
      borderRadius: colors.radius,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
    },
    roleCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
    },
    roleEmoji: { fontSize: 28, marginBottom: 8 },
    roleName: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    roleDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 4,
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 6,
      marginTop: 14,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: colors.radius - 2,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    subjectGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    subjectChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    subjectChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
    },
    subjectText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    subjectTextActive: { color: colors.primary },
    error: {
      backgroundColor: "#FEF2F2",
      borderRadius: 10,
      padding: 12,
      marginTop: 16,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 28,
    },
    buttonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
    linkRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
      gap: 4,
    },
    linkText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
    link: { color: colors.primary, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={s.back} onPress={() => router.back()}>
          <Text style={s.backText}>← Geri</Text>
        </Pressable>

        <Text style={s.title}>Hesap Oluştur</Text>
        <Text style={s.subtitle}>SoruÇöz'e katılın</Text>

        <Text style={s.sectionTitle}>Ben bir...</Text>
        <View style={s.roleRow}>
          <Pressable
            style={[s.roleCard, role === "student" && s.roleCardActive]}
            onPress={() => setRole("student")}
          >
            <Text style={s.roleEmoji}>📚</Text>
            <Text style={s.roleName}>Öğrenciyim</Text>
            <Text style={s.roleDesc}>Soru gönder, çözüm al</Text>
          </Pressable>
          <Pressable
            style={[s.roleCard, role === "teacher" && s.roleCardActive]}
            onPress={() => setRole("teacher")}
          >
            <Text style={s.roleEmoji}>👨‍🏫</Text>
            <Text style={s.roleName}>Öğretmenim</Text>
            <Text style={s.roleDesc}>Soruları çöz, öğrencilere yardım et</Text>
          </Pressable>
        </View>

        <Text style={s.label}>Ad Soyad</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="Adınız Soyadınız"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
        />

        <Text style={s.label}>E-posta</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="ornek@mail.com"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={s.label}>Şifre</Text>
        <TextInput
          style={s.input}
          value={password}
          onChangeText={setPassword}
          placeholder="En az 6 karakter"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
        />

        <Text style={s.label}>Okul</Text>
        <TextInput
          style={s.input}
          value={school}
          onChangeText={setSchool}
          placeholder="Örn: Atatürk Anadolu Lisesi"
          placeholderTextColor={colors.mutedForeground}
        />

        {role === "teacher" && (
          <>
            <Text style={s.label}>Branş</Text>
            <View style={s.subjectGrid}>
              {SUBJECTS.map((sub) => (
                <Pressable
                  key={sub}
                  style={[s.subjectChip, subject === sub && s.subjectChipActive]}
                  onPress={() => setSubject(sub)}
                >
                  <Text
                    style={[s.subjectText, subject === sub && s.subjectTextActive]}
                  >
                    {sub}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {error ? (
          <View style={s.error}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [s.button, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleRegister}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.buttonText}>Kayıt Ol</Text>
          )}
        </Pressable>

        <View style={s.linkRow}>
          <Text style={s.linkText}>Zaten hesabınız var mı?</Text>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={s.link}>Giriş Yap</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
