import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useMemo } from "react";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedCrop, setSelectedCrop] = useState("tomato");

  const [prices, setPrices] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const [error, setError] = useState(null);

  //Live Market controls
  const [liveSearch, setLiveSearch] = useState("");

  //Master Product controls
  const [productSearch, setProductSearch] = useState("");
  const [productOrdering, setProductOrdering] = useState("");

  useEffect(() => {
    if (productSearch.trim().length < 2) {
      setDebouncedSearch("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(productSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [productSearch]);

  /* 
     FETCH TODAY'S PRICES + ANALYSIS DATA
  */
  useEffect(() => {
    async function loadLiveMarket() {
      try {
        setAnalysisLoading(true);
        const analysisData = await getMarketAnalysis();
        setAnalysis(analysisData);
      } catch {
        setError("Failed to load live market data");
      } finally {
        setAnalysisLoading(false);
      }
    }

    loadLiveMarket();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const params = {};

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch;
        }

        if (productOrdering) {
          params.ordering = productOrdering;
        }

        setProductsLoading(prev => prev)

        const data = await getMarketPrices(params, controller.signal);
        setPrices(data);
        setError(null);
      } catch (err) {
        // Ignore aborted requests
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError("Failed to load products");
        }
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();

    //  Cancel previous request when effect re-runs
    return () => controller.abort();
  }, [debouncedSearch, productOrdering]);

  // MATCH SELECTED CROP TO REAL MARKET PRICE
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

  // LIVE MARKET TABLE DATA
  const marketRows =
    analysis?.changes?.map(item => ({
      name: item.commodity,
      price: item.today,
      change: item.change_percentage,
      trend: item.trend,
      unit: "kg"
    })) || [];

  const filteredLiveMarket = marketRows.filter(item =>
    item.name.toLowerCase().includes(liveSearch.toLowerCase())
  );

  // RENDER UI
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
            <TabsTrigger value="latest">Master Product</TabsTrigger>
            <TabsTrigger value="predictor">Price Predictor</TabsTrigger>
          </TabsList>

          {/* LIVE MARKET TAB */}
          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Live Market Prices</CardTitle>
                  <CardDescription>Real-time Kalimati Prices</CardDescription>
                </div>

                <input
                  type="text"
                  placeholder="Search commodity…"
                  value={liveSearch}
                  onChange={(e) => setLiveSearch(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-full sm:w-60"
                />
              </CardHeader>

              <CardContent>
                {filteredLiveMarket.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No market data found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredLiveMarket.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between
                                  p-4 rounded-lg
                                  bg-muted/50
                                  hover:bg-muted
                                  transition-all duration-200
                                  hover:shadow-md
                                  hover:scale-[1.01]
                                  cursor-pointer"
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
                            <p className="text-sm text-muted-foreground">
                              Unit: {item.unit}
                            </p>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="text-right">
                          <p className="text-xl font-bold">NPR {item.price}</p>
                          <Badge
                            variant={item.trend === "up" ? "secondary" : "destructive"}
                          >
                            {item.trend === "up" ? "+" : ""}
                            {item.change}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

            </Card>
          </TabsContent>

          {/*  MASTER PRODUCT TAB */}
          <TabsContent value="latest">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* LEFT: Title + description */}
                <div>
                  <CardTitle>Latest Market Prices</CardTitle>
                  <CardDescription>
                    Complete commodity snapshot (Master Product data)
                  </CardDescription>
                </div>

                {/* RIGHT: Search + Sort (same row) */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search commodity…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm w-full sm:w-60"
                  />

                  <Select onValueChange={setProductOrdering}>
                    <SelectTrigger className="w-full sm:w-56">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="last_price">Price ↑ (Low → High)</SelectItem>
                      <SelectItem value="-last_price">Price ↓ (High → Low)</SelectItem>

                      <SelectItem value="commodityname">Name A → Z</SelectItem>
                      <SelectItem value="-commodityname">Name Z → A</SelectItem>
                    </SelectContent>
                  </Select>

                </div>
              </CardHeader>

              <CardContent className="space-y-4 relative">

                {/* LOADING (only initial load, prevents flicker while typing) */}
                {productsLoading && (
                  <p className="absolute top-3 right-4 text-xs text-muted-foreground animate-pulse">
                    Updating results…
                  </p>
                )}

                {/* EMPTY STATE */}
                {!productsLoading && prices.length === 0 && debouncedSearch.trim() && (
                  <div className="text-center text-muted-foreground py-10">
                    No products found matching your search.
                  </div>
                )}

                {/* PRODUCT LIST */}
                {prices.length > 0 && prices.map((item, idx) => (
                  <div
                    key={item.id ?? item.commodityname}
                    className="
                                group
                                  rounded-lg
                                  px-4 py-3
                                  bg-muted/40
                                  hover:bg-muted/60
                                  transition-all duration-200
                                  hover:shadow-md
                                  hover:scale-[1.01]
                                  cursor-pointer
                                "
                  >
                    {/* TOP ROW */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-primary" />
                        </div>

                        <div>
                          <p className="font-medium leading-tight">
                            {item.commodityname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unit: {item.commodityunit || "kg"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          NPR {item.last_price ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last price
                        </p>
                      </div>
                    </div>

                    {/* PRICE ROW (KEEP ALL VALUES) */}
                    <div className="mt-2 flex flex-wrap justify-between text-sm">
                      <span className="text-muted-foreground">
                        Min: <strong className="text-foreground">NPR {item.min_price ?? "—"}</strong>
                      </span>

                      <span className="text-muted-foreground">
                        Max: <strong className="text-foreground">NPR {item.max_price ?? "—"}</strong>
                      </span>

                      <span className="text-muted-foreground">
                        Avg: <strong className="text-foreground">NPR {item.avg_price ?? "—"}</strong>
                      </span>

                      <span className="text-muted-foreground">
                        Updated: <strong className="text-foreground">{item.last_update}</strong>
                      </span>
                    </div>
                  </div>
                ))}

              </CardContent>

            </Card>
          </TabsContent>

          {/*
              PRICE PREDICTOR TAB
          */}
          <TabsContent value="predictor" className="space-y-6">

            {/* SEARCH */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                  </div>

                  <input
                    type="text"
                    placeholder="Search crops, regions, or reports…"
                    className="
            w-full h-11 rounded-lg
            bg-muted/40 border border-border/50
            pl-11 pr-4 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30
          "
                  />
                </div>
              </CardContent>
            </Card>

            {/* MARKET STYLE HEADER — AI CARD STYLE */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/15 flex items-center justify-center">
                      <span className="text-lg">🍅</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="capitalize">
                          {selectedCrop} (Big)
                        </CardTitle>
                        <Badge variant="secondary">In Season</Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        Kalimati Market • Updated {analysis?.today}
                      </p>
                    </div>
                  </div>

                  {selectedReal && (
                    <div className="text-right">
                      <p className="text-3xl font-bold">
                        Rs {selectedReal.today}
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "} / kg
                        </span>
                      </p>

                      <p
                        className={`text-xs ${selectedReal.trend === "up"
                          ? "text-success"
                          : "text-destructive"
                          }`}
                      >
                        {selectedReal.trend === "up" ? "↗" : "↘"}{" "}
                        {selectedReal.change_percentage}% since yesterday
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Today</p>
                    <p className="text-lg font-semibold">
                      Rs {selectedReal?.today ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                    <p className="text-lg font-semibold">
                      Rs {selectedReal?.yesterday ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">7-Day Avg</p>
                    <p className="text-lg font-semibold">
                      Rs {mergedCurrentData.previous}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Monthly Avg</p>
                    <p className="text-lg font-semibold">
                      Rs {(mergedCurrentData.previous * 0.9).toFixed(1)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3 text-success">
                    <p className="text-xs text-muted-foreground">Highest (30D)</p>
                    <p className="text-lg font-semibold">
                      Rs {Math.max(...mergedCurrentData.prediction.map(p => p.price))}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3 text-destructive">
                    <p className="text-xs text-muted-foreground">Lowest (30D)</p>
                    <p className="text-lg font-semibold">
                      Rs {Math.min(...mergedCurrentData.prediction.map(p => p.price))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* INNER TABS */}
            <Tabs defaultValue="forecast">
              <TabsList>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
                <TabsTrigger value="historical">Historical</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="forecast">
                <Card>
                  <CardHeader>
                    <CardTitle>4-Week Price Forecast</CardTitle>
                    <CardDescription>
                      AI-powered predictions with confidence bands
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="h-56 flex items-end justify-between px-6">
                      {mergedCurrentData.prediction.map((p, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-foreground" />
                          <span className="text-sm font-medium">Rs {p.price}</span>
                          <span className="text-xs text-muted-foreground">
                            {p.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historical">
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Price Trend</CardTitle>
                    <CardDescription>
                      5-month price movement analysis
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="h-56 flex items-end justify-between px-6">
                      {["Jan", "Feb", "Mar", "Apr", "May"].map((m, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-foreground" />
                          <span className="text-xs text-muted-foreground">{m}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Forecast Confidence Analysis
                    </CardTitle>
                    <CardDescription>
                      Prediction reliability over time horizons
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {mergedCurrentData.prediction.map((p, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>{p.date}</span>
                          <Badge variant="secondary">{p.confidence}%</Badge>
                        </div>

                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${p.confidence}%` }}
                          />
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Predicted: Rs {p.price}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>

            {/* 3️⃣ AI PRICE FORECAST — MATCHES THIRD SCREENSHOT */}
            <Card>
              <CardHeader>
                <CardTitle>AI Price Forecast</CardTitle>
              </CardHeader>

              <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Tomorrow", price: 66.5, change: 2.3 },
                  { label: "7 Days", price: 72.0, change: 10.7 },
                  { label: "14 Days", price: 75.0, change: 15.3 },
                  { label: "30 Days", price: 68.0, change: -3.2 }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-muted/40 p-4 hover:bg-muted transition"
                  >
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">NPR {item.price}</p>
                    <p
                      className={`text-sm ${item.change >= 0 ? "text-success" : "text-destructive"
                        }`}
                    >
                      {item.change >= 0 ? "+" : ""}
                      {item.change}%
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}