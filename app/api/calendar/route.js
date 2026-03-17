import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // 1. Get current system date as defaults
  const now = new Date();
  const year = searchParams.get('year') || now.getFullYear();
  const month = searchParams.get('month') || (now.getMonth() + 1);
  const day = searchParams.get('day') || now.getDate();

  const padMonth = String(month).padStart(2, '0');
  const padDay = String(day).padStart(2, '0');
  
  try {
    // 2. Dynamic URL generation based on system date
    const url = `https://www.yourchineseastrology.com/tong-shu/${year}-${padMonth}-${padDay}.htm`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) throw new Error("Source unreachable");

    const html = await response.text();
    const $ = cheerio.load(html);

    let suit = [];
    let avoid = [];
    
    // 3. Strict Scraping: Target the exact table cells for Suit and Avoid
    $('th:contains("Suit"), td:contains("Suit")').next('td').find('a, span').each((i, el) => {
      const text = $(el).text().trim();
      if (text) suit.push(text);
    });

    $('th:contains("Avoid"), td:contains("Avoid")').next('td').find('a, span').each((i, el) => {
      const text = $(el).text().trim();
      if (text) avoid.push(text);
    });

    // 4. Clean and Deduplicate
    const finalSuit = [...new Set(suit)].filter(item => item.length > 1);
    const finalAvoid = [...new Set(avoid)].filter(item => item.length > 1);

    // 5. Validation: Fail if data is missing (No hardcoding)
    if (finalSuit.length === 0 || finalAvoid.length === 0) {
      return NextResponse.json({ error: "Sync Failed: Missing Source Data" }, { status: 500 });
    }

    const clashSection = $('th:contains("Clash"), td:contains("Clash")').next('td').text();
    const isSnakeClash = clashSection.toLowerCase().includes("snake");

    return NextResponse.json({
      fullDate: `${year}-${padMonth}-${padDay}`,
      isSnakeSafe: !isSnakeClash,
      status: isSnakeClash ? "Snake Clash" : "Auspicious",
      suit: finalSuit,
      avoid: finalAvoid
    });

  } catch (error) {
    return NextResponse.json({ error: "Sync Failed: Connection Error" }, { status: 500 });
  }
}
