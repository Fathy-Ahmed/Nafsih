import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ADHKAR, AYAHS, DUAS } from "@/constants/arabic";
import { useColors } from "@/hooks/useColors";

export default function LibraryScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            مكتبة السكينة
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            كلماتٌ ترتاح إليها
          </Text>
          <Text style={[styles.sub, { color: colors.inkSoft }]}>
            مختارات من القرآن والسنة، تصحبك حين يضيق الصدر.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/breathing")}
          style={[
            styles.featureCard,
            { backgroundColor: colors.primary },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.featureEyebrow, { color: colors.sandLight }]}>
              تمرين موجَّه
            </Text>
            <Text style={[styles.featureTitle, { color: colors.primaryForeground }]}>
              نفَس وذِكر · ٤ دورات
            </Text>
            <Text style={[styles.featureSub, { color: "rgba(247,245,240,0.78)" }]}>
              أربع ثوانٍ سحب، ثبات، إخراج، راحة — مع تسبيحٍ في كل مرحلة.
            </Text>
          </View>
          <View style={[styles.featureIcon, { backgroundColor: "rgba(255,255,255,0.10)" }]}>
            <Feather name="wind" size={20} color={colors.sandLight} />
          </View>
        </Pressable>

        <Section title="آيات للقلب القلِق" colors={colors}>
          {AYAHS.map((a) => (
            <View
              key={a.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardEyebrow, { color: colors.secondary }]}>
                {a.theme}
              </Text>
              <Text style={[styles.cardArabic, { color: colors.foreground }]}>
                {a.text}
              </Text>
              <Text style={[styles.cardRef, { color: colors.mutedForeground }]}>
                {a.ref}
              </Text>
            </View>
          ))}
        </Section>

        <Section title="من دعاء النبي ﷺ" colors={colors}>
          {DUAS.map((d) => (
            <View
              key={d.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardEyebrow, { color: colors.accent }]}>
                {d.theme}
              </Text>
              <Text style={[styles.cardArabic, { color: colors.foreground, fontSize: 18, lineHeight: 32 }]}>
                {d.text}
              </Text>
              <Text style={[styles.cardRef, { color: colors.mutedForeground }]}>
                {d.source}
              </Text>
            </View>
          ))}
        </Section>

        <Section title="أذكارٌ يومية" colors={colors}>
          {ADHKAR.map((dh) => (
            <View
              key={dh.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.dhikrHeader}>
                <Text style={[styles.dhikrCount, { color: colors.primary }]}>
                  {dh.count}
                </Text>
              </View>
              <Text style={[styles.cardArabic, { color: colors.foreground }]}>
                {dh.text}
              </Text>
              <Text style={[styles.cardRef, { color: colors.mutedForeground }]}>
                {dh.benefit}
              </Text>
            </View>
          ))}
        </Section>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 24,
  },
  heading: {
    paddingTop: 8,
    gap: 6,
  },
  eyebrow: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    letterSpacing: 2,
    textAlign: "right",
    writingDirection: "rtl",
  },
  title: {
    fontFamily: "Cairo_700Bold",
    fontSize: 26,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sub: {
    fontFamily: "Cairo_500Medium",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featureCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 22,
  },
  featureEyebrow: {
    fontFamily: "Cairo_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featureTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    marginTop: 4,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featureSub: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 22,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sectionBody: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  cardEyebrow: {
    fontFamily: "Cairo_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: "right",
    writingDirection: "rtl",
  },
  cardArabic: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 20,
    lineHeight: 36,
    textAlign: "right",
    writingDirection: "rtl",
  },
  cardRef: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    marginTop: 10,
    textAlign: "right",
    writingDirection: "rtl",
  },
  dhikrHeader: {
    flexDirection: "row-reverse",
    marginBottom: 8,
  },
  dhikrCount: {
    fontFamily: "Cairo_700Bold",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(43,76,63,0.08)",
    borderRadius: 999,
    writingDirection: "rtl",
  },
});
