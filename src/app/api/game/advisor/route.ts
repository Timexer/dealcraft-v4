import { NextRequest, NextResponse } from 'next/server';

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

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      console.warn("Missing OPENROUTER_API_KEY. Using fallback advice.");
      return NextResponse.json({ advice: "Consider the other party's BATNA before making your next move." });
    }

    const userMessage = `Scenario: ${scenarioContext}
Current state: Trust=${negotiationState.trust}/100, Anger=${negotiationState.anger}/100, Patience=${negotiationState.patience}/100, Value Claimed=${negotiationState.valueClaimed}, Value Created=${negotiationState.valueCreated}
Choices made so far: ${negotiationState.choicesMade.length}
Information revealed: ${[...negotiationState.informationRevealed, ...(discoveredFacts || [])].join(', ') || 'none'}
Bias traps triggered: ${negotiationState.biasTrapsTriggered.join(', ') || 'none'}
Recent dialogue: "${recentDialogue || 'N/A'}"

What should I do next?`;

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
        messages: [
          {
            role: 'system',
            content: "You are a world-class negotiation advisor based on the principles from 'Negotiation Genius'. Give brief, actionable advice (2-3 sentences max). Focus on: 1) What the other side likely wants but isn't saying, 2) What cognitive biases might be at play, 3) What strategic move would maximize value. Be specific to the current situation. Use negotiation terminology like BATNA (best alternative if no deal), ZOPA (possible deal zone), walk-away point (reservation value), target outcome (aspiration), anchoring, logrolling, etc. Never confuse BATNA with walk-away point — BATNA is an action, walk-away point is a number.",
          },
          {
            role: 'user',
            content: userMessage,
          },
        ]
      })
    });

    if (!openRouterResponse.ok) {
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    const response = await openRouterResponse.json();

    // Extract the advice text from the response
    let advice = '';
    if (response?.choices?.[0]?.message?.content) {
      advice = response.choices[0].message.content.trim();
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
