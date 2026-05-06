import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  onRecordingComplete: (audioDataUri: string) => void;
  onClear: () => void;
}

export default function AudioRecorder({ onRecordingComplete, onClear }: Props) {
  const colors = useColors();
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [seconds, setSeconds] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("İzin Gerekli", "Ses kaydı için mikrofon izni gerekiyor.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Alert.alert("Hata", "Ses kaydı başlatılamadı.");
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!recordingRef.current) return;
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
        onRecordingComplete(`data:audio/m4a;base64,${base64}`);
        setState("done");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert("Hata", "Ses kaydı durdurulamadı.");
    }
  };

  const clearRecording = () => {
    setState("idle");
    setSeconds(0);
    onClear();
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const s = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: state === "recording" ? "#EF4444" : colors.border,
    },
    btn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    label: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    timer: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: state === "recording" ? "#EF4444" : colors.mutedForeground,
    },
    clearBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    clearText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
  });

  if (state === "idle") {
    return (
      <Pressable style={s.container} onPress={startRecording}>
        <View style={[s.btn, { backgroundColor: "#FEE2E2" }]}>
          <Text style={{ fontSize: 20 }}>🎙️</Text>
        </View>
        <Text style={s.label}>Sesli not ekle (isteğe bağlı)</Text>
      </Pressable>
    );
  }

  if (state === "recording") {
    return (
      <View style={s.container}>
        <View style={[s.btn, { backgroundColor: "#EF4444" }]}>
          <Text style={{ fontSize: 18 }}>⏺</Text>
        </View>
        <Text style={s.label}>Kayıt yapılıyor...</Text>
        <Text style={s.timer}>{fmt(seconds)}</Text>
        <Pressable
          style={[s.btn, { backgroundColor: "#F1F5F9", marginLeft: 4 }]}
          onPress={stopRecording}
        >
          <Text style={{ fontSize: 18 }}>⏹️</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={[s.btn, { backgroundColor: "#D1FAE5" }]}>
        <Text style={{ fontSize: 20 }}>✅</Text>
      </View>
      <Text style={s.label}>Ses notu kaydedildi ({fmt(seconds)})</Text>
      <Pressable style={s.clearBtn} onPress={clearRecording}>
        <Text style={s.clearText}>Sil</Text>
      </Pressable>
    </View>
  );
}
