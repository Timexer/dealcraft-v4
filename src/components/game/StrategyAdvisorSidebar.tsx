'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { ADVISOR_TIPS, CATEGORY_TIPS, BATNA_TIPS, STRATEGY_TIPS, STRATEGY_ID_MAP } from '@/data/strategy-tips';
import { NotesAndAssumptions } from './NotesAndAssumptions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Lightbulb, ChevronUp, ChevronDown, Zap, AlertTriangle, CheckCircle2, Target, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StrategyAdvisorSidebarProps {
  openingStrategy?: string;
  batnaEstimate?: number;
}

export function StrategyAdvisorSidebar({ openingStrategy, batnaEstimate = 0 }: StrategyAdvisorSidebarProps) {
  const { currentScenarioId, phase, discoveredFacts } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;
  if (!scenario) return null;

  const categoryTip = CATEGORY_TIPS[scenario.category];
  
  // Calculate BATNA Level (only used in strategy phase really)
  let batnaLevel: 'low' | 'medium' | 'high' | null = null;
  if (phase === 'strategy') {
    const batnaRatio = batnaEstimate / (scenario.batna.clientBATNAValue || 1);
    batnaLevel = batnaRatio < 0.8 ? 'low' : batnaRatio < 1.1 ? 'medium' : 'high';
  }

  // Content rendering based on phase
  const renderAdvisorContent = () => (
    <div className="space-y-4">
      {/* Dynamic Tips based on Phase */}
      {(phase === 'intake' || phase === 'strategy') && categoryTip && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{categoryTip.icon}</span>
            <h3 className="text-xs font-semibold text-amber-400">{categoryTip.title}</h3>
          </div>
          <ul className="space-y-2">
            {categoryTip.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {phase === 'strategy' && batnaLevel && (
        <div className={`glass-card p-4 space-y-2 ${
          batnaLevel === 'low' ? 'border-orange-500/30' : batnaLevel === 'high' ? 'border-emerald-500/30' : 'border-amber-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {batnaLevel === 'low' ? <AlertTriangle className="h-3.5 w-3.5 text-orange-400" /> : batnaLevel === 'high' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Lightbulb className="h-3.5 w-3.5 text-amber-400" />}
            <h3 className="text-xs font-semibold text-amber-400">Alternative Assessment</h3>
          </div>
          <p className={`text-xs ${batnaLevel === 'low' ? 'text-orange-300' : batnaLevel === 'high' ? 'text-emerald-300' : 'text-amber-300'}`}>
            {BATNA_TIPS[batnaLevel].text}
          </p>
        </div>
      )}

      {phase === 'pre-negotiation' && openingStrategy && STRATEGY_ID_MAP[openingStrategy] && (
        <div className="glass-card p-4 space-y-2 border-violet-500/20">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-violet-400" />
            <h3 className="text-xs font-semibold text-amber-400">Opening Strategy</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {STRATEGY_TIPS[STRATEGY_ID_MAP[openingStrategy]]}
          </p>
        </div>
      )}

      {phase === 'pre-negotiation' && (
        <div className="glass-card p-4 space-y-3 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-emerald-400" />
              <h3 className="text-xs font-semibold text-emerald-400">Discovered Intel</h3>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] px-1.5 py-0">
              {discoveredFacts.length} facts
            </Badge>
          </div>
          {discoveredFacts.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {discoveredFacts.map((fact) => (
                <Badge key={fact} variant="outline" className="text-[10px] px-1.5 py-0 bg-background/50 border-border/50 text-muted-foreground">
                  {fact.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No intel discovered.</p>
          )}
        </div>
      )}

      {/* Shared Quick Tip */}
      <div className="glass-card p-4 space-y-2 border-amber-500/20">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200 italic">
            {ADVISOR_TIPS[scenario.category] || ADVISOR_TIPS.fundamentals}
          </p>
        </div>
      </div>

      <div className="animated-line opacity-50 my-4" />

      {/* Notes & Assumptions */}
      <div className="glass-card overflow-hidden bg-card/80 border-border/50 shadow-inner">
        <NotesAndAssumptions />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle & Drawer */}
      <div className="lg:hidden fixed bottom-4 right-4 z-[42]">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-full shadow-xl h-12 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white gap-2 border border-amber-500/30">
              <Lightbulb className="h-4 w-4" />
              Advisor & Notes
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-4 py-6 overflow-y-auto custom-scrollbar border-t border-amber-500/20">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">💡</span>
              <h2 className="text-sm font-semibold text-amber-400">Strategy Advisor</h2>
            </div>
            {renderAdvisorContent()}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h2 className="text-sm font-semibold text-amber-400">Strategy Advisor</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-amber-400"
            >
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {renderAdvisorContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
