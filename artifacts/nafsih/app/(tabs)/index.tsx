import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionCard } from "@/components/ActionCard";
import { AyahCard } from "@/components/AyahCard";
import { MoodChip } from "@/components/MoodChip";
import {
  AYAHS,
  MOODS,
  arabicNumber,
  dateLabelArabic,
  greetingForHour,
} from "@/constants/arabic";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { displayName, todayMood, setMood, streak, journal } = useApp();

  const today = new Date();
  const greeting = greetingForHour(today.getHours());
  const dateLabel = dateLabelArabic(today);

  const ayah = useMemo(() => {
    const idx = dayOfYear(today) % AYAHS.length;
    return AYAHS[idx]!;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const journalToday = journal.filter(
    (j) => j.date === today.toISOString().slice(0, 10)
  ).length;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {dateLabel}
            </Text>
            <Text style={[styles.greet, { color: colors.foreground }]}>
              {greeting}
              {displayName ? `، ${displayName}` : ""}
            </Text>
          </View>
          <View
            style={[
              styles.brandMark,
              { backgroundColor: colors.primary, borderColor: colors.sandLight },
            ]}
          >
            <Text style={[styles.brandMarkText, { color: colors.sandLight }]}>
              ن
            </Text>
          </View>
        </View>

        <View style={styles.moodWrap}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            كيف قلبك الآن؟
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodRow}
          >
            {[...MOODS].reverse().map((m) => (
              <MoodChip
                key={m.id}
                mood={m}
                selected={todayMood === m.id}
                onPress={(id) => void setMood(id)}
              />
            ))}
          </ScrollView>
        </View>

        <AyahCard ayah={ayah} />

        <View style={styles.actions}>
          <ActionCard
            title="تحدّث مع الرفيق"
            subtitle="مساحةٌ آمنة للحديث، بإصغاءٍ هادئ ومذكِّرٍ بربك."
            iconName="message-circle"
            variant="primary"
            onPress={() => router.push("/companion")}
          />
          <ActionCard
            title="نفَس وذِكر"
            subtitle="أربع دورات تنفّسٍ موجَّهة، يصاحبها تسبيحٌ هادئ."
            iconName="wind"
            variant="secondary"
            onPress={() => router.push("/breathing")}
          />
          <ActionCard
            title="افتح يومياتك"
            subtitle={
              journalToday > 0
                ? `كتبتَ ${arabicNumber(journalToday)} اليوم. تابِع.`
                : "اكتب صفحةً بينك وبين نفسك."
            }
            iconName="edit-3"
            onPress={() => router.push("/(tabs)/journal")}
          />
        </View>

        <View
          style={[
            styles.streakCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.streakIcon, { backgroundColor: colors.muted }]}>
            <Feather name="award" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>
              مواظبتك على التنفّس
            </Text>
            <Text style={[styles.streakValue, { color: colors.foreground }]}>
              {streak > 0
                ? `${arabicNumber(streak)} يوم متتالي`
                : "ابدأ سلسلتك اليوم"}
            </Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          {'"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"'}
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 22,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingTop: 8,
    gap: 12,
  },
  date: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    textAlign: "right",
    writingDirection: "rtl",
  },
  greet: {
    fontFamily: "Cairo_700Bold",
    fontSize: 26,
    marginTop: 4,
    textAlign: "right",
    writingDirection: "rtl",
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  brandMarkText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 22,
    lineHeight: 28,
  },
  moodWrap: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    textAlign: "right",
    writingDirection: "rtl",
  },
  moodRow: {
    paddingVertical: 4,
    paddingLeft: 8,
  },
  actions: {
    gap: 12,
  },
  streakCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  streakIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  streakLabel: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    textAlign: "right",
    writingDirection: "rtl",
  },
  streakValue: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    marginTop: 2,
    textAlign: "right",
    writingDirection: "rtl",
  },
  footer: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
    writingDirection: "rtl",
  },
});
