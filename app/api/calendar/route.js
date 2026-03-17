import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
// while debugging, force fresh requests so Vercel cache does not confuse you
export const dynamic = "force-dynamic";

function cleanList(arr) {
  return [...new Set(arr.map(v => v.trim()))].filter(
    v => v && v.length > 1 && !/^(suit|avoid)$/i.test(v)
  );
}

function extractItemsFromCell($, cell) {
  const values = [];

  // First try links, spans, list items
  $(cell).find("a, span, li").each((_, el) => {
    const txt = $(el).text().trim();
    if (txt) values.push(txt);
  });

  // Fallback: split raw text
  if (values.length === 0) {
    const raw = $(cell).text().replace(/\s+/g, " ").trim();
    raw.split(/,|\/|;|\|/).forEach(part => {
      const txt = part.trim();
      if (txt) values.push(txt);
    });
  }

  return cleanList(values);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const now = new Date();
  const year = Number(searchParams.get("year")) || now.getFullYear();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;
  const day = Number(searchParams.get("day")) || now.getDate();

  // Validate date properly
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Invalid date" },
      { status: 400 }
    );
  }

  const padMonth = String(month).padStart(2, "0");
  const padDay = String(day).padStart(2, "0");
  const url = `https://www.yourchineseastrology.com/calendar/${year}/${Number(month)}-${Number(day)}.htm`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Source fetch failed`,
          statusCode: response.status,
          sourceUrl: targetUrl,
        },
        { status: 502 }
      );
    }

    const html = await response.text();

    if (!html || html.length < 500) {
      return NextResponse.json(
        {
          error: "Source returned empty or suspiciously short HTML",
          sourceUrl: targetUrl,
        },
        { status: 502 }
      );
    }

    const $ = cheerio.load(html);

    let suit = [];
    let avoid = [];
    let clashText = "";

    $("th, td").each((_, el) => {
      const label = $(el).text().replace(/\s+/g, " ").trim().toLowerCase();
      const nextCell = $(el).next("td");

      if (!nextCell || nextCell.length === 0) return;

      if (label === "suit" || label.includes("suit")) {
        suit = extractItemsFromCell($, nextCell);
      }

      if (label === "avoid" || label.includes("avoid")) {
        avoid = extractItemsFromCell($, nextCell);
      }

      if (label === "clash" || label.includes("clash")) {
        clashText = nextCell.text().replace(/\s+/g, " ").trim();
      }
    });

    // Fallback search if primary selectors failed
    if (suit.length === 0 || avoid.length === 0) {
      $("table tr").each((_, row) => {
        const cells = $(row).find("th, td");
        if (cells.length < 2) return;

        const first = $(cells[0]).text().replace(/\s+/g, " ").trim().toLowerCase();
        const second = cells[1];

        if (suit.length === 0 && (first === "suit" || first.includes("suit"))) {
          suit = extractItemsFromCell($, second);
        }

        if (avoid.length === 0 && (first === "avoid" || first.includes("avoid"))) {
          avoid = extractItemsFromCell($, second);
        }

        if (!clashText && (first === "clash" || first.includes("clash"))) {
          clashText = $(second).text().replace(/\s+/g, " ").trim();
        }
      });
    }

    if (suit.length === 0) {
      return NextResponse.json(
        {
          error: "Scrape failed: could not find Suit items",
          sourceUrl: targetUrl,
          debug: {
            avoidFound: avoid.length,
            clashFound: !!clashText,
          },
        },
        { status: 502 }
      );
    }

    const isSnakeClash = clashText.toLowerCase().includes("snake");

    return NextResponse.json({
      date: `${year}-${padMonth}-${padDay}`,
      isSnakeSafe: !isSnakeClash,
      status: isSnakeClash ? "Snake Clash" : "Auspicious",
      clash: clashText || null,
      suit,
      avoid,
      sourceUrl: targetUrl,
    });
  } catch (error) {
    console.error("calendar route error:", error);

    return NextResponse.json(
      {
        error: "Server scrape error",
        details: error instanceof Error ? error.message : "Unknown error",
        sourceUrl: targetUrl,
      },
      { status: 500 }
    );
  }
}
