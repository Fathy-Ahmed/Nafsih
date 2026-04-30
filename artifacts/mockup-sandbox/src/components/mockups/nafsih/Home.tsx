import React from "react";
import { Wind, Heart, Sparkles, BookOpen } from "lucide-react";
import "./_group.css";

export default function Home() {
  const moods = [
    { label: "ممتن", color: "bg-[#E4EAE5] text-[#2B4C3F]" },
    { label: "هادئ", color: "bg-[#F0E6DD] text-[#8E6855]" },
    { label: "قلق", color: "bg-neutral-200 text-neutral-700" },
    { label: "حزين", color: "bg-[#EBEAF0] text-[#4A5568]" },
    { label: "متعب", color: "bg-[#F3E8E8] text-[#716377]" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4">
      <div 
        dir="rtl" 
        lang="ar" 
        className="relative w-[390px] h-[844px] overflow-hidden bg-[#F7F5F0] rounded-[40px] shadow-2xl border-8 border-neutral-800 nafsih-app flex flex-col"
      >
        <div className="absolute inset-0 nafsih-pattern pointer-events-none"></div>
        
        {/* Header */}
        <header className="px-6 pt-16 pb-6 flex justify-between items-start relative z-10">
          <div>
            <h1 className="font-cairo text-3xl font-bold text-[#2B4C3F]">صباح الخير، أحمد</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-tajawal text-[#8E6855] text-sm font-medium">٧ أيام متتالية</span>
              <Sparkles size={14} className="text-[#BFA588]" />
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#E4EAE5] flex items-center justify-center text-[#2B4C3F] font-cairo font-bold text-lg shadow-inner">
            أ
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-24 space-y-8 z-10 hide-scrollbar">
          
          {/* Mood Selector */}
          <section className="space-y-4">
            <h2 className="font-cairo text-xl font-semibold text-[#212523]">كيف نفسك اليوم؟</h2>
            <div className="flex justify-between items-center gap-2">
              {moods.map((mood, idx) => (
                <button 
                  key={idx}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl ${mood.color} transition-transform active:scale-95`}
                >
                  <span className="font-tajawal text-sm font-bold">{mood.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Ayah of the day */}
          <section className="relative bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E4EAE5]/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E4EAE5] rounded-bl-full opacity-20 pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-[#8E6855]" />
              <h3 className="font-tajawal text-sm font-semibold text-[#8E6855]">آية اليوم</h3>
            </div>
            <p className="font-cairo text-2xl font-semibold text-[#2B4C3F] leading-snug text-center py-4">
              "إِنَّ مَعَ الْعُسْرِ يُسْرًا"
            </p>
            <p className="font-tajawal text-center text-[#6B726B] text-sm mt-2">
              الشرح ٦
            </p>
          </section>

          {/* Breathing CTA */}
          <section className="bg-[#2B4C3F] rounded-3xl p-1 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform shadow-lg">
            <div className="absolute inset-0 mashrabiya-bg opacity-10"></div>
            <div className="relative z-10 flex items-center justify-between p-5">
              <div>
                <h3 className="font-cairo text-white text-xl font-bold">تنفّس معي</h3>
                <p className="font-tajawal text-[#E4EAE5] text-sm mt-1">دقيقتان لاستعادة هدوئك</p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#E4EAE5] opacity-20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-[#E4EAE5] opacity-40 rounded-full animate-pulse"></div>
                <div className="relative z-10 w-8 h-8 bg-[#F7F5F0] rounded-full flex items-center justify-center">
                  <Wind size={16} className="text-[#2B4C3F]" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
