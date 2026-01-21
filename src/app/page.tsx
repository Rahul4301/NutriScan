'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ScanLine,
  Flame,
  BrainCircuit,
  Salad,
  Sparkles,
  Shield,
  Heart,
  CheckCircle2,
  ArrowRight,
  Camera,
  Leaf,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#4A6741]/10 bg-[#F5F5F0]/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#4A6741] flex items-center justify-center shadow-lg">
                <Salad className="h-5 w-5 text-[#F5F5F0]" />
              </div>
              <span className="text-sm font-semibold text-[#4A6741] tracking-wide">NutriScan</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <Button
                variant="ghost"
                asChild
                className="text-sm font-medium text-[#4A6741]/80 hover:text-[#4A6741] hover:bg-[#4A6741]/5 rounded-full"
              >
                <Link href="/auth">Log In</Link>
              </Button>
              <Button
                asChild
                className="rounded-full px-6 bg-[#4A6741] text-white hover:bg-[#4A6741]/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/auth">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#4A6741]/5 blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#C27D5F]/5 blur-3xl"
              animate={{
                x: [0, -80, 0],
                y: [0, -60, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          <div className="container mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              {/* Left Side - Content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ y, opacity }}
                className="space-y-8 lg:space-y-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A6741]/10 border border-[#4A6741]/20 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-[#4A6741]" />
                  <span className="text-sm font-medium text-[#4A6741]">AI-Powered Nutrition Intelligence</span>
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-6xl xl:text-7xl font-headline text-[#4A6741] leading-[1.1] tracking-tight">
                    Scan. Analyze.{' '}
                    <span className="relative inline-block">
                      <span className="relative z-10">Eat</span>
                      <motion.span
                        className="absolute bottom-2 left-0 right-0 h-4 bg-[#C27D5F]/20 -z-0"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </span>{' '}
                    wisely.
                  </h1>
                  <p className="text-xl lg:text-2xl text-[#4A6741]/70 leading-relaxed font-body max-w-2xl">
                    Transform any menu into clear, actionable nutrition insights. 
                    <span className="block mt-2">No judgment, just clarity.</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      asChild
                      className="rounded-full px-8 h-14 text-base font-semibold bg-[#4A6741] text-white hover:bg-[#4A6741]/90 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <Link href="/auth" className="flex items-center gap-2">
                        Start Scanning Free
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="rounded-full px-8 h-14 text-base font-semibold border-2 border-[#4A6741]/30 text-[#4A6741] hover:bg-[#4A6741]/5 hover:border-[#4A6741]/50 transition-all duration-300"
                    >
                      <Link href="#features">See How It Works</Link>
                    </Button>
                  </motion.div>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-[#4A6741]/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#4A6741]" />
                    <span className="text-sm text-[#4A6741]/70 font-medium">No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#4A6741]" />
                    <span className="text-sm text-[#4A6741]/70 font-medium">Privacy-first</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#4A6741]" />
                    <span className="text-sm text-[#4A6741]/70 font-medium">AI-powered insights</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="relative">
                  {/* Main Card */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white/80 to-[#F5F5F0]/80 backdrop-blur-xl border border-[#4A6741]/10">
                    <div className="aspect-[4/5] p-8 flex flex-col">
                      {/* Mock Menu Header */}
                      <div className="mb-6">
                        <div className="h-3 w-24 bg-[#4A6741]/20 rounded-full mb-3"></div>
                        <div className="h-2 w-32 bg-[#4A6741]/10 rounded-full"></div>
                      </div>

                      {/* Menu Items with Nutritional Info */}
                      <div className="space-y-4 flex-1">
                        {[
                          { name: 'Caesar Salad', calories: '320', color: 'bg-[#4A6741]/10' },
                          { name: 'Grilled Salmon', calories: '450', color: 'bg-[#C27D5F]/10' },
                          { name: 'Vegetable Pasta', calories: '380', color: 'bg-[#4A6741]/10' },
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 + idx * 0.2 }}
                            className={`${item.color} rounded-2xl p-4 border border-[#4A6741]/10 backdrop-blur-sm`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="h-3 w-28 bg-[#4A6741]/30 rounded-full"></div>
                              <div className="flex items-center gap-2">
                                <Flame className="h-4 w-4 text-[#C27D5F]" />
                                <span className="text-xs font-semibold text-[#4A6741]">{item.calories} cal</span>
                              </div>
                            </div>
                            <div className="h-2 w-20 bg-[#4A6741]/20 rounded-full"></div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Scanning Indicator */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ y: 0 }}
                        animate={{ y: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#4A6741]/60 to-transparent"></div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#4A6741]/10"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#4A6741]/10 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-[#4A6741]" />
                      </div>
                      <div>
                        <div className="h-2 w-16 bg-[#4A6741]/30 rounded-full mb-1"></div>
                        <div className="h-2 w-12 bg-[#4A6741]/20 rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#C27D5F]/10"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#C27D5F]/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-[#C27D5F]" />
                      </div>
                      <div>
                        <div className="h-2 w-16 bg-[#C27D5F]/30 rounded-full mb-1"></div>
                        <div className="h-2 w-12 bg-[#C27D5F]/20 rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-[#4A6741]/30 flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#4A6741]"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 lg:py-40 relative">
          <div className="container mx-auto px-6 lg:px-12">
            <FadeInSection>
              <div className="text-center mb-20 max-w-3xl mx-auto">
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-headline text-[#4A6741] leading-tight mb-6">
                  Everything you need, thoughtfully designed
                </h2>
                <p className="text-xl lg:text-2xl text-[#4A6741]/70 leading-relaxed font-body">
                  Powerful features wrapped in a warm, approachable experience. 
                  No overwhelm, just clarity.
                </p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {[
                {
                  icon: <Camera className="h-8 w-8" />,
                  title: 'Instant Menu Scan',
                  description: 'Capture any menu with your camera. Our AI reads, understands, and extracts every dish with precision—no manual entry required.',
                  gradient: 'from-[#4A6741]/10 to-[#4A6741]/5',
                },
                {
                  icon: <Flame className="h-8 w-8" />,
                  title: 'Complete Nutrition',
                  description: 'Get detailed breakdowns of calories, macros, allergens, and ingredients. All the information you need, beautifully presented.',
                  gradient: 'from-[#C27D5F]/10 to-[#C27D5F]/5',
                },
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: 'Dietary Alerts',
                  description: 'Set your preferences and restrictions. We\'ll flag items that don\'t align with your dietary needs—because your health matters.',
                  gradient: 'from-[#4A6741]/10 to-[#4A6741]/5',
                },
                {
                  icon: <BrainCircuit className="h-8 w-8" />,
                  title: 'AI-Powered Insights',
                  description: 'Receive gentle, helpful suggestions based on your preferences. Think of it as a knowledgeable friend, not a nutrition textbook.',
                  gradient: 'from-[#C27D5F]/10 to-[#C27D5F]/5',
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: 'Health Ratings',
                  description: 'Every dish gets a thoughtful health score. Understand nutrition at a glance without feeling judged or overwhelmed.',
                  gradient: 'from-[#4A6741]/10 to-[#4A6741]/5',
                },
                {
                  icon: <Leaf className="h-8 w-8" />,
                  title: 'Vegan & Allergen Info',
                  description: 'Instantly see which items are vegan, vegetarian, or contain allergens. Make informed choices without the detective work.',
                  gradient: 'from-[#C27D5F]/10 to-[#C27D5F]/5',
                },
              ].map((feature, idx) => (
                <FadeInSection key={idx} delay={idx * 0.1}>
                  <FeatureCard {...feature} />
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 lg:py-40 bg-gradient-to-b from-transparent to-[#4A6741]/5">
          <div className="container mx-auto px-6 lg:px-12">
            <FadeInSection>
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-headline text-[#4A6741] leading-tight mb-6">
                  Simple as 1, 2, 3
                </h2>
                <p className="text-xl text-[#4A6741]/70 max-w-2xl mx-auto font-body">
                  Getting started takes less than a minute. Really.
                </p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-5xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Snap a Photo',
                  description: 'Take a picture of any restaurant menu with your phone camera. Our AI does the rest.',
                  icon: <Camera className="h-12 w-12" />,
                },
                {
                  step: '02',
                  title: 'Review & Select',
                  description: 'Browse through detected menu items. Tap any dish to see its complete nutritional profile.',
                  icon: <ScanLine className="h-12 w-12" />,
                },
                {
                  step: '03',
                  title: 'Make Informed Choices',
                  description: 'Get instant insights on calories, macros, allergens, and health ratings. Order with confidence.',
                  icon: <CheckCircle2 className="h-12 w-12" />,
                },
              ].map((step, idx) => (
                <FadeInSection key={idx} delay={idx * 0.15}>
                  <div className="relative">
                    <div className="relative rounded-3xl p-8 lg:p-10 bg-white/60 backdrop-blur-xl border border-[#4A6741]/10 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-[#4A6741]/10 text-[#4A6741] mb-6">
                        {step.icon}
                      </div>
                      <div className="text-6xl font-headline text-[#4A6741]/10 mb-4">{step.step}</div>
                      <h3 className="text-2xl font-headline text-[#4A6741] mb-4">{step.title}</h3>
                      <p className="text-[#4A6741]/70 leading-relaxed font-body">{step.description}</p>
                    </div>
                    {idx < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2">
                        <ArrowRight className="h-8 w-8 text-[#4A6741]/30" />
                      </div>
                    )}
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 lg:py-40">
          <div className="container mx-auto px-6 lg:px-12">
            <FadeInSection>
              <div className="max-w-4xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#4A6741] to-[#4A6741]/90 p-12 lg:p-16 shadow-2xl">
                  <div className="relative z-10 text-center space-y-8">
                    <h2 className="text-4xl lg:text-5xl xl:text-6xl font-headline text-white leading-tight">
                      Ready to eat smarter?
                    </h2>
                    <p className="text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto font-body leading-relaxed">
                      Join thousands who are making better food choices, one scan at a time.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="pt-4"
                    >
                      <Button
                        size="lg"
                        asChild
                        className="rounded-full px-10 h-16 text-lg font-semibold bg-white text-[#4A6741] hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                      >
                        <Link href="/auth" className="flex items-center gap-2">
                          Get Started Free
                          <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </motion.div>
                    <p className="text-white/70 text-sm font-body">
                      No credit card required • Set up in 30 seconds
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#4A6741]/10 bg-white/40 backdrop-blur-sm py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#4A6741] flex items-center justify-center">
                <Salad className="h-4 w-4 text-[#F5F5F0]" />
              </div>
              <span className="text-sm font-semibold text-[#4A6741]">NutriScan</span>
            </div>
            <div className="text-center md:text-right text-sm text-[#4A6741]/60 font-body">
              © {new Date().getFullYear()} NutriScan. All rights reserved.
            </div>
          </div>
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

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-3xl p-8 lg:p-10 bg-gradient-to-br ${gradient} border border-[#4A6741]/10 hover:border-[#4A6741]/30 transition-all duration-300 shadow-sm hover:shadow-2xl backdrop-blur-sm`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 text-[#4A6741] group-hover:scale-110 transition-transform duration-300 mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl lg:text-3xl font-headline text-[#4A6741] mb-4">{title}</h3>
      <p className="text-[#4A6741]/70 leading-relaxed text-base lg:text-lg font-body">{description}</p>
    </motion.div>
  );
}
