import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useLogin } from "@workspace/api-client-react";
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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin({
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
        setError(err?.response?.data?.error || "Giriş başarısız");
      },
    },
  });

  const handleLogin = () => {
    setError("");
    if (!email || !password) {
      setError("E-posta ve şifre gerekli");
      return;
    }
    loginMutation.mutate({ data: { email, password } });
  };

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingTop: insets.top + 40,
      paddingBottom: insets.bottom + 24,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      alignSelf: "center",
    },
    logoText: {
      color: "#fff",
      fontSize: 32,
      fontFamily: "Inter_700Bold",
    },
    title: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 36,
      fontFamily: "Inter_400Regular",
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 6,
      marginTop: 16,
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
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Inter_700Bold",
    },
    linkRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
      gap: 4,
    },
    linkText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
    link: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logo}>
          <Text style={s.logoText}>?</Text>
        </View>
        <Text style={s.title}>Hoş Geldiniz</Text>
        <Text style={s.subtitle}>SoruÇöz'e giriş yapın</Text>

        <Text style={s.label}>E-posta</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="ornek@mail.com"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={s.label}>Şifre</Text>
        <TextInput
          style={s.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
        />

        {error ? (
          <View style={s.error}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [s.button, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.buttonText}>Giriş Yap</Text>
          )}
        </Pressable>

        <View style={s.linkRow}>
          <Text style={s.linkText}>Hesabınız yok mu?</Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={s.link}>Kayıt Ol</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
