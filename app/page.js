"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/calendar').then(res => res.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-400 font-medium tracking-widest uppercase text-[10px]">Syncing Lunar Data...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        
        <div className={`p-10 text-center ${data.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-80 mb-2">{data.date}</p>
          <h1 className="text-6xl font-black tracking-tighter mb-4">{data.status}</h1>
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest border border-white/30">
            {data.isSnakeSafe ? "🐍 Snake Safe" : "🐍 Snake Clash"}
          </div>
        </div>

        <div className="p-10 space-y-10">
          <section>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span>✨</span> Auspicious
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.suit.map(item => (
                <span key={item} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-sm font-bold border border-emerald-100/50">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span>🚫</span> Avoid
            </h3>
            <div className="flex flex-wrap gap-2 opacity-50">
              {data.avoid.map(item => (
                <span key={item} className="bg-slate-50 text-slate-500 px-4 py-2 rounded-2xl text-xs font-bold border border-slate-100">
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="bg-slate-50/50 p-6 text-center border-t border-slate-100">
          <p className="text-[9px] text-slate-300 uppercase font-black tracking-[0.4em]">Lunar Director v1.1</p>
        </div>
      </div>
    </div>
  );
}
