"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [dayData, setDayData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/calendar?day=${selectedDay}&month=${currentMonth}&year=${currentYear}`)
      .then(async res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setDayData(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-sans antialiased">
      
      {/* Dynamic Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
        <button 
          onClick={() => setSelectedDay(prev => prev > 1 ? prev - 1 : daysInMonth)} 
          className="p-4 hover:bg-slate-100 rounded-2xl text-slate-400 font-bold"
        >←</button>
        
        <div className="text-center">
          <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
            {now.toLocaleString('en-US', { month: 'long' })} {currentYear}
          </span>
          <span className="text-xl font-black text-slate-900">{selectedDay}</span>
        </div>

        <button 
          onClick={() => setSelectedDay(prev => prev < daysInMonth ? prev + 1 : 1)} 
          className="p-4 hover:bg-slate-100 rounded-2xl text-slate-400 font-bold"
        >→</button>
      </div>

      {/* Card Content */}
      <div className={`max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white transition-all ${loading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
        {error ? (
          <div className="p-20 text-center">
            <h1 className="text-sm font-black text-rose-500 uppercase tracking-widest">Sync Failed</h1>
            <p className="text-[10px] text-slate-400 mt-2">Check Connection or Source</p>
            <button 
               onClick={() => window.location.reload()}
               className="mt-6 px-6 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest"
            >Retry Sync</button>
          </div>
        ) : dayData && (
          <>
            <div className={`p-12 text-center ${dayData.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
              <h1 className="text-5xl font-black tracking-tighter uppercase">{dayData.status}</h1>
            </div>

            <div className="p-10 space-y-10">
              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Auspicious</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dayData.suit.map(item => (
                    <div key={item} className="bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-[11px] font-bold border border-slate-100 uppercase tracking-tighter">
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] mb-4 opacity-50">Avoid</h3>
                <div className="grid grid-cols-2 gap-2 opacity-40">
                  {dayData.avoid.map(item => (
                    <div key={item} className="bg-slate-50 text-slate-400 px-3 py-2 rounded-lg text-[10px] font-bold border border-slate-100 uppercase tracking-tighter">
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
