
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { HoroscopeReading, CompatibilityReading, ZodiacSign, AstrologicalAspect } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyHoroscope = async (signName: string, date: string): Promise<HoroscopeReading> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Bugün ${date} tarihindeki güncel gökyüzü olaylarını (gezegen transitleri, ay fazı, önemli açılar) Google Arama üzerinden kontrol et ve ${signName} burcu için detaylı, modern bir günlük yorum hazırla.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sign: { type: Type.STRING },
          date: { type: Type.STRING },
          general: { type: Type.STRING, description: "Gerçek gökyüzü olaylarına dayalı genel yorum" },
          love: { type: Type.STRING, description: "Aşk hayatı yorumu" },
          career: { type: Type.STRING, description: "Kariyer ve para yorumu" },
          health: { type: Type.STRING, description: "Sağlık yorumu" },
          luckyNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
          luckyColor: { type: Type.STRING },
        },
        required: ["sign", "date", "general", "love", "career", "health", "luckyNumbers", "luckyColor"],
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("AI'dan boş yanıt geldi");
    return JSON.parse(text.trim());
  } catch (e) {
    throw new Error("Burç verisi ayrıştırılamadı");
  }
};

export const generateCosmicImage = async (signName: string, energy: string, color: string): Promise<string> => {
  const prompt = `A mystical and ethereal digital art piece representing the zodiac sign ${signName}. 
                  The theme is ${energy}. Dominant colors should be ${color} and cosmic purple. 
                  High detail, 4k, cinematic lighting, sacred geometry elements, nebula background.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
  });

  let base64Image = "";
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }
  return base64Image;
};

export const connectToCosmicLive = async (callbacks: any) => {
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
      systemInstruction: 'Sen bilge bir astrologsun. Kullanıcıyla sesli sohbet ederek doğum haritaları ve gökyüzü olayları hakkında samimi, derinlemesine bilgi veriyorsun. Ses tonun huzur verici ve gizemli olmalı.',
    },
  });
};

export const getCompatibility = async (
  sign1: string, 
  date1: string, 
  sign2: string, 
  date2: string,
  aspects: AstrologicalAspect[] = [],
  time1: string = '',
  time2: string = ''
): Promise<CompatibilityReading> => {
  const aspectText = aspects.length > 0 
    ? `Özellikle şu açılara odaklan: ${aspects.join(', ')}. `
    : '';

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `${sign1} (${date1} ${time1}) ve ${sign2} (${date2} ${time2}) arasındaki sinastri uyumunu detaylı analiz et. ${aspectText}
    Analizde:
    1. İki kişi için de natal yerleşimleri (Güneş, Ay, Merkür, Venüs, Mars, Jüpiter, Satürn, Uranüs, Neptün, Plüton, Yükselen, Kuzey Ay Düğümü, Güney Ay Düğümü) oluştur.
    2. Her bir 'meaning' alanında; gezegenin astrolojik sembolünün (glifinin) arketipsel anlamını 'Sembol:' başlığıyla, bu gezegenin bulunduğu burçla olan bağlantısını ve kişiye kattığı gücü 'Bağlantı:' başlığıyla 3-4 cümleyle açıkla.
    3. chartSummary1 ve chartSummary2 alanlarında: İlgili kişinin haritasındaki baskın element ve baskın nitelik dengesini analiz et.
    4. İki harita arasındaki en önemli 5-7 açıyı (synastry aspects) listele.
    5. Sonuçları Türkçe ver.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sign1: { type: Type.STRING },
          sign2: { type: Type.STRING },
          score: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          advice: { type: Type.STRING },
          chartSummary1: { type: Type.STRING },
          chartSummary2: { type: Type.STRING },
          aspects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                planet1: { type: Type.STRING },
                planet2: { type: Type.STRING },
                planet1Element: { type: Type.STRING },
                planet1Modality: { type: Type.STRING },
                planet2Element: { type: Type.STRING },
                planet2Modality: { type: Type.STRING },
                interpretation: { type: Type.STRING }
              },
              required: ["type", "planet1", "planet2", "planet1Element", "planet1Modality", "planet2Element", "planet2Modality", "interpretation"]
            }
          },
          chart1: {
            type: Type.OBJECT,
            properties: {
              placements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    planet: { type: Type.STRING },
                    sign: { type: Type.STRING },
                    signSymbol: { type: Type.STRING },
                    element: { type: Type.STRING },
                    modality: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ["planet", "sign", "signSymbol", "element", "modality", "meaning"]
                }
              }
            },
            required: ["placements"]
          },
          chart2: {
            type: Type.OBJECT,
            properties: {
              placements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    planet: { type: Type.STRING },
                    sign: { type: Type.STRING },
                    signSymbol: { type: Type.STRING },
                    element: { type: Type.STRING },
                    modality: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ["planet", "sign", "signSymbol", "element", "modality", "meaning"]
                }
              }
            },
            required: ["placements"]
          }
        },
        required: ["sign1", "sign2", "score", "summary", "advice", "chart1", "chart2", "chartSummary1", "chartSummary2", "aspects"],
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    throw new Error("Uyum verisi ayrıştırılamadı");
  }
};
