
import React, { useEffect, useState } from 'react';
import { SignData, HoroscopeReading } from '../types';
import { getDailyHoroscope, generateCosmicImage } from '../services/geminiService';

interface ReadingViewProps {
  sign: SignData;
  onBack: () => void;
}

const ReadingView: React.FC<ReadingViewProps> = ({ sign, onBack }) => {
  const [reading, setReading] = useState<HoroscopeReading | null>(null);
  const [cosmicImage, setCosmicImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReading = async () => {
      try {
        setLoading(true);
        const data = await getDailyHoroscope(sign.id, new Date().toLocaleDateString('tr-TR'));
        setReading(data);
      } catch (err) {
        setError("Gökyüzü şu an biraz bulutlu, daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };
    fetchReading();
  }, [sign]);

  const handleGenerateImage = async () => {
    if (!reading) return;
    try {
      setImageLoading(true);
      const img = await generateCosmicImage(sign.nameTr, reading.general.substring(0, 100), reading.luckyColor);
      setCosmicImage(img);
    } catch (err) {
      console.error("Görsel üretilemedi", err);
    } finally {
      setImageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-cinzel text-purple-300 animate-pulse">Kozmik Veriler Alınıyor...</h2>
        <p className="text-slate-400 mt-2 italic">Gemini o anki gezegen konumlarını Google üzerinde kontrol ediyor.</p>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={onBack} className="bg-white/10 px-6 py-2 rounded-full hover:bg-white/20 transition-colors">Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 flex flex-col items-center sticky top-8">
            <div className="text-8xl mb-4 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">{sign.symbol}</div>
            <h2 className="text-4xl font-cinzel font-bold text-white mb-2">{sign.nameTr}</h2>
            <p className="text-purple-400 mb-6 font-bold uppercase tracking-widest text-xs">{sign.dateRange}</p>
            
            <div className="w-full space-y-4 text-sm mb-8">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Element</span>
                <span className="text-white font-medium">{sign.element}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Yönetici</span>
                <span className="text-white font-medium">{sign.planet}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Günün Rengi</span>
                <span className="text-white font-medium">{reading.luckyColor}</span>
              </div>
            </div>

            {cosmicImage ? (
              <div className="w-full animate-fadeIn">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center mb-2">Manifestasyon Kartın</p>
                <img src={cosmicImage} alt="Cosmic Energy" className="w-full aspect-square rounded-2xl border border-purple-500/30 shadow-2xl" />
              </div>
            ) : (
              <button 
                onClick={handleGenerateImage}
                disabled={imageLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50"
              >
                {imageLoading ? 'Hizalanıyor...' : 'Görsel Enerji Üret'}
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="p-1 px-4 inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
            ✓ Google Arama ile Doğrulandı
          </div>
          <SectionCard title="Kozmik Durum" content={reading.general} icon="✨" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <SmallSection title="Duygu & Aşk" content={reading.love} icon="❤️" />
             <SmallSection title="Aksiyon & Para" content={reading.career} icon="💼" />
             <SmallSection title="Zindelik" content={reading.health} icon="🧘" />
          </div>
          
          <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl italic text-slate-400 text-sm leading-relaxed">
            "Bu yorum, Gemini AI tarafından güncel astronomik veriler ve gerçek zamanlı gökyüzü olayları harmanlanarak oluşturulmuştur. Yıldızların enerjisi sizinle olsun."
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, content, icon }: { title: string, content: string, icon: string }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-2xl border border-purple-500/20">
        {icon}
      </div>
      <h3 className="text-3xl font-cinzel font-bold text-white">{title}</h3>
    </div>
    <p className="text-slate-200 leading-relaxed text-xl font-light">{content}</p>
  </div>
);

const SmallSection = ({ title, content, icon }: { title: string, content: string, icon: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xl">{icon}</span>
      <h4 className="font-cinzel font-bold text-white uppercase tracking-widest text-xs">{title}</h4>
    </div>
    <p className="text-slate-400 text-sm leading-relaxed">{content}</p>
  </div>
);

export default ReadingView;
