import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, Activity, Scan, DollarSign } from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");

  const overviewStats = [
    { label: "Total Revenue", value: "NPR 8.4M", change: "+18.2%", trend: "up" },
    { label: "New Users", value: "1,284", change: "+12.5%", trend: "up" },
    { label: "Total Scans", value: "45,892", change: "+15.3%", trend: "up" },
    { label: "Avg Session", value: "12m 34s", change: "-2.1%", trend: "down" }
  ];

  const userGrowth = [
    { month: "Jan", users: 8420 },
    { month: "Feb", users: 9150 },
    { month: "Mar", users: 10240 },
    { month: "Apr", users: 11680 },
    { month: "May", users: 12458 }
  ];

  const scansByType = [
    { type: "Disease Detection", count: 25640, percentage: 56 },
    { type: "Price Prediction", count: 11350, percentage: 25 },
    { type: "Weather Advisory", count: 6780, percentage: 15 },
    { type: "AI Chatbot", count: 2122, percentage: 4 }
  ];

  const topLocations = [
    { location: "Kathmandu", users: 3245, percentage: 26 },
    { location: "Pokhara", users: 2180, percentage: 17.5 },
    { location: "Chitwan", users: 1890, percentage: 15.2 },
    { location: "Lalitpur", users: 1650, percentage: 13.2 },
    { location: "Rupandehi", users: 1420, percentage: 11.4 }
  ];

  const revenueByMonth = [
    { month: "Jan", revenue: 1200000 },
    { month: "Feb", revenue: 1450000 },
    { month: "Mar", revenue: 1680000 },
    { month: "Apr", revenue: 1920000 },
    { month: "May", revenue: 2150000 }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into platform performance.
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    {stat.value}
                  </p>
                  <Badge
                    variant="secondary"
                    className={stat.trend === "up" ? "text-success" : "text-destructive"}
                  >
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
          </TabsList>

          {/* Usage Analytics Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth Trend</CardTitle>
                  <CardDescription>Monthly active users over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userGrowth.map((data, index) => {
                      const maxUsers = Math.max(...userGrowth.map(d => d.users));
                      const percentage = (data.users / maxUsers) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{data.month} 2024</span>
                            <span className="text-muted-foreground">{data.users.toLocaleString()} users</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Scans by Feature */}
              <Card>
                <CardHeader>
                  <CardTitle>Feature Usage</CardTitle>
                  <CardDescription>Scans by feature type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scansByType.map((scan, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{scan.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{scan.count.toLocaleString()}</span>
                            <Badge variant="outline">{scan.percentage}%</Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary transition-all"
                            style={{ width: `${scan.percentage * 1.5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Pattern</CardTitle>
                <CardDescription>Average user activity throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[35, 28, 42, 56, 68, 82, 95, 88, 76, 65, 58, 48, 52, 62, 71, 78, 72, 58, 45, 38, 42, 48, 40, 32].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-primary rounded-t transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`${index}:00 - ${height}% activity`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue growth over the last 5 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueByMonth.map((data, index) => {
                    const maxRevenue = Math.max(...revenueByMonth.map(d => d.revenue));
                    const percentage = (data.revenue / maxRevenue) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{data.month} 2024</span>
                          <span className="text-muted-foreground">NPR {(data.revenue / 1000000).toFixed(2)}M</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { source: "Premium Subscriptions", amount: 5200000, percentage: 62 },
                      { source: "API Usage", amount: 2100000, percentage: 25 },
                      { source: "Advertisements", amount: 1100000, percentage: 13 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{item.source}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">NPR {(item.amount / 1000000).toFixed(1)}M</span>
                            <Badge variant="outline">{item.percentage}%</Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: "Free to Premium", rate: "18.5%", change: "+2.3%" },
                      { metric: "Trial Conversion", rate: "42.8%", change: "+5.1%" },
                      { metric: "Renewal Rate", rate: "87.3%", change: "+1.8%" },
                      { metric: "Churn Rate", rate: "3.2%", change: "-0.5%" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{item.metric}</p>
                          <p className="text-2xl font-display font-bold text-foreground mt-1">{item.rate}</p>
                        </div>
                        <Badge variant="secondary" className="text-success">
                          {item.change}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users by Location</CardTitle>
                <CardDescription>Top 5 locations with most users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLocations.map((location, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">#{index + 1}</span>
                          <span className="font-medium text-foreground">{location.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{location.users.toLocaleString()} users</span>
                          <Badge variant="outline">{location.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary transition-all"
                          style={{ width: `${location.percentage * 3}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regional Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { region: "Province 1", growth: "+15.2%", users: 2450 },
                      { region: "Province 2", growth: "+22.8%", users: 1890 },
                      { region: "Bagmati", growth: "+18.5%", users: 4200 },
                      { region: "Gandaki", growth: "+12.3%", users: 2180 },
                      { region: "Lumbini", growth: "+19.7%", users: 1650 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{item.region}</p>
                          <p className="text-sm text-muted-foreground">{item.users.toLocaleString()} users</p>
                        </div>
                        <Badge variant="secondary" className="text-success">
                          {item.growth}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Urban vs Rural</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex gap-8">
                        <div>
                          <p className="text-4xl font-display font-bold text-foreground">68%</p>
                          <p className="text-sm text-muted-foreground mt-1">Urban</p>
                        </div>
                        <div>
                          <p className="text-4xl font-display font-bold text-foreground">32%</p>
                          <p className="text-sm text-muted-foreground mt-1">Rural</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                      <div className="bg-gradient-primary" style={{ width: "68%" }} />
                      <div className="bg-secondary" style={{ width: "32%" }} />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      8,458 urban users | 3,999 rural users
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}