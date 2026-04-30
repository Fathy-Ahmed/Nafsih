import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { finishOnboarding } = useApp();
  const [name, setName] = useState("");

  async function handleContinue() {
    await finishOnboarding(name);
    router.replace("/");
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandWrap}>
            <View
              style={[
                styles.crescent,
                { backgroundColor: colors.primary, borderColor: colors.sandLight },
              ]}
            >
              <Text style={[styles.brandMark, { color: colors.sandLight }]}>
                ن
              </Text>
            </View>
            <Text style={[styles.brand, { color: colors.foreground }]}>
              نفسيّه
            </Text>
            <Text style={[styles.tag, { color: colors.mutedForeground }]}>
              صحبةٌ هادئة لقلبٍ مُتعَب
            </Text>
          </View>

          <View style={styles.bullets}>
            <Bullet
              text="مساحةٌ آمنة بالعربية، تواكِبك في التوتر والإرهاق."
              colors={colors}
            />
            <Bullet
              text="مرتكَزة على التوكل والذِّكر والصبر، لا على ضجيج العالم."
              colors={colors}
            />
            <Bullet
              text="تنفّس، تأمّل، اكتب، وارجع إلى نفسك في أي لحظة."
              colors={colors}
            />
          </View>

          <View style={styles.formWrap}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              ما اسمك؟ (اختياري)
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="اكتب اسمك"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              maxLength={32}
              returnKeyType="done"
              textAlign="right"
            />
          </View>

          <PrimaryButton label="ابدأ رحلتك" onPress={handleContinue} />

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bullet({
  text,
  colors,
}: {
  text: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.bulletRow}>
      <View
        style={[styles.bulletDot, { backgroundColor: colors.secondary }]}
      />
      <Text style={[styles.bulletText, { color: colors.foreground }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 28,
  },
  brandWrap: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 8,
  },
  crescent: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: 18,
  },
  brandMark: {
    fontFamily: "Cairo_700Bold",
    fontSize: 44,
    lineHeight: 52,
  },
  brand: {
    fontFamily: "Cairo_700Bold",
    fontSize: 34,
    writingDirection: "rtl",
  },
  tag: {
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    marginTop: 8,
    writingDirection: "rtl",
  },
  bullets: {
    gap: 14,
  },
  bulletRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 9,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    lineHeight: 26,
    textAlign: "right",
    writingDirection: "rtl",
  },
  formWrap: {
    gap: 10,
  },
  label: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    textAlign: "right",
    writingDirection: "rtl",
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontFamily: "Cairo_500Medium",
    fontSize: 16,
    writingDirection: "rtl",
  },
  footer: {
    fontFamily: "Cairo_500Medium",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    writingDirection: "rtl",
  },
});
