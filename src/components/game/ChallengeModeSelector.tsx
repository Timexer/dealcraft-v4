'use client';

import { useGameStore } from '@/store/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Lock, Scale, Circle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

type ChallengeMode = 'none' | 'speed' | 'limited_choices' | 'ethics_lock';

interface ModeConfig {
  id: ChallengeMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  difficulty: string;
  badgeClass: string;
  iconBg: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'none',
    label: 'Normal',
    icon: <Circle className="size-5" />,
    description: 'Standard gameplay with no special constraints',
    difficulty: '1x',
    badgeClass: 'bg-muted/20 text-muted-foreground border-muted/30',
    iconBg: 'bg-muted/20',
  },
  {
    id: 'speed',
    label: 'Speed Run',
    icon: <Zap className="size-5" />,
    description: '90-second timer for the entire negotiation. If time runs out, current state becomes the final outcome.',
    difficulty: '1.5x',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    iconBg: 'bg-amber-500/15',
  },
  {
    id: 'limited_choices',
    label: 'Limited Choices',
    icon: <Lock className="size-5" />,
    description: 'Every other choice is locked. You can only pick choice 1 or 3 from a set of 4, etc.',
    difficulty: '2x',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    iconBg: 'bg-orange-500/15',
  },
  {
    id: 'ethics_lock',
    label: 'Ethics Lock',
    icon: <Scale className="size-5" />,
    description: 'Any choice that would reduce ethical impact is disabled. You must maintain ethical standards.',
    difficulty: '1.8x',
    badgeClass: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    iconBg: 'bg-teal-500/15',
  },
];

interface ChallengeModeSelectorProps {
  onModeSelected?: () => void;
}

export function ChallengeModeSelector({ onModeSelected }: ChallengeModeSelectorProps) {
  const { challengeMode, setChallengeMode } = useGameStore();

  const handleSelect = (mode: ChallengeMode) => {
    setChallengeMode(mode);
    onModeSelected?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-amber-500">Challenge Mode</h3>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20">
          Optional
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MODES.map((mode, i) => {
          const isSelected = challengeMode === mode.id;
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-amber-500/5 ${
                  isSelected
                    ? 'border-amber-500/50 bg-amber-500/5 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'border-border/30 bg-card/30 hover:border-amber-500/20'
                }`}
                onClick={() => handleSelect(mode.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex size-7 items-center justify-center rounded-md ${mode.iconBg}`}>
                        <span className={isSelected ? 'text-amber-400' : 'text-muted-foreground'}>
                          {mode.icon}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-amber-300' : 'text-foreground'}`}>
                        {mode.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${mode.badgeClass}`}>
                        {mode.difficulty}
                      </Badge>
                      {isSelected && (
                        <CheckCircle2 className="size-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    {mode.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
