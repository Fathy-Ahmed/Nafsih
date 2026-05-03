import { useState, useEffect, useRef } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:         "#F7F5F0",
  sage:       "#2B4C3F",
  sageLight:  "#E4EAE5",
  sand:       "#BFA588",
  blush:      "#8E6855",
  blushLight: "#F0E6DD",
  muted:      "#6B726B",
  mutedLight: "#9B9186",
  white:      "#FFFFFF",
  text:       "#212523",
  border:     "rgba(228,234,229,0.6)",
};

// ── Types ──────────────────────────────────────────────────────────────────
interface JournalEntry {
  id:      string;
  date:    string;   // YYYY-MM-DD
  content: string;
  ts:      number;
}

interface MoodRecord {
  date:  string;   // YYYY-MM-DD
  score: number;   // 1–5
  label: string;
}

// ── Storage keys ───────────────────────────────────────────────────────────
const KEY_ENTRIES  = "nafsih_journal_entries";
const KEY_MOODS    = "nafsih_mood_history";
const KEY_VISITED  = "nafsih_visited_days";

// ── Arabic day abbreviations (starting Sunday) ─────────────────────────────
const AR_DAYS = ["ح","ن","ث","ر","خ","ج","س"];   // Sun…Sat

// ── Moods ──────────────────────────────────────────────────────────────────
const MOODS = [
  { score: 5, label: "ممتاز",   color: "#2B4C3F", bg: "#E4EAE5" },
  { score: 4, label: "جيد",     color: "#4A7C6B", bg: "#EAF0EC" },
  { score: 3, label: "عادي",    color: "#BFA588", bg: "#F0E6DD" },
  { score: 2, label: "متعب",    color: "#8E6855", bg: "#F5ECE6" },
  { score: 1, label: "صعب",     color: "#7A4A3A", bg: "#F3E8E8" },
];

// ── Achievements ───────────────────────────────────────────────────────────
interface Achievement {
  id:      string;
  title:   string;
  desc:    string;
  color:   string;
  bgFrom:  string;
  check:   (data: { streak: number; entries: JournalEntry[]; moods: MoodRecord[] }) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "week_calm",
    title: "أسبوع من الهدوء",
    desc: "٧ أيام متتالية",
    color: C.sage,
    bgFrom: C.sageLight,
    check: ({ streak }) => streak >= 7,
  },
  {
    id: "ten_entries",
    title: "١٠ تأملات",
    desc: "كتبت ١٠ مرات",
    color: C.blush,
    bgFrom: C.blushLight,
    check: ({ entries }) => entries.length >= 10,
  },
  {
    id: "two_weeks",
    title: "١٤ يوماً متتالية",
    desc: "استمراريّة مميّزة",
    color: C.sage,
    bgFrom: "#D6E8E0",
    check: ({ streak }) => streak >= 14,
  },
  {
    id: "first_entry",
    title: "البداية",
    desc: "أول تأمّل لك",
    color: C.sand,
    bgFrom: "#F5ECD9",
    check: ({ entries }) => entries.length >= 1,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" });
}

function toArabicNum(n: number): string {
  return n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[+d]);
}

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
}

function save(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

function calcStreak(visited: string[]): number {
  if (!visited.length) return 0;
  const sorted = [...new Set(visited)].sort().reverse();
  const tod = today();
  let streak = 0;
  let cur = tod;
  for (const d of sorted) {
    if (d === cur) { streak++; const dt = new Date(cur); dt.setDate(dt.getDate()-1); cur = dt.toISOString().slice(0,10); }
    else if (d < cur) break;
  }
  return streak;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    days.push(d.toISOString().slice(0,10));
  }
  return days;
}

function genId(): string { return Math.random().toString(36).slice(2); }

// ── Icon components ────────────────────────────────────────────────────────
function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.sand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}

function IconAward({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [entries,  setEntries]  = useState<JournalEntry[]>(() => load(KEY_ENTRIES, []));
  const [moods,    setMoods]    = useState<MoodRecord[]>  (() => load(KEY_MOODS,   []));
  const [visited,  setVisited]  = useState<string[]>      (() => load(KEY_VISITED, []));

  const [showNewEntry,   setShowNewEntry]   = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [draft,          setDraft]          = useState("");
  const [todayMood,      setTodayMood]      = useState<MoodRecord | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mark today as visited
  useEffect(() => {
    const tod = today();
    if (!visited.includes(tod)) {
      const next = [...visited, tod];
      setVisited(next);
      save(KEY_VISITED, next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Find today's mood
  useEffect(() => {
    const tod = today();
    setTodayMood(moods.find(m => m.date === tod) ?? null);
  }, [moods]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (showNewEntry) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [showNewEntry]);

  const streak = calcStreak(visited);
  const last7  = getLast7Days();

  // Bar chart data
  const chartData = last7.map(d => {
    const mood = moods.find(m => m.date === d);
    const dayIdx = new Date(d + "T12:00:00").getDay(); // 0=Sun
    const isToday = d === today();
    return {
      date: d,
      score: mood?.score ?? 0,
      dayLetter: AR_DAYS[dayIdx],
      isToday,
    };
  });

  const achievements = ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: a.check({ streak, entries, moods }),
  }));

  function saveMood(score: number, label: string) {
    const rec: MoodRecord = { date: today(), score, label };
    const filtered = moods.filter(m => m.date !== today());
    const next = [...filtered, rec];
    setMoods(next);
    save(KEY_MOODS, next);
    setShowMoodPicker(false);
  }

  function saveEntry() {
    if (!draft.trim()) return;
    const entry: JournalEntry = {
      id:      genId(),
      date:    today(),
      content: draft.trim(),
      ts:      Date.now(),
    };
    const next = [entry, ...entries];
    setEntries(next);
    save(KEY_ENTRIES, next);
    setDraft("");
    setShowNewEntry(false);
  }

  const recentEntries = showAllEntries ? entries : entries.slice(0, 3);

  const streakMsg =
    streak >= 14 ? "ما شاء الله، استمراريّة رائعة. أنت تبني عادة حقيقية."
    : streak >= 7 ? "أسبوع كامل! القليل الدائم خير من الكثير المنقطع."
    : streak >= 3 ? "ثلاثة أيام متتالية. كل يوم تُضيف لبنة لنفسك."
    : streak === 1 ? "اليوم أول خطوة. الاستمرار هو السر."
    : "عُد كلّ يوم، حتى لو لدقائق قليلة.";

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
        backgroundColor: C.bg,
        fontFamily: "'Tajawal', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header style={{
        padding: "20px 24px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <h1 style={{ fontFamily: "'Cairo', sans-serif", fontSize: 28, fontWeight: 700, color: C.text }}>
          رحلتك
        </h1>
        <button
          onClick={() => setShowMoodPicker(true)}
          title="سجّل مزاجك"
          style={{
            width: 40, height: 40, borderRadius: "50%",
            backgroundColor: C.white,
            border: `1px solid ${C.sageLight}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: C.sage,
          }}
        >
          <IconCalendar />
        </button>
      </header>

      {/* Scrollable body */}
      <main
        className="hide-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "8px 20px 120px" }}
      >

        {/* ── Streak card ── */}
        <section
          className="fade-in"
          style={{
            backgroundColor: C.white,
            borderRadius: 28,
            border: `1px solid ${C.border}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            padding: "28px 20px 24px",
            textAlign: "center",
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            backgroundColor: C.blushLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            position: "relative",
          }}>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 44, fontWeight: 700, color: C.blush }}>
              {toArabicNum(streak)}
            </span>
            <div style={{
              position: "absolute", bottom: -10,
              backgroundColor: C.sage, color: C.white,
              fontSize: 10, fontWeight: 700,
              padding: "3px 12px", borderRadius: 20,
              letterSpacing: "0.04em",
            }}>
              يومًا متتالية
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 280, margin: "0 auto", marginTop: 8 }}>
            {streakMsg}
          </p>
        </section>

        {/* ── Mood this week ── */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontSize: 17, fontWeight: 700, color: C.text }}>
              مزاجك هذا الأسبوع
            </h2>
            <IconTrend />
          </div>
          <div style={{
            backgroundColor: C.white,
            borderRadius: 24,
            border: `1px solid ${C.border}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            padding: "20px 16px 16px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: 120,
          }}>
            {chartData.map((d, i) => {
              const barH = d.score ? `${(d.score / 5) * 100}%` : "8%";
              const barBg = d.isToday ? C.sage
                : d.score === 5 ? C.sageLight
                : d.score === 4 ? "#EAF0EC"
                : d.score === 3 ? C.blushLight
                : d.score === 2 ? "#F5ECE6"
                : d.score === 1 ? "#F3E8E8"
                : "rgba(0,0,0,0.06)";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 28, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 64, alignItems: "center" }}>
                    <div style={{
                      width: 12, height: barH,
                      borderRadius: 6,
                      backgroundColor: barBg,
                      transition: "height 0.5s ease",
                      boxShadow: d.isToday ? "0 2px 6px rgba(43,76,63,0.3)" : "none",
                    }} />
                  </div>
                  <span style={{
                    fontSize: 10,
                    color: d.isToday ? C.sage : C.muted,
                    fontWeight: d.isToday ? 700 : 400,
                  }}>
                    {d.dayLetter}
                  </span>
                </div>
              );
            })}
          </div>
          {!todayMood && (
            <button
              onClick={() => setShowMoodPicker(true)}
              style={{
                width: "100%", marginTop: 10,
                padding: "10px",
                border: `1px dashed ${C.sand}`,
                borderRadius: 14,
                backgroundColor: "transparent",
                color: C.sand,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              سجّل مزاجك اليوم
            </button>
          )}
          {todayMood && (
            <p style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: C.mutedLight }}>
              مزاجك اليوم: <strong style={{ color: C.sage }}>{todayMood.label}</strong>
            </p>
          )}
        </section>

        {/* ── Achievements ── */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Cairo', sans-serif", fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 14 }}>
            إنجازات
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {achievements.map(a => (
              <div
                key={a.id}
                style={{
                  background: a.unlocked
                    ? `linear-gradient(135deg, ${a.bgFrom}, ${C.white})`
                    : "linear-gradient(135deg, #F2F0EC, #FAFAF8)",
                  padding: "16px",
                  borderRadius: 20,
                  border: `1px solid ${a.unlocked ? a.bgFrom : C.sageLight}`,
                  display: "flex", flexDirection: "column", gap: 10,
                  opacity: a.unlocked ? 1 : 0.45,
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  backgroundColor: `${a.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconAward color={a.unlocked ? a.color : C.mutedLight} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, color: C.text }}>
                    {a.title}
                  </h3>
                  <p style={{ fontSize: 11, color: C.mutedLight, marginTop: 2 }}>
                    {a.unlocked ? "مكتمل" : a.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Journal entries ── */}
        <section style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", fontSize: 17, fontWeight: 700, color: C.text }}>
              تأملات سابقة
            </h2>
            {entries.length > 3 && (
              <button
                onClick={() => setShowAllEntries(!showAllEntries)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: C.sand, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 2,
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                {showAllEntries ? "أقل" : "عرض الكل"} <IconChevronLeft />
              </button>
            )}
          </div>

          {entries.length === 0 && (
            <div style={{
              textAlign: "center", padding: "32px 20px",
              backgroundColor: C.white, borderRadius: 20,
              border: `1px dashed ${C.sageLight}`,
              color: C.mutedLight, fontSize: 14, lineHeight: 1.7,
            }}>
              لا تأملات بعد.<br />ابدأ بكتابة أول تأمّل لك اليوم.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentEntries.map((e, i) => (
              <div
                key={e.id}
                className="fade-in"
                style={{
                  backgroundColor: C.white,
                  padding: "16px",
                  borderRadius: 18,
                  border: `1px solid ${C.border}`,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <p style={{ fontSize: 11, color: C.sand, marginBottom: 8, fontWeight: 700 }}>
                  {dateLabel(e.date)}
                </p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, textAlign: "right" }}>
                  "{e.content}"
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── FAB: New entry ── */}
      <button
        onClick={() => setShowNewEntry(true)}
        style={{
          position: "fixed",
          bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: C.sage,
          color: C.white,
          border: "none",
          borderRadius: 28,
          padding: "14px 28px",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "'Cairo', sans-serif",
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 20px rgba(43,76,63,0.35)",
          letterSpacing: "0.02em",
          zIndex: 30,
        }}
      >
        <IconPlus /> تأمّل جديد
      </button>

      {/* ── Modal: New entry ── */}
      {showNewEntry && (
        <div
          onClick={() => setShowNewEntry(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "flex-end",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="scale-in"
            style={{
              width: "100%", maxWidth: 680, margin: "0 auto",
              backgroundColor: C.white,
              borderRadius: "24px 24px 0 0",
              padding: "24px 20px 40px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontSize: 18, fontWeight: 700, color: C.text }}>
                تأمّل جديد
              </h2>
              <button
                onClick={() => setShowNewEntry(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedLight }}
              >
                <IconClose />
              </button>
            </div>
            <p style={{ fontSize: 12, color: C.mutedLight, marginBottom: 12 }}>
              {dateLabel(today())}
            </p>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="اكتب ما يدور في ذهنك وقلبك الآن..."
              rows={5}
              style={{
                width: "100%", resize: "none",
                border: `1px solid ${C.sageLight}`,
                borderRadius: 16,
                padding: "14px 16px",
                fontSize: 15, lineHeight: 1.75,
                fontFamily: "'Tajawal', sans-serif",
                backgroundColor: C.bg,
                color: C.text,
                outline: "none",
                direction: "rtl", textAlign: "right",
              }}
            />
            <button
              onClick={saveEntry}
              disabled={!draft.trim()}
              style={{
                width: "100%", marginTop: 14,
                padding: "14px",
                borderRadius: 16,
                border: "none",
                backgroundColor: draft.trim() ? C.sage : C.sageLight,
                color: draft.trim() ? C.white : C.mutedLight,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "'Cairo', sans-serif",
                cursor: draft.trim() ? "pointer" : "not-allowed",
                transition: "background-color 0.2s",
              }}
            >
              حفظ التأمّل
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Mood picker ── */}
      {showMoodPicker && (
        <div
          onClick={() => setShowMoodPicker(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "flex-end",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="scale-in"
            style={{
              width: "100%", maxWidth: 680, margin: "0 auto",
              backgroundColor: C.white,
              borderRadius: "24px 24px 0 0",
              padding: "24px 20px 48px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cairo', sans-serif", fontSize: 18, fontWeight: 700, color: C.text }}>
                كيف حالك اليوم؟
              </h2>
              <button
                onClick={() => setShowMoodPicker(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedLight }}
              >
                <IconClose />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOODS.map(m => (
                <button
                  key={m.score}
                  onClick={() => saveMood(m.score, m.label)}
                  style={{
                    padding: "14px 20px",
                    borderRadius: 16,
                    border: `1px solid ${todayMood?.score === m.score ? m.color : "transparent"}`,
                    backgroundColor: m.bg,
                    color: m.color,
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "'Cairo', sans-serif",
                    cursor: "pointer",
                    textAlign: "right",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{m.label}</span>
                  {todayMood?.score === m.score && (
                    <span style={{ fontSize: 11, opacity: 0.7 }}>مسجّل</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
