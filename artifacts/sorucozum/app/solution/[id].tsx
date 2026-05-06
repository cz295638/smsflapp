import AudioPlayer from "@/components/AudioPlayer";
import { useColors } from "@/hooks/useColors";
import { useGetQuestion } from "@workspace/api-client-react";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path, Image as SvgImage } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PathData {
  d: string;
  color: string;
  width: number;
}

export default function SolutionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"photo" | "solution">("solution");

  const { data, isLoading } = useGetQuestion(Number(id));

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      margin: 12,
      borderRadius: 10,
      padding: 3,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 8,
    },
    tabActive: {
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    tabText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    tabTextActive: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    imageArea: {
      flex: 1,
      margin: 12,
      marginTop: 0,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    image: { width: "100%", height: "100%" },
    svgContainer: {
      flex: 1,
      margin: 12,
      marginTop: 0,
      borderRadius: colors.radius,
      overflow: "hidden",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: colors.border,
    },
    teacherInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      backgroundColor: colors.teacherBg,
      borderBottomWidth: 1,
      borderBottomColor: "#BBF7D0",
    },
    teacherAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.success,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    teacherAvatarText: {
      color: "#fff",
      fontFamily: "Inter_700Bold",
      fontSize: 15,
    },
    teacherName: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#065F46",
    },
    teacherLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "#059669",
    },
    solvedBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "#D1FAE5",
    },
    solvedText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#065F46",
    },
    bottomCards: {
      paddingHorizontal: 12,
      paddingBottom: insets.bottom + 12,
      gap: 8,
    },
    noteCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    noteLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    noteText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 20,
    },
    noSolution: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    noSolutionIcon: { fontSize: 48 },
    noSolutionText: {
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
  });

  if (isLoading || !data) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { question, solution } = data;

  if (!solution) {
    return (
      <View style={s.container}>
        <View style={s.noSolution}>
          <Text style={s.noSolutionIcon}>⏳</Text>
          <Text style={s.noSolutionText}>Çözüm bekleniyor...</Text>
        </View>
      </View>
    );
  }

  let paths: PathData[] = [];
  try {
    paths = JSON.parse(solution.drawingData);
  } catch {
    paths = [];
  }

  return (
    <View style={s.container}>
      <View style={s.teacherInfo}>
        <View style={s.teacherAvatar}>
          {(solution as any).teacherAvatarData ? (
            <Image
              source={{ uri: (solution as any).teacherAvatarData }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <Text style={s.teacherAvatarText}>
              {solution.teacherName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.teacherName}>{solution.teacherName}</Text>
          <Text style={s.teacherLabel}>Öğretmen tarafından çözüldü</Text>
        </View>
        <View style={s.solvedBadge}>
          <Text style={s.solvedText}>Çözüldü ✓</Text>
        </View>
      </View>

      <View style={s.tabs}>
        <Pressable
          style={[s.tab, activeTab === "solution" && s.tabActive]}
          onPress={() => setActiveTab("solution")}
        >
          <Text style={[s.tabText, activeTab === "solution" && s.tabTextActive]}>
            Çözüm
          </Text>
        </Pressable>
        <Pressable
          style={[s.tab, activeTab === "photo" && s.tabActive]}
          onPress={() => setActiveTab("photo")}
        >
          <Text style={[s.tabText, activeTab === "photo" && s.tabTextActive]}>
            Soru
          </Text>
        </Pressable>
      </View>

      {activeTab === "photo" ? (
        <View style={s.imageArea}>
          <Image
            source={{ uri: question.photoData }}
            style={s.image}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={s.svgContainer}>
          <Svg style={StyleSheet.absoluteFill}>
            <SvgImage
              href={question.photoData}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            />
            {paths.map((p, i) => (
              <Path
                key={i}
                d={p.d}
                stroke={p.color}
                strokeWidth={p.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        </View>
      )}

      <View style={s.bottomCards}>
        {solution.audioData ? (
          <AudioPlayer audioData={solution.audioData} />
        ) : null}
        {solution.note ? (
          <View style={s.noteCard}>
            <Text style={s.noteLabel}>Öğretmen Notu</Text>
            <Text style={s.noteText}>{solution.note}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
