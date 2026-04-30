import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MOODS, dateLabelArabic } from "@/constants/arabic";
import { useApp, type JournalEntry } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function moodLabel(id: string | null): string | null {
  if (!id) return null;
  return MOODS.find((m) => m.id === id)?.label ?? null;
}

export default function JournalScreen() {
  const colors = useColors();
  const { journal, addJournal, deleteJournal } = useApp();
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);

  async function handleSave() {
    const text = draft.trim();
    if (!text) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await addJournal(text);
    setDraft("");
    setComposing(false);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
              يومياتي
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              صفحاتٌ بينك وبين نفسك
            </Text>
            <Text style={[styles.sub, { color: colors.inkSoft }]}>
              اكتُب ما يُثقل قلبك. الكتابة بابٌ هادئ للسكينة.
            </Text>
          </View>

          {composing || journal.length === 0 ? (
            <View
              style={[
                styles.composer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onFocus={() => setComposing(true)}
                placeholder="ما الذي تشعر به الآن؟"
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={[styles.input, { color: colors.foreground }]}
                textAlign="right"
                maxLength={2000}
              />
              <View style={styles.composerActions}>
                {composing ? (
                  <Pressable
                    onPress={() => {
                      setDraft("");
                      setComposing(false);
                    }}
                    style={[styles.ghostBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.ghostBtnText, { color: colors.foreground }]}>
                      إلغاء
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={handleSave}
                  disabled={!draft.trim()}
                  style={[
                    styles.saveBtn,
                    {
                      backgroundColor: draft.trim()
                        ? colors.primary
                        : colors.muted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.saveBtnText,
                      {
                        color: draft.trim()
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    احفظ
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setComposing(true)}
              style={[
                styles.addPrompt,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather name="edit-3" size={18} color={colors.primary} />
              <Text style={[styles.addPromptText, { color: colors.foreground }]}>
                اكتب صفحةً جديدة
              </Text>
            </Pressable>
          )}

          {journal.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                لا توجد صفحات بعد. كل صفحةٍ خطوةٌ نحو راحة القلب.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {journal.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => void deleteJournal(entry.id)}
                  colors={colors}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EntryCard({
  entry,
  onDelete,
  colors,
}: {
  entry: JournalEntry;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const mLabel = moodLabel(entry.mood);
  const date = new Date(entry.ts);
  return (
    <View
      style={[
        styles.entry,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>
          {dateLabelArabic(date)}
        </Text>
        <View style={styles.entryHeaderRight}>
          {mLabel ? (
            <Text style={[styles.entryMood, { color: colors.primary }]}>
              {mLabel}
            </Text>
          ) : null}
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="حذف"
            style={styles.deleteBtn}
          >
            <Feather name="trash-2" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>
      <Text style={[styles.entryText, { color: colors.foreground }]}>
        {entry.content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 18,
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
  composer: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  input: {
    minHeight: 100,
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    lineHeight: 26,
    textAlignVertical: "top",
    writingDirection: "rtl",
  },
  composerActions: {
    flexDirection: "row-reverse",
    gap: 10,
    justifyContent: "flex-start",
  },
  ghostBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  ghostBtnText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    writingDirection: "rtl",
  },
  saveBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
  },
  saveBtnText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 14,
    writingDirection: "rtl",
  },
  addPrompt: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  addPromptText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    writingDirection: "rtl",
  },
  emptyWrap: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Cairo_500Medium",
    fontSize: 14,
    textAlign: "center",
    writingDirection: "rtl",
  },
  list: {
    gap: 12,
  },
  entry: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  entryHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryHeaderRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  entryDate: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    writingDirection: "rtl",
  },
  entryMood: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(43,76,63,0.08)",
    borderRadius: 999,
    writingDirection: "rtl",
  },
  deleteBtn: {
    padding: 6,
  },
  entryText: {
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    lineHeight: 26,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
