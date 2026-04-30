import React from "react";
import { Play, Headphones, BookOpen, Wind, Star } from "lucide-react";
import "./_group.css";

export default function Library() {
  const categories = ["الكل", "تنفّس", "تأمّل", "قرآن", "ذكر"];
  
  const sessions = [
    { title: "هدوء ما بعد العمل", duration: "١٠ دقائق", category: "تنفّس", icon: Wind, color: "bg-[#E4EAE5] text-[#2B4C3F]" },
    { title: "سورة يس - بصوت هادئ", duration: "١٥ دقيقة", category: "قرآن", icon: BookOpen, color: "bg-[#F0E6DD] text-[#8E6855]" },
    { title: "تأمل في نعم الله", duration: "٧ دقائق", category: "تأمّل", icon: Star, color: "bg-[#EBEAF0] text-[#4A5568]" },
    { title: "أذكار المساء", duration: "١٢ دقيقة", category: "ذكر", icon: Headphones, color: "bg-[#F3E8E8] text-[#716377]" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4">
      <div 
        dir="rtl" 
        lang="ar" 
        className="relative w-[390px] h-[844px] overflow-hidden bg-[#F7F5F0] rounded-[40px] shadow-2xl border-8 border-neutral-800 nafsih-app flex flex-col"
      >
        <div className="absolute inset-0 nafsih-pattern pointer-events-none opacity-5"></div>
        
        {/* Header */}
        <header className="pt-16 pb-4 px-6 z-10">
          <h1 className="font-cairo text-3xl font-bold text-[#212523]">جلسات سريعة</h1>
          <p className="font-tajawal text-[#6B726B] mt-2">لحظات من السكينة في يومك المزدحم</p>
        </header>

        {/* Categories */}
        <div className="px-6 py-2 overflow-x-auto hide-scrollbar z-10 flex gap-2 whitespace-nowrap">
          {categories.map((cat, idx) => (
            <button 
              key={idx} 
              className={`px-5 py-2 rounded-full font-tajawal text-sm font-bold transition-all ${
                idx === 0 
                  ? "bg-[#2B4C3F] text-white shadow-md" 
                  : "bg-white text-[#6B726B] hover:bg-neutral-50 border border-[#E4EAE5]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 hide-scrollbar">
          
          {/* Featured Card */}
          <section className="relative bg-[#2B4C3F] rounded-[32px] p-6 overflow-hidden text-white shadow-xl cursor-pointer group active:scale-[0.98] transition-transform">
            <div className="absolute inset-0 mashrabiya-bg opacity-10"></div>
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col h-[160px] justify-between">
              <div className="flex justify-between items-start">
                <span className="font-tajawal text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">مُقترح لك</span>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={18} fill="currentColor" className="ml-1" />
                </div>
              </div>
              
              <div>
                <h2 className="font-cairo text-2xl font-bold mb-1">تنفّس قبل العودة للبيت</h2>
                <div className="flex items-center gap-2 font-tajawal text-sm text-[#E4EAE5]">
                  <Wind size={14} />
                  <span>٥ دقائق</span>
                  <span className="w-1 h-1 rounded-full bg-[#E4EAE5]/50"></span>
                  <span>استرخاء عميق</span>
                </div>
              </div>
            </div>
          </section>

          {/* List */}
          <section className="space-y-3 pb-8">
            {sessions.map((session, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-[#E4EAE5]/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.color}`}>
                    <session.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-cairo font-bold text-[#212523] text-lg leading-tight">{session.title}</h3>
                    <p className="font-tajawal text-[#6B726B] text-sm mt-1">{session.duration} • {session.category}</p>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full border border-[#E4EAE5] flex items-center justify-center text-[#2B4C3F] hover:bg-[#F7F5F0] transition-colors">
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                </button>
              </div>
            ))}
          </section>
          
        </main>
      </div>
    </div>
  );
}
