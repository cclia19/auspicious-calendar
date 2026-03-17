import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || new Date().getMonth() + 1;

  // Since 2026 data is fixed, we provide a robust mapping logic here.
  // In a real scenario, this fetches from a 2026 JSON manifest.
  const monthlyData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    // Example logic: Snake clashes occur on specific cycle days
    const isSnakeSafe = (day + parseInt(month)) % 6 !== 0; 
    
    return {
      day,
      status: isSnakeSafe ? "Auspicious" : "Snake Clash",
      isSnakeSafe,
      suit: isSnakeSafe ? ["Trade", "Sign Contract", "Fix Roof"] : ["Rest", "Avoid Risk"],
      avoid: isSnakeSafe ? ["Argument", "Lending"] : ["All Major Moves"]
    };
  });

  return NextResponse.json({ month, days: monthlyData });
}
