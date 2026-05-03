import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MOODS, arabicNumber, dateLabelArabic } from "@/constants/arabic";
import { useApp, type JournalEntry } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

// ── Helpers ────────────────────────────────────────────────────────────────

const AR_DAY_LETTERS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"]; // Sun–Sat

const MOOD_SCORES: Record<string, number> = {
  calm: 5,
  grateful: 5,
  hopeful: 4,
  tired: 3,
  overwhelmed: 2,
  anxious: 2,
  stressed: 2,
  sad: 1,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function streakMessage(streak: number): string {
  if (streak >= 14) return "ما شاء الله، استمراريّة رائعة. أنت تبني عادةً حقيقية.";
  if (streak >= 7)  return "أسبوع كامل! القليل الدائم خير من الكثير المنقطع.";
  if (streak >= 3)  return "ثلاثة أيام متتالية. كل يوم تُضيف لبنة لنفسك.";
  if (streak === 1) return "اليوم أول خطوة. الاستمرار هو السر.";
  return "أنت مستمر في تخصيص وقت لنفسك. تذكر، القليل الدائم خير من الكثير المنقطع.";
}

// ── Achievement definitions ────────────────────────────────────────────────

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  variant: "sage" | "blush";
  unlocked: (streak: number, entries: JournalEntry[]) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first",
    title: "البداية",
    desc: "أول تأمّل لك",
    icon: "edit-3",
    variant: "blush",
    unlocked: (_s, e) => e.length >= 1,
  },
  {
    id: "week",
    title: "أسبوع من الهدوء",
    desc: "٧ أيام متتالية",
    icon: "award",
    variant: "sage",
    unlocked: (s) => s >= 7,
  },
  {
    id: "ten_entries",
    title: "١٠ تأملات",
    desc: "١٠ صفحات مكتوبة",
    icon: "book-open",
    variant: "blush",
    unlocked: (_s, e) => e.length >= 10,
  },
  {
    id: "two_weeks",
    title: "١٤ يوماً متتالية",
    desc: "استمراريّة مميّزة",
    icon: "award",
    variant: "sage",
    unlocked: (s) => s >= 14,
  },
];

// ── Main Screen ────────────────────────────────────────────────────────────

export default function JournalScreen() {
  const colors = useColors();
  const { journal, streak, moodHistory, addJournal, deleteJournal } = useApp();

  const [showCompose, setShowCompose]   = useState(false);
  const [showAll,     setShowAll]       = useState(false);
  const [draft,       setDraft]         = useState("");

  const today = todayKey();
  const last7 = useMemo(() => getLast7Days(), []);

  // chart data
  const chartData = useMemo(() =>
    last7.map((d) => {
      const moodEntry = moodHistory.find((m) => m.date === d);
      const score = moodEntry ? (MOOD_SCORES[moodEntry.mood] ?? 3) : 0;
      const dayIdx = new Date(d + "T12:00:00").getDay();
      return { date: d, score, letter: AR_DAY_LETTERS[dayIdx]!, isToday: d === today };
    }),
  [last7, moodHistory, today]);

  // achievements
  const achievements = useMemo(() =>
    ACHIEVEMENTS.map((a) => ({ ...a, done: a.unlocked(streak, journal) })),
  [streak, journal]);

  async function handleSave() {
    const text = draft.trim();
    if (!text) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await addJournal(text);
    setDraft("");
    setShowCompose(false);
  }

  const visibleEntries = showAll ? journal : journal.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>رحلتك</Text>
          <Pressable
            onPress={() => setShowCompose(true)}
            style={[styles.calBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="edit-3" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* ── Streak card ── */}
        <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.streakCircle, { backgroundColor: "#F0E6DD" }]}>
            <Text style={[styles.streakNum, { color: colors.accent }]}>
              {arabicNumber(streak)}
            </Text>
            <View style={[styles.streakBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.streakBadgeText, { color: colors.primaryForeground }]}>
                يومًا متتالية
              </Text>
            </View>
          </View>
          <Text style={[styles.streakMsg, { color: colors.mutedForeground }]}>
            {streakMessage(streak)}
          </Text>
        </View>

        {/* ── Mood this week ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="trending-up" size={15} color={colors.secondary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>مزاجك هذا الأسبوع</Text>
          </View>
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {chartData.map((d, i) => {
              const barH = d.score ? Math.max(8, (d.score / 5) * 56) : 6;
              const barBg = d.isToday
                ? colors.primary
                : d.score === 5 ? "#E4EAE5"
                : d.score === 4 ? "#EAF0EC"
                : d.score === 3 ? "#F0E6DD"
                : d.score === 2 ? "#F5ECE6"
                : d.score === 1 ? "#F3E8E8"
                : colors.border;
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={styles.chartBarWrap}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: barH,
                          backgroundColor: barBg,
                          shadowColor: d.isToday ? colors.primary : "transparent",
                          shadowOpacity: d.isToday ? 0.3 : 0,
                          shadowRadius: 4,
                          elevation: d.isToday ? 3 : 0,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[
                    styles.chartLabel,
                    { color: d.isToday ? colors.primary : colors.mutedForeground,
                      fontFamily: d.isToday ? "Cairo_700Bold" : "Cairo_400Regular" }
                  ]}>
                    {d.letter}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Achievements ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>إنجازات</Text>
          <View style={styles.achieveGrid}>
            {achievements.map((a) => {
              const bgFrom = a.variant === "sage" ? "#E4EAE5" : "#F0E6DD";
              const iconColor = a.done
                ? (a.variant === "sage" ? colors.primary : colors.accent)
                : colors.mutedForeground;
              return (
                <View
                  key={a.id}
                  style={[
                    styles.achieveCard,
                    {
                      backgroundColor: a.done ? bgFrom : colors.muted,
                      borderColor: a.done ? bgFrom : colors.border,
                      opacity: a.done ? 1 : 0.45,
                    },
                  ]}
                >
                  <View style={[styles.achieveIcon, { backgroundColor: `${iconColor}18` }]}>
                    <Feather name={a.icon as "award"} size={16} color={iconColor} />
                  </View>
                  <Text style={[styles.achieveTitle, { color: colors.foreground }]}>{a.title}</Text>
                  <Text style={[styles.achieveSub, { color: colors.mutedForeground }]}>
                    {a.done ? "مكتمل" : a.desc}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Past reflections ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {journal.length > 3 && (
              <Pressable onPress={() => setShowAll(!showAll)} style={styles.showAllBtn}>
                <Text style={[styles.showAllText, { color: colors.secondary }]}>
                  {showAll ? "أقل" : "عرض الكل"}
                </Text>
                <Feather
                  name="chevron-left"
                  size={13}
                  color={colors.secondary}
                />
              </Pressable>
            )}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>تأملات سابقة</Text>
          </View>

          {journal.length === 0 ? (
            <View style={[styles.emptyCard, { borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                لا تأملات بعد. ابدأ بكتابة أول تأمّل لك اليوم.
              </Text>
            </View>
          ) : (
            <View style={styles.entriesList}>
              {visibleEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => void deleteJournal(entry.id)}
                  colors={colors}
                />
              ))}
            </View>
          )}
        </View>

        {/* bottom space for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        onPress={() => setShowCompose(true)}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Feather name="plus" size={20} color={colors.primaryForeground} />
        <Text style={[styles.fabText, { color: colors.primaryForeground }]}>تأمّل جديد</Text>
      </Pressable>

      {/* ── Compose Modal ── */}
      <Modal
        visible={showCompose}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowCompose(false); setDraft(""); }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => { setShowCompose(false); setDraft(""); }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalSheet}
          >
            <Pressable
              onPress={() => { /* absorb tap */ }}
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Pressable onPress={() => { setShowCompose(false); setDraft(""); }}>
                  <Feather name="x" size={20} color={colors.mutedForeground} />
                </Pressable>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>تأمّل جديد</Text>
              </View>

              <Text style={[styles.modalDate, { color: colors.secondary }]}>
                {dateLabelArabic(new Date())}
              </Text>

              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="اكتب ما يدور في ذهنك وقلبك الآن..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                autoFocus
                style={[
                  styles.modalInput,
                  { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                ]}
                textAlign="right"
                maxLength={2000}
              />

              <Pressable
                onPress={handleSave}
                disabled={!draft.trim()}
                style={[
                  styles.saveBtn,
                  { backgroundColor: draft.trim() ? colors.primary : colors.muted },
                ]}
              >
                <Text style={[
                  styles.saveBtnText,
                  { color: draft.trim() ? colors.primaryForeground : colors.mutedForeground },
                ]}>
                  حفظ التأمّل
                </Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Entry Card ────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  onDelete,
  colors,
}: {
  entry: JournalEntry;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const moodLabel = entry.mood
    ? (MOODS.find((m) => m.id === entry.mood)?.label ?? null)
    : null;

  return (
    <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.entryMeta}>
        <Pressable onPress={onDelete} style={styles.deleteBtn}>
          <Feather name="trash-2" size={14} color={colors.mutedForeground} />
        </Pressable>
        <View style={styles.entryMetaRight}>
          {moodLabel && (
            <View style={[styles.moodPill, { backgroundColor: `${colors.primary}12` }]}>
              <Text style={[styles.moodPillText, { color: colors.primary }]}>{moodLabel}</Text>
            </View>
          )}
          <Text style={[styles.entryDate, { color: colors.secondary }]}>
            {dateLabelArabic(new Date(entry.ts))}
          </Text>
        </View>
      </View>
      <Text style={[styles.entryText, { color: colors.foreground }]}>
        "{entry.content}"
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 24,
  },

  // Header
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  pageTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28,
    writingDirection: "rtl",
  },
  calBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Streak
  streakCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 16,
  },
  streakCircle: {
    width: 96, height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  streakNum: {
    fontFamily: "Cairo_700Bold",
    fontSize: 44,
    lineHeight: 52,
  },
  streakBadge: {
    position: "absolute",
    bottom: -10,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
  },
  streakBadgeText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
    writingDirection: "rtl",
  },
  streakMsg: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    writingDirection: "rtl",
    paddingHorizontal: 12,
    marginTop: 6,
  },

  // Sections
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    writingDirection: "rtl",
  },
  showAllBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2,
  },
  showAllText: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    writingDirection: "rtl",
  },

  // Chart
  chartCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 110,
  },
  chartCol: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  chartBarWrap: {
    height: 60,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
  },
  chartLabel: {
    fontSize: 10,
  },

  // Achievements
  achieveGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
  },
  achieveCard: {
    width: "47%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  achieveIcon: {
    width: 34, height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  achieveTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 13,
    writingDirection: "rtl",
  },
  achieveSub: {
    fontFamily: "Cairo_400Regular",
    fontSize: 11,
    writingDirection: "rtl",
  },

  // Entries
  entriesList: { gap: 12 },
  entryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  entryMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryMetaRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  entryDate: {
    fontFamily: "Cairo_500Medium",
    fontSize: 11,
    writingDirection: "rtl",
  },
  moodPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  moodPillText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 11,
    writingDirection: "rtl",
  },
  deleteBtn: { padding: 4 },
  entryText: {
    fontFamily: "Cairo_500Medium",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "right",
    writingDirection: "rtl",
  },

  // Empty state
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Cairo_500Medium",
    fontSize: 14,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 24,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: "#2B4C3F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    writingDirection: "rtl",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    width: "100%",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalHandle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.12)",
    alignSelf: "center",
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    writingDirection: "rtl",
  },
  modalDate: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    writingDirection: "rtl",
    textAlign: "right",
  },
  modalInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    lineHeight: 26,
    textAlignVertical: "top",
    writingDirection: "rtl",
  },
  saveBtn: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    writingDirection: "rtl",
  },
});
