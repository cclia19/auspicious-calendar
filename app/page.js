"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [dayData, setDayData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar?day=${selectedDay}`)
      .then(res => res.json())
      .then(data => {
        setDayData(data);
        setLoading(false);
      });
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-sans antialiased">
      
      {/* Date Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
        <button onClick={() => setSelectedDay(prev => Math.max(1, prev - 1))} className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 font-bold">←</button>
        <div className="text-center">
          <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 mb-1">March 2026</span>
          <span className="text-xl font-black text-slate-900 leading-none">{selectedDay}</span>
        </div>
        <button onClick={() => setSelectedDay(prev => Math.min(31, prev + 1))} className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 font-bold">→</button>
      </div>

      {/* Main Card */}
      <div className={`max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl transition-all duration-500 overflow-hidden border border-white ${loading ? 'opacity-40 scale-95 grayscale' : 'opacity-100 scale-100'}`}>
        
        {dayData && (
          <>
            <div className={`p-12 text-center transition-colors duration-700 ${dayData.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
              <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
                {dayData.status}
              </h1>
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase">
                {dayData.isSnakeSafe ? "Proceed with Confidence" : "Strategic Caution"}
              </p>
            </div>

            <div className="p-10 space-y-12">
              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                   Auspicious Activities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dayData.suit.map(item => (
                    <span key={item} className="bg-slate-50 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold border border-slate-100 shadow-sm transition-transform active:scale-95 uppercase tracking-tighter">
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-5">Avoid</h3>
                <div className="flex flex-wrap gap-2 opacity-50">
                  {dayData.avoid.map(item => (
                    <span key={item} className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-100 uppercase">
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      <div className="mt-10 text-center">
        <p className="text-[8px] text-slate-300 uppercase font-black tracking-[0.6em]">Lunar Director v1.4</p>
      </div>
    </div>
  );
}
