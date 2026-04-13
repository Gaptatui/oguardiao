
import React, { useState, useEffect, useRef } from 'react';
import { 
  Language, UserProfile, UsageLog 
} from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface LazerModuleProps {
  user: any;
  userProfile: UserProfile | null;
  t: any;
  language: Language;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onDataChange: (data: { 
    leisureList: any[],
    isFetchingLeisure: boolean,
    leisureCategory: string,
    setLeisureCategory: (cat: any) => void,
    leisureSubCategory: string,
    setLeisureSubCategory: (sub: string) => void,
    fetchNearbyLeisure: (cat: string, sub?: string) => void
  }) => void;
  genAI: any;
  logModuleUsage: (modulo: UsageLog['modulo']) => void;
}

export const LazerModule: React.FC<LazerModuleProps> = ({
  user, userProfile, t, language, showToast, 
  onDataChange, genAI, logModuleUsage
}) => {
  const [leisureList, setLeisureList] = useState<any[]>([]);
  const [isFetchingLeisure, setIsFetchingLeisure] = useState(false);
  const [leisureCache, setLeisureCache] = useState<Record<string, any[]>>({});
  const [leisureCategory, setLeisureCategory] = useState<'cinema' | 'mall' | 'theater' | 'bar' | 'restaurant' | 'supermarket' | 'bakery'>('cinema');
  const [leisureSubCategory, setLeisureSubCategory] = useState<string>('');

  const fetchNearbyLeisure = React.useCallback(async (category: string, subCategory?: string) => {
    setIsFetchingLeisure(true);
    setLeisureList([]);
    logModuleUsage('talentos');
    try {
      let currentLat = -23.9618;
      let currentLng = -46.3322;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          currentLat = position.coords.latitude;
          currentLng = position.coords.longitude;
        } catch (geoError) {
          console.warn("Geolocation failed, using default:", geoError);
        }
      }

      const categoryName = t[category as keyof typeof t] || category;
      let finalCategory = categoryName;
      if (subCategory && subCategory !== '') {
        const subCategoryName = t[subCategory as keyof typeof t] || subCategory;
        finalCategory = `${subCategoryName} (${categoryName})`;
      }
      const prompt = (t.leisurePrompt as any).replace('{category}', finalCategory);

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: currentLat,
                longitude: currentLng
              }
            }
          }
        },
      });

      const text = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const foundLeisure = chunks
          .filter((chunk: any) => chunk.maps)
          .map((chunk: any) => {
            const name = chunk.maps.title;
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const infoRegex = new RegExp(`${escapedName}.*?\\((.*?)\\).*?\\[(.*?)\\]`, 'i');
            const match = text.match(infoRegex);
            
            let distance = null;
            let rating = 0;
            
            if (match) {
              distance = match[1];
              rating = parseFloat(match[2]) || 0;
            } else {
              const distanceOnlyRegex = new RegExp(`${escapedName}.*?\\((.*?)\\)`, 'i');
              const distMatch = text.match(distanceOnlyRegex);
              distance = distMatch ? distMatch[1] : null;
            }

            return {
              name: name,
              uri: chunk.maps.uri,
              distance: distance,
              rating: rating
            };
          })
          .sort((a: any, b: any) => b.rating - a.rating)
          .slice(0, 3);
        
        setLeisureList(foundLeisure);
        setLeisureCache(prev => ({
          ...prev,
          [`${category}-${subCategory || ''}`]: foundLeisure
        }));
      }
    } catch (error: any) {
      console.error("Error fetching leisure:", error);
      const errStr = JSON.stringify(error);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
        showToast(t.quotaExceeded, "error");
      }
    } finally {
      setIsFetchingLeisure(false);
    }
  }, [t, genAI, logModuleUsage, showToast]);

  useEffect(() => {
    const cacheKey = `${leisureCategory}-${leisureSubCategory}`;
    if (!leisureCache[cacheKey]) {
      fetchNearbyLeisure(leisureCategory, leisureSubCategory);
    } else {
      setLeisureList(prev => {
        const cached = leisureCache[cacheKey];
        // Only update if the reference is different to avoid unnecessary re-renders
        return prev === cached ? prev : cached;
      });
    }
  }, [leisureCategory, leisureSubCategory, leisureCache, fetchNearbyLeisure]);

  const lastDataRef = useRef<string>('');

  // Sync Data with App.tsx
  useEffect(() => {
    const dataToSync = {
      leisureList,
      isFetchingLeisure,
      leisureCategory,
      setLeisureCategory,
      leisureSubCategory,
      setLeisureSubCategory,
      fetchNearbyLeisure
    };

    const dataString = JSON.stringify({
      leisureList, isFetchingLeisure, leisureCategory, leisureSubCategory
    });

    if (dataString !== lastDataRef.current) {
      lastDataRef.current = dataString;
      onDataChange(dataToSync);
    }
  }, [leisureList, isFetchingLeisure, leisureCategory, leisureSubCategory, onDataChange, fetchNearbyLeisure]);

  return null; // This module only handles logic and syncing data
};
