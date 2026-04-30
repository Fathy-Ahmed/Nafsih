import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

function TabLabel({
  label,
  focused,
  color,
}: {
  label: string;
  focused: boolean;
  color: string;
}) {
  return (
    <Text
      style={{
        fontFamily: focused ? "Cairo_700Bold" : "Cairo_500Medium",
        fontSize: 11,
        color,
        marginTop: 2,
        writingDirection: "rtl",
      }}
    >
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الآن",
          tabBarIcon: ({ color }) => (
            <Feather name="sun" size={22} color={color} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="الآن" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "المكتبة",
          tabBarIcon: ({ color }) => (
            <Feather name="book-open" size={22} color={color} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="المكتبة" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "اليوميات",
          tabBarIcon: ({ color }) => (
            <Feather name="edit-3" size={22} color={color} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="اليوميات" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
