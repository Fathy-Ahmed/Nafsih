import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Props = {
  title?: string;
  eyebrow?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
  variant?: "light" | "dark";
};

export function Header({
  title,
  eyebrow,
  onBack,
  showBack = true,
  rightSlot,
  variant = "light",
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isDark = variant === "dark";

  const fg = isDark ? colors.sandPale : colors.foreground;
  const sub = isDark ? colors.sandLight : colors.mutedForeground;
  const buttonBg = isDark ? "rgba(255,255,255,0.10)" : colors.muted;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.wrap, { paddingTop: topPad + 8 }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="رجوع"
              onPress={() => (onBack ? onBack() : router.back())}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: buttonBg, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="chevron-right" size={20} color={fg} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.center}>
          {eyebrow ? (
            <Text style={[styles.eyebrow, { color: sub }]} numberOfLines={1}>
              {eyebrow}
            </Text>
          ) : null}
          {title ? (
            <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>

        <View style={[styles.side, styles.rightSide]}>{rightSlot}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  side: {
    width: 44,
    alignItems: "flex-start",
  },
  rightSide: {
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontFamily: "Cairo_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    writingDirection: "rtl",
  },
  title: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 17,
    marginTop: 2,
    writingDirection: "rtl",
  },
});
