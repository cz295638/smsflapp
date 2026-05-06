import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: true,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { fontFamily: "Inter_700Bold", color: colors.foreground },
        headerShadowVisible: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 60,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          marginBottom: isWeb ? 16 : 4,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Soru Sor",
          tabBarStyle: isTeacher
            ? { display: "none" }
            : {
                position: "absolute",
                backgroundColor: isIOS ? "transparent" : colors.card,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                elevation: 0,
                height: isWeb ? 84 : 60,
              },
          tabBarButton: isTeacher ? () => null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
          headerTitle: "Soru Sor",
        }}
      />
      <Tabs.Screen
        name="pool"
        options={{
          title: "Sorular",
          tabBarButton: !isTeacher ? () => null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Feather name="inbox" size={size} color={color} />
          ),
          headerTitle: "Soru Havuzu",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Geçmişim",
          tabBarButton: isTeacher ? () => null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color} />
          ),
          headerTitle: "Sorularım",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
          headerTitle: "Profilim",
        }}
      />
    </Tabs>
  );
}
