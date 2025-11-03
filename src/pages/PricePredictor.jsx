import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  BarChart3,
  AlertCircle
} from "lucide-react";

export default function PricePredictor() {
  const [selectedCrop, setSelectedCrop] = useState("tomato");

  // Mock price data
  const priceData = {
    tomato: {
      current: 85,
      previous: 78,
      change: 8.97,
      prediction: [
        { date: "Week 1", price: 88, confidence: 85 },
        { date: "Week 2", price: 92, confidence: 80 },
        { date: "Week 3", price: 95, confidence: 75 },
        { date: "Week 4", price: 90, confidence: 70 }
      ],
      trend: "up",
      recommendation: "Consider selling in Week 3 when prices are expected to peak at NPR 95/kg.",
      factors: [
        "Seasonal demand increasing",
        "Supply slightly constrained",
        "Festival season approaching"
      ]
    },
    potato: {
      current: 45,
      previous: 50,
      change: -10.0,
      prediction: [
        { date: "Week 1", price: 43, confidence: 88 },
        { date: "Week 2", price: 42, confidence: 85 },
        { date: "Week 3", price: 44, confidence: 78 },
        { date: "Week 4", price: 46, confidence: 72 }
      ],
      trend: "down",
      recommendation: "Prices expected to decline. Consider holding stock until Week 4.",
      factors: [
        "High supply from recent harvest",
        "Storage costs increasing",
        "Import competition present"
      ]
    },
    rice: {
      current: 65,
      previous: 64,
      change: 1.56,
      prediction: [
        { date: "Week 1", price: 66, confidence: 90 },
        { date: "Week 2", price: 67, confidence: 88 },
        { date: "Week 3", price: 68, confidence: 85 },
        { date: "Week 4", price: 69, confidence: 82 }
      ],
      trend: "up",
      recommendation: "Stable upward trend. Good time to sell gradually over next 2 weeks.",
      factors: [
        "Steady demand",
        "Limited new supply",
        "Government procurement active"
      ]
    }
  };

  const marketData = [
    { crop: "Tomato", price: 85, change: 8.97, trend: "up", volume: "2,450 kg" },
    { crop: "Potato", price: 45, change: -10.0, trend: "down", volume: "5,200 kg" },
    { crop: "Rice", price: 65, change: 1.56, trend: "up", volume: "8,900 kg" },
    { crop: "Wheat", price: 48, change: -2.04, trend: "down", volume: "4,100 kg" },
    { crop: "Onion", price: 72, change: 12.5, trend: "up", volume: "3,300 kg" },
    { crop: "Cauliflower", price: 55, change: 5.77, trend: "up", volume: "1,800 kg" }
  ];

  const currentData = priceData[selectedCrop];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Price Predictor
          </h1>
          <p className="text-muted-foreground">
            Real-time market prices and AI-powered predictions to help you sell at the right time.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's Avg Price", value: "NPR 68", icon: DollarSign, color: "text-primary" },
            { label: "Market Trend", value: "Bullish", icon: TrendingUp, color: "text-success" },
            { label: "Active Markets", value: "24", icon: BarChart3, color: "text-chart-4" },
            { label: "Last Updated", value: "2 hrs ago", icon: Calendar, color: "text-muted-foreground" }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
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

        <Tabs defaultValue="predictor" className="space-y-6">
          <TabsList>
            <TabsTrigger value="predictor">Price Predictor</TabsTrigger>
            <TabsTrigger value="market">Live Market</TabsTrigger>
          </TabsList>

          {/* Price Predictor Tab */}
          <TabsContent value="predictor" className="space-y-6">
            {/* Crop Selection */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2 max-w-xs">
                  <label className="text-sm font-medium text-foreground">Select Crop</label>
                  <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tomato">Tomato</SelectItem>
                      <SelectItem value="potato">Potato</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Current Price */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Current Market Price</CardTitle>
                <CardDescription>Kalimati Fruit and Vegetable Market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Price per kg</p>
                    <div className="flex items-end gap-3">
                      <p className="text-4xl sm:text-5xl font-display font-bold text-foreground">
                        NPR {currentData.current}
                      </p>
                      <Badge
                        variant={currentData.trend === "up" ? "secondary" : "destructive"}
                        className="mb-2"
                      >
                        {currentData.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(currentData.change)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Previous: NPR {currentData.previous}/kg
                    </p>
                  </div>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    currentData.trend === "up" ? "bg-success/10" : "bg-destructive/10"
                  }`}>
                    {currentData.trend === "up" ? (
                      <TrendingUp className="w-10 h-10 text-success" />
                    ) : (
                      <TrendingDown className="w-10 h-10 text-destructive" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  4-Week Price Forecast
                </CardTitle>
                <CardDescription>
                  AI-powered predictions based on historical data and market trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prediction Chart */}
                <div className="space-y-3">
                  {currentData.prediction.map((pred, index) => {
                    const percentage = (pred.price / 100) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{pred.date}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">NPR {pred.price}</span>
                            <Badge variant="outline" className="text-xs">
                              {pred.confidence}% confidence
                            </Badge>
                          </div>
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

                {/* Recommendation */}
                <Card className="bg-gradient-hero border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">AI Recommendation</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {currentData.recommendation}
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">Key Factors:</p>
                          {currentData.factors.map((factor, index) => (
                            <p key={index} className="text-xs text-muted-foreground">• {factor}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Market Tab */}
          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Market Prices</CardTitle>
                <CardDescription>Real-time prices from Kalimati Market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-smooth"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.trend === "up" ? "bg-success/10" : "bg-destructive/10"
                        }`}>
                          {item.trend === "up" ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.crop}</p>
                          <p className="text-sm text-muted-foreground">Volume: {item.volume}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-display font-bold text-foreground">
                          NPR {item.price}
                        </p>
                        <Badge
                          variant={item.trend === "up" ? "secondary" : "destructive"}
                          className="mt-1"
                        >
                          {item.trend === "up" ? "+" : ""}{item.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}