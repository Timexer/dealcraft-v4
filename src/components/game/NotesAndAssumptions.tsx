'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Target, Plus, Trash2 } from 'lucide-react';

export function NotesAndAssumptions() {
  const { caseNotes, setCaseNotes, assumptions, addAssumption, removeAssumption } = useGameStore();
  const [newAssumption, setNewAssumption] = useState('');

  return (
    <Accordion type="multiple" defaultValue={['notes', 'assumptions']} className="w-full">
      <AccordionItem value="notes" className="border-border/30">
        <AccordionTrigger className="hover:no-underline py-3 px-1 text-sm font-semibold text-amber-500">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Case Notepad
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-3 px-1">
          <Textarea
            placeholder="Jot down facts, thoughts, or ideas about the case here..."
            value={caseNotes}
            onChange={(e) => setCaseNotes(e.target.value)}
            className="min-h-[150px] resize-y bg-background/50 border-amber-500/20 focus-visible:ring-amber-500 text-sm"
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="assumptions" className="border-border/30">
        <AccordionTrigger className="hover:no-underline py-3 px-1 text-sm font-semibold text-amber-500">
          <div className="flex items-center justify-between w-full pr-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Your Assumptions
            </div>
            {assumptions.length > 0 && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 text-[10px] px-1.5 py-0 h-4">
                {assumptions.length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-3 px-1 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. They have a strict deadline"
              value={newAssumption}
              onChange={(e) => setNewAssumption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newAssumption.trim()) {
                  addAssumption(newAssumption.trim());
                  setNewAssumption('');
                }
              }}
              className="bg-background/50 border-amber-500/20 text-xs h-8"
            />
            <Button 
              size="sm"
              onClick={() => {
                if (newAssumption.trim()) {
                  addAssumption(newAssumption.trim());
                  setNewAssumption('');
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {assumptions.map((assumption, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card/50 border border-border/50 group">
                <div className="h-5 w-5 mt-0.5 shrink-0 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-medium">
                  {i + 1}
                </div>
                <p className="text-xs flex-1 leading-relaxed text-foreground/90">{assumption}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 shrink-0"
                  onClick={() => removeAssumption(i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {assumptions.length === 0 && (
              <div className="text-center p-4 border border-dashed border-border/50 rounded-lg text-muted-foreground">
                <p className="text-xs">No assumptions recorded.</p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
