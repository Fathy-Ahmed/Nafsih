import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

import type { Mood } from "@/constants/arabic";
import { useColors } from "@/hooks/useColors";

type Props = {
  mood: Mood;
  selected: boolean;
  onPress: (id: string) => void;
};

const TONE_BG: Record<Mood["tone"], string> = {
  calm: "rgba(43,76,63,0.10)",
  warm: "rgba(142,104,85,0.12)",
  deep: "rgba(31,56,48,0.12)",
  bright: "rgba(191,165,136,0.18)",
};

export function MoodChip({ mood, selected, onPress }: Props) {
  const colors = useColors();
  const bg = selected ? colors.primary : TONE_BG[mood.tone];
  const fg = selected ? colors.primaryForeground : colors.foreground;

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.selectionAsync();
        }
        onPress(mood.id);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: bg,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.text, { color: fg }]}>{mood.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
  text: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    writingDirection: "rtl",
  },
});
