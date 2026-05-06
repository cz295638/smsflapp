import AudioRecorder from "@/components/AudioRecorder";
import DrawingCanvas from "@/components/DrawingCanvas";
import { useColors } from "@/hooks/useColors";
import {
  useGetQuestion,
  useSubmitSolution,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SolveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [drawingData, setDrawingData] = useState("[]");
  const [note, setNote] = useState("");
  const [audioData, setAudioData] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"photo" | "draw">("photo");

  const { data, isLoading } = useGetQuestion(Number(id));

  const submitMutation = useSubmitSolution({
    mutation: {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Çözüm Gönderildi!",
          "Çözümünüz öğrenciye iletildi.",
          [{ text: "Tamam", onPress: () => router.back() }],
        );
      },
      onError: () => {
        Alert.alert("Hata", "Çözüm gönderilemedi, tekrar deneyin.");
      },
    },
  });

  const handleSubmit = () => {
    const paths = JSON.parse(drawingData);
    if (paths.length === 0) {
      Alert.alert("Uyarı", "Lütfen çözüm çizin.");
      return;
    }
    Alert.alert(
      "Çözümü Gönder",
      "Çözümünüzü öğrenciye göndermek istiyor musunuz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Gönder",
          onPress: () => {
            submitMutation.mutate({
              id: Number(id),
              data: {
                drawingData,
                note: note || undefined,
                audioData: audioData || undefined,
              },
            });
          },
        },
      ],
    );
  };

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
    photoArea: {
      flex: 1,
      margin: 12,
      marginTop: 0,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    photo: { width: "100%", height: "100%" },
    canvasArea: {
      flex: 1,
      margin: 12,
      marginTop: 0,
      borderRadius: colors.radius,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    noteInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      marginHorizontal: 12,
      marginBottom: 8,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      height: 60,
      textAlignVertical: "top",
    },
    audioRow: {
      marginHorizontal: 12,
      marginBottom: 8,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      marginHorizontal: 12,
      marginBottom: insets.bottom + 12,
      paddingVertical: 16,
      borderRadius: colors.radius,
      alignItems: "center",
    },
    submitBtnText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Inter_700Bold",
    },
    studentInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
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
    subjectBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
      backgroundColor: colors.secondary,
    },
    subjectText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
  });

  if (isLoading || !data) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { question } = data;

  return (
    <View style={s.container}>
      <View style={s.studentInfo}>
        <View style={{ flex: 1 }}>
          <Text style={s.studentName}>{question.studentName}</Text>
          <Text style={s.studentSchool}>{question.studentSchool}</Text>
        </View>
        <View style={s.subjectBadge}>
          <Text style={s.subjectText}>{question.subject}</Text>
        </View>
      </View>

      <View style={s.tabs}>
        <Pressable
          style={[s.tab, activeTab === "photo" && s.tabActive]}
          onPress={() => setActiveTab("photo")}
        >
          <Text style={[s.tabText, activeTab === "photo" && s.tabTextActive]}>
            Soru
          </Text>
        </Pressable>
        <Pressable
          style={[s.tab, activeTab === "draw" && s.tabActive]}
          onPress={() => setActiveTab("draw")}
        >
          <Text style={[s.tabText, activeTab === "draw" && s.tabTextActive]}>
            Çizim Yap
          </Text>
        </Pressable>
      </View>

      {activeTab === "photo" ? (
        <View style={s.photoArea}>
          <Image
            source={{ uri: question.photoData }}
            style={s.photo}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={s.canvasArea}>
          <DrawingCanvas
            backgroundUri={question.photoData}
            onPathsChange={setDrawingData}
          />
        </View>
      )}

      <TextInput
        style={s.noteInput}
        value={note}
        onChangeText={setNote}
        placeholder="Ek not ekleyin (isteğe bağlı)..."
        placeholderTextColor={colors.mutedForeground}
        multiline
      />

      <View style={s.audioRow}>
        <AudioRecorder
          onRecordingComplete={(uri) => setAudioData(uri)}
          onClear={() => setAudioData(null)}
        />
      </View>

      <Pressable
        style={({ pressed }) => [s.submitBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={handleSubmit}
        disabled={submitMutation.isPending}
      >
        {submitMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.submitBtnText}>Çözümü Gönder</Text>
        )}
      </Pressable>
    </View>
  );
}
