'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistSection {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  tip: string;
  category: 'essential' | 'recommended' | 'advanced';
}

const SECTIONS: ChecklistSection[] = [
  {
    id: 'power',
    title: 'Power Assessment',
    icon: '⚡',
    items: [
      {
        id: 'power-1',
        label: 'Identified your BATNA',
        description: 'What will you do if this negotiation fails?',
        tip: 'Your BATNA is your greatest source of power. The better your alternative, the more leverage you have.',
        category: 'essential',
      },
      {
        id: 'power-2',
        label: 'Estimated their BATNA',
        description: 'What options does the other side have if they walk away?',
        tip: 'Understanding their alternatives tells you how hard they need this deal.',
        category: 'essential',
      },
      {
        id: 'power-3',
        label: 'Assessed who needs the deal more',
        description: 'Which side has more to lose from no deal?',
        tip: 'Leverage flows to the side with less to lose. Time pressure shifts leverage.',
        category: 'recommended',
      },
    ],
  },
  {
    id: 'issues',
    title: 'Issue Analysis',
    icon: '📊',
    items: [
      {
        id: 'issues-1',
        label: 'Listed all issues, not just price',
        description: 'What are ALL the negotiable items?',
        tip: 'Voss: "Don\'t just negotiate price. Expand the pie — timeline, scope, terms, guarantees, relationships."',
        category: 'essential',
      },
      {
        id: 'issues-2',
        label: 'Ranked issues by priority',
        description: 'Which issues matter most to you? Which to them?',
        tip: 'Different priorities create opportunities for logrolling — trading low-priority issues for high-priority ones.',
        category: 'essential',
      },
      {
        id: 'issues-3',
        label: 'Identified hidden interests',
        description: 'What does the other side really want beneath their stated position?',
        tip: 'Difficult Conversations: Their position is what they say they want. Their interest is WHY they want it.',
        category: 'recommended',
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Battle Planning',
    icon: '♟️',
    items: [
      {
        id: 'strategy-1',
        label: 'Prepared your opening approach',
        description: 'Will you anchor first or let them anchor?',
        tip: 'Voss: Letting them anchor gives you information. If you anchor, use the Ackerman model (65→85→95→100%).',
        category: 'essential',
      },
      {
        id: 'strategy-2',
        label: 'Prepared calibrated questions',
        description: 'What "How" and "What" questions will you use?',
        tip: '"How am I supposed to do that?" — the most powerful calibrated question. It forces them to solve your problem.',
        category: 'recommended',
      },
      {
        id: 'strategy-3',
        label: 'Ready to do an accusation audit',
        description: 'What are the worst things they\'ll think about you?',
        tip: 'Preemptively name the negatives: "You\'re probably thinking I\'m being unreasonable..." Defuses them.',
        category: 'recommended',
      },
      {
        id: 'strategy-4',
        label: 'Identified potential Black Swans',
        description: 'What unknown unknowns might exist in this negotiation?',
        tip: 'Voss: Look for contradictions, mismatched behaviors, and things that don\'t add up. That\'s where Black Swans hide.',
        category: 'advanced',
      },
    ],
  },
  {
    id: 'emotions',
    title: 'Emotional Preparation',
    icon: '🎭',
    items: [
      {
        id: 'emotions-1',
        label: 'Identified your emotional triggers',
        description: 'What might the other side say that would make you react emotionally?',
        tip: 'Difficult Conversations: Name your feelings before the conversation. Otherwise they\'ll leak into your tone.',
        category: 'recommended',
      },
      {
        id: 'emotions-2',
        label: 'Grounded your identity',
        description: 'What does this negotiation mean for your self-image?',
        tip: 'DC Ch.6: If your identity is all-or-nothing ("I\'m competent or incompetent"), you\'ll be fragile. Complexify it.',
        category: 'advanced',
      },
      {
        id: 'emotions-3',
        label: 'Practiced the FM DJ voice',
        description: 'Ready to use a calm, slow, reassuring tone?',
        tip: 'Voss: The late-night FM DJ voice — deep, soft, slow — unconsciously triggers calm in your counterpart.',
        category: 'advanced',
      },
    ],
  },
];

const CATEGORY_COLORS = {
  essential: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  recommended: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  advanced: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
};

export function PreNegotiationChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ power: true, issues: true, strategy: false, emotions: false });

  const totalItems = SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const completionPercent = Math.round((checkedCount / totalItems) * 100);

  const toggleChecked = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="glass-card border-amber-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span>📋</span>
            Pre-Negotiation Checklist
            <Badge variant="outline" className="text-[11px] ml-2 border-amber-500/30 text-amber-500">
              NAP Method
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{checkedCount}/{totalItems}</span>
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-amber-500">{completionPercent}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {SECTIONS.map(section => (
          <div key={section.id} className="border border-border/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
            >
              <span className="text-sm font-medium flex items-center gap-2">
                <span>{section.icon}</span>
                {section.title}
                <Badge variant="outline" className="text-[11px] px-1.5 py-0">
                  {section.items.filter(i => checked[i.id]).length}/{section.items.length}
                </Badge>
              </span>
              {expandedSections[section.id] ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <AnimatePresence>
              {expandedSections[section.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2">
                    {section.items.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                          checked[item.id] ? 'bg-amber-500/5' : 'hover:bg-muted/10'
                        }`}
                      >
                        <Checkbox
                          checked={checked[item.id] || false}
                          onCheckedChange={() => toggleChecked(item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${checked[item.id] ? 'line-through text-muted-foreground' : ''}`}>
                              {item.label}
                            </span>
                            <Badge variant="outline" className={`text-[11px] px-1 py-0 ${CATEGORY_COLORS[item.category]}`}>
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          {expandedTip === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 p-2 rounded-md bg-amber-500/5 border border-amber-500/10"
                            >
                              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <Lightbulb className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                                {item.tip}
                              </p>
                            </motion.div>
                          )}
                          <button
                            onClick={() => setExpandedTip(expandedTip === item.id ? null : item.id)}
                            className="text-[11px] text-amber-500 hover:text-amber-500 mt-1 transition-colors"
                          >
                            {expandedTip === item.id ? 'Hide tip' : 'Show tip'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {completionPercent === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Fully prepared! You&apos;re ready to negotiate.</span>
          </motion.div>
        )}

        {completionPercent < 100 && completionPercent > 0 && (
          <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            <span>Checklist completion is optional but improves your preparation score.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
