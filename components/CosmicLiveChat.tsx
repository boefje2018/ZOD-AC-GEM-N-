
import React, { useState, useRef, useEffect } from 'react';
import { connectToCosmicLive } from '../services/geminiService';

const CosmicLiveChat: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = connectToCosmicLive({
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: any) => {
          const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            const bytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
            const buffer = await decodeAudioData(bytes, outputCtx);
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsActive(false),
        onerror: (err: any) => console.error(err),
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      setIsActive(false);
    }
  };

  return (
    <div className="bg-purple-900/20 border border-purple-500/30 rounded-[3rem] p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full animate-pulse"></div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-3xl font-cinzel font-bold text-white mb-4">Canlı Kozmik Danışman</h3>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
          Gemini Live teknolojisi ile bilge bir astrologla sesli sohbete başlayın. Doğum haritanız, gelecek öngörüleri veya ruh haliniz hakkında konuşun.
        </p>

        {isActive ? (
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-1 h-12 items-end">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }}></div>
              ))}
            </div>
            <button onClick={stopSession} className="px-12 py-5 bg-red-500/20 border border-red-500/40 text-red-400 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-red-500/30 transition-all">
              Bağlantıyı Kes
            </button>
          </div>
        ) : (
          <button 
            onClick={startSession}
            disabled={isConnecting}
            className="group relative px-16 py-6 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-3xl shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
          >
            {isConnecting ? 'Evrenle Bağlanılıyor...' : 'Sesli Sohbeti Başlat'}
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-3xl transition-transform duration-500 pointer-events-none"></div>
          </button>
        )}
        
        <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
           ✦ Gemini 2.5 Native Audio Engine ✦
        </p>
      </div>
    </div>
  );
};

export default CosmicLiveChat;
