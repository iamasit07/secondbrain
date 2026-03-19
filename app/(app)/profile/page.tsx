"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { User, KeyRound, Monitor, Moon, Sun, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // States
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const supabase = createClient();

  // Load user data
  useEffect(() => {
    setMounted(true);
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setName(user.user_metadata?.name || user.user_metadata?.full_name || "");
      }
    };
    loadUser();
  }, [supabase.auth]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: name.trim() }
      });
      
      if (error) throw error;
      toast.success("Profile name updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      toast.success("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences, themes, and security.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the interface theme of your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="w-full flex flex-col gap-2 h-auto py-4 cursor-pointer"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-6 w-6" />
                <span className="text-xs">Light</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="w-full flex flex-col gap-2 h-auto py-4 cursor-pointer"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-6 w-6" />
                <span className="text-xs">Dark</span>
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="w-full flex flex-col gap-2 h-auto py-4 cursor-pointer"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-xs">System</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Identity
            </CardTitle>
            <CardDescription>
              Update your display name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isUpdating || !name.trim()}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Identity
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <KeyRound className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Update your password. This action requires you to be logged in via Email/Password rather than Google OAuth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isUpdating || !password || password !== confirmPassword}
              >
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
