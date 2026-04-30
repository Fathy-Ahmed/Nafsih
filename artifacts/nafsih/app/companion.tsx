import { useCompanionChat } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { COMPANION_OPENERS, MOODS } from "@/constants/arabic";
import { useApp, type ChatMessage } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

function pickOpener(): string {
  const i = Math.floor(Math.random() * COMPANION_OPENERS.length);
  return COMPANION_OPENERS[i] ?? COMPANION_OPENERS[0]!;
}

export default function CompanionScreen() {
  const colors = useColors();
  const { chat, todayMood, appendChat, resetChat } = useApp();
  const chatMutation = useCompanionChat();
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const moodLabel = useMemo(
    () => MOODS.find((m) => m.id === todayMood)?.label ?? null,
    [todayMood]
  );

  // Seed an opener on first mount if no history
  useEffect(() => {
    if (chat.length === 0) {
      void appendChat({
        id: genId(),
        role: "assistant",
        content: pickOpener(),
        ts: Date.now(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chat.length > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [chat.length]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || chatMutation.isPending) return;
    setDraft("");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content: text,
      ts: Date.now(),
    };
    await appendChat(userMsg);

    const history = [...chat, userMsg].slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    chatMutation.mutate(
      {
        data: {
          messages: history,
          mood: todayMood ?? undefined,
        },
      },
      {
        onSuccess: async (res) => {
          await appendChat({
            id: genId(),
            role: "assistant",
            content: res.reply,
            ts: Date.now(),
          });
        },
        onError: async () => {
          await appendChat({
            id: genId(),
            role: "assistant",
            content:
              "تعذّر الاتصال الآن. خذ نفساً عميقاً وأعد المحاولة بعد لحظات بإذن الله.",
            ts: Date.now(),
          });
        },
      }
    );
  }

  const data = chatMutation.isPending
    ? [
        ...chat,
        {
          id: "pending",
          role: "assistant" as const,
          content: "",
          ts: Date.now(),
        },
      ]
    : chat;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <Header
        title="الرفيق"
        eyebrow={moodLabel ? `حالتك اليوم: ${moodLabel}` : "مساحة آمنة للحديث"}
        rightSlot={
          chat.length > 1 ? (
            <Pressable
              onPress={() => void resetChat()}
              accessibilityRole="button"
              accessibilityLabel="بدء محادثة جديدة"
              style={[styles.resetBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name="refresh-ccw" size={16} color={colors.foreground} />
            </Pressable>
          ) : null
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble
              role={item.role}
              content={item.content}
              pending={item.id === "pending"}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
        />

        <View
          style={[
            styles.composer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim() || chatMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="إرسال"
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor:
                  draft.trim() && !chatMutation.isPending
                    ? colors.primary
                    : colors.muted,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather
              name="arrow-left"
              size={20}
              color={
                draft.trim() && !chatMutation.isPending
                  ? colors.primaryForeground
                  : colors.mutedForeground
              }
            />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="اكتب ما يجول في بالك..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
            textAlign="right"
            maxLength={1200}
            editable={!chatMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 12,
    paddingBottom: 16,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    writingDirection: "rtl",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
