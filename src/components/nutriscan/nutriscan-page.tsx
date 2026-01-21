'use client';

import { useState, useRef, useCallback, type ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Beef,
  Flame,
  Leaf,
  LogOut,
  UploadCloud,
  Wheat,
  X,
  Heart,
} from 'lucide-react';
import { ProfileDropdown } from '@/components/profile/profile-dropdown';
import { scanMenuForFoodOptions } from '@/ai/flows/scan-menu-for-food-options';
import {
  generateNutritionalData,
  type GenerateNutritionalDataOutput,
} from '@/ai/flows/generate-nutritional-data';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type Status = 'idle' | 'scanning' | 'analyzing' | 'scanned' | 'error';
type NutritionStatus = 'idle' | 'loading' | 'loaded' | 'error';

type FoodDetails = GenerateNutritionalDataOutput & {
  name: string;
  dietaryViolations?: string[]; // Array of dietary restrictions that this food violates
};

type FoodOption = {
  name: string;
  isVegan: boolean;
  dietaryViolations?: string[];
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
];

// Generate gentle insights based on nutrition data
const generateGentleInsight = (data: GenerateNutritionalDataOutput): string => {
  const protein = parseInt(data.protein) || 0;
  const carbs = parseInt(data.carbs) || 0;
  const fat = parseInt(data.fat) || 0;
  const calories = parseInt(data.calories) || 0;

  if (protein > 20 && carbs < 30) {
    return 'A protein-rich choice for sustained energy.';
  } else if (carbs > 40 && fat < 15) {
    return 'A balanced choice for energy.';
  } else if (calories < 300) {
    return 'A lighter option that keeps you moving.';
  } else if (calories > 600) {
    return 'A hearty option that satisfies.';
  } else {
    return 'A balanced choice for your day.';
  }
};

export function NutriScanPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [foodOptions, setFoodOptions] = useState<FoodOption[]>([]);
  const [foodDetails, setFoodDetails] = useState<Map<string, FoodDetails>>(new Map());
  const [selectedFood, setSelectedFood] = useState<FoodDetails | null>(null);
  const [nutritionStatus, setNutritionStatus] = useState<NutritionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{
    dietary_restrictions?: string[] | null;
    allergens?: string[] | null;
  } | null>(null);
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
        // Load user profile for dietary restrictions
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('dietary_restrictions, allergens')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserProfile({
            dietary_restrictions: profile.dietary_restrictions,
            allergens: profile.allergens,
          });
        }
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
    setFoodOptions([]);
    try {
      const result = await scanMenuForFoodOptions({ 
        menuPhotoDataUri: dataUri,
        dietaryRestrictions: userProfile?.dietary_restrictions || undefined,
        allergens: userProfile?.allergens || undefined,
      });
      if (result.foodOptions && result.foodOptions.length > 0) {
        // Ensure dietary violations are set (default to empty array if not present)
        const updatedOptions = result.foodOptions.map(option => ({
          ...option,
          dietaryViolations: option.dietaryViolations || [],
        }));
        setFoodOptions(updatedOptions);
        
        // If direct food analysis is available, pre-populate the nutrition data
        if (result.directFoodAnalysis) {
          const directFood = result.directFoodAnalysis;
          const details: FoodDetails = {
            name: directFood.name,
            calories: directFood.calories,
            protein: directFood.protein,
            carbs: directFood.carbs,
            fat: directFood.fat,
            isVegan: directFood.isVegan,
            dietaryViolations: directFood.dietaryViolations || [],
          };
          setFoodDetails(prev => new Map(prev).set(directFood.name, details));
        }
        
        setStatus('scanned');
      } else {
        setError('No food items were detected in this image. Please try a clearer menu photo.');
        setStatus('error');
      }
    } catch (e) {
      console.error('Scan error:', e);
      let errorMessage = 'Failed to scan menu. Please try another image.';
      
      if (e instanceof Error) {
        if (e.message.includes('[429 Too Many Requests]')) {
          errorMessage = 'Too many API requests made. Please try again later.';
        } else if (e.message.includes('Missing GOOGLE_GENAI_API_KEY') || e.message.includes('Missing GEMINI_API_KEY')) {
          errorMessage = 'API key is missing. Please configure GOOGLE_GENAI_API_KEY or GEMINI_API_KEY.';
        } else if (e.message.includes('Invalid menuPhotoDataUri')) {
          errorMessage = 'Invalid image format. Please try uploading the image again.';
        } else {
          errorMessage = `Failed to scan menu: ${e.message}. Please try another image.`;
        }
      }
      
      setError(errorMessage);
      setStatus('error');
    }
  }, [userProfile]);

  const fetchNutrition = useCallback(async (foodItem: string) => {
    setSelectedFood({ name: foodItem } as FoodDetails);
    setNutritionStatus('loading');
    setError(null);

    // Check if we already have nutrition data (from direct analysis or previous fetch)
    if (foodDetails.has(foodItem)) {
      const details = foodDetails.get(foodItem)!;
      setSelectedFood(details);
      setNutritionStatus('loaded');
      return;
    }
    
    try {
      const nutrition = await generateNutritionalData({ 
        foodItem,
        dietaryRestrictions: userProfile?.dietary_restrictions || undefined,
        allergens: userProfile?.allergens || undefined,
      });
      const details = { name: foodItem, ...nutrition };
      setFoodDetails(prev => new Map(prev).set(foodItem, details));
      setSelectedFood(details);
      setNutritionStatus('loaded');
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes('[429 Too Many Requests]')) {
        setError('Too many API requests made. Please try again later.');
      } else {
        setError(`Failed to get nutritional data for ${foodItem}.`);
      }
      setNutritionStatus('error');
    }
  }, [foodDetails, userProfile]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetState = () => {
    setStatus('idle');
    setMenuImage(null);
    setFoodOptions([]);
    setFoodDetails(new Map());
    setSelectedFood(null);
    setNutritionStatus('idle');
    setError(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5F5F0] overflow-hidden">
      {/* Top Branding - Fixed */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 right-0 z-50 pt-6 pb-4 px-4 pointer-events-none"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex-1" />
          <div className="text-center space-y-1 pointer-events-auto">
            <h1 className="text-sm uppercase tracking-[0.3em] font-medium text-[#4A6741]">
              NUTRISCAN
            </h1>
            <p className="text-xs text-[#4A6741]/60 font-headline italic">
              Scan warmly. Eat calmly.
            </p>
              </div>
          <div className="flex-1 flex justify-end gap-2 pointer-events-auto">
              {user && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="h-9 w-9 p-0 rounded-full bg-white/20 backdrop-blur-md border border-[#4A6741]/10 text-[#4A6741] hover:bg-white/30"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <ProfileDropdown user={user} />
                </>
              )}
          </div>
        </div>
      </motion.header>

      {/* Main Viewfinder Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Image/Camera Feed */}
        {menuImage ? (
          <div className="absolute inset-0">
            <Image
              src={menuImage}
              alt="Menu"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A6741]/5 to-[#C27D5F]/5" />
        )}

        {/* Center Focus Brackets - Pulsing */}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <FocusBrackets />
          </motion.div>
        )}

        {/* Loading Overlay */}
        {status === 'scanning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="text-center space-y-4 px-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto rounded-full border-4 border-[#4A6741]/30 border-t-[#4A6741]"
              />
              <p className="text-white text-sm font-medium">{loadingMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Glassmorphic Food Cards - Overlay */}
        <AnimatePresence>
          {status === 'scanned' && foodOptions.length > 0 && (
            <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
              <div className="overflow-y-auto max-h-[70vh] p-4 pb-32 pointer-events-auto">
                <div className="max-w-md mx-auto space-y-4">
                  {foodOptions.map((item, index) => (
                    <FoodCard
                      key={`${item.name}-${index}`}
                      foodItem={item}
                      index={index}
                      onSelect={() => fetchNutrition(item.name)}
                      selected={selectedFood?.name === item.name}
                      details={selectedFood?.name === item.name ? selectedFood : null}
                      nutritionStatus={selectedFood?.name === item.name ? nutritionStatus : 'idle'}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-red-50/95 backdrop-blur-md border border-red-200/50 rounded-3xl p-6 shadow-2xl max-w-md w-full"
              >
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-red-900 mb-2">Scan Failed</h3>
                      <p className="text-sm text-red-800 leading-relaxed">{error}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setError(null);
                          resetState();
                        }}
                        className="flex-1 h-10 px-4 text-sm text-red-700 hover:text-red-900 hover:bg-red-100/50 rounded-full"
                      >
                        Try Again
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setError(null)}
                        className="h-10 px-4 text-sm text-red-600 hover:text-red-800 hover:bg-red-100/30 rounded-full"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar - Fixed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 z-50 pb-6 pt-4 px-4 bg-gradient-to-t from-[#F5F5F0] via-[#F5F5F0]/95 to-transparent"
      >
        <div className="max-w-md mx-auto w-full space-y-3">
          {status === 'idle' ? (
            <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={handleUploadClick}
                  className="w-full h-14 rounded-[32px] bg-[#4A6741] text-white text-base font-semibold shadow-lg hover:bg-[#4A6741]/90 transition-all"
                >
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Upload menu photo
                </Button>
              </motion.div>
              <p className="text-center text-xs text-[#4A6741]/70 font-body">
                  Prefer a demo? Use any menu photo from your camera roll.
                </p>
            </>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
                                <Button
                size="lg"
                onClick={resetState}
                variant="outline"
                className="w-full h-14 rounded-[32px] bg-white/80 backdrop-blur-md border-[#4A6741]/20 text-[#4A6741] text-base font-semibold hover:bg-white/90"
              >
                <X className="mr-2 h-5 w-5" />
                New Scan
                                </Button>
            </motion.div>
                      )}
                    </div>
      </motion.div>
                </div>
  );
}

// Focus Brackets Component
function FocusBrackets() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Top Left */}
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#4A6741]/60 rounded-tl-3xl"
      />
      {/* Top Right */}
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1,
        }}
        className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#4A6741]/60 rounded-tr-3xl"
      />
      {/* Bottom Left */}
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#4A6741]/60 rounded-bl-3xl"
      />
      {/* Bottom Right */}
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
        className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#4A6741]/60 rounded-br-3xl"
      />
    </div>
  );
}

// Glassmorphic Food Card Component
function FoodCard({
  foodItem,
  index,
  onSelect,
  selected,
  details,
  nutritionStatus,
}: {
  foodItem: FoodOption;
  index: number;
  onSelect: () => void;
  selected: boolean;
  details: FoodDetails | null;
  nutritionStatus: NutritionStatus;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (selected && details && nutritionStatus === 'loaded') {
      setIsExpanded(true);
    }
  }, [selected, details, nutritionStatus]);

  // Get dietary violations from either foodItem or details (prefer details if available)
  const dietaryViolations = details?.dietaryViolations || foodItem.dietaryViolations || [];
  const hasViolations = dietaryViolations.length > 0;
  const violationMessage = hasViolations 
    ? `contains ${dietaryViolations.join(', ')}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.95 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden ${
        hasViolations 
          ? 'bg-red-50/90 border-2 border-red-300/50' 
          : 'bg-[#F5F5F0]/90 border border-[#4A6741]/20'
      }`}
    >
      <motion.button
        onClick={() => {
          onSelect();
          if (!isExpanded) setIsExpanded(true);
        }}
        className="w-full p-6 text-left"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className={`text-xl font-headline leading-tight ${
              hasViolations ? 'text-red-700' : 'text-[#4A6741]'
            }`}>
              {foodItem.name}
            </h3>
            {foodItem.isVegan && !hasViolations && (
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-[#4A6741]" />
                <span className="text-xs text-[#4A6741]/70 font-medium">Vegan</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {hasViolations && (
              <div className="text-right">
                <p className="text-xs font-medium text-red-600 italic">
                  {violationMessage}
                </p>
              </div>
            )}
            {nutritionStatus === 'loading' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`w-5 h-5 border-2 rounded-full flex-shrink-0 mt-1 ${
                  hasViolations 
                    ? 'border-red-300 border-t-red-600' 
                    : 'border-[#4A6741]/30 border-t-[#4A6741]'
                }`}
              />
            )}
          </div>
      </div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && details && nutritionStatus === 'loaded' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`overflow-hidden border-t ${
              hasViolations ? 'border-red-200/50' : 'border-[#4A6741]/10'
            }`}
          >
            <div className="p-6 space-y-6">
              {/* Health Rating & Calories */}
              {(details.healthRating !== undefined || details.calories) && (
                <div className="grid grid-cols-2 gap-4">
                  {details.healthRating !== undefined && (
                    <div className="rounded-2xl bg-[#4A6741]/5 p-4 border border-[#4A6741]/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-[#4A6741]" />
                        <p className="text-xs text-[#4A6741]/70 font-medium">Health Rating</p>
                      </div>
                      <p className="text-2xl font-headline text-[#4A6741]">
                        {details.healthRating}/10
                      </p>
                    </div>
                  )}
                  {details.calories && (
                    <div className="rounded-2xl bg-[#C27D5F]/5 p-4 border border-[#C27D5F]/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-4 w-4 text-[#C27D5F]" />
                        <p className="text-xs text-[#C27D5F]/70 font-medium">Calories</p>
                      </div>
                      <p className="text-2xl font-headline text-[#C27D5F]">
                        {details.calories}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Macro Stats */}
              <div className="grid grid-cols-3 gap-4">
                <MacroStat
                  icon={Beef}
                  label="Protein"
                  value={details.protein}
                  color="text-[#4A6741]"
                />
                <MacroStat
                  icon={Wheat}
                  label="Carbs"
                  value={details.carbs}
                  color="text-[#4A6741]"
                />
                <MacroStat
                  icon={FatIcon}
                  label="Fats"
                  value={details.fat}
                  color="text-[#4A6741]"
                />
              </div>

              {/* Allergens */}
              {details.allergens && details.allergens.length > 0 && (
                <div className="pt-2 border-t border-[#4A6741]/10">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-[#C27D5F]" />
                    <p className="text-sm font-medium text-[#4A6741]">Potential Allergens</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {details.allergens.map((allergen, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-3 py-1.5 rounded-full bg-[#C27D5F]/10 text-[#C27D5F] text-xs font-medium border border-[#C27D5F]/20"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {details.ingredients && (
                <div className="pt-2 border-t border-[#4A6741]/10">
                  <p className="text-sm font-medium text-[#4A6741] mb-2">Ingredients</p>
                  <p className="text-sm text-[#4A6741]/70 font-body leading-relaxed">
                    {details.ingredients}
                  </p>
                </div>
              )}

              {/* Gentle Insight Footer */}
              <div className="pt-4 border-t border-[#4A6741]/10">
                <p className="text-sm text-[#4A6741]/80 font-body italic leading-relaxed">
                  {generateGentleInsight(details)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Macro Stat Component
function MacroStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center space-y-2">
      <div className="flex justify-center">
        <div className={`p-2 rounded-2xl bg-[#4A6741]/5 ${color}`}>
          <Icon className="h-5 w-5" />
    </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-[#4A6741]/60 font-medium">{label}</p>
        <p className="text-lg font-semibold text-[#4A6741] font-body">{value}</p>
    </div>
  </div>
);
}
