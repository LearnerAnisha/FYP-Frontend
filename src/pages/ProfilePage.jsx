import { useState, useEffect } from "react";
import { fetchProfile, updateProfile, changePassword, deleteAccount } from "@/api/profile";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  User, Camera, Mail, Phone, MapPin, Calendar,
  Save, Bell, Lock, Shield, Trash2, Download, Upload,
  CheckCircle2, AlertCircle, Zap, Sprout, Crown,
  ArrowRight, Star, CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ── Subscription plan data ───────────────────────────────────── */
const plans = [
  {
    id: "free",
    name: "Free",
    icon: Sprout,
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started.",
    highlight: false,
    features: [
      "5 disease scans / month",
      "Basic weather tips",
      "Live market prices",
      "AI chatbot (10 msgs/day)",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    price: { monthly: 499, yearly: 399 },
    description: "For active farmers who need real-time insights.",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited disease scans",
      "Advanced weather analytics",
      "AI price predictions",
      "Unlimited AI chatbot",
      "SMS & email alerts",
      "Chat history & export",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    price: { monthly: 1499, yearly: 1199 },
    description: "For cooperatives and agribusinesses.",
    highlight: false,
    features: [
      "Everything in Pro",
      "Multi-farm management",
      "Custom AI model training",
      "API access",
      "Dedicated account manager",
    ],
  },
];

const comparisonRows = [
  { label: "Disease scans",    values: ["5 / month",   "Unlimited",  "Unlimited"] },
  { label: "AI chatbot",       values: ["10 msgs/day", "Unlimited",  "Unlimited"] },
  { label: "Price predictions",values: ["—",           "✓",          "✓"]         },
  { label: "SMS alerts",       values: ["—",           "✓",          "✓"]         },
  { label: "Chat history",     values: ["—",           "✓",          "✓"]         },
  { label: "API access",       values: ["—",           "—",          "✓"]         },
  { label: "Multi-farm",       values: ["—",           "—",          "✓"]         },
  { label: "Support",          values: ["Email",       "Priority",   "Dedicated"] },
];

const MOCK_CURRENT_PLAN = { id: "free", renewDate: null, billingCycle: null };

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);

  /* ── Profile state ── */
  const [profileData, setProfileData] = useState({
    fullName: "", email: "", phone: "", avatar: null,
    location: "", farmSize: "", cropTypes: "", experience: "",
    bio: "", language: "nepali", joinDate: "", activeDays: 0,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true, smsAlerts: true, diseaseAlerts: true,
    weatherAlerts: true, priceAlerts: false, weeklyReports: true,
  });

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  /* ── Subscription state ── */
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(MOCK_CURRENT_PLAN);
  const [loadingPlan, setLoadingPlan] = useState(null);

  /* ── Load profile ── */
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile();
        setProfileData((prev) => ({
          ...prev,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone || "",
          avatar: data.avatar,
          activeDays: data.active_days || 0,
          joinDate: data.date_joined ? new Date(data.date_joined).toLocaleDateString() : "",
          farmSize: data.farmer_profile?.farm_size || "",
          experience: data.farmer_profile?.experience || "",
          cropTypes: data.farmer_profile?.crop_types || "",
          language: data.farmer_profile?.language || "nepali",
          bio: data.farmer_profile?.bio || "",
        }));
      } catch (err) {
        console.error("Profile load error:", err);
        toast.error("Failed to load profile");
      }
    }
    loadProfile();
  }, []);

  /* ── Handlers ── */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: profileData.fullName,
        phone: profileData.phone,
        farmer_profile: {
          farm_size: profileData.farmSize,
          experience: profileData.experience,
          crop_types: profileData.cropTypes,
          language: profileData.language,
          bio: profileData.bio,
        },
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) { toast.error("New passwords don't match!"); return; }
    setIsLoading(true);
    try {
      await changePassword({ current: passwords.current, new: passwords.new });
      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); toast.success("Notification preferences updated!"); }, 1000);
  };

  const handleExportData = () => toast.success("Preparing your data export... You'll receive an email shortly.");

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      localStorage.clear();
      window.location.href = "/auth";
    } catch { toast.error("Failed to delete account"); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const updated = await updateProfile(formData);
      setProfileData((prev) => ({ ...prev, avatar: updated.avatar }));
      toast.success("Profile picture updated!");
    } catch { toast.error("Avatar upload failed"); }
  };

  /* ── Subscription handlers ── */
  const handleUpgrade = async (planId) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:info@krishisaathi.com?subject=Enterprise Plan Inquiry";
      return;
    }
    if (planId === currentPlan.id) return;
    setLoadingPlan(planId);
    await new Promise((r) => setTimeout(r, 1500));
    setCurrentPlan({
      id: planId,
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      billingCycle: isYearly ? "yearly" : "monthly",
    });
    setLoadingPlan(null);
    toast.success(`Upgraded to ${plans.find((p) => p.id === planId)?.name} plan!`);
  };

  const handleCancelPlan = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setCurrentPlan({ id: "free", renewDate: null, billingCycle: null });
    toast.success("Subscription cancelled. Access retained until billing period ends.");
  };

  /* ── Derived ── */
  const activePlan = plans.find((p) => p.id === currentPlan.id);
  const ActiveIcon = activePlan?.icon || Sprout;

  const avatarSrc = profileData.avatar?.startsWith("http")
    ? profileData.avatar
    : `${import.meta.env.VITE_API_BASE_URL}${profileData.avatar}`;

  const stats = [
    { label: "Total Scans",   value: "156",                    icon: CheckCircle2, color: "text-primary" },
    { label: "Active Days",   value: profileData.activeDays || 0, icon: Calendar  },
    { label: "Saved Reports", value: "24",                     icon: Download,     color: "text-accent"  },
    { label: "Success Rate",  value: "94%",                    icon: CheckCircle2, color: "text-success" },
  ];

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Page header ── */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        {/* ── Profile header card ── */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20 overflow-hidden">
                  <AvatarImage src={avatarSrc} alt="Profile" className="object-cover w-full h-full" />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-primary-foreground">
                    {profileData.fullName
                      ? profileData.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-smooth">
                  <Camera className="w-4 h-4" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">{profileData.fullName}</h2>
                <p className="text-muted-foreground mb-3">Farmer • Member since {profileData.joinDate}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{profileData.location}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{profileData.experience} years experience
                  </Badge>
                  {/* Show current plan badge */}
                  <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20">
                    <ActiveIcon className="w-3 h-3" />{activePlan?.name} Plan
                  </Badge>
                </div>
              </div>

              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Stats ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TABS — General · Notifications · Security · Privacy · Subscription
        ══════════════════════════════════════════════════════════ */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Subscription
            </TabsTrigger>
          </TabsList>

          {/* ── General ── */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and farm information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">Farm Size (Hectares)</Label>
                      <Input id="farmSize" type="number" step="0.1" value={profileData.farmSize}
                        onChange={(e) => setProfileData({ ...profileData, farmSize: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Farming Experience (Years)</Label>
                      <Input id="experience" type="number" value={profileData.experience}
                        onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cropTypes">Primary Crops</Label>
                    <Input id="cropTypes" placeholder="e.g., Rice, Wheat, Maize" value={profileData.cropTypes}
                      onChange={(e) => setProfileData({ ...profileData, cropTypes: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={profileData.language} onValueChange={(v) => setProfileData({ ...profileData, language: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nepali">Nepali (नेपाली)</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi (हिन्दी)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" rows={4} placeholder="Tell us about your farming journey..."
                      value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline">Cancel</Button>
                    <Button type="submit" disabled={isLoading} className="bg-gradient-primary text-primary-foreground">
                      {isLoading ? <><span className="animate-spin mr-2">○</span>Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notifications ── */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive updates and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { id: "emailNotifications", label: "Email Notifications",        sub: "Receive updates and alerts via email"              },
                    { id: "smsAlerts",          label: "SMS Alerts",                 sub: "Get important alerts via text message"             },
                    { id: "diseaseAlerts",      label: "Disease Detection Alerts",   sub: "Notifications when diseases are detected"          },
                    { id: "weatherAlerts",      label: "Weather Alerts",             sub: "Updates on weather changes affecting your crops"   },
                    { id: "priceAlerts",        label: "Price Alerts",               sub: "Market price updates and predictions"              },
                    { id: "weeklyReports",      label: "Weekly Reports",             sub: "Summary of your farming activities"                },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-0.5">
                        <Label htmlFor={item.id} className="text-base font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.sub}</p>
                      </div>
                      <Switch id={item.id} checked={notifications[item.id]}
                        onCheckedChange={(c) => setNotifications({ ...notifications, [item.id]: c })} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleNotificationUpdate} disabled={isLoading} className="bg-gradient-primary text-primary-foreground">
                    {isLoading ? <><span className="animate-spin mr-2">○</span>Saving...</> : <><Bell className="w-4 h-4 mr-2" />Save Preferences</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Security ── */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required />
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="bg-gradient-primary text-primary-foreground">
                      {isLoading ? <><span className="animate-spin mr-2">○</span>Updating...</> : <><Lock className="w-4 h-4 mr-2" />Update Password</>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-5 h-5" />Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Two-factor authentication adds an additional layer of security by requiring more than just a password to sign in.
                </p>
                <Button variant="outline"><Shield className="w-4 h-4 mr-2" />Enable 2FA</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Privacy ── */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      <Download className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Download Your Data</h4>
                        <p className="text-sm text-muted-foreground mb-3">Download a copy of all your data including scans, reports, and preferences.</p>
                        <Button variant="outline" onClick={handleExportData}><Download className="w-4 h-4 mr-2" />Request Data Export</Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      <Upload className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Import Data</h4>
                        <p className="text-sm text-muted-foreground mb-3">Import your farming data from other platforms or backups.</p>
                        <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import Data</Button>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Delete Account</h4>
                        <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Delete Account</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                                Yes, Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              SUBSCRIPTION TAB — new
          ══════════════════════════════════════════════════════════ */}
          <TabsContent value="subscription" className="space-y-6">

            {/* Current plan banner */}
            <Card className={`border-2 ${currentPlan.id !== "free" ? "border-primary/40 bg-primary/5" : "border-border"}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    currentPlan.id !== "free" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <ActiveIcon className="w-7 h-7" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-display font-bold text-foreground">{activePlan?.name} Plan</h2>
                      <Badge
                        className={currentPlan.id !== "free" ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground"}
                        variant="outline"
                      >
                        {currentPlan.id === "free" ? "Current" : "Active"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan.renewDate
                        ? `Renews on ${currentPlan.renewDate} · ${currentPlan.billingCycle === "yearly" ? "Annual" : "Monthly"} billing`
                        : "No active subscription — using the free tier."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {currentPlan.id !== "free" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                            Cancel Plan
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You'll keep access until your current billing period ends, then be downgraded to the Free plan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelPlan} className="bg-destructive text-destructive-foreground">
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Button variant="outline" size="sm" className="gap-1">
                      <CreditCard className="w-4 h-4" />Billing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing toggle + plan cards */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground">Available Plans</h3>
              <div className="inline-flex items-center gap-2 bg-muted rounded-xl p-1.5">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">20% off</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const price = isYearly ? plan.price.yearly : plan.price.monthly;
                const isActive = plan.id === currentPlan.id;
                const isLoadingThis = loadingPlan === plan.id;

                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col transition-smooth ${
                      isActive
                        ? "border-primary shadow-lg ring-2 ring-primary/30"
                        : plan.highlight
                        ? "border-primary/40 ring-2 ring-primary/15 shadow-md"
                        : "border-border hover:border-primary/30 hover:shadow-elegant"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow flex items-center gap-1">
                          <Star className="w-3 h-3" />Current Plan
                        </span>
                      </div>
                    )}
                    {plan.badge && !isActive && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <CardHeader className="pt-8 pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive || plan.highlight ? "bg-primary" : "bg-primary/10"
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive || plan.highlight ? "text-primary-foreground" : "text-primary"}`} />
                        </div>
                        <CardTitle className="text-lg font-display">{plan.name}</CardTitle>
                      </div>
                      <div className="mb-1">
                        {price === 0 ? (
                          <span className="text-3xl font-display font-bold text-foreground">Free</span>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs text-muted-foreground">NPR</span>
                            <span className="text-3xl font-display font-bold text-foreground">{price}</span>
                            <span className="text-xs text-muted-foreground">/ mo</span>
                          </div>
                        )}
                      </div>
                      <CardDescription className="text-xs">{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 pb-6">
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full gap-2 ${
                          isActive ? "bg-primary/10 text-primary border border-primary/30 cursor-default"
                            : plan.highlight ? "bg-gradient-primary text-primary-foreground hover:opacity-90" : ""
                        }`}
                        variant={isActive ? "ghost" : plan.highlight ? "default" : "outline"}
                        disabled={isActive || isLoadingThis}
                        onClick={() => !isActive && handleUpgrade(plan.id)}
                      >
                        {isLoadingThis ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : isActive ? (
                          <><CheckCircle2 className="w-4 h-4" />Current Plan</>
                        ) : plan.id === "enterprise" ? "Contact Sales" : (
                          <>Upgrade<ArrowRight className="w-4 h-4" /></>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Comparison table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Comparison</CardTitle>
                <CardDescription>See what's included in each plan at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-6 font-semibold text-foreground w-2/5">Feature</th>
                      {plans.map((p) => (
                        <th key={p.id} className={`text-center py-3 px-4 font-semibold ${p.id === currentPlan.id ? "text-primary" : "text-foreground"}`}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row) => (
                      <tr key={row.label} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-6 text-muted-foreground">{row.label}</td>
                        {row.values.map((val, i) => (
                          <td key={i} className={`text-center py-3 px-4 ${plans[i].id === currentPlan.id ? "font-semibold text-primary" : "text-foreground"}`}>
                            {val === "✓" ? <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                              : val === "—" ? <span className="text-muted-foreground/40">—</span>
                              : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Billing note */}
            <Card className="bg-muted/30">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Questions about billing?</p>
                    <p className="text-sm text-muted-foreground">
                      All plans are billed in NPR. Cancel anytime and retain access until end of billing period.
                      For refunds or payment issues, contact{" "}
                      <a href="mailto:info@krishisaathi.com" className="text-primary underline underline-offset-2">
                        info@krishisaathi.com
                      </a>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}