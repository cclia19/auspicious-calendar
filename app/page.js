"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

function cleanItems(items = []) {
  const cleaned = items
    .flatMap((item) => {
      if (!item) return [];

      let text = item.replace(/\s+/g, " ").trim();

      text = text.replace(
        /directions the god of joy:.*?auspicious\s+/i,
        ""
      );

      text = text.replace(/\/$/, "");

      const parts = text
        .split(/(?<=[a-z])(?=[A-Z])/)
        .map((s) => s.trim())
        .filter(Boolean);

      return parts.length > 1 ? parts : [text];
    })
    .map((s) => s.trim())
    .filter(Boolean);

  return [...new Set(cleaned)];
}

export default function CalendarApp() {
  const now = new Date();

  const [dayData, setDayData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const dayRefs = useRef({});

  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();

  const displayDate = useMemo(() => {
    const current = new Date(year, month - 1, selectedDay);
    return {
      monthShort: current.toLocaleString("en-US", { month: "short" }),
      monthLong: current.toLocaleString("en-US", { month: "long" }),
      weekday: current.toLocaleString("en-US", { weekday: "long" }),
      year: current.getFullYear(),
    };
  }, [selectedDay, month, year]);

  const monthDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month - 1, day);
      return {
        day,
        weekdayShort: date.toLocaleString("en-US", { weekday: "short" }),
      };
    });
  }, [daysInMonth, month, year]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      try {
        const res = await fetch(
          `/api/calendar?day=${selectedDay}&month=${month}&year=${year}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load calendar data");
        }

        if (isMounted) {
          setDayData(data);
        }
      } catch (err) {
        if (isMounted) {
          setDayData(null);
          setErrorMessage(err.message || "Failed to fetch data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedDay, month, year]);

  useEffect(() => {
    const el = dayRefs.current[selectedDay];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedDay]);

  const auspiciousItems = cleanItems(dayData?.suit || []);
  const inauspiciousItems = cleanItems(dayData?.avoid || []);
  const isClashDay = dayData && !dayData.isSnakeSafe;

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-all duration-500 ${
        isClashDay
          ? "bg-gradient-to-br from-rose-700 via-rose-600 to-rose-500"
          : "bg-slate-100"
      }`}
    >
      <div className="mx-auto max-w-4xl px-4 py-4 md:px-6 md:py-6">
        {/* Top Nav */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            onClick={() =>
              setSelectedDay((d) => (d > 1 ? d - 1 : daysInMonth))
            }
            className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl font-bold shadow-sm transition hover:scale-105 ${
              isClashDay
                ? "bg-white text-rose-600"
                : "bg-white text-slate-700"
            }`}
          >
            ←
          </button>

          <div
            className={`rounded-full px-5 py-2 text-center shadow-sm ${
              isClashDay ? "bg-white/95" : "bg-white"
            }`}
          >
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
              {displayDate.monthLong} {displayDate.year}
            </div>
            <div className="text-base font-black text-slate-900">
              Day {selectedDay}
            </div>
          </div>

          <button
            onClick={() =>
              setSelectedDay((d) => (d < daysInMonth ? d + 1 : 1))
            }
            className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl font-bold shadow-sm transition hover:scale-105 ${
              isClashDay
                ? "bg-white text-rose-600"
                : "bg-white text-slate-700"
            }`}
          >
            →
          </button>
        </div>

        {/* Simple Date Strip */}
        <div
          className={`mb-4 overflow-hidden rounded-[1.5rem] shadow-sm ${
            isClashDay ? "bg-white/95 backdrop-blur" : "bg-white"
          }`}
        >
          <div className="flex gap-2 overflow-x-auto px-3 py-3 scrollbar-none">
            {monthDays.map((item) => {
              const active = item.day === selectedDay;

              return (
                <button
                  key={item.day}
                  ref={(el) => {
                    dayRefs.current[item.day] = el;
                  }}
                  onClick={() => setSelectedDay(item.day)}
                  className={`min-w-[58px] shrink-0 rounded-2xl px-3 py-2 text-center transition ${
                    active
                      ? isClashDay
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  <div
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      active ? "opacity-80" : "text-slate-400"
                    }`}
                  >
                    {item.weekdayShort}
                  </div>
                  <div className="mt-1 text-base font-black">{item.day}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <div className="text-sm font-bold tracking-widest text-slate-400">
              Loading...
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && errorMessage && (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <h1 className="mb-3 text-xl font-black uppercase tracking-widest text-rose-500">
              Sync Failed
            </h1>
            <p className="text-sm text-slate-500">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main */}
        {!loading && !errorMessage && dayData && (
          <div className="space-y-4">
            {/* Date / Status card first */}
            <section
              className={`overflow-hidden rounded-[2rem] shadow-sm ${
                isClashDay ? "bg-white/95 backdrop-blur" : "bg-white"
              }`}
            >
              <div
                className={`px-6 py-6 text-center ${
                  isClashDay
                    ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white"
                    : "bg-gradient-to-r from-slate-900 to-slate-800 text-white"
                }`}
              >
                <div className="text-xs font-black uppercase tracking-[0.35em] opacity-70">
                  {displayDate.monthShort} {displayDate.year}
                </div>
                <div className="mt-3 text-7xl font-black leading-none md:text-8xl">
                  {selectedDay}
                </div>
                <div className="mt-3 text-2xl font-black md:text-3xl">
                  {displayDate.weekday}
                </div>
              </div>

              <div className="grid gap-3 p-4 md:grid-cols-3">
                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Status
                  </div>
                  <div
                    className={`mt-2 text-lg font-black ${
                      isClashDay ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {dayData.status}
                  </div>
                </div>

                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Clash
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-800">
                    {dayData.clash || "None"}
                  </div>
                </div>

                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Lunar Data
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-800">
                    Verified
                  </div>
                </div>
              </div>
            </section>

            {/* Compact two boxes */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Auspicious */}
              <section
                className={`rounded-[2rem] p-4 shadow-sm ${
                  isClashDay ? "bg-white/95 backdrop-blur" : "bg-white"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black text-emerald-600 md:text-2xl">
                    Auspicious
                  </h2>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-600">
                    {auspiciousItems.length} items
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {auspiciousItems.length > 0 ? (
                      auspiciousItems.map((item) => (
                        <div
                          key={item}
                          className="rounded-full bg-white px-4 py-3 text-sm font-bold leading-snug text-slate-800 shadow-sm"
                        >
                          <span className="mr-2 text-emerald-500">•</span>
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-400">
                        No auspicious activities found.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Inauspicious */}
              <section
                className={`rounded-[2rem] p-4 shadow-sm ${
                  isClashDay ? "bg-white/95 backdrop-blur" : "bg-white"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black text-rose-600 md:text-2xl">
                    Inauspicious
                  </h2>
                  <div className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-rose-600">
                    {inauspiciousItems.length} items
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-rose-100 bg-rose-50 p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {inauspiciousItems.length > 0 ? (
                      inauspiciousItems.map((item) => (
                        <div
                          key={item}
                          className="rounded-full bg-white px-4 py-3 text-sm font-bold leading-snug text-slate-800 shadow-sm"
                        >
                          <span className="mr-2 text-rose-500">•</span>
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-400">
                        No inauspicious activities found.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
