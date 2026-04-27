import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  Scan, CloudRain, TrendingUp, MessageSquare,
  ArrowRight, AlertCircle, CheckCircle, Clock,
  Leaf, Info
} from "lucide-react";
import { fetchProfile } from "@/api/profile";
import { getDashboardStats } from "@/api/dashboard";

// Maps activity type → icon + colour
const ACTIVITY_ICON_MAP = {
  success: { Icon: CheckCircle, color: "text-green-500" },
  warning: { Icon: AlertCircle, color: "text-yellow-500" },
  info: { Icon: Info, color: "text-blue-500" },
};

const quickActions = [
  { title: "Detect Disease", description: "Upload crop images for instant analysis", icon: Scan, color: "text-primary", bgColor: "bg-primary/10", route: "/disease-detection" },
  { title: "Check Weather", description: "Get irrigation recommendations", icon: CloudRain, color: "text-chart-4", bgColor: "bg-chart-4/10", route: "/weather-irrigation" },
  { title: "View Prices", description: "See market trends and predictions", icon: TrendingUp, color: "text-accent", bgColor: "bg-accent/10", route: "/price-predictor" },
  { title: "Ask AI", description: "Chat with your agricultural assistant", icon: MessageSquare, color: "text-chart-5", bgColor: "bg-chart-5/10", route: "/chatbot" },
];

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-lg bg-muted/50 animate-pulse">
      <Skeleton className="w-5 h-5 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [profile, dashData] = await Promise.all([
          fetchProfile(),
          getDashboardStats(),
        ]);
        setUserName(profile.full_name?.split(" ")[0] || "");
        setStats(dashData.stats);
        setRecent(dashData.recent_activity);
      } catch (err) {
        console.error("Dashboard load failed", err);
        setError("Could not load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            {loading
              ? <Skeleton className="h-9 w-64 inline-block" />
              : <>Welcome back{userName ? `, ${userName}` : ""}!</>
            }
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your farm today.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            : stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                    <Badge
                      variant="secondary"
                      className={stat.change.startsWith("+") ? "text-green-600" : "text-muted-foreground"}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-elegant transition-smooth hover:border-primary/50"
                  onClick={() => navigate(action.route)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Tip */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest farming activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
                  : recentActivity.length === 0
                    ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No activity yet. Start by scanning a crop or asking the AI assistant!
                      </p>
                    )
                    : recentActivity.map((activity, index) => {
                      const { Icon, color } = ACTIVITY_ICON_MAP[activity.type] ?? ACTIVITY_ICON_MAP.info;
                      return (
                        <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/50">
                          <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-hero border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                Today's Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Monitor crops for early signs of pests to prevent yield loss.
                Regular scanning helps catch diseases before they spread.
              </p>
              <Button variant="outline" onClick={() => navigate("/chatbot")}>
                Learn More
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}