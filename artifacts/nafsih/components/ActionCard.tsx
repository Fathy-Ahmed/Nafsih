import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  title: string;
  subtitle?: string;
  iconName: keyof typeof Feather.glyphMap;
  onPress: () => void;
  variant?: "primary" | "secondary" | "soft";
};

export function ActionCard({
  title,
  subtitle,
  iconName,
  onPress,
  variant = "soft",
}: Props) {
  const colors = useColors();

  const palette = (() => {
    switch (variant) {
      case "primary":
        return {
          bg: colors.primary,
          fg: colors.primaryForeground,
          sub: "rgba(247,245,240,0.78)",
          ring: "rgba(255,255,255,0.10)",
          icon: colors.sandLight,
        };
      case "secondary":
        return {
          bg: colors.accent,
          fg: colors.accentForeground,
          sub: "rgba(255,255,255,0.78)",
          ring: "rgba(255,255,255,0.12)",
          icon: colors.sandLight,
        };
      default:
        return {
          bg: colors.card,
          fg: colors.foreground,
          sub: colors.mutedForeground,
          ring: colors.muted,
          icon: colors.primary,
        };
    }
  })();

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: palette.bg,
          borderColor: variant === "soft" ? colors.border : "transparent",
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: palette.sub }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View
          style={[styles.iconWrap, { backgroundColor: palette.ring }]}
        >
          <Feather name={iconName} size={20} color={palette.icon} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  title: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
    textAlign: "right",
    writingDirection: "rtl",
  },
  subtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    marginTop: 4,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
  },
});
