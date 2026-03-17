import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const revalidate = 86400;

function cleanList(arr) {
  return [...new Set(arr.map((v) => v.trim()))].filter(Boolean);
}

function splitMergedText(text) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[a-z\/])(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getSectionText(fullText, startLabel, endLabel) {
  const pattern = new RegExp(
    `${startLabel}\\s*([\\s\\S]*?)\\s*${endLabel}`,
    "i"
  );
  const match = fullText.match(pattern);
  return match ? match[1].trim() : "";
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
      next: { revalidate: 86400 },
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

    const rawText = $("body")
      .text()
      .replace(/\r/g, "")
      .replace(/\u00a0/g, " ");

    const clashMatch = rawText.match(/Clash:\s*\[?([A-Za-z]+)\]?/i);
    const clashAnimal = clashMatch ? clashMatch[1].trim() : "";
    const isSnakeClash = /snake/i.test(clashAnimal);

    const auspiciousText = getSectionText(
      rawText,
      "Auspicious",
      "Auspicious Times"
    );

    const inauspiciousText = getSectionText(
      rawText,
      "Inauspicious",
      "Inauspicious Times"
    );

    const finalSuit = cleanList(splitMergedText(auspiciousText));
    const finalAvoid = cleanList(splitMergedText(inauspiciousText));

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
      clash: clashAnimal ? `Clash: ${clashAnimal}` : "",
    });
  } catch (error) {
    console.error("calendar route error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
