import speciesData from './species.json' assert { type: 'json' };
import type { Species } from '../types';

interface ScrapedSpecies {
  name: string;
  source?: string;
  creatureType?: string;
  size?: string;
  speed?: number;
  traits?: Array<{name: string, description: string}>;
  description?: string;
}

interface SpeciesData {
  name: string;
  description: string;
  source?: string;
  creatureType?: string;
  size: string;
  speed: number;
  traits: Array<{name: string, description: string}>;
}

const species = speciesData as unknown as ScrapedSpecies[];

export const SPECIES: Record<Species, SpeciesData> = species.reduce((acc, sp) => {
  // Convert friendly name to slug (e.g., "Aasimar" -> "aasimar", "Lorwyn Changeling" -> "lorwyn-changeling")
  const key = (sp.name.toLowerCase().replace(/\s+/g, '-') as string) as Species;
  
  acc[key] = {
    name: sp.name,
    description: sp.description || '',
    source: sp.source,
    creatureType: sp.creatureType,
    size: sp.size || 'Medium',
    speed: sp.speed || 30,
    traits: sp.traits || []
  };
  return acc;
}, {} as Record<Species, SpeciesData>);
