"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/calendar').then(res => res.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-400 font-medium tracking-widest uppercase text-xs">Syncing Lunar Data...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans antialiased">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-white">
        
        {/* Main Status Header */}
        <div className={`p-10 text-center ${data.isSnakeSafe ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-rose-400 to-orange-500'} text-white`}>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-80 mb-3">{data.date}</p>
          <h1 className="text-6xl font-black tracking-tighter mb-4">{data.status}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-widest">
            {data.isSnakeSafe ? "🐍 Snake Safe" : "🐍 Snake Clash"}
          </div>
        </div>

        {/* Action Content */}
        <div className="p-8 space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✨</span>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Auspicious Activities</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.suit.map(item => (
                <span key={item} className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl text-sm font-bold border border-emerald-100/50 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🚫</span>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Inauspicious (Avoid)</h3>
            </div>
            <div className="flex flex-wrap gap-2 opacity-60">
              {data.avoid.map(item => (
                <span key={item} className="bg-slate-50 text-slate-500 px-4 py-2 rounded-2xl text-xs font-semibold border border-slate-100">
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Minimalist Footer */}
        <div className="px-8 pb-8 text-center">
          <div className="h-[1px] w-full bg-slate-100 mb-6"></div>
          <p className="text-[9px] text-slate-300 uppercase font-black tracking-[0.4em]">
            Lunar Director v1.1 • 2026
          </p>
        </div>
      </div>
    </div>
  );
}
