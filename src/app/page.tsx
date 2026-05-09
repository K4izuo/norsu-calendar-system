import Navbar from "./_components/norsu-navbar";
import HeroSection from "./_components/hero-section";
import { AboutSection, TeamSection } from "./_components/about-team";

const Index = () => {
  return (
    <div className="flex flex-col bg-background">
      <Navbar />
      <HeroSection />
      {/* Below-fold sections */}
      <div className="landing-deferred-section">
        <AboutSection />
      </div>
      <div className="landing-deferred-section">
        <TeamSection />
      </div>
    </div>
  );
};

export default Index;
