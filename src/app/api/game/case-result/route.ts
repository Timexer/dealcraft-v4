import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Save case result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playerId,
      scenarioId,
      outcome,
      scores,
      finalScore,
      choicesMade,
      advisorLogs,
      hiddenFactsFound,
    } = body;

    if (!playerId || !scenarioId || !outcome) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure player exists
    let player = await db.player.findUnique({ where: { id: playerId } });
    if (!player) {
      player = await db.player.create({
        data: {
          id: playerId,
          name: playerId,
        },
      });
    }

    // Create the case result
    const caseResult = await db.caseResult.create({
      data: {
        playerId,
        scenarioId,
        outcome,
        finalScore: finalScore || 0,
        choicesMade: typeof choicesMade === 'string' ? choicesMade : JSON.stringify(choicesMade || []),
        advisorLogs: typeof advisorLogs === 'string' ? advisorLogs : JSON.stringify(advisorLogs || []),
        hiddenFactsFound: typeof hiddenFactsFound === 'string' ? hiddenFactsFound : JSON.stringify(hiddenFactsFound || []),
      },
    });

    // Update player's completed scenario IDs and score
    const existingPlayer = await db.player.findUnique({ where: { id: playerId } });
    if (existingPlayer) {
      const completedIds: string[] = JSON.parse(existingPlayer.completedScenarioIds || '[]');
      if (!completedIds.includes(scenarioId)) {
        completedIds.push(scenarioId);
      }

      await db.player.update({
        where: { id: playerId },
        data: {
          completedScenarioIds: JSON.stringify(completedIds),
          casesCompleted: existingPlayer.casesCompleted + 1,
          totalScore: existingPlayer.totalScore + (finalScore || 0),
          currentCaseId: null,
          gamePhase: 'dashboard',
        },
      });
    }

    return NextResponse.json({ caseResult });
  } catch (error) {
    console.error('Error saving case result:', error);
    return NextResponse.json({ error: 'Failed to save case result' }, { status: 500 });
  }
}
