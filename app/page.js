"use client";
import React, { useEffect, useMemo, useState } from "react";

function cleanItems(items = []) {
  const cleaned = items
    .flatMap((item) => {
      if (!item) return [];

      let text = item.replace(/\s+/g, " ").trim();

      // remove noisy scraped heading text if it appears
      text = text.replace(
        /directions the god of joy:.*?auspicious\s+/i,
        ""
      );

      // remove trailing slash like "Buy Livestock/"
      text = text.replace(/\/$/, "");

      // if a long merged string still slips through, try splitting camel-style joins
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

  const auspiciousItems = cleanItems(dayData?.suit || []);
  const inauspiciousItems = cleanItems(dayData?.avoid || []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 font-sans antialiased md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Top Navigation */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <button
            onClick={() =>
              setSelectedDay((d) => (d > 1 ? d - 1 : daysInMonth))
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-rose-600 shadow-sm transition hover:scale-105"
          >
            ←
          </button>

          <div className="rounded-full bg-white px-5 py-2 text-center shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
              {displayDate.monthLong} {displayDate.year}
            </div>
            <div className="text-lg font-black text-slate-900">
              Day {selectedDay}
            </div>
          </div>

          <button
            onClick={() =>
              setSelectedDay((d) => (d < daysInMonth ? d + 1 : 1))
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-rose-600 shadow-sm transition hover:scale-105"
          >
            →
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
            <div className="text-sm font-bold tracking-widest text-slate-400">
              Loading...
            </div>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
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

        {/* Main Layout */}
        {!loading && !errorMessage && dayData && (
          <div className="grid gap-4 md:grid-cols-[1.05fr_0.9fr_1.05fr]">
            {/* Auspicious */}
            <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5 text-center">
                <h2 className="text-2xl font-black text-emerald-600 md:text-3xl">
                  Auspicious
                </h2>
              </div>

              <div className="p-6">
                <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5">
                  <ul className="space-y-3">
                    {auspiciousItems.length > 0 ? (
                      auspiciousItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-base font-semibold leading-relaxed text-slate-800"
                        >
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-400">
                        No auspicious activities found.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {/* Center Date Panel */}
            <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-6 text-center">
                <div className="text-3xl font-black text-rose-600 md:text-4xl">
                  {displayDate.monthShort} {displayDate.year}
                </div>
              </div>

              <div className="px-6 py-8 text-center">
                <div className="text-7xl font-black leading-none text-rose-600 md:text-8xl">
                  {selectedDay}
                </div>
                <div className="mt-4 text-2xl font-black text-rose-600 md:text-3xl">
                  {displayDate.weekday}
                </div>

                <div className="mx-auto mt-8 max-w-xs space-y-4 border-t border-b border-slate-200 py-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      Status
                    </div>
                    <div
                      className={`mt-2 text-lg font-black ${
                        dayData.isSnakeSafe ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {dayData.status}
                    </div>
                  </div>

                  {dayData.clash && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Clash
                      </div>
                      <div className="mt-2 text-base font-bold text-slate-800">
                        {dayData.clash}
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.35em] text-slate-300">
                  Verified Lunar Data
                </p>
              </div>
            </section>

            {/* Inauspicious */}
            <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5 text-center">
                <h2 className="text-2xl font-black text-rose-600 md:text-3xl">
                  Inauspicious
                </h2>
              </div>

              <div className="p-6">
                <div className="rounded-[1.5rem] border border-rose-100 bg-rose-50 p-5">
                  <ul className="space-y-3">
                    {inauspiciousItems.length > 0 ? (
                      inauspiciousItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-base font-semibold leading-relaxed text-slate-800"
                        >
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-400">
                        No inauspicious activities found.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
