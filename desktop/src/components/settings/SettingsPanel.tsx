
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, Palette, Shield, Code, Globe, Loader2, Save, Github } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { API_URL } from "@/config";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

export function SettingsPanel() {
  const { user, token, setToken } = useAuth(); // Assuming setToken can trigger re-fetch or we manually re-fetch
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.username || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || "",
      });

      if (user.notificationPreferences) {
        setPreferences((prev) => ({
          ...prev,
          pushNotifications: user.notificationPreferences!.pushNotifications,
          emailNotifications: user.notificationPreferences!.emailAlerts,
          commitAlerts: user.notificationPreferences!.commitActivityAlerts,
        }));
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();

      toast({
        title: "Profile Updated",
        description: "Your profile details have been saved successfully.",
      });

      // Force a reload to reflect changes in Sidebar/Context if setToken doesn't handle it deeply
      window.location.reload();

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    animations: true,
    compactMode: false,
    pushNotifications: false,
    emailNotifications: true,
    commitAlerts: true,
    twoFactor: false,
    activityLog: true,
    sessionManagement: true,
    apiAccess: false,
    webhooks: false,
    betaFeatures: false
  });

  const handleToggle = async (id: string) => {
    const newValue = !preferences[id];
    setPreferences(prev => ({ ...prev, [id]: newValue }));

    // Sync Notification Preferences with Backend
    if (["pushNotifications", "emailNotifications", "commitAlerts"].includes(id)) {
      const payload = {
        notificationPreferences: {
          pushNotifications: id === "pushNotifications" ? newValue : preferences.pushNotifications,
          emailAlerts: id === "emailNotifications" ? newValue : preferences.emailNotifications,
          commitActivityAlerts: id === "commitAlerts" ? newValue : preferences.commitAlerts,
        }
      };

      try {
        await fetch(`${API_URL}/api/user/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        toast({ title: "Saved", description: "Notification preferences updated." });
      } catch (e) {
        toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" });
      }
    } else {
      toast({
        title: "Setting Updated",
        description: "Your preference has been saved locally.",
      });
    }
  };

  const settingsSections = [
    {
      title: "Appearance",
      icon: Palette,
      comingSoon: true,
      settings: [
        { id: "darkMode", label: "Dark Mode", description: "Use dark theme across the application" },
        { id: "animations", label: "Animations", description: "Enable smooth transitions and animations" },
        { id: "compactMode", label: "Compact Mode", description: "Reduce spacing for denser UI" },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      comingSoon: true,
      settings: [
        { id: "pushNotifications", label: "Push Notifications", description: "Receive push notifications" },
        { id: "emailNotifications", label: "Email Notifications", description: "Receive email updates" },
        { id: "commitAlerts", label: "Commit Alerts", description: "Get notified on new commits" },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      comingSoon: true, // Flag
      settings: [
        { id: "twoFactor", label: "Two-Factor Auth", description: "Add extra security layer" },
        { id: "activityLog", label: "Activity Log", description: "Track account activity" },
        { id: "sessionManagement", label: "Session Management", description: "Manage active sessions" },
      ],
    },
    {
      title: "Developer",
      icon: Code,
      comingSoon: true, // Flag
      settings: [
        { id: "apiAccess", label: "API Access", description: "Enable API key generation" },
        { id: "webhooks", label: "Webhooks", description: "Configure webhook endpoints" },
        { id: "betaFeatures", label: "Beta Features", description: "Try experimental features" },
      ],
    },
    {
      title: "GitHub Connection",
      icon: Github,
      customContent: true,
      settings: [],
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Manage your public profile and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                  <AvatarImage src={formData.avatarUrl || user?.avatarUrl} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
                <div className="pt-2">
                  <Button onClick={handleSaveProfile} disabled={isLoading} className="glow-blue">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sectionIndex + 2) * 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="w-5 h-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* @ts-ignore */}
              {section.comingSoon ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-muted/20 border border-dashed rounded-md">
                  <p className="font-semibold text-muted-foreground">Coming Soon</p>
                  <p className="text-xs text-muted-foreground">This feature is currently under development.</p>
                </div>
              ) : section.customContent ? (
                <div className="flex flex-col sm:flex-row items-center justify-between py-2 gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-sm font-medium">Status: {user?.id && user?.onboardingCompleted !== undefined ? "Verified" : "Connected (Verify Needed)"}</p>
                    <p className="text-xs text-muted-foreground">GitHub must be verified to use all features, and re-verified if inactive for 3 days.</p>
                  </div>
                  <Button variant="outline" onClick={() => window.location.href = `${API_URL}/oauth2/authorization/github`} className="gap-2 shrink-0">
                    <Github className="w-4 h-4" />
                    Verify GitHub
                  </Button>
                </div>
              ) : (
                section.settings.map((setting, index) => (
                  <div key={setting.id}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor={setting.id} className="text-sm font-medium">
                          {setting.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                      <Switch
                        id={setting.id}
                        checked={preferences[setting.id]}
                        onCheckedChange={() => handleToggle(setting.id)}
                      />
                    </div>
                    {index < section.settings.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
