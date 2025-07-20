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
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Salad className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground font-headline">
                NutriScan
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center sm:py-32">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Unlock the Nutrition in Every Bite.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Navigate restaurant menus with confidence. NutriScan leverages
            advanced AI to provide instant, comprehensive nutritional insights
            directly from your photos.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/40 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold text-foreground">
                Why You'll Love NutriScan
              </h2>
              <p className="mt-4 text-muted-foreground">
                Making healthy choices has never been easier.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<ScanLine className="h-10 w-10 text-primary" />}
                title="Instant Menu Scanning"
                description="Just snap a photo of any menu. Our AI quickly detects the food items, saving you time and effort."
              />
              <FeatureCard
                icon={<Flame className="h-10 w-10 text-primary" />}
                title="Comprehensive Nutrition"
                description="Get estimated calories, macronutrients (protein, carbs, fats), and other key nutritional details for each item."
              />
              <FeatureCard
                icon={<BrainCircuit className="h-10 w-10 text-primary" />}
                title="AI-Powered Insights"
                description="Discover ingredients, potential allergens, and dietary suitability (e.g., vegan, gluten-free) powered by Gemini."
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-headline text-3xl font-bold text-foreground">
            Ready to Make Smarter Food Choices?
          </h2>
          <p className="mt-4 text-muted-foreground">
            It's quick, easy, and free to get started.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth">
                <UserPlus className="mr-2 h-5 w-5" />
                Create Your Account
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} NutriScan. All rights reserved.
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
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
