'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/scenarios/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Lightbulb,
  Plus,
  X,
  Shield,
  Target,
  MessageSquare,
  Handshake,
  BarChart3,
} from 'lucide-react';

const ADVISOR_TIPS: Record<string, string> = {
  fundamentals: 'Start with your BATNA. Know your walk-away point before you sit at the table.',
  hidden_interests: 'Ask why. The stated demand is rarely the real need.',
  multi_issue: "Don't negotiate issues one at a time. Build package offers.",
  deadline: 'Urgency creates pressure on both sides. Find out whose deadline it really is.',
  deception: 'Verify claims independently. Trust is earned, not assumed.',
  power_imbalance: 'Your weakness may be their necessity. Find what they need from you.',
  relationship: 'The relationship IS the deal. Protect it.',
  ugly: 'Emotions are data. Don\'t fight them — read them.',
  ethics: 'Consider who is NOT at the table. Outsider harm is still harm.',
  master: 'Combine every skill you\'ve learned. The master sees the whole board.',
};

const TRADEABILITY_COLORS = {
  high: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  low: 'text-red-400 bg-red-500/20 border-red-500/30',
};

const OPENING_STRATEGIES = [
  { id: 'first_offer', label: 'Make First Offer', icon: Target, description: 'Anchor the negotiation with your opening position' },
  { id: 'invite_offer', label: 'Invite Their Offer', icon: MessageSquare, description: 'Let them show their hand first' },
  { id: 'diagnostic', label: 'Ask Diagnostic Questions', icon: BarChart3, description: 'Gather information before positioning' },
  { id: 'rapport', label: 'Build Rapport First', icon: Handshake, description: 'Establish trust before discussing terms' },
];

export function StrategyBoard() {
  const {
    currentScenarioId, setPhase,
    batnaEstimate, setBatnaEstimate,
    reservationEstimate, setReservationEstimate,
    openingStrategy, setOpeningStrategy,
    assumptions, addAssumption, removeAssumption,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;
  const [newAssumption, setNewAssumption] = useState('');

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

  const { batna, issues, category } = scenario;

  const handleAddAssumption = () => {
    const trimmed = newAssumption.trim();
    if (trimmed) {
      addAssumption(trimmed);
      setNewAssumption('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddAssumption();
    }
  };

  // ZOPA gauge calculation
  const zopaLow = batna.estimatedZOPALow;
  const zopaHigh = batna.estimatedZOPAHigh;
  const zopaRange = zopaHigh - zopaLow;
  const zopaMid = (zopaLow + zopaHigh) / 2;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setPhase('intake')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Strategy Board</h1>
              <p className="text-xs text-muted-foreground">{scenario.title}</p>
            </div>
          </div>
          <Badge variant="outline" className={CATEGORY_COLORS[category]}>
            {CATEGORY_LABELS[category]}
          </Badge>
        </motion.div>

        <ScrollArea className="max-h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-2">
            {/* BATNA Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    BATNA Analysis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Understand your Best Alternative to a Negotiated Agreement
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-xs text-muted-foreground">Client&apos;s BATNA</span>
                      <p className="text-sm font-medium">{batna.clientBATNA}</p>
                      <span className="text-xs text-muted-foreground">Estimated value: €{batna.clientBATNAValue.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs text-muted-foreground">Counterparty&apos;s BATNA</span>
                      <p className="text-sm font-medium">{batna.counterpartyBATNA}</p>
                      <span className="text-xs text-muted-foreground">Estimated value: €{batna.counterpartyBATNAValue.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Your BATNA Estimate (€)</Label>
                      <Input
                        type="number"
                        placeholder="Enter your estimate..."
                        value={batnaEstimate || ''}
                        onChange={(e) => setBatnaEstimate(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Your Reservation Value (€)</Label>
                      <Input
                        type="number"
                        placeholder="Minimum acceptable..."
                        value={reservationEstimate || ''}
                        onChange={(e) => setReservationEstimate(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* ZOPA Gauge */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Estimated ZOPA Range</span>
                      <span className="text-xs text-muted-foreground">
                        €{zopaLow.toLocaleString()} — €{zopaHigh.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-8 bg-muted/30 rounded-full overflow-hidden border border-border/50">
                      <div className="absolute inset-0 flex items-center">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500/30 via-amber-400/50 to-emerald-500/30 rounded-full"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-[10px] font-medium">€{(zopaLow / 1000).toFixed(0)}K</span>
                        <span className="text-[10px] font-medium text-amber-400">ZOPA</span>
                        <span className="text-[10px] font-medium">€{(zopaHigh / 1000).toFixed(0)}K</span>
                      </div>
                      {reservationEstimate > 0 && (
                        <div
                          className="absolute top-0 h-full w-0.5 bg-red-500 z-10"
                          style={{
                            left: `${Math.min(100, Math.max(0, ((reservationEstimate - zopaLow) / zopaRange) * 100))}%`,
                          }}
                        >
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-red-400 whitespace-nowrap">
                            RV
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Issue Priority Matrix */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Issue Priority Matrix
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Identify trade opportunities where priorities differ
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-3 rounded-lg bg-background/50 border border-border/30 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{issue.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{issue.description}</p>
                          </div>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${TRADEABILITY_COLORS[issue.tradeability]}`}>
                            {issue.tradeability} trade
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground">Client Priority</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < issue.clientPriority ? 'text-amber-400 fill-amber-400' : 'text-muted/30'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground">Counterparty Priority</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < issue.counterpartyPriority ? 'text-cyan-400 fill-cyan-400' : 'text-muted/30'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Opening Strategy */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-card/50 border-border/50">
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

            {/* Assumption Tracker */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    Assumption Tracker
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Track what you believe to be true — verify them during investigation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {assumptions.length > 0 && (
                    <ul className="space-y-2">
                      {assumptions.map((assumption, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border border-border/30"
                        >
                          <span className="text-sm text-muted-foreground flex-1">{assumption}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssumption(i)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an assumption..."
                      value={newAssumption}
                      onChange={(e) => setNewAssumption(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddAssumption}
                      disabled={!newAssumption.trim()}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Advisor Tip */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-400 mb-1">Advisor Tip</p>
                      <p className="text-sm text-amber-200/80 italic">
                        {ADVISOR_TIPS[category] || ADVISOR_TIPS.fundamentals}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>

        {/* Proceed Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-end"
        >
          <Button
            onClick={() => setPhase('investigation')}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            size="lg"
          >
            Proceed to Investigation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
