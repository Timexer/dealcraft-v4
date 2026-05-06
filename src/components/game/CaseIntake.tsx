'use client';

import { useGameStore } from '@/store/game-store';
import { getScenarioById } from '@/data/scenarios';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/scenarios/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Clock,
  AlertTriangle,
  Heart,
  ClipboardList,
  Target,
  FileText,
} from 'lucide-react';

export function CaseIntake() {
  const { currentScenarioId, setPhase, setCaseAccepted, setCurrentScenarioId } = useGameStore();
  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : null;

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

  const { briefing, client, counterparty } = scenario;

  const handleAccept = () => {
    setCaseAccepted(true);
    setPhase('strategy');
  };

  const handleRequestMoreInfo = () => {
    toast.info('Additional information requires investigation phase', {
      description: 'Accept the case to unlock the investigation phase where you can gather more intel.',
    });
  };

  const handleDecline = () => {
    setCurrentScenarioId(null);
    setCaseAccepted(false);
    setPhase('dashboard');
    toast('Case declined', {
      description: 'You chose not to take this case.',
    });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="sm" onClick={() => setPhase('dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Badge variant="outline" className={CATEGORY_COLORS[scenario.category]}>
            {CATEGORY_LABELS[scenario.category]}
          </Badge>
        </motion.div>

        {/* Client Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{client.avatar}</div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{scenario.title}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{scenario.subtitle}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-medium">{briefing.clientName}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{briefing.clientRole}</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">Tier {scenario.tier}</Badge>
                  <span className="text-xs text-muted-foreground">Fee: €{scenario.fee.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Case Briefing Sections */}
        <ScrollArea className="max-h-[calc(100vh-320px)]">
          <div className="space-y-4 pr-2">
            {/* Situation */}
            <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    Situation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{briefing.situation}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Client Demands */}
            <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-400" />
                    Client Demands
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {briefing.clientDemands.map((demand, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{demand}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Known Facts */}
            <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Known Facts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {briefing.knownFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Missing Information */}
            <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-violet-400" />
                    Missing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {briefing.missingInformation.map((info, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <HelpCircle className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Time Pressure & Stakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      Time Pressure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <p className="text-sm text-muted-foreground">{briefing.timePressure}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      What&apos;s at Stake
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{briefing.stakes}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Client Emotional State */}
            <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-400" />
                    Client Emotional State
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{briefing.clientEmotionalState}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Counterparty Info */}
            <motion.div custom={7} variants={sectionVariants} initial="hidden" animate="visible">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-cyan-400" />
                    Counterparty
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{counterparty.avatar}</span>
                    <div>
                      <p className="text-sm font-medium">{counterparty.name}</p>
                      <p className="text-xs text-muted-foreground">{counterparty.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ScrollArea>

        <Separator />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={handleAccept}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2"
            size="lg"
          >
            <CheckCircle2 className="h-5 w-5" />
            Accept Case
          </Button>
          <Button
            variant="outline"
            onClick={handleRequestMoreInfo}
            className="flex-1 gap-2"
            size="lg"
          >
            <HelpCircle className="h-5 w-5" />
            Request More Info
          </Button>
          <Button
            variant="ghost"
            onClick={handleDecline}
            className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
            size="lg"
          >
            Decline Case
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
