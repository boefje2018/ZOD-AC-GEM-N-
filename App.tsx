
import React, { useState } from 'react';
import Layout from './components/Layout';
import SignCard from './components/SignCard';
import ReadingView from './components/ReadingView';
import CompatibilityTool from './components/CompatibilityTool';
import ProfileSection from './components/ProfileSection';
import CosmicLiveChat from './components/CosmicLiveChat';
import { ZODIAC_SIGNS } from './constants';
import { SignData, Profile } from './types';

const App: React.FC = () => {
  const [selectedSign, setSelectedSign] = useState<SignData | null>(null);

  const handleProfileSelect = (profile: Profile) => {
    const sign = ZODIAC_SIGNS.find(s => s.id === profile.zodiacSign);
    if (sign) setSelectedSign(sign);
  };

  return (
    <Layout>
      {!selectedSign ? (
        <div className="animate-fadeIn">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-cinzel font-bold text-white mb-6 tracking-tight leading-tight">
              Kozmik Rehberinize <br/> Hoş Geldiniz
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed font-light">
              Yapay zeka ve yıldızların kadim bilgeliği burada buluşuyor. Burcunuzu seçin veya canlı danışmanımızla sohbete başlayın.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-24">
            <div className="lg:col-span-3">
              <ProfileSection onProfileSelect={handleProfileSelect} />
              
              <div className="mt-16">
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-3xl font-cinzel font-bold text-white">Gök Günlüğü</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {ZODIAC_SIGNS.map((sign) => (
                    <SignCard key={sign.id} sign={sign} onClick={setSelectedSign} />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                   <h4 className="text-white font-cinzel font-bold mb-4 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     Canlı Kozmik Hava
                   </h4>
                   <p className="text-xs text-slate-400 leading-relaxed mb-4">
                     Bugün Ay büyüyen fazda, yaratıcı enerjilerinizi serbest bırakmak için mükemmel bir zaman.
                   </p>
                   <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                     Güneş: Yay ♐ | Ay: Boğa ♉
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-24">
             <CosmicLiveChat />
          </div>

          <div className="mt-24 max-w-5xl mx-auto">
             <div className="text-center mb-14">
               <h2 className="text-4xl font-cinzel font-bold text-white mb-4">Sinastri & Uyum</h2>
               <p className="text-slate-400 text-lg">İki ruh arasındaki karmaşık bağları ve elementel rezonansı keşfedin.</p>
             </div>
             <CompatibilityTool />
          </div>
        </div>
      ) : (
        <ReadingView sign={selectedSign} onBack={() => setSelectedSign(null)} />
      )}
    </Layout>
  );
};

export default App;
