import React, { useCallback, useRef, useState } from "react";
import { PanResponder, StyleSheet, View, Pressable, Text, ScrollView } from "react-native";
import Svg, { Path, Image as SvgImage } from "react-native-svg";

interface PathData {
  d: string;
  color: string;
  width: number;
}

interface DrawingCanvasProps {
  backgroundUri?: string;
  onPathsChange?: (data: string) => void;
  style?: object;
}

const COLORS = [
  { color: "#1A56DB", label: "Mavi" },
  { color: "#EF4444", label: "Kırmızı" },
  { color: "#10B981", label: "Yeşil" },
  { color: "#111827", label: "Siyah" },
  { color: "#F59E0B", label: "Turuncu" },
  { color: "#8B5CF6", label: "Mor" },
];

export default function DrawingCanvas({
  backgroundUri,
  onPathsChange,
  style,
}: DrawingCanvasProps) {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].color);
  const [isEraser, setIsEraser] = useState(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const svgRef = useRef<Svg>(null);

  const pointsToD = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return "";
    const [first, ...rest] = points;
    let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
    for (const p of rest) {
      d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }
    return d;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      currentPoints.current = [{ x: locationX, y: locationY }];
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      currentPoints.current = [
        ...currentPoints.current,
        { x: locationX, y: locationY },
      ];
      if (currentPoints.current.length % 3 === 0) {
        const d = pointsToD(currentPoints.current);
        setPaths((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.d.startsWith("CURRENT")) {
            return [
              ...prev.slice(0, -1),
              { d: "CURRENT" + d, color: isEraser ? "#FFFFFF" : selectedColor, width: isEraser ? 24 : 3 },
            ];
          }
          return [
            ...prev,
            { d: "CURRENT" + d, color: isEraser ? "#FFFFFF" : selectedColor, width: isEraser ? 24 : 3 },
          ];
        });
      }
    },
    onPanResponderRelease: () => {
      const d = pointsToD(currentPoints.current);
      if (d) {
        setPaths((prev) => {
          const filtered = prev.filter((p) => !p.d.startsWith("CURRENT"));
          const newPaths = [
            ...filtered,
            { d, color: isEraser ? "#FFFFFF" : selectedColor, width: isEraser ? 24 : 3 },
          ];
          onPathsChange?.(JSON.stringify(newPaths));
          return newPaths;
        });
      }
      currentPoints.current = [];
    },
  });

  const handleUndo = useCallback(() => {
    setPaths((prev) => {
      const filtered = prev.filter((p) => !p.d.startsWith("CURRENT"));
      const newPaths = filtered.slice(0, -1);
      onPathsChange?.(JSON.stringify(newPaths));
      return newPaths;
    });
  }, [onPathsChange]);

  const handleClear = useCallback(() => {
    setPaths([]);
    onPathsChange?.(JSON.stringify([]));
  }, [onPathsChange]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarInner}>
          {COLORS.map(({ color }) => (
            <Pressable
              key={color}
              onPress={() => { setSelectedColor(color); setIsEraser(false); }}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                selectedColor === color && !isEraser && styles.colorDotActive,
              ]}
            />
          ))}
          <Pressable
            onPress={() => setIsEraser(!isEraser)}
            style={[styles.toolBtn, isEraser && styles.toolBtnActive]}
          >
            <Text style={styles.toolBtnText}>Silgi</Text>
          </Pressable>
          <Pressable onPress={handleUndo} style={styles.toolBtn}>
            <Text style={styles.toolBtnText}>Geri Al</Text>
          </Pressable>
          <Pressable onPress={handleClear} style={styles.toolBtn}>
            <Text style={styles.toolBtnText}>Temizle</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg ref={svgRef} style={StyleSheet.absoluteFill}>
          {backgroundUri && (
            <SvgImage
              href={backgroundUri}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            />
          )}
          {paths.map((p, i) => (
            <Path
              key={i}
              d={p.d.startsWith("CURRENT") ? p.d.substring(7) : p.d}
              stroke={p.color}
              strokeWidth={p.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    height: 52,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  toolbarInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotActive: {
    borderColor: "#111827",
    transform: [{ scale: 1.2 }],
  },
  toolBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  toolBtnActive: {
    backgroundColor: "#111827",
  },
  toolBtnText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#374151",
  },
  canvas: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
