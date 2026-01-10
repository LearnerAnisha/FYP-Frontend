import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Upload, Mail, Bell, Shield, Database, Globe } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Krishi Saathi",
    siteDescription: "AI-Powered Agricultural Assistant for Nepalese Farmers",
    supportEmail: "support@krishisaathi.com",
    adminEmail: "admin@krishisaathi.com",
    maintenanceMode: false,
    userRegistration: true,
    emailVerification: true,
    twoFactorAuth: false,
    apiRateLimit: "1000",
    maxUploadSize: "10",
    sessionTimeout: "60",
    language: "nepali",
    timezone: "Asia/Kathmandu"
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success("Settings saved successfully!");
    }, 1500);
  };

  const handleTestEmail = () => {
    toast.info("Sending test email...");
    setTimeout(() => {
      toast.success("Test email sent successfully!");
    }, 2000);
  };

  const handleBackup = () => {
    toast.info("Creating database backup...");
    setTimeout(() => {
      toast.success("Backup created successfully!");
    }, 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Configure platform settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Basic information about your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      rows={3}
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Default Language</Label>
                      <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nepali">Nepali</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kathmandu">Asia/Kathmandu (NPT)</SelectItem>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenance" className="text-base font-medium cursor-pointer">
                          Maintenance Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Temporarily disable user access for maintenance
                        </p>
                      </div>
                      <Switch
                        id="maintenance"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="registration" className="text-base font-medium cursor-pointer">
                          User Registration
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow new users to create accounts
                        </p>
                      </div>
                      <Switch
                        id="registration"
                        checked={settings.userRegistration}
                        onCheckedChange={(checked) => setSettings({ ...settings, userRegistration: checked })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="bg-gradient-primary text-primary-foreground">
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">○</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure email settings for notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new users
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailVerification}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailVerification: checked })}
                  />
                </div>
                <div className="flex justify-between items-center pt-4">
                  <Button type="button" variant="outline" onClick={handleTestEmail}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test Email
                  </Button>
                  <Button type="button" onClick={handleSave} className="bg-gradient-primary text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and authentication options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={handleSave} className="bg-gradient-primary text-primary-foreground">
                    <Shield className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Manage API settings and rate limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings({ ...settings, apiRateLimit: e.target.value })}
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-base font-medium">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value="sk_live_••••••••••••••••••••••••••••"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={handleSave} className="bg-gradient-primary text-primary-foreground">
                    <Globe className="w-4 h-4 mr-2" />
                    Save API Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Backup</CardTitle>
                <CardDescription>Create and manage database backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 rounded-lg border border-border text-center space-y-4">
                  <Database className="w-12 h-12 mx-auto text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Last Backup</h4>
                    <p className="text-sm text-muted-foreground">May 15, 2024 at 2:30 AM</p>
                  </div>
                  <Button onClick={handleBackup} className="bg-gradient-primary text-primary-foreground">
                    <Database className="w-4 h-4 mr-2" />
                    Create Backup Now
                  </Button>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Recent Backups</h4>
                  {[
                    { date: "May 15, 2024", size: "2.4 GB", status: "success" },
                    { date: "May 14, 2024", size: "2.3 GB", status: "success" },
                    { date: "May 13, 2024", size: "2.2 GB", status: "success" }
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-foreground">{backup.date}</p>
                        <p className="text-sm text-muted-foreground">{backup.size}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload className="w-3 h-3 mr-2" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}