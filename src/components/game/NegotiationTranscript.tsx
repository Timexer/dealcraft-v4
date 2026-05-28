'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { getScenarioById } from '@/data/scenarios';
import { type TranscriptEntry, type DialogueNode, type DialogueChoice, CHOICE_TYPE_STYLES } from '@/data/scenarios/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  Bot,
  BookOpen,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NegotiationTranscriptProps {
  scenarioId: string;
  transcript?: TranscriptEntry[];
  choicesMade: string[];
}

// Speaker style map for transcript viewer
const SPEAKER_STYLES: Record<string, { bg: string; border: string; label: string; iconClass: string }> = {
  narrator: { bg: 'bg-muted/20', border: 'border-l-muted-foreground/30', label: 'Narrator', iconClass: 'text-muted-foreground' },
  counterparty: { bg: 'bg-cyan-500/10', border: 'border-l-cyan-500/40', label: 'Counterparty', iconClass: 'text-cyan-400' },
  client: { bg: 'bg-amber-500/10', border: 'border-l-amber-500/40', label: 'Client', iconClass: 'text-amber-400' },
  advisor: { bg: 'bg-violet-500/10', border: 'border-l-violet-500/40', label: 'Advisor', iconClass: 'text-violet-400' },
};

const formatDialogueText = (text: string) => {
  if (!text) return '';
  const parts = text.split('*');
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    // Odd indices are text inside asterisks (i.e. *action*)
    if (index % 2 !== 0) {
      return (
        <span key={index} className="italic text-muted-foreground font-light">
          {part}
        </span>
      );
    }
    return part;
  });
};

export function NegotiationTranscript({ scenarioId, transcript, choicesMade }: NegotiationTranscriptProps) {
  const scenario = getScenarioById(scenarioId);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Build transcript from scenario data if not stored
  const builtTranscript = useMemo((): TranscriptEntry[] => {
    if (transcript && transcript.length > 0) return transcript;
    if (!scenario) return [];

    // Reconstruct transcript from choicesMade and dialogue tree
    const entries: TranscriptEntry[] = [];
    const choicesMadeSet = new Set(choicesMade);
    let currentId = 'start';
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = scenario.dialogueTree.find(n => n.id === currentId);
      if (!node) break;

      const entry: TranscriptEntry = {
        nodeId: node.id,
        speaker: node.speaker,
        text: node.text,
      };

      // If this node has choices, record the available choices and which was taken
      if (node.choices && node.choices.length > 0) {
        const availableChoices = node.choices.map(choice => ({
          id: choice.id,
          text: choice.text,
          type: choice.type,
          wasTaken: choicesMadeSet.has(choice.id),
        }));
        entry.availableChoices = availableChoices;

        // Find the choice that was taken
        const takenChoice = node.choices.find(c => choicesMadeSet.has(c.id));
        if (takenChoice) {
          entry.chosenChoiceId = takenChoice.id;
          entry.chosenChoiceText = takenChoice.text;
          currentId = takenChoice.nextNodeId;
        } else {
          // No choice was found, follow nextNodeId or stop
          currentId = node.nextNodeId || '';
        }
      } else {
        // Auto node, follow nextNodeId
        currentId = node.nextNodeId || '';
      }

      // Stop at ending nodes
      if (node.id.startsWith('ending_')) {
        entries.push(entry);
        break;
      }

      entries.push(entry);
    }

    return entries;
  }, [transcript, scenario, choicesMade]);

  // Scroll to focused entry
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < entryRefs.current.length) {
      entryRefs.current[focusedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusedIndex]);

  const handleScrubberClick = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Get speaker display info from scenario
  const getSpeakerInfo = (speaker: string): { label: string; avatar: string } => {
    if (!scenario) return { label: speaker, avatar: '💬' };
    switch (speaker) {
      case 'counterparty':
        return { label: scenario.counterparty.name, avatar: scenario.counterparty.avatar };
      case 'client':
        return { label: scenario.client.name, avatar: scenario.client.avatar };
      case 'advisor':
        return { label: 'Advisor', avatar: '💡' };
      case 'narrator':
        return { label: 'Narrator', avatar: '📖' };
      default:
        return { label: speaker, avatar: '💬' };
    }
  };

  if (!scenario || builtTranscript.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No transcript data available for this case.</p>
        <p className="text-xs text-muted-foreground mt-1">Transcripts are recorded for new cases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Scrubber */}
      <div className="bg-card/30 rounded-lg border border-border/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] text-muted-foreground font-medium">Conversation Flow</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {builtTranscript.map((entry, i) => {
            const speakerInfo = getSpeakerInfo(entry.speaker);
            const isFocused = i === focusedIndex;
            const isChosen = !!entry.chosenChoiceId;
            const isEnding = entry.nodeId.startsWith('ending_');

            return (
              <button
                key={`${entry.nodeId}-${i}`}
                onClick={() => handleScrubberClick(i)}
                className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] transition-all duration-200 ${
                  isFocused
                    ? 'border-amber-500 bg-amber-500/20 scale-110 ring-2 ring-amber-500/30'
                    : isEnding
                      ? 'border-yellow-500/40 bg-yellow-500/10 hover:border-amber-500/50'
                      : isChosen
                        ? 'border-amber-500/30 bg-amber-500/10 hover:border-amber-500/50'
                        : 'border-border/40 bg-card/50 hover:border-amber-500/30'
                }`}
                title={`${speakerInfo.label}: ${entry.text.slice(0, 50)}...`}
              >
                {speakerInfo.avatar}
              </button>
            );
          })}
        </div>
        {/* Position indicator */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-muted-foreground">Start</span>
          <span className="text-[11px] text-amber-400 font-medium">
            {focusedIndex + 1} of {builtTranscript.length}
          </span>
          <span className="text-[11px] text-muted-foreground">End</span>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          disabled={focusedIndex === 0}
          onClick={() => setFocusedIndex(Math.max(0, focusedIndex - 1))}
          className="gap-1 text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Step {focusedIndex + 1} / {builtTranscript.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={focusedIndex >= builtTranscript.length - 1}
          onClick={() => setFocusedIndex(Math.min(builtTranscript.length - 1, focusedIndex + 1))}
          className="gap-1 text-xs"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Separator />

      {/* Transcript Entries */}
      <ScrollArea className="max-h-[50vh]" ref={scrollRef}>
        <div className="space-y-3 pr-2">
          {builtTranscript.map((entry, i) => {
            const speakerInfo = getSpeakerInfo(entry.speaker);
            const speakerStyle = SPEAKER_STYLES[entry.speaker] || SPEAKER_STYLES.narrator;
            const isFocused = i === focusedIndex;
            const isEnding = entry.nodeId.startsWith('ending_');

            return (
              <motion.div
                key={`${entry.nodeId}-${i}`}
                ref={(el) => { entryRefs.current[i] = el; }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setFocusedIndex(i)}
                className={`rounded-lg border-l-2 transition-all duration-200 cursor-pointer ${
                  isFocused
                    ? `ring-1 ring-amber-500/30 ${speakerStyle.bg} ${speakerStyle.border}`
                    : `${speakerStyle.bg} ${speakerStyle.border} hover:ring-1 hover:ring-amber-500/15`
                } ${isEnding ? 'ring-1 ring-yellow-500/20' : ''}`}
              >
                {/* Dialogue message */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">{speakerInfo.avatar}</span>
                    <span className={`text-xs font-semibold ${speakerStyle.iconClass}`}>
                      {speakerInfo.label}
                    </span>
                    {isEnding && (
                      <Badge variant="outline" className="text-[11px] px-1.5 py-0 bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
                        Ending
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${entry.speaker === 'narrator' ? 'italic text-muted-foreground' : ''}`}>
                    {formatDialogueText(entry.text)}
                  </p>
                </div>

                {/* Chosen choice highlight */}
                {entry.chosenChoiceText && (
                  <div className="mx-3 mb-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <User className="h-3 w-3 text-amber-400" />
                      <span className="text-[11px] text-amber-400 font-medium">Your Choice</span>
                    </div>
                    <p className="text-xs text-amber-300">→ {entry.chosenChoiceText}</p>
                  </div>
                )}

                {/* Available choices (branch indicators) */}
                {entry.availableChoices && entry.availableChoices.length > 0 && (
                  <div className="mx-3 mb-3 space-y-1.5">
                    <p className="text-[11px] text-muted-foreground font-medium">Available paths:</p>
                    {entry.availableChoices.map(choice => {
                      const wasTaken = choice.wasTaken;
                      const choiceStyle = CHOICE_TYPE_STYLES[choice.type as keyof typeof CHOICE_TYPE_STYLES];
                      const isRequirementMet = true; // We show all available choices in review

                      return (
                        <div
                          key={choice.id}
                          className={`flex items-start gap-2 p-1.5 rounded-md text-[11px] transition-all ${
                            wasTaken
                              ? 'bg-amber-500/10 border border-amber-500/20'
                              : 'bg-card/30 border border-border/20 opacity-50'
                          }`}
                        >
                          <span className="shrink-0 mt-0.5">
                            {wasTaken ? (
                              <Eye className="h-3 w-3 text-amber-400" />
                            ) : (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={wasTaken ? 'text-amber-300' : 'text-muted-foreground'}>
                                {choice.text}
                              </span>
                              {choiceStyle && (
                                <Badge variant="outline" className={`text-[11px] px-1 py-0 ${wasTaken ? choiceStyle.color : 'bg-muted/20 text-muted-foreground border-border/20'}`}>
                                  {choiceStyle.icon} {choiceStyle.label}
                                </Badge>
                              )}
                            </div>
                            {!wasTaken && (
                              <span className="text-[11px] text-muted-foreground italic">Road not taken</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
