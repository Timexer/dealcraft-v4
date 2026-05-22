'use client';

import { useState } from 'react';
import type { Scenario } from '@/data/scenarios/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import { getDifficultyLabel, getDifficultyColor } from '@/lib/game-engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, ChevronRight, Search, Filter, X, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CaseGridProps {
  availableCases: Scenario[];
  onSelectCase: (scenarioId: string) => void;
}

export function CaseGrid({ availableCases, onSelectCase }: CaseGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filtered cases based on search and category
  const filteredCases = availableCases.filter(s => {
    const matchesSearch = !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from available cases
  const availableCategories = [...new Set(availableCases.map(s => s.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Available Cases
          <span className="ml-1 text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            {filteredCases.length} of {availableCases.length} available
          </span>
        </h2>
      </div>

      {/* Search & Filter Bar with focus glow */}
      {availableCases.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 search-focus-glow rounded-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases by title, subtitle, or client..."
              className="pl-9 bg-card/50 border-border/50 h-9 text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {availableCategories.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <button
                onClick={() => setFilterCategory('all')}
                className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
                  filterCategory === 'all'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-card/50 text-muted-foreground border-border/30 hover:border-amber-500/20'
                }`}
              >
                All
              </button>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
                    filterCategory === cat
                      ? CATEGORY_COLORS[cat]
                      : 'bg-card/50 text-muted-foreground border-border/30 hover:border-amber-500/20'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((scenario, i) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="game-card card-hover-lift cursor-pointer group hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200"
              onClick={() => onSelectCase(scenario.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{scenario.client.avatar}</span>
                    <div>
                      <CardTitle className="text-base leading-tight group-hover:text-amber-500 transition-colors duration-200">{scenario.title}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{scenario.subtitle}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[11px] px-2 py-0 ${CATEGORY_COLORS[scenario.category]}`}>
                    {CATEGORY_LABELS[scenario.category]}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] px-2 py-0">
                    Tier {scenario.tier}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <span className={`text-[11px] font-medium ${getDifficultyColor(getDifficultyLabel(scenario.difficulty))}`}>
                      {getDifficultyLabel(scenario.difficulty)}
                    </span>
                    <div className="flex items-center">
                      {(() => {
                        const avgDifficulty = (
                          scenario.difficulty.economicComplexity +
                          scenario.difficulty.emotionalComplexity +
                          scenario.difficulty.ethicalComplexity +
                          scenario.difficulty.informationAsymmetry +
                          scenario.difficulty.powerImbalance +
                          scenario.difficulty.timePressure +
                          scenario.difficulty.relationshipStakes
                        ) / 7;
                        const starRating = Math.round(avgDifficulty);
                        return Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`h-3 w-3 ${starIdx < starRating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
                          />
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {scenario.stakesLabel && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Stakes: {scenario.stakesLabel}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Fee: €{scenario.fee.toLocaleString()}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCases.length === 0 && availableCases.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No cases match your search. Try a different query or category.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {availableCases.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No new cases available. Complete career progression to unlock more, or replay completed cases!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
