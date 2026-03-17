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
    
    // SMART SEARCH: Find the cell containing "Suit", then grab all text in the cell next to it
    $('th, td').each((i, el) => {
      const cellText = $(el).text().trim();
      
      if (cellText === "Suit") {
        $(el).next('td').find('a, span, li').each((j, item) => {
          const val = $(item).text().trim();
          if (val.length > 2) suit.push(val);
        });
        // Fallback if no sub-tags (a, span, li) are found
        if (suit.length === 0) {
          suit = $(el).next('td').text().split(',').map(s => s.trim());
        }
      }

      if (cellText === "Avoid") {
        $(el).next('td').find('a, span, li').each((j, item) => {
          const val = $(item).text().trim();
          if (val.length > 2) avoid.push(val);
        });
        if (avoid.length === 0) {
          avoid = $(el).next('td').text().split(',').map(s => s.trim());
        }
      }
    });

    // Clean up
    const finalSuit = [...new Set(suit)].filter(item => item.length > 2 && item !== "Suit");
    const finalAvoid = [...new Set(avoid)].filter(item => item.length > 2 && item !== "Avoid");

    // STRICT CHECK: If after all that it's still empty, then it's a real error
    if (finalSuit.length === 0) throw new Error("No Data Found");

    // CLASH LOGIC
    const clashText = $('th:contains("Clash"), td:contains("Clash")').next('td').text();
    const isSnakeClash = clashText.toLowerCase().includes("snake");

    return NextResponse.json({
      isSnakeSafe: !isSnakeClash,
      status: isSnakeClash ? "Snake Clash" : "Auspicious",
      suit: finalSuit,
      avoid: finalAvoid
    });

  } catch (error) {
    console.error("Scrape Error:", error);
    return NextResponse.json({ error: "Sync Failed" }, { status: 500 });
  }
}
