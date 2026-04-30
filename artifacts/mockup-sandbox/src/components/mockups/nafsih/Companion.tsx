import React from "react";
import { Lock, Send, Sparkles, ChevronRight } from "lucide-react";
import "./_group.css";

export default function Companion() {
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
          <div className="absolute inset-0 nafsih-pattern pointer-events-none opacity-5"></div>
          
          <div className="text-center mb-4">
            <span className="font-tajawal text-xs text-[#BFA588] bg-[#F0E6DD]/50 px-3 py-1 rounded-full">اليوم، ٦:٣٠ صباحاً</span>
          </div>

          {/* User Message */}
          <div className="flex justify-start w-full">
            <div className="bg-[#2B4C3F] text-white px-5 py-4 rounded-3xl rounded-tl-sm max-w-[85%] shadow-sm">
              <p className="font-tajawal text-[15px] leading-relaxed">
                أشعر بضغط كبير اليوم. لدي اجتماعات متتالية والمهام لا تنتهي. لا أعرف كيف سأنجز كل هذا.
              </p>
            </div>
          </div>

          {/* Companion Message */}
          <div className="flex justify-end w-full">
            <div className="bg-white text-[#212523] px-5 py-4 rounded-3xl rounded-tr-sm max-w-[85%] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E4EAE5]">
              <p className="font-tajawal text-[15px] leading-relaxed">
                أفهم تماماً هذا الثقل يا أحمد. من الطبيعي أن تشعر بالارتباك أمام هذا الكم من المهام.
                <br/><br/>
                تذكر أن عليك السعي فقط، والنتيجة بيد الله. "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ". 
                <br/><br/>
                هل نبدأ بتمرين تنفس قصير لترتيب أفكارك قبل الاجتماع الأول؟
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex justify-end gap-2 w-full mt-2">
            <button className="bg-[#F0E6DD] text-[#8E6855] px-4 py-2 rounded-full font-tajawal text-sm font-medium hover:bg-[#e6d8cd] transition-colors border border-[#BFA588]/20 flex items-center gap-1.5">
              <Sparkles size={14} />
              اقترح دعاء
            </button>
            <button className="bg-[#E4EAE5] text-[#2B4C3F] px-4 py-2 rounded-full font-tajawal text-sm font-medium hover:bg-[#d0dbd3] transition-colors border border-[#2B4C3F]/10">
              تمرين تنفس
            </button>
          </div>
        </main>

        {/* Input Area */}
        <div className="p-4 pb-8 bg-white/80 backdrop-blur-md border-t border-[#E4EAE5]/50 z-20">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="اكتب ما في قلبك..." 
              className="w-full bg-[#F7F5F0] border-none rounded-full py-4 pr-5 pl-14 font-tajawal text-[15px] text-[#212523] placeholder:text-[#6B726B] focus:outline-none focus:ring-2 focus:ring-[#2B4C3F]/20 transition-all"
            />
            <button className="absolute left-2 w-10 h-10 bg-[#2B4C3F] rounded-full flex items-center justify-center text-white hover:bg-[#1f382e] transition-colors shadow-sm">
              <Send size={18} className="mr-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
