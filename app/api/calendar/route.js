export async function GET() {
  // Logic specifically for March 17, 2026
  const data = {
    date: "Tuesday, March 17, 2026",
    lunarDate: "January 29",
    status: "Auspicious",
    clashSign: "Monkey",
    isSnakeSafe: true, // Today clashes with Monkey, so Snake is safe!
    suit: ["Sign Contract", "Trade", "Decorate", "Planting"],
    avoid: ["Wedding", "Travel", "Moving", "Install Door"]
  };

  return Response.json(data);
}
