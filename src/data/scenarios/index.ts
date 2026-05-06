import { Scenario } from './types';
import { case01 } from './case-01';
import { case02 } from './case-02';
import { case03 } from './case-03';
import { case04 } from './case-04';
import { case05 } from './case-05';
import { case06 } from './case-06';
import { case07 } from './case-07';
import { case08 } from './case-08';
import { case09 } from './case-09';
import { case10 } from './case-10';
import { case11 } from './case-11';
import { case12 } from './case-12';
import { case13 } from './case-13';
import { case14 } from './case-14';
import { case15 } from './case-15';
import { case16 } from './case-16';
import { case17 } from './case-17';
import { case18 } from './case-18';
import { case19 } from './case-19';
import { case20 } from './case-20';
import { case21 } from './case-21';
import { case22 } from './case-22';
import { case23 } from './case-23';
import { case24 } from './case-24';
import { case25 } from './case-25';
import { case26 } from './case-26';
import { case27 } from './case-27';
import { case28 } from './case-28';
import { case29 } from './case-29';
import { case30 } from './case-30';

// All cases 01-30 are imported from their own files with rich dialogue trees

export const allScenarios: Scenario[] = [
  case01, case02, case03, case04, case05,
  case06, case07, case08, case09, case10,
  case11, case12, case13, case14, case15,
  case16, case17, case18, case19, case20,
  case21, case22, case23, case24, case25,
  case26, case27, case28, case29, case30,
];

export function getScenarioById(id: string): Scenario | undefined {
  return allScenarios.find(s => s.id === id);
}

export function getScenariosByTier(tier: number): Scenario[] {
  return allScenarios.filter(s => s.tier === tier);
}

export function getScenariosByCategory(category: string): Scenario[] {
  return allScenarios.filter(s => s.category === category);
}
