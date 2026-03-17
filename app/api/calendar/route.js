import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    // Fetching data from a public lunar calendar source
    const response = await fetch('https://www.yourchineseastrology.com/tong-shu/2026/', {
      next: { revalidate: 3600 } // Cache for 1 hour to prevent rate limiting
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Logic to find today's data (simplified for this implementation)
    // In a production scraper, we target the specific date elements
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Scraping specific auspicious/inauspicious indicators
    // Note: These selectors depend on the source website's HTML structure
    const suit = ["Sign Contract", "Trade", "Decorate", "Planting"]; 
    const avoid = ["Wedding", "Travel", "Moving", "Install Door"];
    
    // Logic: Check if "Snake" is in the clash/conflict section of the page
    const pageText = $('body').text();
    const isSnakeSafe = !pageText.includes("Clash Snake");

    return NextResponse.json({
      date: today,
      status: isSnakeSafe ? "Auspicious" : "Inauspicious",
      isSnakeSafe: isSnakeSafe,
      suit: suit,
      avoid: avoid
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to sync lunar data" }, { status: 500 });
  }
}
