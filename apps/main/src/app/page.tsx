"use client"
import { AppShell } from "@mantine/core" // Import AppShell
import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"
import { CollaborationSection } from "@/components/landing/CollaborationSection"

export default function HomePage() {
  return (
    <AppShell
      header={{ height: 60 }} // Define header height for AppShell
      padding="md"
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <CollaborationSection />
      </AppShell.Main>

      {/* Footer is typically outside AppShell.Main but within the overall layout */}
      <Footer />
    </AppShell>
  )
}
