import {
  AppFeaturesSection,
  ContactSection,
  HeroSection,
  PersonalProjectsSection,
} from "@/components/landing";

export default function HomePage() {
  return (
    <main className="w-full">
      <HeroSection />
      <AppFeaturesSection />
      <PersonalProjectsSection />
      <ContactSection />
    </main>
  );
}
