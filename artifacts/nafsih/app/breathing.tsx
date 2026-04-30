import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { Header } from "@/components/Header";
import { PrimaryButton } from "@/components/PrimaryButton";
import { arabicNumber } from "@/constants/arabic";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const PHASE_MS = 4000;
const PHASES = [
  { id: "inhale", label: "اسحب نفسك", hint: "أربع ثوانٍ" },
  { id: "hold", label: "احتفظ به", hint: "أربع ثوانٍ" },
  { id: "exhale", label: "أخرج بهدوء", hint: "أربع ثوانٍ" },
  { id: "rest", label: "استرح", hint: "أربع ثوانٍ" },
] as const;

export default function BreathingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { markBreathingDone, streak } = useApp();
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.7);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setRunning(true);
    setPhaseIdx(0);
    setCycle(0);

    scale.value = 0.6;
    opacity.value = 0.7;

    scale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: PHASE_MS, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.0, { duration: PHASE_MS, easing: Easing.linear }),
        withTiming(0.6, { duration: PHASE_MS, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.6, { duration: PHASE_MS, easing: Easing.linear })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: PHASE_MS }),
        withTiming(0.95, { duration: PHASE_MS }),
        withTiming(0.55, { duration: PHASE_MS }),
        withTiming(0.55, { duration: PHASE_MS })
      ),
      -1,
      false
    );

    intervalRef.current = setInterval(() => {
      setPhaseIdx((p) => {
        const next = (p + 1) % PHASES.length;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, PHASE_MS);
  }

  function stop() {
    setRunning(false);
    cancelAnimation(scale);
    cancelAnimation(opacity);
    scale.value = withTiming(0.6, { duration: 600 });
    opacity.value = withTiming(0.7, { duration: 600 });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function finish() {
    stop();
    await markBreathingDone();
    router.back();
  }

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const phase = PHASES[phaseIdx]!;

  const dhikrText = useMemo(() => {
    const list = [
      "سُبْحَانَ اللَّهِ",
      "الْحَمْدُ لِلَّهِ",
      "اللَّهُ أَكْبَرُ",
      "لَا إِلَٰهَ إِلَّا اللَّهُ",
    ];
    return list[phaseIdx]!;
  }, [phaseIdx]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.sageDeep }}>
      <LinearGradient
        colors={[colors.sageDeep, "#0F1F1A"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <Header title="نفَس" eyebrow="تنفُّس واعٍ" variant="dark" />

        <View style={styles.body}>
          <View style={styles.orbWrap}>
            <View
              style={[
                styles.haloOuter,
                { borderColor: "rgba(232,217,191,0.10)" },
              ]}
            />
            <View
              style={[
                styles.haloMid,
                { borderColor: "rgba(232,217,191,0.16)" },
              ]}
            />
            <Animated.View
              style={[
                styles.orb,
                {
                  backgroundColor: colors.sageGlow,
                  shadowColor: colors.sandLight,
                },
                orbStyle,
              ]}
            >
              <Text style={[styles.orbText, { color: colors.sandPale }]}>
                {running ? phase.label : "ابدأ"}
              </Text>
              {running ? (
                <Text style={[styles.orbHint, { color: colors.sandLight }]}>
                  {phase.hint}
                </Text>
              ) : null}
            </Animated.View>
          </View>

          <View style={styles.dhikrWrap}>
            <Text style={[styles.dhikr, { color: colors.sandPale }]}>
              {running ? dhikrText : "خذ لحظةً مع ربك"}
            </Text>
            <Text style={[styles.cycle, { color: colors.sandLight }]}>
              {running
                ? `الدورة ${arabicNumber(cycle + 1)}`
                : `سلسلتك الحالية: ${arabicNumber(streak)} يوم`}
            </Text>
          </View>

          <View style={styles.controls}>
            {!running ? (
              <PrimaryButton label="ابدأ التنفس" onPress={start} />
            ) : (
              <View style={styles.runningRow}>
                <Pressable
                  onPress={stop}
                  style={[
                    styles.iconBtn,
                    { backgroundColor: "rgba(255,255,255,0.10)" },
                  ]}
                >
                  <Feather name="pause" size={20} color={colors.sandPale} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <PrimaryButton label="أنهيت بإذن الله" onPress={finish} />
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  orbWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  haloOuter: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
  },
  haloMid: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
  },
  orb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.3,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  orbText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 24,
    writingDirection: "rtl",
  },
  orbHint: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    marginTop: 6,
    writingDirection: "rtl",
  },
  dhikrWrap: {
    alignItems: "center",
    paddingVertical: 16,
  },
  dhikr: {
    fontFamily: "Cairo_700Bold",
    fontSize: 24,
    textAlign: "center",
    writingDirection: "rtl",
  },
  cycle: {
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    marginTop: 10,
    letterSpacing: 1,
    writingDirection: "rtl",
  },
  controls: {
    paddingTop: 12,
  },
  runningRow: {
    flexDirection: "row-reverse",
    gap: 12,
    alignItems: "center",
  },
  iconBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
});
