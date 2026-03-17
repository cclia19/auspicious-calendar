import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanList(arr) {
  return [...new Set(arr.map(v => v.trim()))].filter(Boolean);
}

function splitItems(lines) {
  return cleanList(
    lines.flatMap(line =>
      line
        .split(/,|\/|;|\|/)
        .map(part => part.trim())
        .filter(Boolean)
    )
  );
}

function getSection(lines, startLabel, endLabel) {
  const startIndex = lines.findIndex(
    line => line.toLowerCase() === startLabel.toLowerCase()
  );

  if (startIndex === -1) return [];

  const endIndex = lines.findIndex(
    (line, i) => i > startIndex && line.toLowerCase() === endLabel.toLowerCase()
  );

  if (endIndex === -1) return [];

  return lines.slice(startIndex + 1, endIndex);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const now = new Date();

  const year = Number(searchParams.get("year")) || now.getFullYear();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;
  const day = Number(searchParams.get("day")) || now.getDate();

  try {
    const url = `https://www.yourchineseastrology.com/calendar/${year}/${month}-${day}.htm`;

    const response = await fetch(url, {
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
          error: "Source fetch failed",
          statusCode: response.status,
          sourceUrl: url,
        },
        { status: 502 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const rawText = $("body").text().replace(/\r/g, "");
    const lines = rawText
      .split("\n")
      .map(line => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const auspiciousLines = getSection(lines, "Auspicious", "Auspicious Times");
    const inauspiciousLines = getSection(lines, "Inauspicious", "Inauspicious Times");

    const finalSuit = splitItems(auspiciousLines);
    const finalAvoid = splitItems(inauspiciousLines);

    const clashLine = lines.find(line => /^Clash:/i.test(line)) || "";
    const isSnakeClash = /snake/i.test(clashLine);

    if (finalSuit.length === 0 && finalAvoid.length === 0) {
      return NextResponse.json(
        {
          error: "Scrape failed",
          sourceUrl: url,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isSnakeSafe: !isSnakeClash,
      status: isSnakeClash ? "Snake Clash" : "Auspicious",
      suit: finalSuit,
      avoid: finalAvoid,
      clash: clashLine,
    });
  } catch (error) {
    console.error("calendar route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
