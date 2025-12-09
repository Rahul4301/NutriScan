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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Salad className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">NutriScan</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground">
                <Link href="/auth">
                  Log In
                </Link>
              </Button>
              <Button asChild className="rounded-full px-6">
                <Link href="/auth">
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Unlock the Nutrition in Every Bite
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Navigate restaurant menus with confidence. NutriScan AI leverages advanced AI to provide instant, comprehensive nutritional insights directly from your photos.
            </p>
          </div>
          <div className="mt-10">
            <Button size="lg" asChild className="rounded-full px-8 h-12 text-base font-medium">
              <Link href="/auth">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-28 border-t border-border/40">
          <div className="container mx-auto px-4">
            <div className="space-y-4 text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
                Why You'll Love NutriScan
              </h2>
              <p className="text-lg text-muted-foreground">
                Making healthy choices has never been easier.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<ScanLine className="h-8 w-8" />}
                title="Instant Menu Scanning"
                description="Just snap a photo of any menu. Our AI quickly detects the food items, saving you time and effort."
              />
              <FeatureCard
                icon={<Flame className="h-8 w-8" />}
                title="Complete Nutrition Data"
                description="Get estimated calories, macronutrients (protein, carbs, fats), and other key nutritional details instantly."
              />
              <FeatureCard
                icon={<BrainCircuit className="h-8 w-8" />}
                title="AI-Powered Insights"
                description="Discover ingredients, potential allergens, and dietary suitability powered by advanced AI."
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-t border-border/40">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Ready to Make Smarter Food Choices?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              It's quick, easy, and free to get started. Take control of your nutrition today.
            </p>
            <Button size="lg" asChild className="rounded-full px-8 h-12 text-base font-medium">
              <Link href="/auth">
                Create Your Account
              </Link>
            </Button>
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
    <div className="group rounded-2xl border border-border/40 bg-card p-8 hover:border-border/80 hover:shadow-lg transition-all duration-300">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
