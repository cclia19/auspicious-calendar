"use client";
import React, { useState, useEffect } from 'react';

export default function CalendarApp() {
  const [dayData, setDayData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    fetch(`/api/calendar?day=${selectedDay}&month=${currentMonth}&year=${currentYear}`)
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
      
      {/* Date Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
        <button onClick={() => setSelectedDay(d => d > 1 ? d - 1 : 31)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 font-bold">←</button>
        <div className="text-center">
          <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
            {now.toLocaleString('en-US', { month: 'long' })} {currentYear}
          </span>
          <span className="text-xl font-black text-slate-900">{selectedDay}</span>
        </div>
        <button onClick={() => setSelectedDay(d => d < 31 ? d + 1 : 1)} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 font-bold">→</button>
      </div>

      {/* Main Container */}
      <div className={`max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white transition-all duration-500 ${loading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
        {error ? (
          <div className="p-20 text-center">
            <h1 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-2">Sync Failed</h1>
            <p className="text-[10px] text-slate-400 mb-8 uppercase">Check Source Connection</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
            >
              Retry Sync
            </button>
          </div>
        ) : dayData && (
          <>
            <div className={`p-12 text-center ${dayData.isSnakeSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white transition-colors duration-700`}>
              <h1 className="text-5xl font-black tracking-tighter uppercase">{dayData.status}</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-70 mt-2 uppercase italic">Verification Active</p>
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
      
      <p className="mt-10 text-[8px] text-slate-200 uppercase font-black tracking-[0.8em]">Lunar Director v1.8</p>
    </div>
  );
}      <div className="w-full max-w-md flex items-center justify-between mb-8 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
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
