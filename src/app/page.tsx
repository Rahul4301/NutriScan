import Link from 'next/link';
import {
  Salad,
  Flame,
  BrainCircuit,
  ScanLine,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/60">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/80 via-accent/80 to-primary flex items-center justify-center shadow-sm">
                <Salad className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">NutriScan</p>
                <h1 className="text-xl font-headline text-foreground">Food clarity, warmly served.</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground rounded-full">
                <Link href="/auth">Log In</Link>
              </Button>
              <Button asChild className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                <Link href="/auth">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 sm:py-28 text-center">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              Scan. Understand. Choose.
            </div>
            <h1 className="text-5xl sm:text-6xl font-headline leading-tight text-foreground">
              Warm, human nutrition insights for real menus.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              NutriScan blends computer vision with gentle guidance so you can eat well without losing the joy of food.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button size="lg" asChild className="rounded-full px-8 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                <Link href="/auth">Start scanning free</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="rounded-full px-8 h-12 text-base font-semibold text-foreground hover:bg-secondary/70">
                <Link href="#features">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-26">
          <div className="container mx-auto px-4">
            <div className="space-y-3 text-center mb-14">
              <h2 className="text-4xl sm:text-5xl font-headline text-foreground">Why you'll love NutriScan</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A warm, indie tool that keeps nutrition honest while staying gentle and human.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<ScanLine className="h-7 w-7" />}
                title="Scan with ease"
                description="Point, snap, and let the app softly read your menu—no fiddly steps or clutter."
              />
              <FeatureCard
                icon={<Flame className="h-7 w-7" />}
                title="Honest nutrition"
                description="Calories, macros, and allergens delivered with clarity—no alarmist vibes, just facts."
              />
              <FeatureCard
                icon={<BrainCircuit className="h-7 w-7" />}
                title="Gentle guidance"
                description="Suggestions feel like a friend’s nudge, not a lecture. Stay empowered, not overwhelmed."
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-18 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-accent/15 via-secondary to-primary/10 p-10 sm:p-14 shadow-sm text-center">
              <h2 className="text-4xl sm:text-5xl font-headline text-foreground mb-4">
                Ready to eat well with calm confidence?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join NutriScan for a warmer, more mindful way to choose your next meal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild className="rounded-full px-8 h-12 text-base font-semibold bg-foreground text-background hover:bg-foreground/90">
                  <Link href="/auth">Create your account</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="rounded-full px-8 h-12 text-base font-semibold text-foreground hover:bg-secondary/80">
                  <Link href="/auth">Try a demo scan</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="container mx-auto px-4 py-12 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} NutriScan AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card/80 p-7 hover:-translate-y-1 hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] transition-all duration-300">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary/20 group-hover:text-primary/80 transition-colors duration-200">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-headline text-foreground">{title}</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed text-base">{description}</p>
    </div>
  );
}
