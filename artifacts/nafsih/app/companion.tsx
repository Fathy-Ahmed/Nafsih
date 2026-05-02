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
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { COMPANION_OPENERS, MOODS } from "@/constants/arabic";
import { useApp, type ChatMessage } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useVoiceInput } from "@/hooks/useVoiceInput";

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
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  const { state: voiceState, start: startVoice, stop: stopVoice, isSupported: voiceSupported } =
    useVoiceInput({
      lang: "ar-SA",
      onTranscript: (text) => {
        setDraft(text);
        setVoiceHint(null);
      },
      onError: (msg) => {
        setVoiceHint(msg);
        setTimeout(() => setVoiceHint(null), 3000);
      },
    });

  const isListening = voiceState === "listening";

  useEffect(() => {
    if (isListening) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 700 }),
          withTiming(0.0, { duration: 700 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isListening, pulseScale, pulseOpacity]);

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const moodLabel = useMemo(
    () => MOODS.find((m) => m.id === todayMood)?.label ?? null,
    [todayMood]
  );

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
    if (isListening) stopVoice();
    setDraft("");
    setVoiceHint(null);
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
      { data: { messages: history, mood: todayMood ?? undefined } },
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
            content: "تعذّر الاتصال الآن. خذ نفساً عميقاً وأعد المحاولة بعد لحظات بإذن الله.",
            ts: Date.now(),
          });
        },
      }
    );
  }

  function handleMicPress() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isListening) {
      stopVoice();
    } else {
      setDraft("");
      startVoice();
      // Dismiss keyboard so mic is unobstructed
      inputRef.current?.blur();
    }
  }

  const data = chatMutation.isPending
    ? [
        ...chat,
        { id: "pending", role: "assistant" as const, content: "", ts: Date.now() },
      ]
    : chat;

  const canSend = draft.trim().length > 0 && !chatMutation.isPending;
  const micColor = isListening ? colors.accentForeground : colors.mutedForeground;
  const micBg = isListening ? colors.accent : colors.muted;

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
              style={[styles.iconBtn, { backgroundColor: colors.muted }]}
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

        {/* Voice status banner */}
        {(isListening || voiceHint) ? (
          <View
            style={[
              styles.voiceBanner,
              {
                backgroundColor: isListening ? colors.accent : colors.muted,
                borderColor: isListening ? colors.blushSoft : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.voiceBannerText,
                { color: isListening ? colors.accentForeground : colors.foreground },
              ]}
            >
              {isListening ? "أنا أستمع... تحدّث بالعربية" : (voiceHint ?? "")}
            </Text>
          </View>
        ) : null}

        {/* Composer row */}
        <View
          style={[
            styles.composer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Send button — left side (RTL: appears right-most visually) */}
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="إرسال"
            style={({ pressed }) => [
              styles.circleBtn,
              {
                backgroundColor: canSend ? colors.primary : colors.muted,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather
              name="arrow-left"
              size={20}
              color={canSend ? colors.primaryForeground : colors.mutedForeground}
            />
          </Pressable>

          {/* Text input */}
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={(t) => {
              setDraft(t);
              if (isListening && t.length === 0) {
                // user cleared — don't auto-stop
              }
            }}
            placeholder={isListening ? "جارٍ الاستماع..." : "اكتب أو تحدّث..."}
            placeholderTextColor={
              isListening ? colors.accent : colors.mutedForeground
            }
            style={[styles.input, { color: colors.foreground }]}
            multiline
            textAlign="right"
            maxLength={1200}
            editable={!chatMutation.isPending}
          />

          {/* Mic button — right side (RTL: appears left-most visually) */}
          {voiceState !== "unsupported" ? (
            <View style={styles.micWrap}>
              {/* Pulse ring behind the button */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  { backgroundColor: colors.accent },
                  pulseRingStyle,
                ]}
              />
              <Pressable
                onPress={handleMicPress}
                accessibilityRole="button"
                accessibilityLabel={isListening ? "أوقف الاستماع" : "ابدأ الإملاء الصوتي"}
                style={({ pressed }) => [
                  styles.circleBtn,
                  { backgroundColor: micBg, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Feather
                  name={isListening ? "mic-off" : "mic"}
                  size={18}
                  color={micColor}
                />
              </Pressable>
            </View>
          ) : null}
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
  voiceBanner: {
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  voiceBannerText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    writingDirection: "rtl",
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
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  micWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
