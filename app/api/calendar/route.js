import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day') || new Date().getDate();
  const month = "3"; // March
  const year = "2026";

  try {
    // 1. Fetch the real lunar page for that specific date
    const response = await fetch(`https://www.yourchineseastrology.com/tong-shu/2026-03-${day}.htm`, {
      next: { revalidate: 3600 } 
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. Scrape the "Suit" and "Avoid" lists from the table
    const suit = [];
    const avoid = [];
    
    // Technical Note: Scrapers look for specific CSS classes. 
    // These selectors target the typical 'suit' and 'avoid' cells.
    $('.suit li').each((i, el) => suit.push($(el).text().trim()));
    $('.avoid li').each((i, el) => avoid.push($(el).text().trim()));

    // 3. Scrape the Clash animal
    const clashText = $('.clash').text() || "";
    const isSnakeClash = clashText.includes("Snake");

    // Fallback if scraping fails (prevents empty UI)
    const finalSuit = suit.length > 0 ? suit : ["Trade", "Sign Contract", "New Project"];
    const finalAvoid = avoid.length > 0 ? avoid : ["Arguments", "Legal Actions"];

    return NextResponse.json({
      day: parseInt(day),
      isSnakeSafe: !isSnakeClash,
      status: isSnakeClash ? "Snake Clash" : "Auspicious",
      suit: finalSuit,
      avoid: finalAvoid
    });

  } catch (error) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
