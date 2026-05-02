import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export type VoiceState = "idle" | "listening" | "processing" | "unsupported";

type UseVoiceInputOptions = {
  onTranscript: (text: string) => void;
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
      onresult: ((e: { resultIndex: number; results: { isFinal: boolean; [i: number]: { transcript: string } | undefined }[] }) => void) | null;
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
  onError,
  lang = "ar-SA",
}: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceState>("idle");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const Ctor = getSpeechRecognitionCtor();
  const isSupported = Ctor !== null;

  useEffect(() => {
    if (!isSupported) setState("unsupported");
    return () => {
      recognitionRef.current?.abort();
    };
  }, [isSupported]);

  const start = useCallback(() => {
    if (!Ctor) {
      onError?.("التفريغ الصوتي غير متاح في هذا المتصفح.");
      return;
    }
    if (state === "listening") return;

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
        setState("processing");
        onTranscript(final.trim());
      } else if (interim) {
        onTranscript(interim.trim());
      }
    };

    recognition.onerror = (event: { error: string }) => {
      setState("idle");
      if (event.error === "not-allowed") {
        onError?.("يرجى السماح بالوصول إلى الميكروفون.");
      } else if (event.error === "no-speech") {
        onError?.("لم يُكتشف صوت. حاول مجدداً.");
      } else if (event.error !== "aborted") {
        onError?.("تعذّر التعرف على الصوت. حاول مجدداً.");
      }
    };

    recognition.onend = () => {
      setState((s: VoiceState) =>
        s === "listening" || s === "processing" ? "idle" : s
      );
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [Ctor, lang, onError, onTranscript, state]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  return { state, start, stop, isSupported };
}
