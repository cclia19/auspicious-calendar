"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [dayData, setDayData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedDay(new Date().getDate());
  }, []);

  useEffect(() => {
    if (!selectedDay) return;
    
    let isMounted = true;
    setLoading(true);
    setError(false);

    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    fetch(`/api/calendar?day=${selectedDay}&month=${m}&year=${y}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (isMounted) {
          setDayData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [selectedDay]);

  if (!selectedDay) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-sans antialiased">
      
      {/* Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 bg-white p-3 rounded-3xl shadow-sm border border-slate-100">
        <button onClick={() => setSelectedDay(d => d > 1 ? d - 1 : 31)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 font-bold">←</button>
        <div className="text-center">
          <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-1">
            {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <span className="text-2xl font-black text-slate-900 leading-none">{selectedDay}</span>
        </div>
        <button onClick={() => setSelectedDay(d => d < 31 ? d + 1 : 1)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 font-bold">→</button>
      </div>

      {/* Content */}
      <div className={`max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white transition-all duration-500 ${loading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
        {error ? (
          <div className="p-24 text-center">
            <h1 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-4">Sync Failed</h1>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">Retry Sync</button>
          </div>
        ) : dayData && (
          <>
            <div className={`p-14 text-center ${dayData.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white transition-colors duration-700`}>
              <h1 className="text-5xl font-black tracking-tighter uppercase">{dayData.status}</h1>
              <p className="text-[10px] font-bold tracking-[0.3em] opacity-70 mt-2 uppercase">Official Director Status</p>
            </div>

            <div className="p-10 space-y-12">
              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-5">Auspicious Activities</h3>
                <div className="grid grid-cols-1 gap-2">
                  {dayData.suit.map(item => (
                    <div key={item} className="bg-slate-50 text-slate-700 px-4 py-3 rounded-2xl text-[12px] font-bold border border-slate-100 flex items-center gap-3 uppercase tracking-tight">
                      <span className={`w-1.5 h-1.5 rounded-full ${dayData.isSnakeSafe ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-5">Avoid Today</h3>
                <div className="grid grid-cols-1 gap-2 opacity-40">
                  {dayData.avoid.map(item => (
                    <div key={item} className="bg-slate-50 text-slate-400 px-4 py-3 rounded-2xl text-[11px] font-bold border border-slate-100 uppercase tracking-tight">
                       {item}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
      
      <p className="mt-12 text-[8px] text-slate-200 uppercase font-black tracking-[0.8em]">Lunar Director v1.9 • Pure Data Mode</p>
    </div>
  );
}
