import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

// Icons
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

// API
import { getMarketPrices, getMarketAnalysis } from "@/api/market";


/* 
   STATIC AI PREDICTION DATA (Only "current" price replaced with real value)
*/
const basePredictionData = {
  tomato: {
    previous: 78,
    change: 8.97,
    trend: "up",
    prediction: [
      { date: "Week 1", price: 88, confidence: 85 },
      { date: "Week 2", price: 92, confidence: 80 },
      { date: "Week 3", price: 95, confidence: 75 },
      { date: "Week 4", price: 90, confidence: 70 }
    ],
    recommendation: "Sell in Week 3 when prices peak.",
    factors: ["Seasonal demand", "Supply constraints", "Festival effect"]
  },

  potato: {
    previous: 50,
    change: -10,
    trend: "down",
    prediction: [
      { date: "Week 1", price: 43, confidence: 88 },
      { date: "Week 2", price: 42, confidence: 85 },
      { date: "Week 3", price: 44, confidence: 78 },
      { date: "Week 4", price: 46, confidence: 72 }
    ],
    recommendation: "Hold until Week 4 due to expected recovery.",
    factors: ["High supply", "Storage cost issues", "Imports rising"]
  },

  rice: {
    previous: 64,
    change: 1.56,
    trend: "up",
    prediction: [
      { date: "Week 1", price: 66, confidence: 90 },
      { date: "Week 2", price: 67, confidence: 88 },
      { date: "Week 3", price: 68, confidence: 85 },
      { date: "Week 4", price: 69, confidence: 82 }
    ],
    recommendation: "Stable upward trend — sell gradually.",
    factors: ["Steady demand", "Limited supply", "Govt procurement"]
  }
};



/* 
   MAIN COMPONENT
*/

export default function PricePredictor() {
  const [selectedCrop, setSelectedCrop] = useState("tomato");

  const [prices, setPrices] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /* 
     FETCH TODAY'S PRICES + ANALYSIS DATA
  */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const priceList = await getMarketPrices();
        const analysisData = await getMarketAnalysis();

        setPrices(priceList);
        setAnalysis(analysisData);

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load market data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);



  /* 
     MATCH SELECTED CROP TO REAL MARKET PRICE
  */
  const NAME_MATCH = {
    tomato: ["Tomato", "Tomato Small", "Tomato Big", "Tomato Local"],
    potato: ["Potato", "Potato Red", "Potato White"],
    rice: ["Rice", "Mansuli", "Jeera", "Masino"]
  };

  const getSelectedRealPrice = () => {
    if (!analysis) return null;

    const names = NAME_MATCH[selectedCrop];

    return (
      analysis.changes.find(change =>
        names.some(n =>
          change.commodity.toLowerCase().includes(n.toLowerCase())
        )
      ) || null
    );
  };

  const selectedReal = getSelectedRealPrice();

  const mergedCurrentData = {
    ...basePredictionData[selectedCrop],
    current: selectedReal ? selectedReal.today : basePredictionData[selectedCrop].previous
  };



  /* 
     LIVE MARKET TABLE DATA
  */
  const marketRows =
    analysis?.changes?.map(item => ({
      name: item.commodity,
      price: item.today,
      change: item.change_percentage,
      trend: item.trend,
      unit: "kg"
    })) || [];



  /* 
     RENDER UI
   */
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Price Predictor</h1>
          <p className="text-muted-foreground">
            Real-time Kalimati prices with AI-powered insights.
          </p>
        </div>


        {/* LOADING / ERROR */}
        {loading && (
          <Card><CardContent className="p-4">Loading market data…</CardContent></Card>
        )}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}


        {/* QUICK STATS */}
        {analysis && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              // Today's average price (using only commodities with comparison data)
              {
                label: "Today's Avg Price",
                value: (() => {
                  const items = analysis.changes;
                  if (!items?.length) return "N/A";
                  const avg =
                    items.reduce((sum, item) => sum + item.today, 0) /
                    items.length;
                  return `NPR ${avg.toFixed(2)}`;
                })(),
                icon: DollarSign
              },
              {
                label: "Market Trend",
                value: analysis.market_trend,
                icon: TrendingUp
              },
              {
                label: "Active Commodities",
                value: analysis.changes.length,
                icon: BarChart3
              },
              {
                label: "Today's Date",
                value: analysis.today,
                icon: Calendar
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8 text-primary" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}


        {/* TABS (LIVE MARKET FIRST) */}
        <Tabs defaultValue="market">
          <TabsList>
            <TabsTrigger value="market">Live Market</TabsTrigger>
            <TabsTrigger value="predictor">Price Predictor</TabsTrigger>
          </TabsList>



          {/*
              LIVE MARKET TAB
           */}
          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Market Prices</CardTitle>
                <CardDescription>Real-time Kalimati Prices</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {marketRows.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between p-4 rounded-lg bg-muted/50"
                    >
                      {/* Left side */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.trend === "up"
                              ? "bg-success/10"
                              : "bg-destructive/10"
                            }`}
                        >
                          {item.trend === "up" ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Unit: {item.unit}</p>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="text-right">
                        <p className="text-xl font-bold">NPR {item.price}</p>
                        <Badge
                          variant={
                            item.trend === "up" ? "secondary" : "destructive"
                          }
                        >
                          {item.trend === "up" ? "+" : ""}
                          {item.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/*
              PRICE PREDICTOR TAB
          */}
          <TabsContent value="predictor" className="space-y-6">

            {/* CROP SELECTOR */}
            <Card>
              <CardContent className="p-6 max-w-xs space-y-2">
                <label className="text-sm font-medium">Select Crop</label>

                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tomato">Tomato</SelectItem>
                    <SelectItem value="potato">Potato</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>



            {/* CURRENT PRICE DISPLAY */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Current Market Price</CardTitle>
                <CardDescription>Kalimati Market (Live Data)</CardDescription>
              </CardHeader>

              <CardContent>
                {selectedReal ? (
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground">Price per kg</p>

                      <div className="flex items-end gap-3">
                        <p className="text-5xl font-bold">NPR {selectedReal.today}</p>

                        <Badge
                          variant={selectedReal.trend === "up" ? "secondary" : "destructive"}
                          className="mb-2"
                        >
                          {selectedReal.trend === "up" ? (
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                          )}
                          {selectedReal.change_percentage}%
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Yesterday: NPR {selectedReal.yesterday}
                      </p>
                    </div>

                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center ${selectedReal.trend === "up"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                        }`}
                    >
                      {selectedReal.trend === "up" ? (
                        <TrendingUp className="w-10 h-10 text-success" />
                      ) : (
                        <TrendingDown className="w-10 h-10 text-destructive" />
                      )}
                    </div>
                  </div>
                ) : (
                  <p>No market data found for selected crop.</p>
                )}
              </CardContent>
            </Card>



            {/* 4-WEEK AI PREDICTION */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  4-Week Price Forecast
                </CardTitle>
                <CardDescription>AI-based prediction</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {mergedCurrentData.prediction.map((p, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{p.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">NPR {p.price}</span>
                        <Badge variant="outline">{p.confidence}% confidence</Badge>
                      </div>
                    </div>

                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary"
                        style={{ width: `${p.price}%` }}
                      />
                    </div>
                  </div>
                ))}

                <Card className="bg-gradient-hero border-primary/20">
                  <CardContent className="p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">AI Recommendation</h4>
                      <p className="text-sm mb-2">{mergedCurrentData.recommendation}</p>

                      <div className="space-y-1 text-xs">
                        <p className="font-medium">Key Factors:</p>
                        {mergedCurrentData.factors.map((f, i) => (
                          <p key={i}>• {f}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}