import React from 'react';
import storeDataJson from '@/data/storeData.json';
import { StoreData } from '@/types/store';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { WhyDecants } from '@/components/WhyDecants';
import { Catalog } from '@/components/Catalog';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { Faq } from '@/components/Faq';
import { CtaFinal } from '@/components/CtaFinal';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { SiteTextsProvider, useSiteTexts } from '@/context/SiteTextsContext';

const storeData = storeDataJson as unknown as StoreData;

function AppContent() {
  const { texts, loading } = useSiteTexts();

  // Fallback para dados estáticos enquanto carrega ou se houver erro
  const heroData = texts?.hero ?? storeData.hero;
  const whyDecantsData = texts?.whyDecants ?? storeData.whyDecants;
  const catalogData = texts?.catalog ?? storeData.catalog;
  const howItWorksData = texts?.howItWorks ?? storeData.howItWorks;
  const faqData = texts?.faq ?? storeData.faq;
  const footerData = texts?.footer ?? storeData.footer;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment text-text-ink">
        <div className="flex-1 flex items-center justify-center">
          <span className="text-text-muted">Carregando…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-text-ink selection:bg-gold/30">
      <Header storeInfo={storeData.storeInfo} />

      <main className="flex-1">
        <Hero
          data={heroData}
          whatsapp={storeData.storeInfo.whatsapp}
        />

        <WhyDecants data={whyDecantsData} />

        <Catalog
          catalogData={catalogData}
          whatsapp={storeData.storeInfo.whatsapp}
        />

        <HowItWorks data={howItWorksData} />

        <Testimonials data={storeData.testimonials} />

        <Faq data={faqData} />

        <CtaFinal
          data={storeData.ctaFinal}
          whatsapp={storeData.storeInfo.whatsapp}
        />
      </main>

      <Footer
        footerData={footerData}
        whatsapp={storeData.storeInfo.whatsapp}
      />

      <FloatingWhatsApp
        phoneNumber={storeData.storeInfo.whatsapp.number}
        defaultMessage={storeData.storeInfo.whatsapp.defaultMessage}
      />
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <SiteTextsProvider>
      <AppContent />
    </SiteTextsProvider>
  );
};

export default App;
