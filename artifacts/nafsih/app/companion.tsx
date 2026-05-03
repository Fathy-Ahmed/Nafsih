import { useCompanionChat } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TextInput } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { MessageBubble } from "@/components/MessageBubble";
import { COMPANION_OPENERS, MOODS } from "@/constants/arabic";
import { useApp, type ChatMessage } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

function pickOpener(): string {
  const i = Math.floor(Math.random() * COMPANION_OPENERS.length);
  return COMPANION_OPENERS[i] ?? COMPANION_OPENERS[0]!;
}

function timeLabel(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const period = h < 12 ? "صباحاً" : "مساءً";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `اليوم، ${h12}:${m} ${period}`;
}

// ── FlatList item types ───────────────────────────────────────────────────────

type ListItem =
  | { type: "timepill"; id: string }
  | { type: "message"; id: string; role: "user" | "assistant"; content: string; ts: number; pending?: boolean }
  | { type: "quickreplies"; id: string }
  | { type: "listening"; id: string };

// ── CompanionHeader ───────────────────────────────────────────────────────────

function CompanionHeader({
  onBack,
  onReset,
  showReset,
}: {
  onBack: () => void;
  onReset: () => void;
  showReset: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topPad + 8,
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        {/* Left: back button (in RTL this is visually on the left = "end") */}
        <View style={styles.headerSide}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            style={({ pressed }) => [
              styles.headerBtn,
              { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="chevron-right" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Center: avatar + title + subtitle */}
        <View style={styles.headerCenter}>
          <View style={[styles.avatar, { backgroundColor: "#E4EAE5", borderColor: `${colors.primary}18` }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>ن</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>نفسيه</Text>
            <View style={styles.headerSubRow}>
              <Feather name="lock" size={9} color={colors.secondary} />
              <Text style={[styles.headerSub, { color: colors.secondary }]}>خاص ومُشفّر</Text>
            </View>
          </View>
        </View>

        {/* Right: reset or spacer */}
        <View style={[styles.headerSide, { alignItems: "flex-end" }]}>
          {showReset && (
            <Pressable
              onPress={onReset}
              accessibilityRole="button"
              accessibilityLabel="بدء محادثة جديدة"
              style={({ pressed }) => [
                styles.headerBtn,
                { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="refresh-ccw" size={15} color={colors.foreground} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

// ── TimePill ─────────────────────────────────────────────────────────────────

function TimePill({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.timePillWrap}>
      <View style={[styles.timePill, { backgroundColor: "#F0E6DD80" }]}>
        <Text style={[styles.timePillText, { color: colors.secondary }]}>{timeLabel()}</Text>
      </View>
    </View>
  );
}

// ── QuickReplies ──────────────────────────────────────────────────────────────

function QuickReplies({
  onSelect,
  colors,
}: {
  onSelect: (text: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.quickRow}>
      <Pressable
        onPress={() => onSelect("اقترح لي دعاءً مناسباً لحالتي الآن")}
        style={[styles.quickChip, { backgroundColor: "#F0E6DD", borderColor: "#BFA58833" }]}
      >
        <Feather name="star" size={13} color={colors.accent} />
        <Text style={[styles.quickText, { color: colors.accent }]}>اقترح دعاء</Text>
      </Pressable>
      <Pressable
        onPress={() => onSelect("ساعدني في تمرين تنفس قصير الآن")}
        style={[styles.quickChip, { backgroundColor: "#E4EAE5", borderColor: `${colors.primary}18` }]}
      >
        <Text style={[styles.quickText, { color: colors.primary }]}>تمرين تنفس</Text>
      </Pressable>
    </View>
  );
}

// ── ListeningBubble ───────────────────────────────────────────────────────────

function ListeningBubble({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.row, { justifyContent: "flex-start" }]}>
      <View
        style={[
          styles.listeningBubble,
          { backgroundColor: `${colors.accent}10`, borderColor: `${colors.accent}22` },
        ]}
      >
        <View style={styles.listeningDotRow}>
          <View style={[styles.listeningDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.listeningLabel, { color: colors.accent }]}>أنا أستمع...</Text>
        </View>
        <Text style={[styles.listeningHint, { color: `${colors.primary}60` }]}>
          تحدّث بالعربية
        </Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CompanionScreen() {
  const colors = useColors();
  const router = useRouter();
  const { chat, todayMood, appendChat, resetChat } = useApp();
  const chatMutation = useCompanionChat();
  const [draft, setDraft] = useState("");
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const listRef = useRef<FlatList<ListItem>>(null);
  const inputRef = useRef<TextInput>(null);

  const draftRef = useRef("");
  const chatRef = useRef(chat);
  const todayMoodRef = useRef(todayMood);
  const isPendingRef = useRef(chatMutation.isPending);

  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { chatRef.current = chat; }, [chat]);
  useEffect(() => { todayMoodRef.current = todayMood; }, [todayMood]);
  useEffect(() => { isPendingRef.current = chatMutation.isPending; }, [chatMutation.isPending]);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  const doSend = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? draftRef.current).trim();
    if (!text || isPendingRef.current) return;
    setDraft("");
    draftRef.current = "";
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
    const history = [...chatRef.current, userMsg].slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    chatMutation.mutate(
      { data: { messages: history, mood: todayMoodRef.current ?? undefined } },
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
  }, [appendChat, chatMutation]);

  const { state: voiceState, start: startVoice, stop: stopVoice, isSupported: voiceSupported } =
    useVoiceInput({
      lang: "ar-SA",
      onTranscript: (text) => {
        setDraft(text);
        draftRef.current = text;
        setVoiceHint(null);
      },
      onFinalTranscript: (text) => {
        setDraft(text);
        draftRef.current = text;
        setVoiceHint(null);
        void doSend(text);
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
          withTiming(1.28, { duration: 750, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.0,  { duration: 750, easing: Easing.inOut(Easing.quad) })
        ),
        -1, false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.38, { duration: 750 }),
          withTiming(0.0,  { duration: 750 })
        ),
        -1, false
      );
    } else {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isListening, pulseOpacity, pulseScale]);

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

  function handleMicPress() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isListening) {
      stopVoice();
    } else {
      setDraft("");
      draftRef.current = "";
      startVoice();
      inputRef.current?.blur();
    }
  }

  // Build flat list data
  const data = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [{ type: "timepill", id: "__timepill" }];

    const msgs: ListItem[] = (
      chatMutation.isPending
        ? [...chat, { id: "pending", role: "assistant" as const, content: "", ts: Date.now() }]
        : chat
    ).map((m) => ({
      type: "message",
      id: m.id,
      role: m.role,
      content: m.content,
      ts: m.ts,
      pending: m.id === "pending",
    }));

    items.push(...msgs);

    // Show quick replies if last real message is from assistant and not pending
    const lastReal = chat[chat.length - 1];
    if (lastReal && lastReal.role === "assistant" && !chatMutation.isPending) {
      items.push({ type: "quickreplies", id: "__quickreplies" });
    }

    // Inline listening bubble
    if (isListening) {
      items.push({ type: "listening", id: "__listening" });
    }

    return items;
  }, [chat, chatMutation.isPending, isListening]);

  const canSend = draft.trim().length > 0 && !chatMutation.isPending;
  const micBg = isListening ? colors.accent : colors.muted;
  const micColor = isListening ? colors.accentForeground : colors.mutedForeground;

  const bannerText = voiceHint
    ? voiceHint
    : voiceState === "processing"
    ? "جارٍ الإرسال..."
    : "";
  const showBanner = voiceState === "processing" || !!voiceHint;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      {/* Custom Header */}
      <CompanionHeader
        onBack={() => router.back()}
        onReset={() => void resetChat()}
        showReset={chat.length > 1}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList<ListItem>
          ref={listRef}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.type === "timepill") {
              return <TimePill colors={colors} />;
            }
            if (item.type === "quickreplies") {
              return <QuickReplies onSelect={(t) => void doSend(t)} colors={colors} />;
            }
            if (item.type === "listening") {
              return <ListeningBubble colors={colors} />;
            }
            return (
              <MessageBubble
                role={item.role}
                content={item.content}
                pending={item.pending}
              />
            );
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Processing / error banner (not listening — that's shown inline) */}
        {showBanner ? (
          <View
            style={[
              styles.voiceBanner,
              {
                backgroundColor: voiceState === "processing" ? colors.primary : colors.muted,
                borderColor: voiceState === "processing" ? colors.sageGlow : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.voiceBannerText,
                {
                  color: voiceState === "processing"
                    ? colors.primaryForeground
                    : colors.foreground,
                },
              ]}
            >
              {bannerText}
            </Text>
          </View>
        ) : null}

        {/* Composer */}
        <View
          style={[
            styles.composer,
            {
              backgroundColor: colors.card,
              borderColor: isListening ? `${colors.accent}55` : colors.border,
            },
          ]}
        >
          {/* Send arrow — left side (RTL: visually left = "end") */}
          <Pressable
            onPress={() => void doSend()}
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
              draftRef.current = t;
            }}
            placeholder={isListening ? "جارٍ الاستماع..." : "اكتب أو تحدّث..."}
            placeholderTextColor={isListening ? colors.accent : colors.mutedForeground}
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: isListening ? `${colors.accent}08` : "transparent",
              },
            ]}
            multiline
            textAlign="right"
            maxLength={1200}
            editable={!chatMutation.isPending && !isListening}
          />

          {/* Mic button */}
          {voiceState !== "unsupported" ? (
            <View style={styles.micWrap}>
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerSide: {
    width: 44,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    lineHeight: 22,
  },
  headerText: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    writingDirection: "rtl",
    lineHeight: 22,
  },
  headerSubRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  headerSub: {
    fontFamily: "Cairo_400Regular",
    fontSize: 11,
    writingDirection: "rtl",
  },

  // List
  list: {
    paddingVertical: 12,
    paddingBottom: 8,
  },

  // Time pill
  timePillWrap: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  timePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timePillText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 11,
    writingDirection: "rtl",
  },

  // Quick replies
  quickRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  quickChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  quickText: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    writingDirection: "rtl",
  },

  // Listening bubble
  row: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  listeningBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  listeningDotRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  listeningDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  listeningLabel: {
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    writingDirection: "rtl",
  },
  listeningHint: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    writingDirection: "rtl",
    textAlign: "right",
  },

  // Voice banner
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

  // Composer
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
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontFamily: "Cairo_500Medium",
    fontSize: 15,
    writingDirection: "rtl",
    borderRadius: 20,
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
});
