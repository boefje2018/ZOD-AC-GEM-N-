
import React, { useState, useEffect, useMemo } from 'react';
import { ZODIAC_SIGNS } from '../constants';
import { getCompatibility } from '../services/geminiService';
import { CompatibilityReading, ZodiacSign, AstrologicalAspect, NatalChart, NatalPlacement, Profile, SynastryAspectInfo } from '../types';
import { getSignFromDate } from '../utils/zodiacUtils';
import Tooltip from './Tooltip';

type IconTheme = 'klasik' | 'kozmik' | 'mistik' | 'modern';

interface AspectInfo {
  id: AstrologicalAspect;
  nameTr: string;
  icon: string;
  description: string;
  detailedMeaning: string;
  impact: string;
  color: string;
  shadow: string;
}

const ASPECTS: AspectInfo[] = [
  { 
    id: 'Conjunction', 
    nameTr: 'Kavuşum', 
    icon: '✨',
    description: 'Enerjilerin birleşmesi.',
    detailedMeaning: '0° açı.',
    impact: 'Güçlü özdeşleşme.',
    color: 'from-amber-200 via-orange-400 to-red-500',
    shadow: 'shadow-orange-500/40'
  },
  { 
    id: 'Opposition', 
    nameTr: 'Karşıtlık', 
    icon: '🌓',
    description: 'Gerilim veya denge.',
    detailedMeaning: '180° açı.',
    impact: 'Ayna etkisi.',
    color: 'from-blue-600 via-indigo-600 to-violet-800',
    shadow: 'shadow-indigo-500/40'
  },
  { 
    id: 'Trine', 
    nameTr: 'Üçgen', 
    icon: '🔺',
    description: 'Uyumlu akış.',
    detailedMeaning: '120° açı.',
    impact: 'Doğal yetenek.',
    color: 'from-emerald-300 via-teal-400 to-cyan-500',
    shadow: 'shadow-emerald-500/40'
  },
  { 
    id: 'Square', 
    nameTr: 'Kare', 
    icon: '⏹️',
    description: 'Zorlayıcı dinamizm.',
    detailedMeaning: '90° açı.',
    impact: 'Gelişim krizi.',
    color: 'from-rose-500 via-red-600 to-orange-700',
    shadow: 'shadow-red-500/40'
  },
  { 
    id: 'Sextile', 
    nameTr: 'Sekstil', 
    icon: '✳️',
    description: 'Fırsat ve iletişim.',
    detailedMeaning: '60° açı.',
    impact: 'Yaratıcılık.',
    color: 'from-sky-300 via-blue-400 to-indigo-500',
    shadow: 'shadow-sky-500/40'
  },
  { 
    id: 'Quincunx', 
    nameTr: 'Quincunx', 
    icon: '⚗️',
    description: 'Uyumsuz enerjiler.',
    detailedMeaning: '150° açı.',
    impact: 'Adaptasyon.',
    color: 'from-fuchsia-400 via-purple-500 to-indigo-600',
    shadow: 'shadow-purple-500/40'
  },
  { 
    id: 'Semisextile', 
    nameTr: 'Yarım Sekstil', 
    icon: '⊻',
    description: 'Hafif gelişim.',
    detailedMeaning: '30° açı.',
    impact: 'Farkındalık.',
    color: 'from-slate-400 via-gray-500 to-slate-600',
    shadow: 'shadow-slate-500/30'
  }
];

const ELEMENT_STYLES: Record<string, any> = {
  'Ateş': { color: 'text-orange-400', border: 'border-orange-500/40', bg: 'bg-orange-500/15', glow: 'shadow-[0_0_35px_rgba(249,115,22,0.6)]', icon: '🔥' },
  'Toprak': { color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/15', glow: 'shadow-[0_0_35px_rgba(16,185,129,0.6)]', icon: '🌿' },
  'Hava': { color: 'text-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-500/15', glow: 'shadow-[0_0_35px_rgba(14,165,233,0.6)]', icon: '💨' },
  'Su': { color: 'text-indigo-400', border: 'border-indigo-500/40', bg: 'bg-indigo-500/15', glow: 'shadow-[0_0_35px_rgba(99,102,241,0.6)]', icon: '💧' }
};

const MODALITY_STYLES: Record<string, any> = {
  'Öncü': { color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_25px_rgba(251,191,36,0.4)]', icon: '⚡' },
  'Sabit': { color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]', icon: '💎' },
  'Değişken': { color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', glow: 'shadow-[0_0_25px_rgba(99,102,241,0.4)]', icon: '🌊' }
};

const THEMES: Record<IconTheme, Record<string, string>> = {
  klasik: {
    'Güneş': '☀️', 'Ay': '🌙', 'Merkür': '☿', 'Venüs': '♀', 'Mars': '♂', 
    'Jüpiter': '♃', 'Satürn': '♄', 'Uranüs': '♅', 'Neptün': '♆', 'Plüton': '♇',
    'Yükselen': '🌅', 'Ascendant': '🌅', 'Tepe Noktası': '🏔️', 'Midheaven': '🏔️', 'MC': '🏔️',
    'Kuzey Ay Düğümü': '☊', 'Güney Ay Düğümü': '☋'
  },
  kozmik: {
    'Güneş': '🌞', 'Ay': '🌛', 'Merkür': '☄️', 'Venüs': '💖', 'Mars': '🛡️', 
    'Jüpiter': '🎡', 'Satürn': '🪐', 'Uranüs': '🌩️', 'Neptün': '🔱', 'Plüton': '🌑',
    'Yükselen': '🌤️', 'Ascendant': '🌤️', 'Tepe Noktası': '🌋', 'Midheaven': '🌋', 'MC': '🌋',
    'Kuzey Ay Düğümü': '🧭', 'Güney Ay Düğümü': '⚓'
  },
  mistik: {
    'Güneş': '🕯️', 'Ay': '🔮', 'Merkür': '📜', 'Venüs': '💠', 'Mars': '⚔️', 
    'Jüpiter': '🏆', 'Satürn': '🗝️', 'Uranüs': '🌀', 'Neptün': '🌊', 'Plüton': '💀',
    'Yükselen': '👁️', 'Ascendant': '👁️', 'Tepe Noktası': '🏛️', 'Midheaven': '🏛️', 'MC': '🏛️',
    'Kuzey Ay Düğümü': '🏹', 'Güney Ay Düğümü': '🏺'
  },
  modern: {
    'Güneş': '🟡', 'Ay': '⚪', 'Merkür': '🟣', 'Venüs': '🟢', 'Mars': '🔴', 
    'Jüpiter': '🟠', 'Satürn': '🟤', 'Uranüs': '🔵', 'Neptün': '🔷', 'Plüton': '🖤',
    'Yükselen': '🔺', 'Ascendant': '🔺', 'Tepe Noktası': '🔝', 'Midheaven': '🔝', 'MC': '🔝',
    'Kuzey Ay Düğümü': '♾️', 'Güney Ay Düğümü': '🌀'
  }
};

const BadgeIndicator = ({ icon, label, style, size = "w-12 h-12" }: { icon: string, label: string, style: any, size?: string }) => (
  <Tooltip text={label}>
    <div className={`flex items-center justify-center ${size} rounded-[1.5rem] border-2 ${style.border || 'border-white/10'} ${style.bg || 'bg-white/5'} ${style.color || 'text-white'} ${style.glow || ''} transition-all duration-500 hover:scale-115 hover:rotate-3 hover:border-white/60 shadow-2xl cursor-help group/badge relative overflow-hidden active:scale-95`}>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300"></div>
      <span className="text-4xl relative z-10 transition-transform duration-500 group-hover/badge:scale-125 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">{icon}</span>
    </div>
  </Tooltip>
);

const PlacementCard = ({ p, planetIcons }: { p: NatalPlacement, planetIcons: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const eStyle = ELEMENT_STYLES[p.element] || { color: 'text-slate-400', icon: '✨', bg: 'bg-white/5' };
  const mStyle = MODALITY_STYLES[p.modality] || { color: 'text-slate-500', icon: '💠' };

  return (
    <div className={`group relative bg-white/5 rounded-3xl border transition-all duration-500 overflow-hidden ${isOpen ? 'border-purple-500/40 bg-white/10 ring-1 ring-purple-500/20' : 'border-white/5 hover:border-purple-500/30 hover:bg-white/10'}`}>
      <div className="w-full flex items-center justify-between p-6">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-5 text-left focus:outline-none group/header"
        >
          <Tooltip text={`✨ Kozmik İpucu ✨\n\n${p.meaning}`}>
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl ${eStyle.glow} transition-all duration-500 group-hover:scale-105 ${isOpen ? 'rotate-3 scale-110' : ''}`}>
                 {planetIcons[p.planet] || '🪐'}
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1 group-hover/header:text-purple-400 transition-colors">
                  {p.planet} Glifi
                </span>
                <span className="text-white font-bold text-xl flex items-center gap-2">
                  {p.signSymbol} {p.sign}
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ml-1 ${isOpen ? 'bg-purple-500 text-white rotate-180' : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'}`}>
                    <span className="text-[10px] font-bold">{isOpen ? '−' : '＋'}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold ml-1 opacity-50 group-hover/header:opacity-100 transition-opacity">ⓘ</span>
                </span>
              </div>
            </div>
          </Tooltip>
        </button>

        <div className="flex gap-5 items-center" onClick={(e) => e.stopPropagation()}>
          <BadgeIndicator icon={eStyle.icon} label={`${p.element} Elementi`} style={eStyle} size="w-16 h-16" />
          <BadgeIndicator icon={mStyle.icon} label={`${p.modality} Nitelik`} style={mStyle} size="w-16 h-16" />
        </div>
      </div>
      
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-8 pb-8 pt-2">
            <div className="p-6 bg-purple-500/5 rounded-2xl border border-purple-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-4xl">✨</div>
              <h6 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="text-sm">🔮</span> Sembolizm & Burç Bağlantısı
              </h6>
              <p className="text-sm text-slate-300 leading-relaxed font-light italic whitespace-pre-line">
                {p.meaning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompatibilityTool: React.FC = () => {
  const [date1, setDate1] = useState('');
  const [time1, setTime1] = useState('');
  const [date2, setDate2] = useState('');
  const [time2, setTime2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityReading | null>(null);
  const [errors, setErrors] = useState<{ date1?: string; date2?: string }>({});
  const [copiedChartId, setCopiedChartId] = useState<string | null>(null);
  const [isCopyingFull, setIsCopyingFull] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<IconTheme>('klasik');

  const planetIcons = THEMES[currentTheme];

  const sign1 = useMemo(() => getSignFromDate(date1), [date1]);
  const sign2 = useMemo(() => getSignFromDate(date2), [date2]);

  const calculateDominants = (placements: NatalPlacement[]) => {
    const elements: Record<string, number> = {};
    const modalities: Record<string, number> = {};
    placements.forEach(p => {
      elements[p.element] = (elements[p.element] || 0) + 1;
      modalities[p.modality] = (modalities[p.modality] || 0) + 1;
    });
    return { elements, modalities };
  };

  const handleCalculate = async () => {
    if (!date1 || !date2) {
      setErrors({ date1: !date1 ? "Gerekli" : "", date2: !date2 ? "Gerekli" : "" });
      return;
    }
    setLoading(true);
    try {
      const data = await getCompatibility(sign1 || 'Aries', date1, sign2 || 'Leo', date2, [], time1, time2);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShareChart = async (chart: NatalChart, ownerName: string, id: string, summary?: string) => {
    const doms = calculateDominants(chart.placements);
    const sortedElements = Object.entries(doms.elements).sort((a,b) => b[1] - a[1]);
    const topElement = sortedElements[0];
    
    const placementsText = chart.placements.map(p => 
      `│ ${planetIcons[p.planet] || '🪐'} ${p.planet.padEnd(10)}: ${p.signSymbol} ${p.sign}`
    ).join('\n');
    
    const text = `┌──── ✨ KOZMİK KİMLİK ✨ ────┐\n` +
                 `  👤 Sahibi: ${ownerName}\n` +
                 `  🌟 Hakim Element: ${topElement ? topElement[0] : 'Belirsiz'}\n` +
                 `├──────────────────────────────┤\n` +
                 `  📝 Özet:\n  "${summary || 'Kozmik analiz verisi bulunamadı.'}"\n` +
                 `├──────────────────────────────┤\n` +
                 `${placementsText}\n` +
                 `├──────────────────────────────┤\n` +
                 `  🌌 @ZodiacGemini AI Analizi\n` +
                 `└──────────────────────────────┘`;
                 
    try {
      await navigator.clipboard.writeText(text);
      setCopiedChartId(id);
      setTimeout(() => setCopiedChartId(null), 2000);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  const handleShareFullCompatibility = async () => {
    if (!result) return;
    setIsCopyingFull(true);
    
    const text = `💖 KOZMİK UYUM RAPORU 💖\n\n` +
                 `👥 ${result.sign1} x ${result.sign2}\n` +
                 `📊 Uyum Skoru: %${result.score}\n\n` +
                 `✨ Özet: "${result.summary}"\n\n` +
                 `🔮 Tavsiye: ${result.advice}\n\n` +
                 `🌌 Zodiac Gemini - Yıldızların Rehberliği`;
                 
    try {
      await navigator.clipboard.writeText(text);
      setTimeout(() => setIsCopyingFull(false), 2000);
    } catch (err) {
      setIsCopyingFull(false);
    }
  };

  const ThemePicker = () => (
    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 mb-12 animate-fadeIn max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 justify-center">
        <span className="text-xl">🎨</span>
        <h6 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Kozmik İkon Teması</h6>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(Object.keys(THEMES) as IconTheme[]).map((theme) => (
          <button
            key={theme}
            onClick={() => setCurrentTheme(theme)}
            className={`group relative p-4 rounded-3xl border transition-all duration-300 ${
              currentTheme === theme 
                ? 'bg-purple-600/20 border-purple-500/50 ring-2 ring-purple-500/20' 
                : 'bg-white/5 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`text-3xl transition-transform group-hover:scale-110 ${currentTheme === theme ? 'scale-125 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'opacity-60'}`}>
                {THEMES[theme]['Güneş']}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${currentTheme === theme ? 'text-purple-300' : 'text-slate-500'}`}>
                {theme}
              </span>
            </div>
            {currentTheme === theme && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-[#030712] flex items-center justify-center">
                <span className="text-[8px]">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
      
      <p className="text-[10px] text-slate-500 mt-6 text-center italic tracking-wide">
        Haritadaki tüm gezegen sembolleri seçilen temaya göre anında güncellenir.
      </p>
    </div>
  );

  const NatalChartDisplay = ({ chart, ownerName, chartId, summary }: { chart: NatalChart, ownerName: string, chartId: string, summary?: string }) => {
    const dominants = useMemo(() => calculateDominants(chart.placements), [chart]);

    return (
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-left h-full flex flex-col backdrop-blur-sm">
        <div className="flex justify-between items-start mb-8">
          <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="text-xl">🗺️</span> {ownerName} - Kozmik Harita
          </h5>
          <button 
            onClick={() => handleShareChart(chart, ownerName, chartId, summary)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
              copiedChartId === chartId 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
            }`}
          >
            {copiedChartId === chartId ? '✓ Kopyalandı' : (
              <><span className="text-sm">📤</span> Haritayı Paylaş</>
            )}
          </button>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/10 rounded-3xl p-6 mb-10 group hover:bg-purple-500/10 transition-all">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-xl">⚖️</span>
             <h6 className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Kozmik Karakter Özeti</h6>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-light italic mb-6">
            {summary || "Harita verileri analiz ediliyor..."}
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
             <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Element Dengesi</span>
                <div className="flex flex-wrap gap-2">
                   {Object.entries(dominants.elements).map(([el, count]) => (
                      <div key={el} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 ${ELEMENT_STYLES[el]?.color}`}>
                         <span className="text-xs">{ELEMENT_STYLES[el]?.icon}</span>
                         <span className="text-[10px] font-bold">{count}</span>
                      </div>
                   ))}
                </div>
             </div>
             <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nitelik Dengesi</span>
                <div className="flex flex-wrap gap-2">
                   {Object.entries(dominants.modalities).map(([mod, count]) => (
                      <div key={mod} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 ${MODALITY_STYLES[mod]?.color}`}>
                         <span className="text-xs">{MODALITY_STYLES[mod]?.icon}</span>
                         <span className="text-[10px] font-bold">{count}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 flex-1">
          {chart.placements.map((p, idx) => (
            <PlacementCard key={idx} p={p} planetIcons={planetIcons} />
          ))}
        </div>
      </div>
    );
  };

  const SynastryConnections = ({ aspects }: { aspects: SynastryAspectInfo[] }) => (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-left mt-14 mb-14 relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-9xl">⚛️</div>
      <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
        <span className="text-xl">💫</span> Astrolojik Açı Bağlantıları
      </h5>
      <div className="space-y-8">
        {aspects.map((asp, idx) => {
          const aspectData = ASPECTS.find(a => a.id === asp.type) || ASPECTS[0];
          const p1E = ELEMENT_STYLES[asp.planet1Element] || { icon: '?', bg: 'bg-white/5', color: 'text-white/20' };
          const p1M = MODALITY_STYLES[asp.planet1Modality] || { icon: '?', bg: 'bg-white/5', color: 'text-white/20' };
          const p2E = ELEMENT_STYLES[asp.planet2Element] || { icon: '?', bg: 'bg-white/5', color: 'text-white/20' };
          const p2M = MODALITY_STYLES[asp.planet2Modality] || { icon: '?', bg: 'bg-white/5', color: 'text-white/20' };

          return (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-all group border-l-4 border-l-purple-500/20">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className="flex items-center gap-6 w-full lg:w-3/5">
                   <div className="flex flex-col items-center gap-3 min-w-[100px]">
                     <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-all duration-500">
                       {planetIcons[asp.planet1] || '🪐'}
                     </div>
                     <span className="text-[11px] font-black text-white uppercase tracking-widest text-center">{asp.planet1}</span>
                     <div className="flex gap-2">
                        <BadgeIndicator icon={p1E.icon} label={`${asp.planet1Element} Elementi`} style={p1E} size="w-14 h-14" />
                        <BadgeIndicator icon={p1M.icon} label={`${asp.planet1Modality} Nitelik`} style={p1M} size="w-14 h-14" />
                     </div>
                   </div>

                   <div className="flex-1 flex items-center justify-center relative">
                     <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                     <Tooltip text={aspectData.description}>
                       <div className={`absolute w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${aspectData.color} shadow-[0_0_30px_rgba(255,255,255,0.1)] ${aspectData.shadow} text-white text-2xl z-10 hover:scale-125 transition-all cursor-help border-2 border-white/20`}>
                         {aspectData.icon}
                       </div>
                     </Tooltip>
                   </div>

                   <div className="flex flex-col items-center gap-3 min-w-[100px]">
                     <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-all duration-500">
                       {planetIcons[asp.planet2] || '🪐'}
                     </div>
                     <span className="text-[11px] font-black text-white uppercase tracking-widest text-center">{asp.planet2}</span>
                     <div className="flex gap-2">
                        <BadgeIndicator icon={p2E.icon} label={`${asp.planet2Element} Elementi`} style={p2E} size="w-14 h-14" />
                        <BadgeIndicator icon={p2M.icon} label={`${asp.planet2Modality} Nitelik`} style={p2M} size="w-14 h-14" />
                     </div>
                   </div>
                </div>

                <div className="w-full lg:w-2/5 bg-white/5 p-8 rounded-3xl border border-white/5 group-hover:border-purple-500/20 transition-all relative">
                   <div className="flex justify-between items-center mb-4">
                     <h6 className="text-[12px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                       <span className="opacity-50">{aspectData.icon}</span> {aspectData.nameTr} Etkisi
                     </h6>
                     <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-slate-500 font-bold tracking-tighter uppercase">{asp.type}</span>
                   </div>
                   
                   <div className="mb-6">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 opacity-60">Etkileşimdeki Enerjiler</span>
                      <div className="flex items-center gap-3 py-3 border-y border-white/5">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{asp.planet1}</span>
                          <div className="flex -space-x-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 border-white/10 ${p1E.bg} ${p1E.color} shadow-lg transition-transform hover:scale-110 hover:z-10`}>{p1E.icon}</div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 border-white/10 ${p1M.bg} ${p1M.color} shadow-lg transition-transform hover:scale-110 hover:z-10`}>{p1M.icon}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <span className="text-white/20 text-xs font-bold px-2">×</span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{asp.planet2}</span>
                          <div className="flex -space-x-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 border-white/10 ${p2E.bg} ${p2E.color} shadow-lg transition-transform hover:scale-110 hover:z-10`}>{p2E.icon}</div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 border-white/10 ${p2M.bg} ${p2M.color} shadow-lg transition-transform hover:scale-110 hover:z-10`}>{p2M.icon}</div>
                          </div>
                        </div>
                      </div>
                   </div>

                   <p className="text-sm text-slate-300 leading-relaxed font-light italic">
                     "{asp.interpretation}"
                   </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-[4rem] p-8 md:p-16 mt-12 w-full shadow-2xl backdrop-blur-lg relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/10 blur-[120px] rounded-full"></div>
      
      <div className="text-center mb-16 relative z-10">
        <h3 className="text-5xl font-cinzel font-bold text-white mb-4 tracking-tight">Yıldızların Sinerjisi 💖</h3>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed font-light">
          Gezegenlerin elementel doğasını ve aralarındaki kadim açıları keşfederek ilişkinizin kozmik haritasını çıkarın.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-10 mb-16 relative z-10">
        <div className="flex-1 w-full space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">SİZİN DOĞUM TARİHİNİZ</label>
          <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 [color-scheme:dark] transition-all" />
        </div>
        <div className="text-5xl text-purple-500/50 animate-pulse font-cinzel hidden md:block">✧</div>
        <div className="flex-1 w-full space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">PARTNERİN DOĞUM TARİHİ</label>
          <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark] transition-all" />
        </div>
      </div>

      <div className="flex justify-center mb-20">
        <button onClick={handleCalculate} disabled={loading} className="group relative px-24 py-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-[3rem] uppercase tracking-[0.4em] text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
          <span className="relative z-10">{loading ? 'Kozmik Veriler İşleniyor...' : 'Analizi Başlat'}</span>
          <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]"></div>
        </button>
      </div>

      {result && !loading && (
        <div className="mt-20 animate-fadeIn">
          <div className="text-center mb-16">
            <div className="inline-block relative mb-8">
              <span className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10 leading-none">
                {result.score}
                <span className="text-6xl text-purple-500">%</span>
              </span>
              <div className="absolute inset-0 bg-purple-500/20 blur-[100px] -z-10 rounded-full animate-pulse"></div>
            </div>
            <p className="text-3xl font-cinzel text-indigo-100 max-w-4xl mx-auto italic leading-relaxed px-4 mb-8">
              "{result.summary}"
            </p>
            
            <ThemePicker />
          </div>

          {result.aspects && result.aspects.length > 0 && <SynastryConnections aspects={result.aspects} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {result.chart1 && <NatalChartDisplay chart={result.chart1} ownerName="Sizin" chartId="chart1" summary={result.chartSummary1} />}
            {result.chart2 && <NatalChartDisplay chart={result.chart2} ownerName="Partnerinizin" chartId="chart2" summary={result.chartSummary2} />}
          </div>
          
          <div className="mt-16 p-16 bg-white/5 rounded-[4rem] border border-white/10 text-left italic text-indigo-100 text-2xl leading-relaxed shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform"></div>
            <span className="text-5xl block mb-8 opacity-50">🔮</span>
            <p className="mb-10">{result.advice}</p>
            
            <button 
              onClick={handleShareFullCompatibility}
              className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm transition-all flex items-center justify-center gap-3 border ${
                isCopyingFull 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                  : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/40'
              }`}
            >
              {isCopyingFull ? '✓ Tüm Sonuç Kopyalandı' : (
                <><span className="text-xl">📤</span> Tüm Analizi Paylaş</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompatibilityTool;
