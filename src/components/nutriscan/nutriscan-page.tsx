'use client';

import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  BarChart,
  Beef,
  Flame,
  Plus,
  Salad,
  Soup,
  UploadCloud,
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

type Status = 'idle' | 'scanning' | 'scanned' | 'error';
type NutritionStatus = 'idle' | 'loading' | 'loaded' | 'error';

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

export function NutriScanPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [nutritionStatus, setNutritionStatus] =
    useState<NutritionStatus>('idle');
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [foodOptions, setFoodOptions] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [nutritionData, setNutritionData] =
    useState<GenerateNutritionalDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError('Failed to scan menu. Please try another image.');
      setStatus('error');
    }
  }, []);

  const fetchNutrition = useCallback(async (foodItem: string) => {
    setSelectedFood(foodItem);
    setNutritionStatus('loading');
    setNutritionData(null);
    setError(null);
    try {
      const result = await generateNutritionalData({ foodItem });
      setNutritionData(result);
      setNutritionStatus('loaded');
    } catch (e) {
      console.error(e);
      setError(`Failed to get nutritional data for ${foodItem}.`);
      setNutritionStatus('error');
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetState = () => {
    setStatus('idle');
    setMenuImage(null);
    setFoodOptions([]);
    setSelectedFood(null);
    setNutritionData(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Salad className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground font-headline">
                NutriScan
              </h1>
            </div>
            {status !== 'idle' && (
              <Button variant="ghost" onClick={resetState}>
                <Plus className="h-4 w-4 -rotate-45 mr-2" />
                Scan New Menu
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-1 p-4 sm:p-6 lg:p-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'idle' && (
          <div className="flex h-[calc(100vh-15rem)] flex-col items-center justify-center text-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="font-headline text-3xl">
                  Welcome to NutriScan
                </CardTitle>
                <CardDescription>
                  Get nutritional insights from any menu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                <Button
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleUploadClick}
                >
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Upload a Menu Photo
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Take a picture or upload an image of a menu to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {status !== 'idle' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="font-headline text-2xl font-bold">Menu</h2>
              <Card className="overflow-hidden">
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
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-headline text-2xl font-bold">
                Detected Items
              </h2>
              <Sheet onOpenChange={(open) => !open && setSelectedFood(null)}>
                <Card>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-16rem)]">
                      <div className="p-4">
                        {status === 'scanning' && (
                          <div className="space-y-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <Skeleton key={i} className="h-10 w-full" />
                            ))}
                          </div>
                        )}
                        {status === 'scanned' && foodOptions.length > 0 && (
                          <ul className="space-y-2">
                            {foodOptions.map((item, index) => (
                              <li key={`${item}-${index}`}>
                                <SheetTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-auto w-full justify-start px-3 py-2 text-left"
                                    onClick={() => fetchNutrition(item)}
                                  >
                                    <Soup className="mr-3 h-5 w-5 flex-shrink-0 text-primary/80" />
                                    <span className="flex-1">{item}</span>
                                    <BarChart className="ml-3 h-5 w-5 text-muted-foreground" />
                                  </Button>
                                </SheetTrigger>
                              </li>
                            ))}
                          </ul>
                        )}
                        {status === 'scanned' && foodOptions.length === 0 && (
                          <p className="py-10 text-center text-muted-foreground">
                            No food items could be detected. Please try a
                            clearer image.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle className="font-headline text-2xl">
                      {selectedFood}
                    </SheetTitle>
                    <SheetDescription>
                      Estimated nutritional information. Varies based on
                      preparation and ingredients.
                    </SheetDescription>
                  </SheetHeader>
                  <Separator className="my-4" />
                  <div className="py-4">
                    {nutritionStatus === 'loading' && <NutritionSkeleton />}
                    {nutritionStatus === 'loaded' && nutritionData && (
                      <NutritionInfo data={nutritionData} />
                    )}
                    {nutritionStatus === 'error' && (
                      <p className="text-destructive">
                        Could not load nutritional data.
                      </p>
                    )}
                  </div>
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
    { label: 'Saturated Fat', value: data.saturatedFat },
    { label: 'Trans Fat', value: data.transFat },
    { label: 'Cholesterol', value: data.cholesterol },
    { label: 'Sodium', value: data.sodium },
    { label: 'Sugar', value: data.sugar },
    { label: 'Fiber', value: data.fiber },
  ].filter((item) => item.value);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {items.slice(0, 4).map((item) => (
          <Card key={item.label}>
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <item.icon className="mb-2 h-6 w-6 text-accent" />
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Separator />
      <div className="space-y-2">
        {items.slice(4).map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <p className="text-muted-foreground">{item.label}</p>
            <p className="font-medium">{item.value}</p>
          </div>
        ))}
      </div>
      {data.ingredients && (
        <>
          <Separator />
          <div>
            <h4 className="mb-2 font-semibold">Ingredients</h4>
            <p className="text-sm text-muted-foreground">
              {data.ingredients}
            </p>
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
