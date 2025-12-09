'use client';

import { useState, useRef, useCallback, type ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  BarChart,
  Beef,
  Flame,
  Leaf,
  LogOut,
  Plus,
  Salad,
  Soup,
  UploadCloud,
  User,
  Wheat,
} from 'lucide-react';
import { scanMenuForFoodOptions } from '@/ai/flows/scan-menu-for-food-options';
import {
  generateNutritionalData,
  type GenerateNutritionalDataOutput,
} from '@/ai/flows/generate-nutritional-data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type Status = 'idle' | 'scanning' | 'analyzing' | 'scanned' | 'error';
type NutritionStatus = 'idle' | 'loading' | 'loaded' | 'error';

type FoodDetails = GenerateNutritionalDataOutput & {
  name: string;
};

type FoodOption = {
  name: string;
  isVegan: boolean;
};

const FatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3c-1.2 0-2.3.4-3.2 1.1A6.7 6.7 0 0 0 6 9.3c0 3.4 2.7 6.2 6 6.2s6-2.8 6-6.2c0-1.9-.8-3.6-2.1-4.9A5.4 5.4 0 0 0 12 3Z" />
    </svg>
  );

const loadingMessages = [
  'Analyzing the tastiness...',
  'Counting carbs and dreams...',
  'Calculating protein power...',
  'Scanning for sneaky sugars...',
  'Decoding deliciousness levels...',
  'Reading between the menu lines...',
  'Translating chef speak to macro speak...',
  'Deciphering dietary data...',
  'Crunching nutritional numbers...',
  'Balancing macro molecules...',
  'Teaching AI to taste test...',
  'Consulting the macro gods...',
  'Awakening the nutrition ninjas...',
  'Unleashing the carb detectives...',
  'Loading lunch logic circuits...',
];

export function NutriScanPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [nutritionStatus, setNutritionStatus] =
    useState<NutritionStatus>('idle');
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [foodOptions, setFoodOptions] = useState<FoodOption[]>([]);
  const [foodDetails, setFoodDetails] = useState<Map<string, FoodDetails>>(new Map());
  const [selectedFood, setSelectedFood] = useState<FoodDetails | null>(null);
  const [nutritionData, setNutritionData] =
    useState<GenerateNutritionalDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in or sign up to make an account.',
        });
        setTimeout(() => {
          router.push('/auth');
        }, 200);
      } else {
        setUser(user);
      }
    };
    fetchUser();
  }, [router, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'scanning') {
      interval = setInterval(() => {
        setLoadingMessage(
          loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
        );
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setMenuImage(dataUri);
        performScan(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const performScan = useCallback(async (dataUri: string) => {
    setStatus('scanning');
    setError(null);
    try {
      const result = await scanMenuForFoodOptions({ menuPhotoDataUri: dataUri });
      setFoodOptions(result.foodOptions);
      setStatus('scanned');
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes('[429 Too Many Requests]')) {
        setError('Too many API requests made. Tell the owner to fix it.');
      } else {
        setError('Failed to scan menu. Please try another image.');
      }
      setStatus('error');
    }
  }, []);

  const fetchNutrition = useCallback(async (foodItem: string) => {
    setSelectedFood({ name: foodItem });
    setNutritionStatus('loading');
    setNutritionData(null);
    setError(null);

    if (foodDetails.has(foodItem)) {
      setNutritionData(foodDetails.get(foodItem)!);
      setSelectedFood(foodDetails.get(foodItem)!);
      setNutritionStatus('loaded');
      return;
    }

    
    try {
      const nutrition = await generateNutritionalData({ foodItem });
      const details = { name: foodItem, ...nutrition };
      setFoodDetails(prev => new Map(prev).set(foodItem, details));
      setNutritionData(details);
      setSelectedFood(details);
      setNutritionStatus('loaded');
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes('[429 Too Many Requests]')) {
        setError('Too many API requests made. Tell the owner to fix it.');
      } else {
        setError(`Failed to get nutritional data for ${foodItem}.`);
      }
      setNutritionStatus('error');
    }
  }, [foodDetails]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetState = () => {
    setStatus('idle');
    setMenuImage(null);
    setFoodOptions([]);
    setFoodDetails(new Map());
    setSelectedFood(null);
    setNutritionData(null);
    setError(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/60">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/85 via-accent/80 to-primary flex items-center justify-center shadow-sm">
                <Salad className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">NutriScan</p>
                <h1 className="text-lg font-headline text-foreground">Scan warmly. Eat calmly.</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full hover:bg-secondary/70">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}
              {status !== 'idle' && (
                <Button variant="ghost" size="sm" onClick={resetState} className="rounded-full text-foreground hover:bg-secondary/70">
                  <Plus className="h-5 w-5 -rotate-45 mr-2" />
                  New scan
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-1 p-4 sm:p-8 lg:p-10">
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'idle' && (
          <div className="flex h-[calc(100vh-15rem)] flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-border/60 bg-card/90 p-10 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.45)]">
              <div className="text-center space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Start here</p>
                <h2 className="text-3xl font-headline text-foreground">
                  Scan a menu, stay kind to yourself.
                </h2>
                <p className="text-muted-foreground">
                  Upload a menu photo and get gentle nutrition insights in seconds.
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  size="lg"
                  className="w-full rounded-full h-14 text-base font-semibold bg-foreground text-background hover:bg-foreground/90"
                  onClick={handleUploadClick}
                >
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Upload menu photo
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Prefer a demo? Use any menu photo from your camera roll.
                </p>
              </div>
            </div>
          </div>
        )}

        {status !== 'idle' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-headline text-foreground">Menu</h2>
              <div className="rounded-3xl border border-border/60 bg-card/90 overflow-hidden shadow-[0_18px_48px_-32px_rgba(0,0,0,0.45)]">
                {menuImage && (
                  <Image
                    src={menuImage}
                    alt="Restaurant Menu"
                    width={800}
                    height={1200}
                    className="w-full object-contain"
                    data-ai-hint="restaurant menu"
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <h2 className="text-2xl font-headline text-foreground">
                Detected items
              </h2>
              <Sheet onOpenChange={(open: boolean) => !open && setSelectedFood(null)}>
                <div className="rounded-3xl border border-border/60 bg-card/90 overflow-hidden shadow-[0_18px_48px_-32px_rgba(0,0,0,0.45)]">
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <div className="p-4 space-y-2">
                      {(status === 'scanning' || status === 'analyzing') && (
                        <div className="space-y-4 py-8">
                          <p className="text-center text-sm text-muted-foreground">
                            {loadingMessage}
                          </p>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-lg" />
                          ))}
                        </div>
                      )}
                      {status === 'scanned' && foodOptions.length > 0 && (
                        <ul className="space-y-1">
                          {foodOptions.map((item, index) => (
                            <li key={`${item.name}-${index}`}>
                              <SheetTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-auto w-full justify-start px-4 py-3 text-left text-base font-medium hover:bg-secondary/70 rounded-xl transition-colors"
                                  onClick={() => fetchNutrition(item.name)}
                                >
                                  <Soup className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                                  <span className="flex-1">{item.name}</span>
                                  {item.isVegan && (
                                    <Leaf className="ml-2 h-4 w-4 text-primary" />
                                  )}
                                </Button>
                              </SheetTrigger>
                            </li>
                          ))}
                        </ul>
                      )}
                      {status === 'scanned' && foodOptions.length === 0 && (
                        <p className="py-12 text-center text-muted-foreground">
                          No food items could be detected. Please try a clearer image.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader className="space-y-2">
                    <SheetTitle className="text-2xl font-bold">
                      {selectedFood?.name}
                    </SheetTitle>
                    <SheetDescription className="text-sm">
                      Estimated nutritional information. Varies based on preparation and ingredients.
                    </SheetDescription>
                  </SheetHeader>
                  <Separator className="my-6" />
                  <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
                    <div className="pb-4 space-y-6">
                      {nutritionStatus === 'loading' && <NutritionSkeleton />}
                      {nutritionStatus === 'loaded' && nutritionData && (
                        <NutritionInfo data={nutritionData} />
                      )}
                      {nutritionStatus === 'error' && (
                        <p className="text-sm text-destructive">
                          Could not load nutritional data.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const NutritionInfo = ({
  data,
}: {
  data: GenerateNutritionalDataOutput;
}) => {
  const items = [
    { icon: Flame, label: 'Calories', value: data.calories },
    { icon: Beef, label: 'Protein', value: data.protein },
    { icon: Wheat, label: 'Carbs', value: data.carbs },
    { icon: FatIcon, label: 'Fat', value: data.fat },
    { label: 'Saturated Fat', value: 'saturatedFat' in data ? data.saturatedFat : undefined },
    { label: 'Trans Fat', value: 'transFat' in data ? data.transFat : undefined },
    { label: 'Cholesterol', value: 'cholesterol' in data ? data.cholesterol : undefined },
    { label: 'Sodium', value: 'sodium' in data ? data.sodium : undefined },
    { label: 'Sugar', value: 'sugar' in data ? data.sugar : undefined },
    { label: 'Fiber', value: 'fiber' in data ? data.fiber : undefined },
  ].filter((item) => item.value);

  return (
    <div className="space-y-6">
      {data.healthRating && (
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border border-green-200/50 dark:border-green-900/50 p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Health Rating</p>
          <div className="flex items-baseline justify-center gap-2">
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{data.healthRating}</p>
            <p className="text-lg text-muted-foreground">/10</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {items.slice(0, 4).map((item) => (
          <div key={item.label} className="rounded-xl border border-border/40 bg-secondary/30 p-4 text-center hover:border-border/60 transition-colors">
            {item.icon && <item.icon className="mb-2 h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />}
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold mt-1">{item.value}</p>
          </div>
        ))}
      </div>
      {items.length > 4 && (
        <>
          <Separator />
          <div className="space-y-3">
            {items.slice(4).map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-secondary/30 transition-colors"
              >
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {data.ingredients && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Ingredients</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.ingredients}
            </p>
          </div>
        </>
      )}
      {data.allergens && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Potential Allergens</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(data.allergens) ? (
                (data.allergens as string[]).map((allergen: string, idx: number) => (
                  <span key={idx} className="inline-block px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                    {allergen}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{data.allergens}</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const NutritionSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
    <Separator />
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  </div>
);
