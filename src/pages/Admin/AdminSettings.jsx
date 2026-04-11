import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  Moon,
  Sun,
  LogOut,
  RefreshCw,
  Users,
  CreditCard,
  MessageSquare,
  Leaf,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDarkMode } from "@/hooks/useDarkMode";
import { adminLogout, getDashboardStats } from "@/api/admin";

const InfoItem = ({ label, value }) => (
  <div className="rounded-lg border border-border p-4">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-medium text-foreground">{value || "-"}</p>
  </div>
);

export default function AdminSettings() {
  const { isDark, toggleDark } = useDarkMode();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin settings stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const overview = stats?.overview || {};
  const subscriptions = stats?.subscriptions || {};
  const chatbot = stats?.chatbot || {};
  const disease = stats?.disease_detection || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage appearance, session settings, and admin account information.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Admin Profile</CardTitle>
            <CardDescription>Current signed-in administrator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">
                  {adminUser?.full_name || "Admin User"}
                </h2>
                <p className="text-sm text-muted-foreground">{adminUser?.email || "No email"}</p>
              </div>
              <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary hover:bg-primary/10">
                Admin
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem label="Staff access" value={adminUser?.is_staff ? "Enabled" : "Disabled"} />
              <InfoItem label="Superuser access" value={adminUser?.is_superuser ? "Enabled" : "Disabled"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Appearance</CardTitle>
            <CardDescription>Match the user panel theme system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-foreground">Current theme</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isDark ? "Dark mode enabled" : "Light mode enabled"}
              </p>
            </div>

            <Button onClick={toggleDark} className="w-full">
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Switch to Dark Mode
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Platform Snapshot</CardTitle>
            <CardDescription>Live admin overview</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">Loading snapshot...</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Users</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {overview.total_users || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-chart-5" />
                    <span className="text-sm text-muted-foreground">Subscriptions</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {subscriptions.total || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-chart-4" />
                    <span className="text-sm text-muted-foreground">Conversations</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {chatbot.total_conversations || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4 text-success" />
                    <span className="text-sm text-muted-foreground">Disease Scans</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {disease.total_scans || 0}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <Button variant="outline" onClick={loadStats}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Snapshot
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Session Actions</CardTitle>
            <CardDescription>Admin session and security controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-foreground">Active session</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your admin access token is stored locally for authenticated requests.
              </p>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-foreground">Security note</p>
              <p className="text-sm text-muted-foreground mt-1">
                Use logout after admin tasks, especially on shared devices.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={adminLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout from Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}