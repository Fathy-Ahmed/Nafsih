import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export type VoiceState = "idle" | "listening" | "processing" | "unsupported";

type UseVoiceInputOptions = {
  /** Called with interim (in-progress) transcript text as the user speaks. */
  onTranscript: (text: string) => void;
  /** Called once with the final confirmed transcript when recognition ends. Auto-send hook. */
  onFinalTranscript?: (text: string) => void;
  onError?: (msg: string) => void;
  lang?: string;
};

function getSpeechRecognitionCtor():
  | (new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      maxAlternatives: number;
      onstart: (() => void) | null;
      onresult: ((e: {
        resultIndex: number;
        results: { isFinal: boolean; [i: number]: { transcript: string } | undefined }[];
      }) => void) | null;
      onerror: ((e: { error: string }) => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
      abort: () => void;
    })
  | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceInput({
  onTranscript,
  onFinalTranscript,
  onError,
  lang = "ar-SA",
}: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceState>("idle");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalTextRef = useRef<string>("");

  const Ctor = getSpeechRecognitionCtor();
  const isSupported = Ctor !== null;

  // Keep callbacks in refs so they don't stale-close over old values
  const onTranscriptRef = useRef(onTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onErrorRef = useRef(onError);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFinalTranscriptRef.current = onFinalTranscript; }, [onFinalTranscript]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    if (!isSupported) setState("unsupported");
    return () => { recognitionRef.current?.abort(); };
  }, [isSupported]);

  const start = useCallback(() => {
    if (!Ctor) {
      onErrorRef.current?.("التفريغ الصوتي غير متاح في هذا المتصفح.");
      return;
    }
    if (state === "listening") return;

    finalTextRef.current = "";
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setState("listening");

    recognition.onresult = (event: {
      resultIndex: number;
      results: { isFinal: boolean; [i: number]: { transcript: string } | undefined }[];
    }) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        finalTextRef.current = final.trim();
        setState("processing");
        onTranscriptRef.current(final.trim());
      } else if (interim) {
        onTranscriptRef.current(interim.trim());
      }
    };

    recognition.onerror = (event: { error: string }) => {
      setState("idle");
      finalTextRef.current = "";
      if (event.error === "not-allowed") {
        onErrorRef.current?.("يرجى السماح بالوصول إلى الميكروفون.");
      } else if (event.error === "no-speech") {
        onErrorRef.current?.("لم يُكتشف صوت. حاول مجدداً.");
      } else if (event.error !== "aborted") {
        onErrorRef.current?.("تعذّر التعرف على الصوت. حاول مجدداً.");
      }
    };

    recognition.onend = () => {
      const captured = finalTextRef.current;
      setState("idle");
      finalTextRef.current = "";
      if (captured) {
        onFinalTranscriptRef.current?.(captured);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [Ctor, lang, state]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { state, start, stop, isSupported };
}
