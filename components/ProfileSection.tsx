
import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { getSignFromDate } from '../utils/zodiacUtils';
import { ZODIAC_SIGNS } from '../constants';

interface ProfileSectionProps {
  onProfileSelect: (profile: Profile) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ onProfileSelect }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('zodiac_profiles');
    if (saved) {
      setProfiles(JSON.parse(saved));
    }
  }, []);

  const saveProfiles = (newProfiles: Profile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem('zodiac_profiles', JSON.stringify(newProfiles));
  };

  const handleAddProfile = () => {
    if (!newName || !newDate) return;
    const sign = getSignFromDate(newDate);
    if (!sign) return;

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name: newName,
      birthDate: newDate,
      birthTime: newTime || undefined,
      zodiacSign: sign
    };

    saveProfiles([...profiles, newProfile]);
    setNewName('');
    setNewDate('');
    setNewTime('');
    setIsAdding(false);
  };

  const removeProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveProfiles(profiles.filter(p => p.id !== id));
  };

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-cinzel font-bold text-white">Ruh Kartlarınız</h2>
          <p className="text-slate-500 text-sm">Sık kullandığınız doğum tarihlerini kaydedin.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest hover:bg-purple-600/40 transition-all"
        >
          {isAdding ? 'Vazgeç' : '+ Yeni Profil'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/5 border border-purple-500/30 rounded-3xl p-6 mb-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">İsim / Lakap</label>
              <input 
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Örn: Benim Haritam"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Doğum Tarihi</label>
              <input 
                type="date" 
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Doğum Saati (Opsiyonel)</label>
              <input 
                type="time" 
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 [color-scheme:dark]"
              />
            </div>
          </div>
          <button 
            onClick={handleAddProfile}
            disabled={!newName || !newDate}
            className="w-full py-3 bg-purple-600 rounded-xl text-white font-bold text-sm uppercase tracking-widest hover:bg-purple-500 transition-all disabled:opacity-50"
          >
            Profili Kaydet
          </button>
        </div>
      )}

      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profiles.map(profile => {
            const signData = ZODIAC_SIGNS.find(s => s.id === profile.zodiacSign);
            return (
              <div 
                key={profile.id}
                onClick={() => onProfileSelect(profile)}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/50 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute -right-2 -bottom-2 text-6xl opacity-10 group-hover:scale-110 transition-transform">
                  {signData?.symbol}
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-bold text-lg">{profile.name}</h4>
                    <p className="text-slate-400 text-[10px]">{profile.birthDate} {profile.birthTime ? `| ${profile.birthTime}` : ''}</p>
                  </div>
                  <button 
                    onClick={(e) => removeProfile(profile.id, e)}
                    className="text-slate-600 hover:text-red-400 text-xs"
                  >
                    Sil
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{signData?.symbol}</span>
                  <span className="text-xs font-cinzel font-bold text-purple-300 uppercase tracking-widest">{signData?.nameTr}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : !isAdding && (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-3xl opacity-50">
          <p className="text-slate-400 text-sm">Henüz profil eklenmemiş. İlk profilini oluştur!</p>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
