import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Ayah } from "@/constants/arabic";
import { useColors } from "@/hooks/useColors";

type Props = {
  ayah: Ayah;
  variant?: "light" | "dark";
};

export function AyahCard({ ayah, variant = "light" }: Props) {
  const colors = useColors();
  const isDark = variant === "dark";

  const bg = isDark ? "rgba(20,32,28,0.55)" : colors.card;
  const border = isDark ? "rgba(191,165,136,0.18)" : colors.border;
  const eyebrow = isDark ? colors.sandLight : colors.secondary;
  const text = isDark ? colors.sandPale : colors.foreground;
  const ref = isDark ? colors.sandLight : colors.mutedForeground;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: 22,
        },
      ]}
    >
      <Text style={[styles.eyebrow, { color: eyebrow }]}>{ayah.theme}</Text>
      <Text style={[styles.text, { color: text }]}>{ayah.text}</Text>
      <Text style={[styles.ref, { color: ref }]}>{ayah.ref}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 22,
    paddingHorizontal: 22,
    borderWidth: 1,
  },
  eyebrow: {
    fontFamily: "Cairo_500Medium",
    fontSize: 11,
    letterSpacing: 2.5,
    marginBottom: 12,
    textAlign: "right",
    writingDirection: "rtl",
  },
  text: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 22,
    lineHeight: 38,
    textAlign: "right",
    writingDirection: "rtl",
  },
  ref: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    marginTop: 12,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
