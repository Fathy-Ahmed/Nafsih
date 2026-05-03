import React, { useState } from "react";
import { Lock, Send, Sparkles, ChevronRight } from "lucide-react";
import "./_group.css";

export default function Companion() {
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");

  function toggleMic() {
    if (listening) {
      setListening(false);
      setDraft("أشعر بضغط كبير في العمل اليوم");
    } else {
      setDraft("");
      setListening(true);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4">
      <div
        dir="rtl"
        lang="ar"
        className="relative w-[390px] h-[844px] overflow-hidden bg-[#F7F5F0] rounded-[40px] shadow-2xl border-8 border-neutral-800 nafsih-app flex flex-col"
      >
        {/* Header */}
        <header className="pt-14 pb-4 px-4 bg-white/80 backdrop-blur-md border-b border-[#E4EAE5]/50 z-20 sticky top-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 -mr-2 text-[#212523] rounded-full hover:bg-neutral-100">
              <ChevronRight size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E4EAE5] flex items-center justify-center border border-[#2B4C3F]/10">
                <span className="font-cairo text-lg font-bold text-[#2B4C3F]">ن</span>
              </div>
              <div>
                <h1 className="font-cairo text-lg font-bold text-[#212523] leading-none">نفسيه</h1>
                <div className="flex items-center gap-1 mt-1 text-[#6B726B]">
                  <Lock size={10} />
                  <span className="font-tajawal text-xs">خاص ومُشفّر</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative z-10 hide-scrollbar flex flex-col">
          <div className="absolute inset-0 nafsih-pattern pointer-events-none opacity-5" />

          <div className="text-center mb-4">
            <span className="font-tajawal text-xs text-[#BFA588] bg-[#F0E6DD]/50 px-3 py-1 rounded-full">
              اليوم، ٦:٣٠ صباحاً
            </span>
          </div>

          {/* User Message */}
          <div className="flex justify-start w-full">
            <div className="bg-[#2B4C3F] text-white px-5 py-4 rounded-3xl rounded-tl-sm max-w-[85%] shadow-sm">
              <p className="font-tajawal text-[15px] leading-relaxed">
                أشعر بضغط كبير اليوم. لدي اجتماعات متتالية والمهام لا تنتهي.
              </p>
            </div>
          </div>

          {/* Companion Message */}
          <div className="flex justify-end w-full">
            <div className="bg-white text-[#212523] px-5 py-4 rounded-3xl rounded-tr-sm max-w-[85%] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E4EAE5]">
              <p className="font-tajawal text-[15px] leading-relaxed">
                أفهم هذا الثقل. تذكّر أن عليك السعي فقط، والنتيجة بيد الله.
                <br /><br />
                "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ"
                <br /><br />
                هل نبدأ بتمرين تنفّس قصير قبل اجتماعك الأول؟
              </p>
            </div>
          </div>

          {/* Quick replies */}
          <div className="flex justify-end gap-2 w-full mt-2">
            <button className="bg-[#F0E6DD] text-[#8E6855] px-4 py-2 rounded-full font-tajawal text-sm font-medium border border-[#BFA588]/20 flex items-center gap-1.5">
              <Sparkles size={14} />
              اقترح دعاء
            </button>
            <button className="bg-[#E4EAE5] text-[#2B4C3F] px-4 py-2 rounded-full font-tajawal text-sm font-medium border border-[#2B4C3F]/10">
              تمرين تنفس
            </button>
          </div>

          {/* Listening state — inline transcript preview */}
          {listening && (
            <div className="flex justify-start w-full">
              <div className="bg-[#2B4C3F]/8 border border-[#2B4C3F]/15 px-5 py-4 rounded-3xl rounded-tl-sm max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8E6855] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8E6855]" />
                  </span>
                  <span className="font-tajawal text-xs text-[#8E6855]">أنا أستمع...</span>
                </div>
                <p className="font-tajawal text-[15px] text-[#2B4C3F]/50 leading-relaxed">
                  تحدّث بالعربية
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Voice status banner */}
        {listening && (
          <div className="mx-4 mb-2 px-4 py-2.5 rounded-2xl bg-[#8E6855] border border-[#B98C73] text-center">
            <span className="font-cairo text-[13px] font-semibold text-white">
              أنا أستمع... تحدّث بالعربية
            </span>
          </div>
        )}

        {/* Composer */}
        <div className="p-4 pb-8 bg-white/80 backdrop-blur-md border-t border-[#E4EAE5]/50 z-20">
          <div className="flex items-end gap-2">

            {/* Send button */}
            <button
              onClick={() => { setDraft(""); setListening(false); }}
              className="flex-shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center shadow-sm transition-colors"
              style={{ backgroundColor: draft.trim() ? "#2B4C3F" : "#E8E2D5" }}
            >
              <Send
                size={18}
                className="rotate-180"
                color={draft.trim() ? "#F7F5F0" : "#9B9186"}
              />
            </button>

            {/* Text input */}
            <div
              className="flex-1 rounded-[22px] border px-4 py-3 min-h-[44px] flex items-center"
              style={{
                backgroundColor: listening ? "rgba(142,104,85,0.06)" : "#F7F5F0",
                borderColor: listening ? "#B98C73" : "#E5DFCE",
              }}
            >
              {draft ? (
                <span className="font-tajawal text-[15px] text-[#2A2A28] w-full block text-right leading-relaxed">
                  {draft}
                </span>
              ) : (
                <span
                  className="font-tajawal text-[15px] w-full block text-right"
                  style={{ color: listening ? "#8E6855" : "#9B9186" }}
                >
                  {listening ? "جارٍ الاستماع..." : "اكتب أو تحدّث..."}
                </span>
              )}
            </div>

            {/* Mic button */}
            <button
              onClick={toggleMic}
              className="flex-shrink-0 relative w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all"
              style={{ backgroundColor: listening ? "#8E6855" : "#E8E2D5" }}
            >
              {/* Pulse ring when listening */}
              {listening && (
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ backgroundColor: "#8E6855", opacity: 0.35 }}
                />
              )}
              {/* Mic icon — inline SVG so we can toggle between mic / mic-off */}
              {listening ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          </div>
        </div>
      </div>
    </div>
  );
}
