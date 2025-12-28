
export type ZodiacSign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' 
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type AstrologicalAspect = 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile' | 'Quincunx' | 'Semisextile';

export interface Profile {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  zodiacSign: ZodiacSign;
}

export interface SignData {
  id: ZodiacSign;
  nameTr: string;
  dateRange: string;
  element: 'Ateş' | 'Toprak' | 'Hava' | 'Su';
  planet: string;
  traits: string[];
  symbol: string;
}

export interface NatalPlacement {
  planet: string;
  sign: string;
  signSymbol: string;
  element: string;
  modality: 'Öncü' | 'Sabit' | 'Değişken';
  meaning: string;
}

export interface NatalChart {
  placements: NatalPlacement[];
}

export interface SynastryAspectInfo {
  type: AstrologicalAspect;
  planet1: string;
  planet2: string;
  planet1Element: string;
  planet1Modality: string;
  planet2Element: string;
  planet2Modality: string;
  interpretation: string;
}

export interface HoroscopeReading {
  sign: string;
  date: string;
  general: string;
  love: string;
  career: string;
  health: string;
  luckyNumbers: number[];
  luckyColor: string;
}

export interface CompatibilityReading {
  sign1: string;
  sign2: string;
  score: number;
  summary: string;
  advice: string;
  chart1?: NatalChart;
  chart2?: NatalChart;
  aspects?: SynastryAspectInfo[];
  chartSummary1?: string;
  chartSummary2?: string;
}
