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
      hiddenFactsFound,
    } = body;

    if (!playerId || !scenarioId || !outcome) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the case result
    const caseResult = await db.caseResult.create({
      data: {
        playerId,
        scenarioId,
        outcome,
        scores: typeof scores === 'string' ? scores : JSON.stringify(scores),
        finalScore: finalScore || 0,
        choicesMade: typeof choicesMade === 'string' ? choicesMade : JSON.stringify(choicesMade || []),
        hiddenFactsFound: typeof hiddenFactsFound === 'string' ? hiddenFactsFound : JSON.stringify(hiddenFactsFound || []),
      },
    });

    // Update player's completed scenario IDs and score
    const player = await db.player.findUnique({ where: { id: playerId } });
    if (player) {
      const completedIds: string[] = JSON.parse(player.completedScenarioIds || '[]');
      if (!completedIds.includes(scenarioId)) {
        completedIds.push(scenarioId);
      }

      await db.player.update({
        where: { id: playerId },
        data: {
          completedScenarioIds: JSON.stringify(completedIds),
          casesCompleted: player.casesCompleted + 1,
          totalScore: player.totalScore + (finalScore || 0),
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
