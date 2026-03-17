import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = searchParams.get('year') || now.getFullYear();
  const month = String(searchParams.get('month') || (now.getMonth() + 1)).padStart(2, '0');
  const day = String(searchParams.get('day') || now.getDate()).padStart(2, '0');

  try {
    const url = `https://www.yourchineseastrology.com/tong-shu/${year}-${month}-${day}.htm`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) throw new Error("Source down");

    const html = await response.text();
    const $ = cheerio.load(html);

    let suit = [];
    let avoid = [];
    let clashAnimal = "";

    // Reliable Table Scraper
    $('tr').each((i, row) => {
      const label = $(row).find('th, td').first().text().trim().toLowerCase();
      const valueCell = $(row).find('td').last();

      if (label.includes('suit')) {
        valueCell.find('a, span').each((j, el) => suit.push($(el).text().trim()));
        if (suit.length === 0) suit = valueCell.text().split(',').map(s => s.trim());
      }
      if (label.includes('avoid')) {
        valueCell.find('a, span').each((j, el) => avoid.push($(el).text().trim()));
        if (avoid.length === 0) avoid = valueCell.text().split(',').map(s => s.trim());
      }
      if (label.includes('clash')) {
        clashAnimal = valueCell.text().trim();
      }
    });

    const clean = (arr) => [...new Set(arr)].filter(v => v.length > 2 && !/suit|avoid/i.test(v));
    const finalSuit = clean(suit);
    const finalAvoid = clean(avoid);

    if (finalSuit.length === 0) throw new Error("Empty Data");

    const isSnakeClash = clashAnimal.toLowerCase().includes("snake");

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
