"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/calendar').then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div className="p-10 text-center font-sans text-slate-500">Syncing with Lunar Calendar...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 text-slate-900">
        
        {/* Header Status */}
        <div className={`p-10 text-center ${data.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
          <p className="text-xs uppercase tracking-[0.2em] opacity-90 mb-2 font-bold">{data.date}</p>
          <h1 className="text-5xl font-black tracking-tighter">{data.status}</h1>
          <div className="mt-5 inline-block px-5 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider border border-white/30">
            {data.isSnakeSafe ? "✅ No Snake Clash" : "⚠️ Snake Clash Today"}
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-8 space-y-10">
          <section>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-4">Auspicious Activities</h3>
            <div className="flex flex-wrap gap-2">
              {data.suit.map(item => (
                <span key={item} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-sm font-bold border border-emerald-100/50">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-4">Inauspicious (Avoid)</h3>
            <div className="flex flex-wrap gap-2">
              {data.avoid.map(item => (
                <span key={item} className="bg-slate-50 text-slate-400 px-4 py-2 rounded-2xl text-sm font-medium border border-slate-100">
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Branding */}
        <div className="bg-slate-50/50 p-5 text-center border-t border-slate-100">
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em]">
            Lunar Director v1.0 • March 2026
          </p>
        </div>
      </div>
    </div>
  );
}
