import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getListTeachersQueryKey, useCreateQuestion, useListTeachers } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SUBJECTS = [
  { label: "Matematik", icon: "∑" },
  { label: "Geometri", icon: "△" },
  { label: "Fizik", icon: "⚛" },
  { label: "Kimya", icon: "⚗" },
  { label: "Biyoloji", icon: "🧬" },
  { label: "Türkçe", icon: "📝" },
  { label: "Edebiyat", icon: "📖" },
  { label: "Tarih", icon: "🏛" },
  { label: "Coğrafya", icon: "🌍" },
  { label: "İngilizce", icon: "🔤" },
  { label: "Felsefe", icon: "💭" },
  { label: "Din Kültürü", icon: "☯" },
];

export default function AskScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);
  const [showSubjectSheet, setShowSubjectSheet] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showTeacherSheet, setShowTeacherSheet] = useState(false);
  const [preferredTeacherId, setPreferredTeacherId] = useState<number | null>(null);
  const [step, setStep] = useState<"photo" | "subject" | "teacher">("photo");

  const { data: teachers } = useListTeachers(
    { subject: selectedSubject || undefined, school: user?.school },
    {
      query: {
        queryKey: getListTeachersQueryKey({
          subject: selectedSubject || undefined,
          school: user?.school,
        }),
        enabled: !!selectedSubject,
      },
    },
  );

  const createQuestion = useCreateQuestion({
    mutation: {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Soru Gönderildi!",
          "Sorunuz öğretmenlere iletildi. Kısa sürede çözüme ulaşacaksınız.",
          [
            {
              text: "Tamam",
              onPress: () => {
                setPhoto(null);
                setSelectedSubject(null);
                setPreferredTeacherId(null);
                setStep("photo");
              },
            },
          ],
        );
      },
      onError: () => {
        Alert.alert("Hata", "Soru gönderilemedi, tekrar deneyin.");
      },
    },
  });

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri iznine ihtiyaç var.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = asset.base64;
      const mimeType = asset.mimeType || "image/jpeg";
      setPhoto(`data:${mimeType};base64,${base64}`);
      setStep("subject");
      setShowSubjectSheet(true);
    }
  };

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Fotoğraf çekmek için kamera iznine ihtiyaç var.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = asset.base64;
      const mimeType = asset.mimeType || "image/jpeg";
      setPhoto(`data:${mimeType};base64,${base64}`);
      setStep("subject");
      setShowSubjectSheet(true);
    }
  };

  const handleSubjectSelect = (sub: string) => {
    setSelectedSubject(sub);
    setShowSubjectSheet(false);
    setStep("teacher");
    setShowTeacherSheet(true);
  };

  const handleSubmit = (teacherId?: number) => {
    if (!photo || !selectedSubject) return;
    setShowTeacherSheet(false);
    createQuestion.mutate({
      data: {
        subject: selectedSubject,
        photoData: photo,
        preferredTeacherId: teacherId ?? null,
      },
    });
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      paddingTop: Platform.OS === "web" ? 67 : 0,
      paddingBottom: Platform.OS === "web" ? 84 : 60,
    },
    heroArea: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    photoPreview: {
      width: SCREEN_WIDTH - 48,
      height: (SCREEN_WIDTH - 48) * 0.75,
      borderRadius: colors.radius,
      backgroundColor: colors.muted,
      overflow: "hidden",
      marginBottom: 24,
    },
    previewImage: { width: "100%", height: "100%" },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.secondary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    cameraIcon: { fontSize: 48 },
    heroTitle: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      lineHeight: 22,
    },
    buttonArea: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      gap: 12,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 18,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
    },
    primaryBtnText: {
      color: "#fff",
      fontSize: 17,
      fontFamily: "Inter_700Bold",
    },
    secondaryBtn: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
    },
    secondaryBtnText: {
      color: colors.foreground,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
    changePhoto: {
      alignSelf: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    changePhotoText: {
      color: colors.primary,
      fontFamily: "Inter_500Medium",
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: insets.bottom + 20,
      maxHeight: "80%",
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    subjectGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    subjectCard: {
      width: (SCREEN_WIDTH - 60) / 3,
      paddingVertical: 16,
      borderRadius: colors.radius,
      backgroundColor: colors.background,
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    subjectCardIcon: { fontSize: 24, marginBottom: 6 },
    subjectCardLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textAlign: "center",
    },
    teacherItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 14,
    },
    teacherAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    teacherAvatarText: {
      color: "#fff",
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    teacherInfo: { flex: 1 },
    teacherName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    teacherSchool: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    poolBtn: {
      margin: 20,
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
    },
    poolBtnText: {
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.content}>
        <View style={s.heroArea}>
          {photo ? (
            <>
              <View style={s.photoPreview}>
                <Image source={{ uri: photo }} style={s.previewImage} resizeMode="cover" />
              </View>
              <Pressable style={s.changePhoto} onPress={() => { setPhoto(null); setStep("photo"); }}>
                <Text style={s.changePhotoText}>Fotoğrafı Değiştir</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={s.photoPlaceholder}>
                <Text style={s.cameraIcon}>📸</Text>
              </View>
              <Text style={s.heroTitle}>Sorunuzu Gönderin</Text>
              <Text style={s.heroSubtitle}>
                Sorunuzun fotoğrafını çekin veya galeriden seçin.{"\n"}
                Öğretmenler kısa sürede yanıt verecek.
              </Text>
            </>
          )}
        </View>

        <View style={s.buttonArea}>
          {createQuestion.isPending ? (
            <View style={[s.primaryBtn, { justifyContent: "center" }]}>
              <ActivityIndicator color="#fff" />
              <Text style={s.primaryBtnText}>Gönderiliyor...</Text>
            </View>
          ) : photo && selectedSubject ? (
            <Pressable
              style={({ pressed }) => [s.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => setShowTeacherSheet(true)}
            >
              <Text style={s.primaryBtnText}>Öğretmen Seç ve Gönder</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                style={({ pressed }) => [s.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={takePhoto}
              >
                <Text style={s.primaryBtnText}>Fotoğraf Çek</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.secondaryBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={pickImage}
              >
                <Text style={s.secondaryBtnText}>Galeriden Seç</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <Modal
        visible={showSubjectSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubjectSheet(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setShowSubjectSheet(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Hangi Ders?</Text>
            <ScrollView>
              <View style={s.subjectGrid}>
                {SUBJECTS.map((sub) => (
                  <Pressable
                    key={sub.label}
                    style={({ pressed }) => [s.subjectCard, { opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => handleSubjectSelect(sub.label)}
                  >
                    <Text style={s.subjectCardIcon}>{sub.icon}</Text>
                    <Text style={s.subjectCardLabel}>{sub.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showTeacherSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeacherSheet(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setShowTeacherSheet(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Öğretmen Seç (İsteğe Bağlı)</Text>
            <FlatList
              data={teachers || []}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={
                <Text
                  style={{
                    textAlign: "center",
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    padding: 24,
                  }}
                >
                  Bu branşta kayıtlı öğretmen bulunamadı
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [s.teacherItem, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleSubmit(item.id);
                  }}
                >
                  <View style={s.teacherAvatar}>
                    {(item as any).avatarData ? (
                      <Image
                        source={{ uri: (item as any).avatarData }}
                        style={s.teacherAvatar}
                      />
                    ) : (
                      <Text style={s.teacherAvatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={s.teacherInfo}>
                    <Text style={s.teacherName}>{item.name}</Text>
                    <Text style={s.teacherSchool}>
                      {item.school}
                      {item.school === user?.school ? " • Okulunuzdan" : ""}
                    </Text>
                  </View>
                  <View style={{ alignItems: "center", gap: 4 }}>
                    <View
                      style={[
                        s.statusDot,
                        { backgroundColor: item.status === "available" ? colors.success : colors.warning },
                      ]}
                    />
                    <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                      {item.status === "available" ? "Müsait" : "Dersde"}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
            <Pressable
              style={({ pressed }) => [s.poolBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => handleSubmit()}
            >
              <Text style={s.poolBtnText}>Havuza Gönder (Öğretmen Seçme)</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
