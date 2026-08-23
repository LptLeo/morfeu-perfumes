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

const storeData = storeDataJson as unknown as StoreData;

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-parchment text-text-ink selection:bg-gold/30">
      <Header storeInfo={storeData.storeInfo} />

      <main className="flex-1">
        <Hero
          data={storeData.hero}
          whatsapp={storeData.storeInfo.whatsapp}
        />

        <WhyDecants data={storeData.whyDecants} />

        <Catalog
          catalogData={storeData.catalog}
          whatsapp={storeData.storeInfo.whatsapp}
        />

        <HowItWorks data={storeData.howItWorks} />

        <Testimonials data={storeData.testimonials} />

        <Faq data={storeData.faq} />

        <CtaFinal
          data={storeData.ctaFinal}
          whatsapp={storeData.storeInfo.whatsapp}
        />
      </main>

      <Footer
        footerData={storeData.footer}
        whatsapp={storeData.storeInfo.whatsapp}
      />

      <FloatingWhatsApp
        phoneNumber={storeData.storeInfo.whatsapp.number}
        defaultMessage={storeData.storeInfo.whatsapp.defaultMessage}
      />
    </div>
  );
};

export default App;
