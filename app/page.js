"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [dayData, setDayData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayDate, setDisplayDate] = useState({ month: '', year: '' });

  useEffect(() => {
    // Set display month/year only on the client to avoid syntax/hydration errors
    const now = new Date();
    setDisplayDate({
      month: now.toLocaleString('en-US', { month: 'long' }),
      year: now.getFullYear()
    });
  }, []);

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-sans antialiased">
      
      {/* Date Navigation Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
        <button onClick={() => setSelectedDay(d => d > 1 ? d - 1 : 31)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 font-bold">←</button>
        <div className="text-center">
          <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
            {displayDate.month} {displayDate.year}
          </span>
          <span className="text-xl font-black text-slate-900">{selectedDay}</span>
        </div>
        <button onClick={() => setSelectedDay(d => d < 31 ? d + 1 : 1)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 font-bold">→</button>
      </div>

      {/* Main Content Card */}
      <div className={`max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white transition-all duration-500 ${loading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
        {error ? (
          <div className="p-20 text-center">
            <h1 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-2">Sync Failed</h1>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase">Retry</button>
          </div>
        ) : dayData && (
          <>
            <div className={`p-12 text-center ${dayData.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
              <h1 className="text-5xl font-black tracking-tighter uppercase">{dayData.status}</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-70 mt-2 uppercase">Verified Lunar Data</p>
            </div>

            <div className="p-10 space-y-12">
              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Auspicious Activities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dayData.suit.map(item => (
                    <div key={item} className="bg-slate-50 text-slate-700 px-3 py-2.5 rounded-xl text-[11px] font-bold border border-slate-100 flex items-center gap-2 uppercase tracking-tighter">
                      <span className={`w-1 h-1 rounded-full ${dayData.isSnakeSafe ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Avoid</h3>
                <div className="grid grid-cols-2 gap-2 opacity-40">
                  {dayData.avoid.map(item => (
                    <div key={item} className="bg-slate-50 text-slate-400 px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-100 uppercase tracking-tighter">
                       {item}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
