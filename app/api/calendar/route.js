import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = searchParams.get('year') || now.getFullYear();
  const month = searchParams.get('month') || (now.getMonth() + 1);
  const day = searchParams.get('day') || now.getDate();

  const padMonth = String(month).padStart(2, '0');
  const padDay = String(day).padStart(2, '0');
  
  try {
    const url = `https://www.yourchineseastrology.com/tong-shu/${year}-${padMonth}-${padDay}.htm`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const html = await response.text();
    const $ = cheerio.load(html);

    let suit = [];
    let avoid = [];
    
    // RESILIENT SCRAPER: Iterate through every table cell to find matches
    $('th, td').each((i, el) => {
      const label = $(el).text().trim().toLowerCase();
      const nextCell = $(el).next('td');

      if (label === 'suit') {
        // Try grabbing links/spans first, fallback to raw text split by commas
        nextCell.find('a, span').each((j, item) => suit.push($(item).text().trim()));
        if (suit.length === 0) suit = nextCell.text().split(',').map(s => s.trim());
      }

      if (label === 'avoid') {
        nextCell.find('a, span').each((j, item) => avoid.push($(item).text().trim()));
        if (avoid.length === 0) avoid = nextCell.text().split(',').map(s => s.trim());
      }
    });

    // Clean data: Remove empty strings, duplicates, and labels
    const clean = (arr) => [...new Set(arr)].filter(v => v.length > 2 && !/suit|avoid/i.test(v));
    const finalSuit = clean(suit);
    const finalAvoid = clean(avoid);

    // CRITICAL VALIDATION: Only fail if we truly found nothing
    if (finalSuit.length === 0) throw new Error("Scrape failed");

    const clashText = $('th:contains("Clash"), td:contains("Clash")').next('td').text();
    const isSnakeClash = clashText.toLowerCase().includes("snake");

    return NextResponse.json({
      isSnakeSafe: !isSnakeClash,
      status: isSnakeClash ? "Snake Clash" : "Auspicious",
      suit: finalSuit,
      avoid: finalAvoid
    });

  } catch (error) {
    return NextResponse.json({ error: "Sync Error" }, { status: 500 });
  }
}
