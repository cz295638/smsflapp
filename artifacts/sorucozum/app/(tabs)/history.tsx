import { useColors } from "@/hooks/useColors";
import { getListQuestionsQueryKey, useListQuestions } from "@workspace/api-client-react";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Bekliyor", color: "#F59E0B", icon: "⏳" },
  claimed: { label: "Çözülüyor", color: "#3B82F6", icon: "✏️" },
  solved: { label: "Çözüldü", color: "#10B981", icon: "✅" },
};

export default function HistoryScreen() {
  const colors = useColors();
  const { data: questions, isLoading, refetch, isRefetching } = useListQuestions(
    {},
    { query: { queryKey: getListQuestionsQueryKey({}), refetchInterval: 20000 } },
  );

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      paddingTop: Platform.OS === "web" ? 67 : 0,
      paddingBottom: Platform.OS === "web" ? 84 : 60,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    list: { padding: 16, gap: 12 },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    subjectBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: colors.secondary,
    },
    subjectText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    timeText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    statusIcon: { fontSize: 16 },
    statusText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    viewBtn: {
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: colors.secondary,
    },
    viewBtnText: {
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },
    emptyIcon: { fontSize: 48, marginBottom: 8 },
    emptyText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
    },
  });

  if (isLoading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const sorted = (questions || []).slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <View style={s.container}>
      <View style={s.content}>
        <FlatList
          data={sorted}
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
            <View style={[s.center, { paddingTop: 80 }]}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyText}>Henüz soru göndermediniz</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <Pressable
                style={({ pressed }) => [s.card, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => {
                  if (item.status === "solved") {
                    router.push(`/solution/${item.id}`);
                  }
                }}
              >
                <View style={s.cardTop}>
                  <View style={s.subjectBadge}>
                    <Text style={s.subjectText}>{item.subject}</Text>
                  </View>
                  <Text style={s.timeText}>{timeAgo(item.createdAt)}</Text>
                </View>
                <View style={s.statusRow}>
                  <Text style={s.statusIcon}>{sc.icon}</Text>
                  <Text style={[s.statusText, { color: sc.color }]}>{sc.label}</Text>
                </View>
                {item.status === "solved" && (
                  <Pressable style={s.viewBtn} onPress={() => router.push(`/solution/${item.id}`)}>
                    <Text style={s.viewBtnText}>Çözümü Gör</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}
