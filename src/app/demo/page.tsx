import Navbar from "../_components/norsu-navbar";
import HeroSection from "../_components/hero-section";
import { AboutSection, TeamSection } from "../_components/about-team";

const Index = () => {
  return (
    <div className="flex flex-col bg-background">
      <Navbar />
      <HeroSection />
      {/* Below-fold sections */}
      <AboutSection />
      <TeamSection />
    </div>
  );
};

export default Index;
