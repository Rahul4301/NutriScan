'use client';

import { useState, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id?: string;
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  dietary_restrictions?: string[] | null;
  allergens?: string[] | null;
  dietary_preferences?: string | null;
}

interface ProfileDropdownProps {
  user: SupabaseUser;
}

const COMMON_DIETARY_RESTRICTIONS = [
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Sodium',
  'Halal',
  'Kosher',
];

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish',
  'Sesame',
];

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user.id,
    email: user.email || undefined,
  });
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (profileOpen) {
      loadProfile();
    }
  }, [profileOpen, user.id]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - that's okay for new users
        throw error;
      }

      if (data) {
        setProfile(data);
        setSelectedRestrictions(data.dietary_restrictions || []);
        setSelectedAllergens(data.allergens || []);
      } else {
        // Initialize with user email if no profile exists
        setProfile({
          user_id: user.id,
          email: user.email || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        email: profile.email || user.email || null,
        phone: profile.phone || null,
        dietary_restrictions: selectedRestrictions.length > 0 ? selectedRestrictions : null,
        allergens: selectedAllergens.length > 0 ? selectedAllergens : null,
        dietary_preferences: profile.dietary_preferences || null,
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
      setProfileOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const getInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full bg-white/20 backdrop-blur-md border border-[#4A6741]/10 text-[#4A6741] hover:bg-white/30"
          >
            <Avatar className="h-full w-full">
              <AvatarFallback className="bg-[#4A6741]/20 text-[#4A6741] text-xs font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md border border-[#4A6741]/10">
          <DropdownMenuItem onClick={() => { setProfileOpen(true); setOpen(false); }}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#F5F5F0] border-[#4A6741]/20">
          <DialogHeader>
            <DialogTitle className="text-[#4A6741]">Profile Settings</DialogTitle>
            <DialogDescription>
              Update your basic information and dietary preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#4A6741]">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-[#4A6741]">First Name</Label>
                  <Input
                    id="first-name"
                    value={profile.first_name || ''}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Enter first name"
                    className="bg-white border-[#4A6741]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-[#4A6741]">Last Name</Label>
                  <Input
                    id="last-name"
                    value={profile.last_name || ''}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Enter last name"
                    className="bg-white border-[#4A6741]/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#4A6741]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Enter email"
                    className="bg-white border-[#4A6741]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#4A6741]">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="bg-white border-[#4A6741]/20"
                  />
                </div>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#4A6741]">Dietary Restrictions</h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_DIETARY_RESTRICTIONS.map((restriction) => (
                  <button
                    key={restriction}
                    type="button"
                    onClick={() => toggleRestriction(restriction)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedRestrictions.includes(restriction)
                        ? 'bg-[#4A6741] text-white'
                        : 'bg-white border border-[#4A6741]/30 text-[#4A6741] hover:bg-[#4A6741]/10'
                    }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#4A6741]">Allergens</h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGENS.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedAllergens.includes(allergen)
                        ? 'bg-[#C27D5F] text-white'
                        : 'bg-white border border-[#C27D5F]/30 text-[#C27D5F] hover:bg-[#C27D5F]/10'
                    }`}
                  >
                    {allergen}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Dietary Preferences */}
            <div className="space-y-2">
              <Label htmlFor="dietary-preferences" className="text-[#4A6741]">
                Additional Dietary Preferences
              </Label>
              <Textarea
                id="dietary-preferences"
                value={profile.dietary_preferences || ''}
                onChange={(e) => setProfile({ ...profile, dietary_preferences: e.target.value })}
                placeholder="Add any additional dietary information or preferences..."
                className="bg-white border-[#4A6741]/20 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProfileOpen(false)}
              className="border-[#4A6741]/20 text-[#4A6741] hover:bg-[#4A6741]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#4A6741] text-white hover:bg-[#4A6741]/90"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
