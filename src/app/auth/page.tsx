"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { Divide } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [authError, setAuthError] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        router.push("/app");
      }
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword);

    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setAuthError(error.message);
      } else {
        // You might want to show a message to check their email for confirmation
        alert("Check your email for the confirmation link!");
        router.push("/app");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/60 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            NutriScan
          </div>
          <h1 className="text-3xl font-headline text-foreground">Sign in to keep eating with ease</h1>
          <p className="text-muted-foreground">Warm, honest nutrition guidance for every menu.</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/90 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.45)]">
          <div className="p-8">
            {authError && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {authError}
              </div>
            )}
            <Tabs
              defaultValue="signin"
              className="w-full"
              onValueChange={(value) => {
                setActiveTab(value as "signin" | "signup");
                setAuthError("");
              }}
            >
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-lg">
                <TabsTrigger value="signin" className="rounded-md">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-md">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleEmailSignIn} className="space-y-5 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="email-signin" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email-signin"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateEmail(e.target.value);
                        }}
                        className="rounded-lg border-border/60 focus:border-primary h-11"
                      />
                      {emailError && <p className="text-destructive text-xs mt-1">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signin" className="text-sm font-medium">Password</Label>
                      <Input
                        id="password-signin"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validatePassword(e.target.value);
                        }}
                        className="rounded-lg border-border/60 focus:border-primary h-11"
                      />
                      {passwordError && <p className="text-destructive text-xs mt-1">{passwordError}</p>}
                    </div>
                    <Button type="submit" className="w-full rounded-lg h-11 font-medium">
                      Sign In
                    </Button>
                  </form>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/40" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg h-11 font-medium"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>
                </motion.div>
              </TabsContent>
              <TabsContent value="signup">
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleEmailSignUp} className="space-y-5 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="email-signup" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateEmail(e.target.value);
                        }}
                        className="rounded-lg border-border/60 focus:border-primary h-11"
                      />
                      {emailError && <p className="text-destructive text-xs mt-1">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup" className="text-sm font-medium">Password</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validatePassword(e.target.value);
                          validateConfirmPassword(e.target.value, confirmPassword);
                        }}
                        className="rounded-lg border-border/60 focus:border-primary h-11"
                      />
                      {passwordError && <p className="text-destructive text-xs mt-1">{passwordError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password-signup" className="text-sm font-medium">Confirm Password</Label>
                      <Input
                        id="confirm-password-signup"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          validateConfirmPassword(password, e.target.value);
                        }}
                        className="rounded-lg border-border/60 focus:border-primary h-11"
                      />
                      {confirmPasswordError && <p className="text-destructive text-xs mt-1">{confirmPasswordError}</p>}
                    </div>
                    <Button type="submit" className="w-full rounded-lg h-11 font-medium">
                      Sign Up
                    </Button>
                  </form>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/40" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg h-11 font-medium"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
