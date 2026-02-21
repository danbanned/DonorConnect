import Header from './components/landing/Header';
import Hero from './components/landing/Hero';
import Metrics from './components/landing/Metrics';
import FeatureGrid from './components/landing/FeatureGrid';
import DonationWidget from './components/landing/DonationWidget';
import MigrationSection from './components/landing/MigrationSection';
import CaseStudy from './components/landing/CaseStudy';
import Testimonials from './components/landing/Testimonials';
import FAQ from './components/landing/FAQ';
import Footer from './components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <Metrics />
      <FeatureGrid />
      <DonationWidget />
      <MigrationSection />
      <CaseStudy />
      <Testimonials />
      <FAQ />
      <Footer />
    </>
  );
}
