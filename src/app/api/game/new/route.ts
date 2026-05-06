import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Create new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const player = await db.player.create({
      data: {
        name,
        careerTier: 1,
        reputation: JSON.stringify({
          shark: 0, architect: 0, detective: 0, diplomat: 0, closer: 0, ethicist: 0, fixer: 0,
        }),
        stats: JSON.stringify({
          preparation: 10, valueClaiming: 10, valueCreation: 10, investigation: 10,
          emotionalControl: 10, ethicalJudgment: 10, powerStrategy: 10,
          relationshipMgmt: 10, crisisHandling: 10, culturalAwareness: 10,
        }),
        casesCompleted: 0,
        totalScore: 0,
        gamePhase: 'dashboard',
        completedScenarioIds: JSON.stringify([]),
      },
    });

    return NextResponse.json({
      player: {
        ...player,
        completedScenarioIds: JSON.parse(player.completedScenarioIds || '[]'),
        stats: JSON.parse(player.stats || '{}'),
        reputation: JSON.parse(player.reputation || '{}'),
      },
    });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}
