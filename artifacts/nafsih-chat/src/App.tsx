import { useState, useRef, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const COLORS = {
  bg: "#F7F5F0",
  sage: "#2B4C3F",
  sageLight: "#E4EAE5",
  sand: "#BFA588",
  blush: "#8E6855",
  blushLight: "#F0E6DD",
  muted: "#9B9186",
  white: "#FFFFFF",
  text: "#212523",
  border: "#E4EAE5",
};

type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  content: string;
  ts: number;
}

const STORAGE_KEY = "nafsih_chat_history";
const MAX_HISTORY = 30;

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function isSameDay(a: number, b: number) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function genId() {
  return Math.random().toString(36).slice(2);
}

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
}

function saveMessages(msgs: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)));
}

async function sendToApi(messages: { role: Role; content: string }[], mood?: string): Promise<string> {
  const res = await fetch(`${BASE}/api/companion/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mood }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { reply: string };
  return data.reply;
}

const QUICK_REPLIES = [
  { label: "اقترح دعاء", prompt: "اقترح لي دعاءً مناسباً لما أشعر به الآن" },
  { label: "تمرين تنفس", prompt: "أريد تمرين تنفّس قصير يساعدني الآن" },
  { label: "آية تريحني", prompt: "شاركني آيةً قرآنية تريح القلب" },
  { label: "ذِكر الصباح", prompt: "علّمني ذِكراً من أذكار الصباح" },
];

type VoiceState = "idle" | "listening" | "unsupported";

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceState("unsupported");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, interim]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const doSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setDraft("");
    setInterim("");
    setError("");

    const userMsg: Message = { id: genId(), role: "user", content: trimmed, ts: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const apiMsgs = updated.map((m) => ({ role: m.role, content: m.content }));
      const reply = await sendToApi(apiMsgs);
      const assistantMsg: Message = { id: genId(), role: "assistant", content: reply, ts: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError("تعذّر الاتصال. يرجى التحقق من الاتصال والمحاولة مجدّداً.");
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const startListening = useCallback(() => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.lang = "ar-SA";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setVoiceState("listening");
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        setDraft((d) => (d + " " + finalText).trim());
        setInterim("");
      }
    };
    rec.onerror = () => {
      setVoiceState("idle");
      setInterim("");
    };
    rec.onend = () => {
      setVoiceState("idle");
      setInterim("");
    };

    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
    setInterim("");
  }, []);

  const toggleMic = useCallback(() => {
    if (voiceState === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState, startListening, stopListening]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend(draft);
    }
  };

  const handleQuickReply = (prompt: string) => {
    doSend(prompt);
  };

  const clearChat = () => {
    if (window.confirm("هل تريد حذف المحادثة؟")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const displayText = interim || draft;
  const canSend = displayText.trim().length > 0 && !loading;

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxWidth: 680,
        margin: "0 auto",
        backgroundColor: COLORS.bg,
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: COLORS.sageLight,
              border: `1px solid rgba(43,76,63,0.12)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 20, fontWeight: 700, color: COLORS.sage }}>ن</span>
          </div>
          <div>
            <h1 style={{ fontFamily: "'Cairo', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.text, lineHeight: 1.2 }}>
              نفسيه
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={COLORS.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'Tajawal', sans-serif" }}>خاص ومُشفّر</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          title="مسح المحادثة"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            borderRadius: 8,
            color: COLORS.muted,
            fontSize: 12,
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          مسح
        </button>
      </header>

      {/* Messages */}
      <main
        className="hide-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 48, color: COLORS.muted }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                backgroundColor: COLORS.sageLight,
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 32, fontWeight: 700, color: COLORS.sage }}>ن</span>
            </div>
            <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: 18, fontWeight: 600, color: COLORS.sage, marginBottom: 8 }}>
              أهلاً بك في نفسيه
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: COLORS.muted, maxWidth: 280, margin: "0 auto" }}>
              أنا رفيقك النفسي. شاركني ما يدور في قلبك، وسأكون معك.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showDate = !prev || !isSameDay(prev.ts, msg.ts);
          const isUser = msg.role === "user";

          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{ textAlign: "center", margin: "16px 0 8px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: COLORS.sand,
                      backgroundColor: "rgba(191,165,136,0.12)",
                      padding: "4px 14px",
                      borderRadius: 20,
                    }}
                  >
                    {formatDate(msg.ts)}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-start" : "flex-end",
                  marginBottom: 4,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    backgroundColor: isUser ? COLORS.sage : COLORS.white,
                    color: isUser ? COLORS.white : COLORS.text,
                    padding: "14px 18px",
                    borderRadius: isUser
                      ? "20px 20px 20px 4px"
                      : "20px 20px 4px 20px",
                    boxShadow: isUser ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                    border: isUser ? "none" : `1px solid ${COLORS.border}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.75,
                      fontFamily: "'Tajawal', sans-serif",
                      whiteSpace: "pre-wrap",
                      textAlign: "right",
                    }}
                  >
                    {msg.content}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      marginTop: 6,
                      textAlign: "left",
                      color: isUser ? "rgba(255,255,255,0.55)" : COLORS.muted,
                    }}
                  >
                    {formatTime(msg.ts)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <div
              style={{
                backgroundColor: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "20px 20px 4px 20px",
                padding: "14px 18px",
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: COLORS.sand,
                    display: "inline-block",
                    animation: `dots 1.4s ${i * 0.2}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inline listening preview */}
        {voiceState === "listening" && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 8 }}>
            <div
              style={{
                backgroundColor: "rgba(43,76,63,0.06)",
                border: `1px solid rgba(43,76,63,0.15)`,
                borderRadius: "20px 20px 20px 4px",
                padding: "14px 18px",
                maxWidth: "80%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ position: "relative", width: 8, height: 8, display: "inline-block" }}>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      backgroundColor: COLORS.blush,
                      opacity: 0.6,
                      animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      display: "block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: COLORS.blush,
                    }}
                  />
                </span>
                <span style={{ fontSize: 12, color: COLORS.blush }}>أنا أستمع...</span>
              </div>
              <p style={{ fontSize: 15, color: interim ? COLORS.text : "rgba(43,76,63,0.4)", fontStyle: interim ? "normal" : "italic" }}>
                {interim || "تحدّث بالعربية"}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              textAlign: "center",
              margin: "12px 0",
              padding: "10px 16px",
              backgroundColor: "rgba(142,104,85,0.08)",
              borderRadius: 12,
              fontSize: 13,
              color: COLORS.blush,
            }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Quick replies */}
      {messages.length > 0 && !loading && (
        <div
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "8px 16px",
            flexShrink: 0,
            flexDirection: "row-reverse",
          }}
        >
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr.label}
              onClick={() => handleQuickReply(qr.prompt)}
              disabled={loading}
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                borderRadius: 20,
                border: `1px solid rgba(191,165,136,0.3)`,
                backgroundColor: COLORS.blushLight,
                color: COLORS.blush,
                fontSize: 13,
                fontFamily: "'Tajawal', sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {qr.label}
            </button>
          ))}
        </div>
      )}

      {/* Voice status banner */}
      {voiceState === "listening" && (
        <div
          style={{
            margin: "0 16px 8px",
            padding: "10px 16px",
            borderRadius: 14,
            backgroundColor: COLORS.blush,
            textAlign: "center",
          }}
        >
          <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 600, color: "#fff" }}>
            أنا أستمع... تحدّث بالعربية
          </span>
        </div>
      )}

      {/* Composer */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${COLORS.border}`,
          padding: "12px 16px env(safe-area-inset-bottom, 16px)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          {/* Send button */}
          <button
            onClick={() => doSend(draft || interim)}
            disabled={!canSend}
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              backgroundColor: canSend ? COLORS.sage : "#E8E2D5",
              cursor: canSend ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={canSend ? "#F7F5F0" : COLORS.muted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "rotate(180deg)" }}
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>

          {/* Text area */}
          <textarea
            ref={inputRef}
            value={voiceState === "listening" ? interim : draft}
            onChange={(e) => {
              if (voiceState !== "listening") setDraft(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={voiceState === "listening" ? "جارٍ الاستماع..." : "اكتب أو تحدّث..."}
            disabled={loading}
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: `1px solid ${voiceState === "listening" ? COLORS.sand : COLORS.border}`,
              borderRadius: 22,
              padding: "10px 16px",
              fontSize: 15,
              fontFamily: "'Tajawal', sans-serif",
              backgroundColor: voiceState === "listening" ? "rgba(142,104,85,0.06)" : COLORS.bg,
              color: COLORS.text,
              outline: "none",
              direction: "rtl",
              textAlign: "right",
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
              transition: "border-color 0.2s",
            }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />

          {/* Mic button */}
          {voiceState !== "unsupported" && (
            <button
              onClick={toggleMic}
              style={{
                flexShrink: 0,
                position: "relative",
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                backgroundColor: voiceState === "listening" ? COLORS.blush : "#E8E2D5",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s",
                overflow: "visible",
              }}
            >
              {voiceState === "listening" && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    backgroundColor: COLORS.blush,
                    opacity: 0.35,
                    animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
              )}
              {voiceState === "listening" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6356" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes dots {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
