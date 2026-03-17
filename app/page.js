"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  useEffect(() => {
    fetch('/api/calendar').then(res => res.json()).then(data => setMonthlyData(data.days));
  }, []);

  if (!monthlyData) return <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse text-[10px] tracking-[0.3em] text-slate-400 uppercase">Loading March 2026...</div>;

  const currentDayData = monthlyData[selectedDay - 1];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-10 font-sans antialiased">
      
      {/* 1. Minimalist Monthly Date Scroller */}
      <div className="w-full max-w-md flex gap-3 overflow-x-auto pb-6 no-scrollbar">
        {monthlyData.map((d) => (
          <button 
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
              selectedDay === d.day 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-110' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-60">Mar</span>
            <span className="text-lg font-black">{d.day}</span>
          </button>
        ))}
      </div>

      {/* 2. Dynamic Status Card */}
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-white transition-all duration-500">
        <div className={`p-10 text-center transition-colors duration-500 ${currentDayData.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
          <h1 className="text-6xl font-black tracking-tighter mb-4">{currentDayData.status}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-80 italic">
            March {selectedDay}, 2026
          </p>
        </div>

        <div className="p-10 space-y-8">
          <div>
            <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em] mb-4">✨ Auspicious</h3>
            <div className="flex flex-wrap gap-2">
              {currentDayData.suit.map(item => (
                <span key={item} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100/50">{item}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em] mb-4">🚫 Avoid</h3>
            <div className="flex flex-wrap gap-2 opacity-40">
              {currentDayData.avoid.map(item => (
                <span key={item} className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-100">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-[9px] text-slate-300 uppercase font-black tracking-[0.5em]">Lunar Director v1.2</p>
    </div>
  );
}
