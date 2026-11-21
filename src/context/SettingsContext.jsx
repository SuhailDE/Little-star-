import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { settingsApi } from '../services/api.js';

const DEFAULT_SETTINGS = {
  institutionName: 'Little Star',
  logoUrl: '',
  tagline: 'A Caring Place for Young Learners',
  directorName: 'Selina Parveen (Munni)',
  phones: ['01636-021582', '01682-225117'],
  whatsappNumber: '01636-021582',
  facebookUrl: '',
  address: '',
  googleMapsUrl: '',
  admissionStatus: 'Open',
  minimumAge: 4,
  heroHeading: 'Every Child Is a Little Star',
  heroSubtitle: 'A Caring Place for Young Learners',
  heroSupportingText:
    'Helping children build confidence, knowledge, creativity and strong educational foundations.',
  aboutIntro:
    'Little Star is a caring educational institution in Bangladesh guided by Director Selina Parveen (Munni). We focus on nurturing young learners with patience, structured early education, and attentive foundational support.',
  mission:
    'To provide a caring, encouraging, and structured learning space where every child builds strong foundational skills, curiosity, and confidence.',
  vision:
    'To nurture thoughtful, capable young learners equipped with essential language, literacy, and basic ICT foundations for continued academic success.',
  teachingPhilosophy:
    'Children thrive when taught with warmth, patience, interactive activities, and individual attention suited to their developmental stage.',
  learningEnvironment:
    'A welcoming, child-friendly classroom atmosphere where young students feel safe, supported, and eager to participate every day.',
  galleryCategories: [
    'Classroom',
    'Learning Activities',
    'Student Activities',
    'Events',
    'Institution',
  ],
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refreshSettings: async () => {},
  setSettings: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await settingsApi.get();
      if (data?.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch {
      // Keep defaults on transient load failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    if (settings.institutionName && settings.tagline) {
      document.title = `${settings.institutionName} — ${settings.tagline}`;
    }
  }, [settings.institutionName, settings.tagline]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
