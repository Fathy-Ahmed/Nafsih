import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
};

export function MessageBubble({ role, content, pending }: Props) {
  const colors = useColors();
  const isUser = role === "user";

  const bubbleBg = isUser ? colors.primary : colors.card;
  const textColor = isUser ? colors.primaryForeground : colors.foreground;
  const align = isUser ? "flex-start" : "flex-end";

  return (
    <View
      style={[
        styles.row,
        { justifyContent: align },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleBg,
            borderColor: isUser ? "transparent" : colors.border,
            borderBottomRightRadius: isUser ? 22 : 6,
            borderBottomLeftRadius: isUser ? 6 : 22,
          },
        ]}
      >
        {pending ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text style={[styles.text, { color: textColor }]}>{content}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  bubble: {
    maxWidth: "84%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
  },
  text: {
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    lineHeight: 26,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
