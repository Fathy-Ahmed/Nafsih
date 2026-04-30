import React from "react";
import { Award, BookOpen, Calendar, ChevronLeft, TrendingUp } from "lucide-react";
import "./_group.css";

export default function Journal() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4">
      <div 
        dir="rtl" 
        lang="ar" 
        className="relative w-[390px] h-[844px] overflow-hidden bg-[#F7F5F0] rounded-[40px] shadow-2xl border-8 border-neutral-800 nafsih-app flex flex-col"
      >
        <div className="absolute inset-0 nafsih-pattern pointer-events-none opacity-5"></div>
        
        {/* Header */}
        <header className="pt-16 pb-2 px-6 z-10 flex justify-between items-center">
          <h1 className="font-cairo text-3xl font-bold text-[#212523]">رحلتك</h1>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E4EAE5]">
            <Calendar size={18} className="text-[#2B4C3F]" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8 z-10 hide-scrollbar pb-24">
          
          {/* Streak Focus */}
          <section className="flex flex-col items-center justify-center py-6 bg-white rounded-[32px] border border-[#E4EAE5]/50 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 mashrabiya-bg opacity-[0.03]"></div>
            <div className="w-24 h-24 rounded-full bg-[#F0E6DD] flex items-center justify-center relative z-10 mb-4 shadow-inner">
              <span className="font-cairo text-5xl font-bold text-[#8E6855]">١٤</span>
              <div className="absolute -bottom-2 bg-[#2B4C3F] text-white text-[10px] font-tajawal px-3 py-1 rounded-full font-bold tracking-wider">
                يومًا متتالية
              </div>
            </div>
            <p className="font-tajawal text-[#6B726B] text-center px-8 text-sm">
              أنت مستمر في تخصيص وقت لنفسك. تذكر، القليل الدائم خير من الكثير المنقطع.
            </p>
          </section>

          {/* Mood Trend (Handcrafted CSS Visualization) */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-cairo text-lg font-bold text-[#212523]">مزاجك هذا الأسبوع</h2>
              <TrendingUp size={16} className="text-[#BFA588]" />
            </div>
            <div className="bg-white p-5 rounded-3xl border border-[#E4EAE5]/50 flex items-end justify-between h-[120px] shadow-sm">
              {[
                { h: "40%", c: "bg-[#F3E8E8]", d: "السبت" },
                { h: "30%", c: "bg-neutral-200", d: "الأحد" },
                { h: "60%", c: "bg-[#EBEAF0]", d: "الإثنين" },
                { h: "50%", c: "bg-[#F0E6DD]", d: "الثلاثاء" },
                { h: "80%", c: "bg-[#E4EAE5]", d: "الأربعاء" },
                { h: "90%", c: "bg-[#E4EAE5]", d: "الخميس" },
                { h: "85%", c: "bg-[#2B4C3F]", d: "اليوم" },
              ].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group">
                  <div className="w-8 flex flex-col justify-end h-16 items-center">
                    <div 
                      className={`w-3 rounded-full transition-all duration-500 group-hover:w-4 ${day.c} ${idx === 6 ? 'shadow-md' : ''}`}
                      style={{ height: day.h }}
                    ></div>
                  </div>
                  <span className={`font-tajawal text-[10px] ${idx === 6 ? 'text-[#2B4C3F] font-bold' : 'text-[#6B726B]'}`}>
                    {day.d.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Milestones */}
          <section>
            <h2 className="font-cairo text-lg font-bold text-[#212523] mb-4">إنجازات</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[#E4EAE5] to-white p-4 rounded-2xl border border-[#E4EAE5] flex flex-col gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2B4C3F]/10 flex items-center justify-center">
                  <Award size={16} className="text-[#2B4C3F]" />
                </div>
                <div>
                  <h3 className="font-cairo font-bold text-[#212523] text-sm">أسبوع من الهدوء</h3>
                  <p className="font-tajawal text-[#6B726B] text-[11px] mt-0.5">مكتمل</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#F0E6DD] to-white p-4 rounded-2xl border border-[#F0E6DD] flex flex-col gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8E6855]/10 flex items-center justify-center">
                  <BookOpen size={16} className="text-[#8E6855]" />
                </div>
                <div>
                  <h3 className="font-cairo font-bold text-[#212523] text-sm">١٠ جلسات تنفّس</h3>
                  <p className="font-tajawal text-[#6B726B] text-[11px] mt-0.5">مكتمل</p>
                </div>
              </div>
            </div>
          </section>

          {/* Journal Preview */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-cairo text-lg font-bold text-[#212523]">تأملات سابقة</h2>
              <button className="text-[#BFA588] flex items-center font-tajawal text-sm hover:text-[#8E6855]">
                عرض الكل <ChevronLeft size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-[#E4EAE5]/50">
                <div className="font-tajawal text-[11px] text-[#BFA588] mb-2 font-bold">الخميس، ١٢ أكتوبر</div>
                <p className="font-tajawal text-sm text-[#212523] leading-relaxed">
                  "كان يوماً مرهقاً في العمل، لكنني تذكرت أن السعي هو المطلوب وليس الكمال."
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E4EAE5]/50 opacity-80">
                <div className="font-tajawal text-[11px] text-[#BFA588] mb-2 font-bold">الإثنين، ٩ أكتوبر</div>
                <p className="font-tajawal text-sm text-[#212523] leading-relaxed">
                  "شعرت بالامتنان اليوم لفنجان القهوة الصباحي والهدوء قبل بدء المهام."
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
