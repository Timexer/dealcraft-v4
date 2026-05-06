import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Load game state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      // Return the most recent player
      const player = await db.player.findFirst({
        orderBy: { updatedAt: 'desc' },
        include: { caseResults: true },
      });

      if (!player) {
        return NextResponse.json({ player: null });
      }

      return NextResponse.json({
        player: {
          ...player,
          completedScenarioIds: JSON.parse(player.completedScenarioIds || '[]'),
          stats: JSON.parse(player.stats || '{}'),
          reputation: JSON.parse(player.reputation || '{}'),
        },
      });
    }

    const player = await db.player.findUnique({
      where: { id: playerId },
      include: { caseResults: true },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({
      player: {
        ...player,
        completedScenarioIds: JSON.parse(player.completedScenarioIds || '[]'),
        stats: JSON.parse(player.stats || '{}'),
        reputation: JSON.parse(player.reputation || '{}'),
      },
    });
  } catch (error) {
    console.error('Error loading game:', error);
    return NextResponse.json({ error: 'Failed to load game' }, { status: 500 });
  }
}

// POST: Save game state
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playerId,
      name,
      careerTier,
      reputation,
      stats,
      casesCompleted,
      totalScore,
      currentCaseId,
      gamePhase,
      completedScenarioIds,
    } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }

    const updated = await db.player.upsert({
      where: { id: playerId },
      update: {
        name,
        careerTier,
        reputation: typeof reputation === 'string' ? reputation : JSON.stringify(reputation),
        stats: typeof stats === 'string' ? stats : JSON.stringify(stats),
        casesCompleted,
        totalScore,
        currentCaseId,
        gamePhase,
        completedScenarioIds: typeof completedScenarioIds === 'string' ? completedScenarioIds : JSON.stringify(completedScenarioIds),
      },
      create: {
        id: playerId,
        name: name || 'Negotiator',
        careerTier: careerTier || 1,
        reputation: typeof reputation === 'string' ? reputation : JSON.stringify(reputation || {}),
        stats: typeof stats === 'string' ? stats : JSON.stringify(stats || {}),
        casesCompleted: casesCompleted || 0,
        totalScore: totalScore || 0,
        currentCaseId,
        gamePhase: gamePhase || 'dashboard',
        completedScenarioIds: typeof completedScenarioIds === 'string' ? completedScenarioIds : JSON.stringify(completedScenarioIds || []),
      },
    });

    return NextResponse.json({ player: updated });
  } catch (error) {
    console.error('Error saving game:', error);
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 });
  }
}
