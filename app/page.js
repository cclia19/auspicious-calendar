"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [dayData, setDayData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read current system month/year for the header
  const now = new Date();
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
  const currentYear = now.getFullYear();

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Passing current month/year to the API
    fetch(`/api/calendar?day=${selectedDay}&month=${now.getMonth() + 1}&year=${currentYear}`)
      .then(async res => {
        if (!res.ok) throw new Error("Sync Failed");
        return res.json();
      })
      .then(data => {
        setDayData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-10 font-sans antialiased">
      
      {/* 1. Fully Dynamic Navigation Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <button onClick={() => setSelectedDay(prev => Math.max(1, prev - 1))} className="p-4 hover:bg-slate-50 rounded-xl text-slate-400 font-bold">←</button>
        <div className="text-center">
          <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">
            {currentMonthName} {currentYear}
          </span>
          <span className="text-xl font-black text-slate-900 leading-none">{selectedDay}</span>
        </div>
        <button onClick={() => setSelectedDay(prev => Math.min(31, prev + 1))} className="p-4 hover:bg-slate-50 rounded-xl text-slate-400 font-bold">→</button>
      </div>

      {/* 2. Content Card */}
      <div className={`max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white transition-all duration-300 ${loading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
        
        {error ? (
          <div className="p-20 text-center">
            <h1 className="text-sm font-black text-rose-500 uppercase tracking-widest">Sync Error</h1>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Information not tally with source</p>
          </div>
        ) : dayData && (
          <>
            <div className={`p-10 text-center ${dayData.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white transition-colors duration-700`}>
              <h1 className="text-5xl font-black tracking-tighter uppercase">{dayData.status}</h1>
              <p className="text-[10px] font-bold tracking-[0.3em] opacity-70 mt-2 italic uppercase">Zodiac Integrity Mode</p>
            </div>

            <div className="p-8 space-y-10">
              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-4 border-b border-slate-50 pb-2">Auspicious Activities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dayData.suit.map(item => (
                    <div key={item} className="bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-[11px] font-bold border border-slate-100 flex items-center gap-2 uppercase tracking-tighter">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-4 border-b border-slate-100/50 pb-2">Avoid</h3>
                <div className="grid grid-cols-2 gap-2 opacity-60">
                  {dayData.avoid.map(item => (
                    <div key={item} className="bg-slate-50 text-slate-400 px-3 py-2 rounded-lg text-[10px] font-bold border border-slate-100 flex items-center gap-2 uppercase tracking-tighter">
                       <span className="w-1 h-1 bg-rose-300 rounded-full"></span>
                       {item}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      <p className="mt-8 text-[8px] text-slate-200 uppercase font-black tracking-[0.8em]">Lunar Director v1.7 • Server Time Synced</p>
    </div>
  );
}
