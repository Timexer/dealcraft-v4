import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      scenarioContext,
      negotiationState,
      discoveredFacts,
      recentDialogue,
    } = body as {
      scenarioContext?: string;
      negotiationState?: {
        trust: number;
        anger: number;
        patience: number;
        valueClaimed: number;
        valueCreated: number;
        choicesMade: string[];
        informationRevealed: string[];
        biasTrapsTriggered: string[];
      };
      discoveredFacts?: string[];
      recentDialogue?: string;
    };

    if (!scenarioContext || !negotiationState) {
      return NextResponse.json(
        { error: 'Missing required fields: scenarioContext and negotiationState' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const userMessage = `Scenario: ${scenarioContext}
Current state: Trust=${negotiationState.trust}/100, Anger=${negotiationState.anger}/100, Patience=${negotiationState.patience}/100, Value Claimed=${negotiationState.valueClaimed}, Value Created=${negotiationState.valueCreated}
Choices made so far: ${negotiationState.choicesMade.length}
Information revealed: ${[...negotiationState.informationRevealed, ...(discoveredFacts || [])].join(', ') || 'none'}
Bias traps triggered: ${negotiationState.biasTrapsTriggered.join(', ') || 'none'}
Recent dialogue: "${recentDialogue || 'N/A'}"

What should I do next?`;

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            "You are a world-class negotiation advisor based on the principles from 'Negotiation Genius'. Give brief, actionable advice (2-3 sentences max). Focus on: 1) What the other side likely wants but isn't saying, 2) What cognitive biases might be at play, 3) What strategic move would maximize value. Be specific to the current situation. Use negotiation terminology like BATNA, ZOPA, anchoring, logrolling, etc.",
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      thinking: { type: 'disabled' },
    });

    // Extract the advice text from the response
    let advice = '';
    if (response?.choices?.[0]?.message?.content) {
      advice = response.choices[0].message.content.trim();
    } else if (typeof response === 'string') {
      advice = response.trim();
    } else {
      advice = String(response).trim();
    }

    // Enforce max length (2-3 sentences)
    const sentences = advice.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 3) {
      advice = sentences.slice(0, 3).join(' ').trim();
    }

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('AI Advisor error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI advice' },
      { status: 500 }
    );
  }
}
