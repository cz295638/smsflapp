import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getListQuestionsQueryKey, useClaimQuestion, useListQuestions } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "#F59E0B" },
  claimed: { label: "Çözülüyor", color: "#3B82F6" },
  solved: { label: "Çözüldü", color: "#10B981" },
};

export default function PoolScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const {
    data: questions,
    isLoading,
    refetch,
    isRefetching,
  } = useListQuestions(
    { subject: user?.subject || undefined },
    {
      query: {
        queryKey: getListQuestionsQueryKey({ subject: user?.subject || undefined }),
        refetchInterval: 15000,
      },
    },
  );

  const claimMutation = useClaimQuestion({
    mutation: {
      onSuccess: (data) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push(`/solve/${data.id}`);
      },
      onError: () => {
        Alert.alert("Hata", "Soru alınamadı, tekrar deneyin.");
      },
    },
  });

  const handleClaim = useCallback(
    (questionId: number, status: string) => {
      if (status === "solved") {
        Alert.alert("Çözüldü", "Bu soru zaten çözülmüş.");
        return;
      }
      if (status === "claimed") {
        router.push(`/solve/${questionId}`);
        return;
      }
      Alert.alert(
        "Soruyu Al",
        "Bu soruyu çözmek istiyor musunuz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Çözmeye Başla",
            onPress: () => claimMutation.mutate({ id: questionId }),
          },
        ],
      );
    },
    [claimMutation],
  );

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      paddingTop: Platform.OS === "web" ? 67 : 0,
      paddingBottom: Platform.OS === "web" ? 84 : 60,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      marginTop: 12,
    },
    emptyIcon: { fontSize: 48, marginBottom: 8 },
    list: { padding: 16, gap: 12 },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: colors.primary,
      fontFamily: "Inter_700Bold",
      fontSize: 15,
    },
    studentInfo: { flex: 1 },
    studentName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    studentSchool: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    timeText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    badgeRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 14,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
    },
    photoThumb: {
      height: 140,
      borderRadius: 10,
      backgroundColor: colors.muted,
      marginBottom: 14,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    photoIcon: { fontSize: 36, color: colors.mutedForeground },
    claimBtn: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    claimBtnText: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
    },
    sameSchoolBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#FFF7ED",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    sameSchoolText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: "#EA580C",
    },
  });

  if (isLoading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const pendingFirst = (questions || []).slice().sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    const aSchool = a.studentSchool === user?.school ? -1 : 0;
    const bSchool = b.studentSchool === user?.school ? -1 : 0;
    return aSchool - bSchool;
  });

  return (
    <View style={s.container}>
      <View style={s.content}>
        <FlatList
          data={pendingFirst}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptyText}>Şu an bekleyen soru yok</Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const isFromSameSchool = item.studentSchool === user?.school;

            return (
              <Pressable
                style={({ pressed }) => [s.card, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => handleClaim(item.id, item.status)}
              >
                <View style={s.cardHeader}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>
                      {item.studentName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={s.studentInfo}>
                    <Text style={s.studentName}>{item.studentName}</Text>
                    <Text style={s.studentSchool}>{item.studentSchool}</Text>
                  </View>
                  <Text style={s.timeText}>{timeAgo(item.createdAt)}</Text>
                </View>

                <View style={s.badgeRow}>
                  <View style={[s.badge, { backgroundColor: colors.secondary }]}>
                    <Text style={[s.badgeText, { color: colors.primary }]}>
                      {item.subject}
                    </Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: statusConf.color + "22" }]}>
                    <Text style={[s.badgeText, { color: statusConf.color }]}>
                      {statusConf.label}
                    </Text>
                  </View>
                  {isFromSameSchool && (
                    <View style={s.sameSchoolBadge}>
                      <Text style={s.sameSchoolText}>Okulunuzdan</Text>
                    </View>
                  )}
                </View>

                <View style={s.photoThumb}>
                  <Text style={s.photoIcon}>📄</Text>
                </View>

                <Pressable
                  style={[
                    s.claimBtn,
                    {
                      backgroundColor:
                        item.status === "solved"
                          ? colors.muted
                          : item.status === "claimed"
                          ? colors.secondary
                          : colors.primary,
                    },
                  ]}
                  onPress={() => handleClaim(item.id, item.status)}
                >
                  <Text
                    style={[
                      s.claimBtnText,
                      {
                        color:
                          item.status === "solved"
                            ? colors.mutedForeground
                            : item.status === "claimed"
                            ? colors.primary
                            : "#fff",
                      },
                    ]}
                  >
                    {item.status === "solved"
                      ? "Çözüldü"
                      : item.status === "claimed"
                      ? "Devam Et"
                      : "Çözmeye Başla"}
                  </Text>
                </Pressable>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}
