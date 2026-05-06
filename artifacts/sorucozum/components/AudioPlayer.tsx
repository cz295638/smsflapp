import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  audioData: string;
}

export default function AudioPlayer({ audioData }: Props) {
  const colors = useColors();
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const togglePlay = async () => {
    if (status === "loading") return;

    if (status === "playing") {
      await soundRef.current?.pauseAsync();
      setStatus("paused");
      return;
    }

    if (status === "paused" && soundRef.current) {
      await soundRef.current.playAsync();
      setStatus("playing");
      return;
    }

    setStatus("loading");
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });
      const { sound } = await Audio.Sound.createAsync({ uri: audioData }, { shouldPlay: true });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) {
          setStatus("idle");
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
      setStatus("playing");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      setStatus("idle");
    }
  };

  const stop = async () => {
    await soundRef.current?.stopAsync();
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    setStatus("idle");
  };

  const s = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: "#EFF6FF",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: "#BFDBFE",
    },
    btn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    label: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: "#1E40AF",
    },
    stopBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "#DBEAFE",
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const icon =
    status === "loading" ? null :
    status === "playing" ? "⏸️" :
    "▶️";

  return (
    <View style={s.container}>
      <Pressable style={s.btn} onPress={togglePlay}>
        {status === "loading" ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        )}
      </Pressable>
      <Text style={s.label}>
        {status === "playing" ? "Oynatılıyor..." :
         status === "paused" ? "Duraklatıldı" :
         status === "loading" ? "Yükleniyor..." :
         "Sesli açıklama dinle"}
      </Text>
      {(status === "playing" || status === "paused") && (
        <Pressable style={s.stopBtn} onPress={stop}>
          <Text style={{ fontSize: 14 }}>⏹️</Text>
        </Pressable>
      )}
    </View>
  );
}
