import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function IndexScreen() {
  // 1. Önce Context'in varlığını kontrol ediyoruz (Hata almamak için)
  // Eğer AuthProvider henüz yüklenmediyse useAuth() hata fırlatır.
  // Bu yüzden içeriği bir kontrol mekanizmasına alıyoruz.
  
  let auth;
  try {
    auth = useAuth();
  } catch (e) {
    // Eğer Provider henüz hazır değilse yükleme ekranı göster
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F7FA" }}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  const { user, isLoading } = auth;

  // 2. Veriler yüklenirken bekle
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F7FA" }}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  // 3. Kullanıcı yoksa Login'e gönder
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // 4. Kullanıcı varsa rolüne göre yönlendir
  if (user.role === "teacher") {
    return <Redirect href="/(tabs)/pool" />;
  }

  return <Redirect href="/(tabs)" />;
}