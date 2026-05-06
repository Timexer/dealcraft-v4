'use client';

import { NegotiationTechnique } from '@/data/scenarios/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TECHNIQUE_INFO: Record<Exclude<NegotiationTechnique, 'none'>, { 
  label: string; 
  shortLabel: string;
  icon: string; 
  color: string; 
  source: string;
  description: string;
}> = {
  mirror: {
    label: 'Mirroring',
    shortLabel: 'Mirror',
    icon: '🪞',
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    source: 'Voss Ch.2',
    description: 'Repeat the last 1-3 critical words your counterpart said. This triggers them to elaborate and feel heard.',
  },
  label: {
    label: 'Labeling',
    shortLabel: 'Label',
    icon: '🏷️',
    color: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    source: 'Voss Ch.3',
    description: '"It seems like..." / "It sounds like..." — Name the emotion to defuse it. Moves brain activity from amygdala to rational areas.',
  },
  calibrated_q: {
    label: 'Calibrated Question',
    shortLabel: 'Cal.Q',
    icon: '🎯',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    source: 'Voss Ch.7',
    description: '"How" or "What" questions that give the illusion of control while directing the conversation. Avoid yes/no questions.',
  },
  accusation_audit: {
    label: 'Accusation Audit',
    shortLabel: 'Acc.Audit',
    icon: '🛡️',
    color: 'bg-red-500/15 text-red-400 border-red-500/30',
    source: 'Voss Ch.3',
    description: 'Preemptively list the worst things the other side could say about you. Defuses negatives before they take root.',
  },
  tactical_empathy: {
    label: 'Tactical Empathy',
    shortLabel: 'Empathy',
    icon: '🤝',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    source: 'Voss Ch.3',
    description: 'Demonstrate understanding of the other side\'s feelings and perspective. Not agreement — understanding.',
  },
  strategic_no: {
    label: 'Strategic No',
    shortLabel: 'No',
    icon: '🚫',
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    source: 'Voss Ch.4',
    description: '"No" creates safety and control for the other side. It lets them feel in charge, making them more open to discussion.',
  },
  that_right: {
    label: "That's Right",
    shortLabel: 'Right',
    icon: '✓',
    color: 'bg-green-500/15 text-green-400 border-green-500/30',
    source: 'Voss Ch.5',
    description: 'Seek "That\'s right" (genuine buy-in) not "You\'re right" (dismissal). Paraphrase their position to trigger it.',
  },
  ackerman: {
    label: 'Ackerman Model',
    shortLabel: 'Ackerman',
    icon: '📈',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    source: 'Voss Ch.9',
    description: 'Incremental offer system: 65% → 85% → 95% → 100% of target. Each increase is smaller, signaling you\'re at your limit.',
  },
  black_swan: {
    label: 'Black Swan',
    shortLabel: 'Swan',
    icon: '🦢',
    color: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    source: 'Voss Ch.10',
    description: 'Uncover unknown unknowns — hidden information that transforms the negotiation. Look for mismatches and contradictions.',
  },
  loss_aversion: {
    label: 'Loss Aversion',
    shortLabel: 'Loss',
    icon: '⚠️',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    source: 'Voss Ch.6',
    description: 'Frame proposals as preventing loss rather than achieving gain. People are 2x more motivated by fear of loss than prospect of gain.',
  },
  contribution: {
    label: 'Contribution Mapping',
    shortLabel: 'Contrib',
    icon: '🔄',
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    source: 'DC Ch.4',
    description: 'Replace blame with understanding each party\'s contribution to the problem. "What did we each do to get here?"',
  },
  intent_impact: {
    label: 'Intent vs Impact',
    shortLabel: 'I vs I',
    icon: '🔍',
    color: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    source: 'DC Ch.3',
    description: 'Separate what you intended from the impact it had. Good intentions don\'t negate bad impact, but understanding both helps.',
  },
  third_story: {
    label: 'Third Story',
    shortLabel: '3rd',
    icon: '👁️',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    source: 'DC Ch.8',
    description: 'Begin from a neutral observer\'s perspective — describe the difference between your stories without judging either.',
  },
  feelings_first: {
    label: 'Feelings First',
    shortLabel: 'Feel',
    icon: '💙',
    color: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    source: 'DC Ch.5',
    description: 'Address feelings before substance. Unexpressed feelings leak into tone and body language, poisoning the conversation.',
  },
  identity_ground: {
    label: 'Identity Grounding',
    shortLabel: 'Identity',
    icon: '⚖️',
    color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    source: 'DC Ch.6',
    description: 'Ground your sense of self before the conversation. All-or-nothing identity ("I\'m competent or incompetent") creates fragility.',
  },
};

export function TechniqueBadge({ technique, compact = false }: { technique: NegotiationTechnique; compact?: boolean }) {
  if (technique === 'none' || !technique) return null;
  
  const info = TECHNIQUE_INFO[technique];
  if (!info) return null;
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0 rounded-full border ${info.color} cursor-help whitespace-nowrap`}>
              <span>{info.icon}</span>
              <span>{info.shortLabel}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px]">
            <p className="font-semibold text-xs">{info.label}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{info.description}</p>
            <p className="text-[11px] text-muted-foreground mt-1">📖 {info.source}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${info.color} cursor-help whitespace-nowrap`}>
            <span>{info.icon}</span>
            <span className="font-medium">{info.label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px]">
          <p className="font-semibold text-sm">{info.icon} {info.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
          <p className="text-[11px] text-muted-foreground mt-1.5">📖 {info.source}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function getTechniqueInfo(technique: NegotiationTechnique) {
  if (technique === 'none' || !technique) return null;
  return TECHNIQUE_INFO[technique] || null;
}

export { TECHNIQUE_INFO };
