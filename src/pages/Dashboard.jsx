import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Scan,
  CloudRain,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Leaf
} from "lucide-react";
import { saveCityFromLocation } from "@/utils/locationToCity";
import { fetchProfile } from "@/api/profile";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Ask for location only once
        const city = localStorage.getItem("user_city");
        if (!city) {
          await saveCityFromLocation();
        }

        // Fetch user profile from backend
        const profile = await fetchProfile();

        // Extract first name
        const firstName = profile.full_name?.split(" ")[0] || "";
        setUserName(firstName);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    }

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Detect Disease",
      description: "Upload crop images for instant analysis",
      icon: Scan,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/disease-detection"
    },
    {
      title: "Check Weather",
      description: "Get irrigation recommendations",
      icon: CloudRain,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      route: "/weather-irrigation"
    },
    {
      title: "View Prices",
      description: "See market trends and predictions",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
      route: "/price-predictor"
    },
    {
      title: "Ask AI",
      description: "Chat with your agricultural assistant",
      icon: MessageSquare,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
      route: "/chatbot"
    }
  ];

  const recentActivities = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Disease Detection Completed",
      description: "Rice leaf analyzed - No disease detected",
      time: "2 hours ago"
    },
    {
      type: "warning",
      icon: AlertCircle,
      title: "Irrigation Alert",
      description: "Heavy rain expected - Delay watering",
      time: "5 hours ago"
    },
    {
      type: "info",
      icon: TrendingUp,
      title: "Price Update",
      description: "Tomato prices increased by 15%",
      time: "1 day ago"
    }
  ];

  const stats = [
    { label: "Scans This Month", value: "24", change: "+12%" },
    { label: "Healthy Crops", value: "18", change: "+5%" },
    { label: "Alerts Received", value: "8", change: "-3%" },
    { label: "Average Yield", value: "85%", change: "+8%" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Welcome back{userName ? `, ${userName}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your farm today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    {stat.value}
                  </p>
                  <Badge
                    variant="secondary"
                    className={stat.change.startsWith("+") ? "text-success" : "text-muted-foreground"}
                  >
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
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
                      <h3 className="font-display font-semibold text-foreground mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
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
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/50">
                      <Icon className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  );
                })}
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