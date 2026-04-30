import React from "react";
import "./_group.css";

export default function Welcome() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4">
      <div 
        dir="rtl" 
        lang="ar" 
        className="relative w-[390px] h-[844px] overflow-hidden bg-[#F7F5F0] rounded-[40px] shadow-2xl border-8 border-neutral-800 nafsih-app flex flex-col items-center justify-between py-20 px-8"
      >
        <div className="absolute inset-0 nafsih-pattern pointer-events-none"></div>
        
        {/* Top Ornament */}
        <div className="w-full flex justify-center mt-8">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8E6855] opacity-60">
            <path d="M20 0L22.4515 15.1485L34.1421 5.85786L24.8515 17.5485L40 20L24.8515 22.4515L34.1421 34.1421L22.4515 24.8515L20 40L17.5485 24.8515L5.85786 34.1421L15.1485 22.4515L0 20L15.1485 17.5485L5.85786 5.85786L17.5485 15.1485L20 0Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="flex flex-col items-center text-center z-10 space-y-6 mt-16">
          <h1 className="font-cairo text-6xl font-bold text-[#2B4C3F] tracking-tight">نفسيه</h1>
          <p className="font-tajawal text-2xl text-[#8E6855] font-medium mt-2">رفيقك في لحظات التعب</p>
          
          <div className="w-12 h-[1px] bg-[#BFA588] my-6 opacity-50"></div>
          
          <p className="font-tajawal text-lg text-[#6B726B] leading-relaxed max-w-[280px]">
            مساحتك الآمنة للتنفس والحديث بصدق. مساندة تستند إلى الإيمان، وتراعي خصوصيتك التامة.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4 z-10 mb-8">
          <button className="w-full bg-[#2B4C3F] text-white font-cairo font-semibold text-xl py-4 rounded-2xl shadow-[0_8px_30px_rgba(43,76,63,0.2)] hover:bg-[#1f382e] transition-colors active:scale-[0.98]">
            ابدأ رحلتك
          </button>
          <button className="w-full bg-transparent text-[#6B726B] font-cairo font-semibold text-lg py-4 rounded-2xl hover:bg-black/5 transition-colors">
            لدي حساب
          </button>
        </div>

        {/* Bottom fading gradient for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F7F5F0] to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
