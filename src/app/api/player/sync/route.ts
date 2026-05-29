import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        caseResults: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse JSON fields
    let parsedStats = {};
    let parsedReputation = {};
    let parsedCompletedScenarioIds = [];

    try {
      if (user.stats) parsedStats = JSON.parse(user.stats);
      if (user.reputation) parsedReputation = JSON.parse(user.reputation);
      if (user.completedScenarioIds) parsedCompletedScenarioIds = JSON.parse(user.completedScenarioIds);
    } catch (e) {
      console.error("Error parsing JSON fields for user:", e);
    }

    // Transform case results into expected state format
    const caseResults = user.caseResults.map((cr) => {
      let scores = {};
      try {
        if (cr.scores) scores = JSON.parse(cr.scores);
      } catch (e) {}

      return {
        id: cr.id,
        scenarioId: cr.scenarioId,
        outcome: cr.outcome,
        finalScore: cr.finalScore,
        createdAt: cr.createdAt,
        scores,
      };
    });

    const totalScore = caseResults.reduce((sum, cr) => sum + cr.finalScore, 0);
    const casesCompleted = caseResults.length;
    const careerTier = casesCompleted < 3 ? 1 : casesCompleted < 8 ? 2 : casesCompleted < 15 ? 3 : casesCompleted < 22 ? 4 : 5;

    return NextResponse.json({
      playerState: {
        playerName: user.name,
        stats: Object.keys(parsedStats).length ? parsedStats : undefined,
        reputation: Object.keys(parsedReputation).length ? parsedReputation : undefined,
        caseResults,
        casesCompleted,
        totalScore,
        careerTier,
        phase: user.gamePhase || "dashboard",
        unlockedCases: ['case-01', 'case-02', 'case-03'], // Could make dynamic based on tier
      },
    });
  } catch (error) {
    console.error("Failed to sync player state:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
