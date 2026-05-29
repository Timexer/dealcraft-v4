import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// POST: Save case result
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    const {
      scenarioId,
      outcome,
      scores,
      finalScore,
      choicesMade,
      advisorLogs,
      hiddenFactsFound,
    } = body;

    if (!scenarioId || !outcome) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the case result attached to User
    const caseResult = await db.caseResult.create({
      data: {
        userId: userId,
        scenarioId,
        outcome,
        finalScore: finalScore || 0,
        scores: typeof scores === 'string' ? scores : JSON.stringify(scores || {}),
        choicesMade: typeof choicesMade === 'string' ? choicesMade : JSON.stringify(choicesMade || []),
        advisorLogs: typeof advisorLogs === 'string' ? advisorLogs : JSON.stringify(advisorLogs || []),
        hiddenFactsFound: typeof hiddenFactsFound === 'string' ? hiddenFactsFound : JSON.stringify(hiddenFactsFound || []),
      },
    });

    // Update user's completed scenario IDs and score
    const completedIds: string[] = JSON.parse(user.completedScenarioIds || '[]');
    if (!completedIds.includes(scenarioId)) {
      completedIds.push(scenarioId);
    }

    await db.user.update({
      where: { id: userId },
      data: {
        completedScenarioIds: JSON.stringify(completedIds),
        casesCompleted: user.casesCompleted + 1,
        totalScore: user.totalScore + (finalScore || 0),
        gamePhase: 'dashboard',
      },
    });

    return NextResponse.json({ caseResult });
  } catch (error) {
    console.error('Error saving case result:', error);
    return NextResponse.json({ error: 'Failed to save case result' }, { status: 500 });
  }
}
