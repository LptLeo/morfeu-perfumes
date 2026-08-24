import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSiteTexts, type SiteTexts } from '../admin/textsService';

interface SiteTextsContextValue {
  texts: SiteTexts | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const SiteTextsContext = createContext<SiteTextsContextValue | null>(null);

export function SiteTextsProvider({ children }: { children: ReactNode }) {
  const [texts, setTexts] = useState<SiteTexts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTexts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSiteTexts();
      setTexts(data);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar textos do site:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTexts();
  }, []);

  return (
    <SiteTextsContext.Provider value={{ texts, loading, error, refresh: loadTexts }}>
      {children}
    </SiteTextsContext.Provider>
  );
}

export function useSiteTexts(): SiteTextsContextValue {
  const context = useContext(SiteTextsContext);
  if (!context) {
    throw new Error('useSiteTexts deve ser usado dentro de SiteTextsProvider');
  }
  return context;
}