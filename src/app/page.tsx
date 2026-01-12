'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ScanLine,
  Flame,
  BrainCircuit,
  Salad,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#4A6741]/10 bg-[#F5F5F0]/80 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#4A6741] flex items-center justify-center shadow-sm">
                <Salad className="h-6 w-6 text-[#F5F5F0]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[#4A6741]/70 font-medium">NutriScan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                asChild 
                className="text-sm font-medium text-[#4A6741]/80 hover:text-[#4A6741] hover:bg-[#4A6741]/5 rounded-full"
              >
                <Link href="/auth">Log In</Link>
              </Button>
              <Button 
                asChild 
                className="rounded-full px-6 bg-[#4A6741] text-white hover:bg-[#4A6741]/90 shadow-sm transition-transform hover:scale-105"
              >
                <Link href="/auth">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Split Screen */}
        <section className="container mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-headline text-[#4A6741] leading-[1.1] tracking-tight">
                  Food clarity, warmly served
                </h1>
                <p className="text-lg lg:text-xl text-[#4A6741]/70 leading-relaxed font-body max-w-xl">
                  Computer vision with gentle guidance. Warm, human nutrition insights for real menus.
                </p>
              </div>
              <div className="pt-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    asChild 
                    className="rounded-full px-8 h-14 text-base font-semibold bg-[#4A6741] text-white hover:bg-[#4A6741]/90 shadow-md"
                  >
                    <Link href="/auth">Start Scanning Free</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Image with Scanning Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#C27D5F]/20 to-[#4A6741]/10 aspect-[4/5] max-w-lg mx-auto">
                {/* Placeholder image - you can replace this with an actual image */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C27D5F]/30 via-[#4A6741]/20 to-[#C27D5F]/30">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Salad className="h-32 w-32 text-[#4A6741]/30" />
                  </div>
                </div>
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-scan-line"></div>
                </div>
                
                {/* Scanning Pulse Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#4A6741]/5 via-transparent to-[#4A6741]/5 animate-pulse-scan pointer-events-none"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 lg:py-40">
          <div className="container mx-auto px-6 lg:px-12">
            <FadeInSection>
              <div className="space-y-4 text-center mb-20">
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-headline text-[#4A6741] leading-tight">
                  Why you'll love NutriScan
                </h2>
                <p className="text-lg lg:text-xl text-[#4A6741]/70 max-w-2xl mx-auto font-body">
                  No alarmist vibes, just facts. A warm, indie tool that keeps nutrition honest while staying gentle and human.
                </p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <FadeInSection delay={0.1}>
                <FeatureCard
                  icon={<ScanLine className="h-8 w-8" />}
                  title="Scan with ease"
                  description="Point, snap, and let the app softly read your menu—no fiddly steps or clutter."
                />
              </FadeInSection>
              <FadeInSection delay={0.2}>
                <FeatureCard
                  icon={<Flame className="h-8 w-8" />}
                  title="Honest nutrition"
                  description="Calories, macros, and allergens delivered with clarity—no alarmist vibes, just facts."
                />
              </FadeInSection>
              <FadeInSection delay={0.3}>
                <FeatureCard
                  icon={<BrainCircuit className="h-8 w-8" />}
                  title="Gentle guidance"
                  description="Suggestions feel like a friend's nudge, not a lecture. Stay empowered, not overwhelmed."
                />
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Footer CTA Section */}
        <section className="py-32 lg:py-40">
          <div className="container mx-auto px-6 lg:px-12">
            <FadeInSection>
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <p className="text-xl lg:text-2xl text-[#4A6741]/80 font-body leading-relaxed">
                  Join NutriScan for a warmer, more mindful way to choose your next meal.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <Button 
                    size="lg" 
                    asChild 
                    className="rounded-full px-8 h-14 text-base font-semibold bg-[#4A6741] text-white hover:bg-[#4A6741]/90 shadow-md"
                  >
                    <Link href="/auth">Get Started</Link>
                  </Button>
                </motion.div>
              </div>
            </FadeInSection>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#4A6741]/10 py-12">
        <div className="container mx-auto px-6 lg:px-12 text-center text-sm text-[#4A6741]/60 font-body">
          © {new Date().getFullYear()} NutriScan. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Fade In Section Component
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Feature Card Component with Glassmorphism
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative rounded-3xl p-8 lg:p-10 bg-white/40 backdrop-blur-md border border-[#4A6741]/10 hover:border-[#4A6741]/20 transition-all duration-300 shadow-sm hover:shadow-xl"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4A6741]/10 text-[#4A6741] group-hover:bg-[#4A6741]/15 transition-colors duration-300 mb-6">
        {icon}
      </div>
      <h3 className="text-2xl lg:text-3xl font-headline text-[#4A6741] mb-4">{title}</h3>
      <p className="text-[#4A6741]/70 leading-relaxed text-base lg:text-lg font-body">{description}</p>
    </motion.div>
  );
}