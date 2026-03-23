import backgroundsData from './backgrounds.json' assert { type: 'json' };
import type { Background, BackgroundData } from '../types';

interface ScrapedBackground {
  name: string;
  description?: string;
  source?: string;
  abilityScores?: string[];
  feat?: string;
  skillProficiencies?: string[];
  toolProficiency?: string[];
  equipment?: string;
}

function formatEquipment(equipmentText: string): string[] {
  if (!equipmentText) return [];
  
  const aMatch = equipmentText.match(/\(A\)\s*([^;]+);/i);
  const bMatch = equipmentText.match(/\(B\)\s*([^;\n]+)/i);
  
  if (aMatch && bMatch) {
    return [
      `Choose A or B: (A) ${aMatch[1].trim()}; or (B) ${bMatch[1].trim()}`
    ];
  } else if (aMatch) {
    return [`(A) ${aMatch[1].trim()}`];
  } else if (bMatch) {
    return [`(B) ${bMatch[1].trim()}`];
  }
  
  return [equipmentText];
}

const backgrounds = backgroundsData as unknown as ScrapedBackground[];

export const BACKGROUNDS: Record<Background, BackgroundData> = backgrounds.reduce((acc, bg) => {
  const key = (bg.name.toLowerCase().replace(/\s+/g, '_') as string) as Background;
  
  acc[key] = {
    name: bg.name,
    description: bg.description || '',
    source: bg.source,
    abilityScores: bg.abilityScores || [],
    feat: bg.feat,
    skillProficiencies: bg.skillProficiencies || [],
    toolProficiencies: bg.toolProficiency,
    equipment: formatEquipment(bg.equipment || ''),
    feature: { name: '', description: '' },
    suggestedCharacteristics: {
      personalityTraits: [],
      ideals: [],
      bonds: [],
      flaws: []
    }
  };
  return acc;
}, {} as Record<Background, BackgroundData>);
