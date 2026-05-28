'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Target, MessageSquare, BarChart3, Handshake, ArrowRight, ArrowLeft } from 'lucide-react';
import { PreNegotiationChecklist } from '@/components/game/PreNegotiationChecklist';
import { StrategyAdvisorSidebar } from './StrategyAdvisorSidebar';

const OPENING_STRATEGIES = [
  { id: 'first_offer', label: 'Make First Offer', icon: Target, description: 'Anchor the negotiation with your opening position' },
  { id: 'invite_offer', label: 'Invite Their Offer', icon: MessageSquare, description: 'Let them show their hand first' },
  { id: 'diagnostic', label: 'Ask Diagnostic Questions', icon: BarChart3, description: 'Gather information before positioning' },
  { id: 'rapport', label: 'Build Rapport First', icon: Handshake, description: 'Establish trust before discussing terms' },
];

export function PreNegotiation() {
  const { currentScenarioId, setPhase } = useGameStore();
  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;
  const [openingStrategy, setOpeningStrategy] = useState<string>('first_offer');
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No case selected.</p>
        <Button variant="outline" onClick={() => setPhase('dashboard')} className="ml-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleProceed = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    useGameStore.getState().resetNegotiation();
    // Small delay to prevent AnimatePresence race conditions
    setTimeout(() => {
      setPhase('negotiation');
      setIsTransitioning(false);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/3 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6 min-w-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setPhase('investigation')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Investigation
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Pre-Negotiation Check</h1>
              <p className="text-xs text-muted-foreground">{scenario.title}</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Opening Strategy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/50 border-border/50 glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-violet-400" />
                  Opening Strategy
                </CardTitle>
                <CardDescription className="text-xs">
                  How will you begin the negotiation?
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <RadioGroup
                  value={openingStrategy}
                  onValueChange={setOpeningStrategy}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {OPENING_STRATEGIES.map((strategy) => (
                    <Label
                      key={strategy.id}
                      htmlFor={strategy.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        openingStrategy === strategy.id
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : 'border-border/30 bg-background/50 hover:border-border/60'
                      }`}
                    >
                      <RadioGroupItem value={strategy.id} id={strategy.id} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <strategy.icon className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-medium">{strategy.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{strategy.description}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pre-Negotiation Checklist (NAP Method) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <PreNegotiationChecklist />
          </motion.div>

          <div className="animated-line" />

          {/* Proceed Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-end pt-4 pb-4"
          >
            <Button
              onClick={handleProceed}
              disabled={isTransitioning}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white gap-2 premium-button dramatic-glow relative z-30"
              size="lg"
            >
              {isTransitioning ? 'Loading...' : 'Start Negotiation'}
              {!isTransitioning && <ArrowRight className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>
        </div>

        {/* Right Column: Strategy Advisor Sidebar */}
        <StrategyAdvisorSidebar openingStrategy={openingStrategy} />
      </div>
    </div>
  );
}
