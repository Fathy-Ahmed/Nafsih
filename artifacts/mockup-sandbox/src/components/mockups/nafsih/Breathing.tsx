import React from "react";
import { ChevronRight, Volume2 } from "lucide-react";
import "./_group.css";

export default function Breathing() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4">
      <style>{`
        @keyframes nafsihBreathe {
          0%, 5%   { transform: scale(0.55); }
          30%      { transform: scale(1.0); }
          30%, 50% { transform: scale(1.0); }
          75%      { transform: scale(0.55); }
          75%, 95% { transform: scale(0.55); }
          100%     { transform: scale(0.55); }
        }
        @keyframes nafsihRing {
          0%, 5%   { transform: scale(0.55); opacity: 0.55; }
          30%      { transform: scale(1.0); opacity: 0.25; }
          30%, 50% { transform: scale(1.0); opacity: 0.25; }
          75%      { transform: scale(0.55); opacity: 0.55; }
          100%     { transform: scale(0.55); opacity: 0.55; }
        }
        @keyframes nafsihHaloRotate {
          to { transform: rotate(360deg); }
        }
        .nafsih-breath-core { animation: nafsihBreathe 16s cubic-bezier(.45,.05,.55,.95) infinite; }
        .nafsih-breath-ring { animation: nafsihRing 16s cubic-bezier(.45,.05,.55,.95) infinite; }
        .nafsih-breath-halo { animation: nafsihHaloRotate 80s linear infinite; }
      `}</style>

      <div
        dir="rtl"
        lang="ar"
        className="relative w-[390px] h-[844px] overflow-hidden rounded-[40px] shadow-2xl border-8 border-neutral-800 nafsih-app flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, #3A6453 0%, #2B4C3F 45%, #1F3830 100%)",
        }}
      >
        {/* soft mashrabiya overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(#BFA588 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* top bar */}
        <header className="relative z-10 px-6 pt-14 pb-4 flex items-center justify-between">
          <button
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <ChevronRight size={18} className="text-[#E8E2D2]" />
          </button>

          <div className="text-center">
            <p className="font-tajawal text-[11px] tracking-[0.3em] text-[#BFA588] uppercase">
              جلسة هدوء
            </p>
            <h1 className="font-cairo text-lg font-semibold text-[#F2EEDF] mt-0.5">
              تنفّس معي
            </h1>
          </div>

          <button
            aria-label="الصوت"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Volume2 size={16} className="text-[#E8E2D2]" />
          </button>
        </header>

        {/* phase pill */}
        <div className="relative z-10 mt-2 flex justify-center">
          <div
            className="px-5 py-1.5 rounded-full font-tajawal text-[12px] tracking-widest"
            style={{
              background: "rgba(191,165,136,0.14)",
              color: "#E8D9BF",
              border: "1px solid rgba(191,165,136,0.25)",
            }}
          >
            ٤ • ٤ • ٤ • ٤  ·  تنفّس الصندوق
          </div>
        </div>

        {/* breathing visual */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            {/* outer rotating halo */}
            <div className="absolute inset-0 nafsih-breath-halo">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(191,165,136,0.55) 90deg, transparent 180deg, rgba(191,165,136,0.25) 270deg, transparent 360deg)",
                  WebkitMask:
                    "radial-gradient(circle, transparent 138px, #000 140px, #000 148px, transparent 150px)",
                  mask:
                    "radial-gradient(circle, transparent 138px, #000 140px, #000 148px, transparent 150px)",
                }}
              />
            </div>

            {/* expanding ring */}
            <div className="absolute w-[260px] h-[260px] rounded-full nafsih-breath-ring"
                 style={{ border: "1px solid rgba(232,217,191,0.45)" }} />

            {/* breathing core */}
            <div
              className="nafsih-breath-core relative w-[220px] h-[220px] rounded-full flex flex-col items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #F2EEDF 0%, #E8D9BF 35%, #BFA588 100%)",
                boxShadow:
                  "0 0 60px rgba(232,217,191,0.35), inset 0 -10px 30px rgba(139,104,85,0.25)",
              }}
            >
              <p className="font-tajawal text-[11px] tracking-[0.4em] text-[#5A4636]/70">
                الآن
              </p>
              <p className="font-cairo text-[34px] font-bold text-[#2B4C3F] leading-none mt-1">
                استنشق
              </p>
              <p className="font-tajawal text-[14px] text-[#5A4636]/80 mt-1.5">
                ٤ ثوانٍ
              </p>
            </div>
          </div>

          {/* cycle indicator dots */}
          <div className="flex items-center gap-2 mt-10">
            <span className="w-2 h-2 rounded-full bg-[#E8D9BF]" />
            <span className="w-2 h-2 rounded-full bg-[#E8D9BF]" />
            <span className="w-2 h-2 rounded-full bg-[#E8D9BF]" />
            <span className="w-6 h-2 rounded-full" style={{ background: "rgba(232,217,191,0.95)" }} />
            <span className="w-2 h-2 rounded-full bg-[#E8D9BF]/30" />
            <span className="w-2 h-2 rounded-full bg-[#E8D9BF]/30" />
            <span className="w-2 h-2 rounded-full bg-[#E8D9BF]/30" />
          </div>
          <p className="font-tajawal text-[11px] text-[#E8D9BF]/60 mt-2 tracking-[0.25em]">
            الدورة ٤ من ٧
          </p>
        </div>

        {/* dhikr footer */}
        <section className="relative z-10 mx-6 mb-6 rounded-2xl px-5 py-4"
                 style={{ background: "rgba(20,32,28,0.55)", border: "1px solid rgba(191,165,136,0.18)" }}>
          <p className="font-tajawal text-[10px] tracking-[0.3em] text-[#BFA588] mb-1.5">
            ذِكر مرافق
          </p>
          <p className="font-cairo text-[18px] text-[#F2EEDF] leading-relaxed">
            أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
          </p>
          <p className="font-tajawal text-[11px] text-[#BFA588]/70 mt-1.5">
            الرعد ٢٨
          </p>
        </section>

        {/* bottom controls */}
        <footer className="relative z-10 px-6 pb-10 flex items-center justify-between">
          <button className="font-tajawal text-[13px] text-[#E8D9BF]/70">
            تخطّي
          </button>

          <button
            className="px-7 py-3 rounded-full font-cairo font-semibold text-[14px]"
            style={{
              background: "linear-gradient(180deg, #F2EEDF 0%, #E8D9BF 100%)",
              color: "#2B4C3F",
              boxShadow: "0 8px 24px rgba(232,217,191,0.25)",
            }}
          >
            أنهيت — كيف نفسي الآن؟
          </button>
        </footer>
      </div>
    </div>
  );
}
