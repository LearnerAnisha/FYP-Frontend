import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  AlertCircle,
  Loader2,
  BrainCircuit,
  RefreshCw,
} from "lucide-react";

import {
  getMarketPrices,
  getMarketAnalysis,
  getForecast,
} from "@/api/market";


import { getCropHistory } from "@/api/market";

/* ERROR BANNER */
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs font-medium underline underline-offset-2 hover:no-underline"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}

/* INLINE LOADER */
function InlineLoader({ text = "Loading…", className = "h-56" }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-muted-foreground text-sm ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      {text}
    </div>
  );
}

/* NO FORECAST STATE */
function NoForecastState({ commodity }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
        <BrainCircuit className="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-base">No AI forecast available</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          {commodity
            ? `"${commodity}" hasn't been trained yet. Ask your admin to run POST /api/market_forecast/retrain/ for this commodity.`
            : "Select a commodity to see its AI-powered price forecast."}
        </p>
      </div>
    </div>
  );
}

/* LINE CHART */
function LineChart({ historicalData = [], forecastData = [], loading = false, error = null }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const W = 700;
  const H = 200;
  const PAD = { top: 16, right: 20, bottom: 32, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allPoints = useMemo(() => {
    const hist = historicalData.map((d) => ({ ...d, type: "historical" }));
    const fore = forecastData.map((d) => ({
      date: d.date,
      avg_price: d.predicted_price,
      lower: d.lower_bound,
      upper: d.upper_bound,
      confidence: d.confidence,
      type: "forecast",
    }));
    return [...hist, ...fore];
  }, [historicalData, forecastData]);

  // Compute scales — must be stable hooks, not computed inside conditional blocks
  const { minP, maxP } = useMemo(() => {
    const prices = allPoints.map((d) => d.avg_price).filter(Boolean);
    const lowers = forecastData.map((d) => d.lower_bound).filter(Boolean);
    const uppers = forecastData.map((d) => d.upper_bound).filter(Boolean);
    const all = [...prices, ...lowers, ...uppers];
    if (!all.length) return { minP: 0, maxP: 100 };
    return {
      minP: Math.min(...all) * 0.96,
      maxP: Math.max(...all) * 1.04,
    };
  }, [allPoints, forecastData]);

  const xScale = useCallback(
    (i) => PAD.left + (i / Math.max(allPoints.length - 1, 1)) * chartW,
    [allPoints.length, chartW]
  );

  const yScale = useCallback(
    (v) => PAD.top + chartH - ((v - minP) / (maxP - minP || 1)) * chartH,
    [minP, maxP, chartH]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!svgRef.current || allPoints.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * W;
      const i = Math.round(((svgX - PAD.left) / chartW) * (allPoints.length - 1));
      const idx = Math.max(0, Math.min(allPoints.length - 1, i));
      const pt = allPoints[idx];
      if (!pt) return;
      setTooltip({
        x: xScale(idx),
        y: yScale(pt.avg_price),
        label: pt.date,
        value: pt.avg_price,
        type: pt.type,
        confidence: pt.confidence,
      });
    },
    [allPoints, xScale, yScale, chartW]
  );


  if (loading) return <InlineLoader text="Loading chart…" />;

  if (error) {
    return (
      <div className="h-56 flex items-center justify-center">
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (allPoints.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
        No data to display.
      </div>
    );
  }

  const histPoints = allPoints.filter((d) => d.type === "historical");
  const forePoints = allPoints.filter((d) => d.type === "forecast");
  const foreStartIdx = histPoints.length;

  const toPath = (pts, startIdx) =>
    pts
      .map((d, i) => {
        const x = xScale(startIdx + i);
        const y = yScale(d.avg_price);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const histPath = toPath(histPoints, 0);

  const forePath =
    forePoints.length > 0 && histPoints.length > 0
      ? `M ${xScale(foreStartIdx - 1).toFixed(1)} ${yScale(
        histPoints[histPoints.length - 1]?.avg_price
      ).toFixed(1)} ` + toPath(forePoints, foreStartIdx)
      : forePoints.length > 0
        ? toPath(forePoints, foreStartIdx)
        : "";

  const bandPath =
    forePoints.length > 1
      ? [
        forePoints
          .map((d, i) => {
            const x = xScale(foreStartIdx + i);
            const y = yScale(d.upper ?? d.avg_price * 1.05);
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" "),
        forePoints
          .slice()
          .reverse()
          .map((d, i) => {
            const x = xScale(foreStartIdx + forePoints.length - 1 - i);
            const y = yScale(d.lower ?? d.avg_price * 0.95);
            return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" "),
        "Z",
      ].join(" ")
      : "";

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(minP + ((maxP - minP) / yTicks) * i)
  );

  const labelIndices = [
    0,
    Math.floor(allPoints.length * 0.25),
    Math.floor(allPoints.length * 0.5),
    Math.floor(allPoints.length * 0.75),
    allPoints.length - 1,
  ].filter((v, i, arr) => v < allPoints.length && arr.indexOf(v) === i);

  return (
    <div className="relative w-full" onMouseLeave={() => setTooltip(null)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        style={{ cursor: "crosshair" }}
      >
        {yTickValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left} x2={PAD.left + chartW}
              y1={yScale(v)} y2={yScale(v)}
              stroke="currentColor" strokeOpacity={0.08} strokeWidth={1}
            />
            <text
              x={PAD.left - 6} y={yScale(v)}
              textAnchor="end" dominantBaseline="central"
              fontSize={10} fill="currentColor" opacity={0.5}
            >
              {v}
            </text>
          </g>
        ))}

        {labelIndices.map((idx) => (
          <text
            key={idx} x={xScale(idx)} y={H - 6}
            textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.45}
          >
            {allPoints[idx]?.date?.slice(5)}
          </text>
        ))}

        {forePoints.length > 0 && histPoints.length > 0 && (
          <line
            x1={xScale(foreStartIdx - 1)} x2={xScale(foreStartIdx - 1)}
            y1={PAD.top} y2={PAD.top + chartH}
            stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 3"
          />
        )}

        {bandPath && (
          <path d={bandPath} fill="hsl(var(--primary))" fillOpacity={0.08} />
        )}

        {histPath && (
          <path
            d={histPath} fill="none"
            stroke="hsl(var(--foreground))" strokeWidth={1.8}
            strokeLinecap="round" strokeLinejoin="round" opacity={0.85}
          />
        )}

        {forePath && (
          <path
            d={forePath} fill="none"
            stroke="hsl(var(--primary))" strokeWidth={2}
            strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round"
          />
        )}

        {tooltip && (
          <circle
            cx={tooltip.x} cy={tooltip.y} r={4}
            fill={tooltip.type === "forecast" ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
            stroke="hsl(var(--background))" strokeWidth={2}
          />
        )}
      </svg>

      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-popover border border-border rounded-lg shadow-md px-3 py-2 text-xs min-w-[130px]"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / H) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <p className="font-semibold text-foreground">{tooltip.label}</p>
          <p className="text-muted-foreground">
            Rs{" "}
            <span className="text-foreground font-medium">
              {tooltip.value?.toFixed(1)}
            </span>{" "}
            / kg
          </p>
          {tooltip.type === "forecast" && tooltip.confidence && (
            <p className="text-primary mt-0.5">{tooltip.confidence}% confidence</p>
          )}
          <Badge
            variant={tooltip.type === "forecast" ? "default" : "secondary"}
            className="mt-1 text-[10px] px-1.5 py-0"
          >
            {tooltip.type === "forecast" ? "AI Forecast" : "Historical"}
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-5 mt-2 px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-px bg-foreground opacity-80 rounded" />
          Historical
        </span>
        {forePoints.length > 0 && (
          <>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-5"
                style={{ borderTop: "2px dashed hsl(var(--primary))", height: 0, display: "inline-block" }}
              />
              Forecast
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm opacity-20"
                style={{ background: "hsl(var(--primary))" }}
              />
              Confidence band
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* MAIN COMPONENT */
export default function PricePredictor() {
  /* Live market */
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState(null);
  const [liveSearch, setLiveSearch] = useState("");

  /* Master Product (for commodity dropdown + Master Product tab) */
  const [prices, setPrices] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [productOrdering, setProductOrdering] = useState("");

  const CACHE_DURATION = 5 * 60 * 1000;

  /* Predictor tab */
  const [selectedCrop, setSelectedCrop] = useState("");

  // Per-crop history (fetched from history-last-month/:commodity)
  const [cropHistory, setCropHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyRetry, setHistoryRetry] = useState(0);

  // AI Forecast
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);
  const [forecastRetry, setForecastRetry] = useState(0);

  /* DEBOUNCE product search */
  useEffect(() => {
    if (productSearch.trim().length < 2) {
      setDebouncedSearch("");
      return;
    }
    const t = setTimeout(() => setDebouncedSearch(productSearch), 400);
    return () => clearTimeout(t);
  }, [productSearch]);

  /* FETCH — market analysis */
  const loadAnalysis = useCallback(async () => {
    const cacheKey = "marketAnalysis";
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);

        if (Date.now() - timestamp < CACHE_DURATION) {
          setAnalysis(data);
          setAnalysisLoading(false);
          return;
        }
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    }

    try {
      setAnalysisLoading(true);
      setAnalysisError(null);
      const data = await getMarketAnalysis();
      setAnalysis(data);

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      const msg =
        err?.response?.status === 400
          ? "Not enough historical data yet."
          : err?.response?.data?.error?.message ??
          err?.message ??
          "Failed to load market analysis.";
      setAnalysisError(msg);
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  useEffect(() => { loadAnalysis(); }, [loadAnalysis]);

  /* FETCH — master product prices (used for both the tab AND the commodity dropdown) */
  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = `marketPrices_${debouncedSearch}_${productOrdering}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);

        if (Date.now() - timestamp < CACHE_DURATION) {
          setPrices(data);
          setProductsLoading(false);
          return;
        }
      } catch {
        sessionStorage.removeItem(cacheKey); // corrupted cache safety
      }
    }

    async function load() {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const params = {};
        if (debouncedSearch.trim()) params.search = debouncedSearch;
        if (productOrdering) params.ordering = productOrdering;
        const data = await getMarketPrices(params, controller.signal);
        const list = Array.isArray(data) ? data : data.results ?? [];
        setPrices(list);

        // store with timestamp
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: list,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setProductsError(
            err?.response?.data?.detail ??
            err?.message ??
            "Failed to load products."
          );
        }
      } finally {
        setProductsLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [debouncedSearch, productOrdering]);

  /* FETCH — per-crop 30-day history (only when a crop is selected) ══
     Uses LastMonthHistoryView: GET /api/market/history-last-month/:commodity/
     This is fast because it's filtered server-side, not the full history dump.
   */
  useEffect(() => {
    if (!selectedCrop) return;
    const cacheKey = `cropHistory_${selectedCrop}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setCropHistory(JSON.parse(cached));
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        setHistoryLoading(true);
        setHistoryError(null);
        const data = await getCropHistory(selectedCrop);
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data.results ?? [];
        // Normalise field names: DailyPriceHistorySerializer uses product_name + avg_price + date
        const normalised = list
          .map((d) => ({ ...d, date: d.date, avg_price: d.avg_price }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setCropHistory(normalised);
        sessionStorage.setItem(cacheKey, JSON.stringify(normalised));
      } catch (err) {
        if (!cancelled) {
          setHistoryError(err?.message ?? "Failed to load commodity history.");
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedCrop, historyRetry]);

  /* FETCH — AI forecast */
  const loadForecast = useCallback(async () => {
    if (!selectedCrop) return;
    const cacheKey = `forecast_${selectedCrop}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      if (cached === "NOT_TRAINED") {
        setForecastData(null);
        setForecastError("not_trained");
      } else {
        setForecastData(JSON.parse(cached));
        setForecastError(null);
      }
      setForecastLoading(false);
      return;
    }
    try {
      setForecastLoading(true);
      setForecastError(null);
      setForecastData(null);
      const data = await getForecast(selectedCrop, 28, "ensemble");
      if (data.status === "not_trained") {
        setForecastData(null);
        setForecastError("not_trained");
        sessionStorage.setItem(cacheKey, "NOT_TRAINED");
        return;
      }
      setForecastData(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      const httpStatus = err?.response?.status;
      if (httpStatus === 404) {
        setForecastError("not_trained");
        sessionStorage.setItem(cacheKey, "NOT_TRAINED");
      } else {
        const msg =
          err?.response?.data?.error?.message ?? err?.message ?? "Forecast request failed.";
        setForecastError(msg);
      }
      setForecastData(null);
    } finally {
      setForecastLoading(false);
    }
  }, [selectedCrop, forecastRetry]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadForecast(); }, [loadForecast]);

  /* DERIVED DATA */

  // Commodity options come from MasterProduct — already loaded, instant
  const commodityOptions = useMemo(
    () => prices.map((p) => p.commodityname).sort(),
    [prices]
  );

  // Match selectedCrop to live analysis data
  const selectedReal = useMemo(() => {
    if (!analysis?.changes || !selectedCrop) return null;
    return (
      analysis.changes.find(
        (c) =>
          c.commodity.toLowerCase().includes(selectedCrop.toLowerCase()) ||
          selectedCrop.toLowerCase().includes(c.commodity.toLowerCase())
      ) || null
    );
  }, [analysis, selectedCrop]);

  // Weekly forecast buckets
  const weeklyForecast = useMemo(() => {
    if (!forecastData?.forecast) return [];
    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    return [0, 1, 2, 3]
      .map((w) => {
        const slice = forecastData.forecast.slice(w * 7, w * 7 + 7);
        if (!slice.length) return null;
        return {
          date: `Week ${w + 1}`,
          price: Math.round(avg(slice.map((d) => d.predicted_price)) * 10) / 10,
          confidence: Math.round(avg(slice.map((d) => d.confidence ?? 80))),
        };
      })
      .filter(Boolean);
  }, [forecastData]);

  // AI tiles: tomorrow, 7d, 14d, 30d
  const aiForecastTiles = useMemo(() => {
    if (!forecastData?.forecast) return [];
    const f = forecastData.forecast;
    const todayPrice =
      selectedReal?.today ?? cropHistory[cropHistory.length - 1]?.avg_price ?? 0;
    const pct = (price) =>
      todayPrice > 0 ? Math.round(((price - todayPrice) / todayPrice) * 1000) / 10 : 0;
    return [
      { label: "Tomorrow", item: f[0] },
      { label: "7 Days", item: f[6] },
      { label: "14 Days", item: f[13] },
      { label: "30 Days", item: f[27] ?? f[f.length - 1] },
    ]
      .filter((t) => t.item)
      .map((t) => ({
        label: t.label,
        price: t.item.predicted_price,
        change: pct(t.item.predicted_price),
      }));
  }, [forecastData, selectedReal, cropHistory]);

  const sevenDayAvg = useMemo(() => {
    const last7 = cropHistory.slice(-7);
    if (!last7.length) return null;
    return Math.round((last7.reduce((s, d) => s + d.avg_price, 0) / last7.length) * 10) / 10;
  }, [cropHistory]);

  const monthlyAvg = useMemo(() => {
    if (!cropHistory.length) return null;
    return Math.round((cropHistory.reduce((s, d) => s + d.avg_price, 0) / cropHistory.length) * 10) / 10;
  }, [cropHistory]);

  const forecastHighest = forecastData?.forecast?.length
    ? Math.max(...forecastData.forecast.map((d) => d.predicted_price))
    : null;
  const forecastLowest = forecastData?.forecast?.length
    ? Math.min(...forecastData.forecast.map((d) => d.predicted_price))
    : null;

  const historicalMonths = useMemo(() => {
    const byMonth = {};
    cropHistory.forEach(({ date, avg_price }) => {
      const label = new Date(date).toLocaleString("default", { month: "short" });
      if (!byMonth[label]) byMonth[label] = [];
      byMonth[label].push(avg_price);
    });
    return Object.entries(byMonth).map(([month, ps]) => ({
      month,
      avgPrice: Math.round((ps.reduce((s, p) => s + p, 0) / ps.length) * 10) / 10,
    }));
  }, [cropHistory]);

  const filteredLiveMarket = useMemo(() => {
    const rows =
      analysis?.changes?.map((item) => ({
        name: item.commodity,
        price: item.today,
        change: item.change_percentage,
        trend: item.trend,
        unit: "kg",
      })) ?? [];
    return rows.filter((item) =>
      item.name.toLowerCase().includes(liveSearch.toLowerCase())
    );
  }, [analysis, liveSearch]);

  const forecastNotTrained = forecastError === "not_trained";
  const forecastGenericError = forecastError && forecastError !== "not_trained" ? forecastError : null;

  /* RENDER */
  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Price Predictor</h1>
          <p className="text-muted-foreground">
            Real-time Kalimati prices with AI-powered insights.
          </p>
        </div>

        {analysisError && (
          <ErrorBanner
            message={`Market analysis: ${analysisError}`}
            onRetry={() => {
              sessionStorage.removeItem("marketAnalysis");
              loadAnalysis();
            }}
          />
        )}

        {/* QUICK STATS */}
        {analysis && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Today's Avg Price",
                value: (() => {
                  const items = analysis.changes;
                  if (!items?.length) return "N/A";
                  const avg = items.reduce((s, i) => s + i.today, 0) / items.length;
                  return `NPR ${avg.toFixed(2)}`;
                })(),
                icon: DollarSign,
              },
              { label: "Market Trend", value: analysis.market_trend, icon: TrendingUp },
              { label: "Active Commodities", value: analysis.changes.length, icon: BarChart3 },
              { label: "Today's Date", value: analysis.today, icon: Calendar },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i}>
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

        {analysisLoading && !analysis && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
                {analysisLoading ? (
                  <InlineLoader text="Loading market prices…" className="h-32" />
                ) : analysisError ? (
                  <ErrorBanner
                    message={analysisError}
                    onRetry={() => { sessionStorage.removeItem("marketAnalysis"); loadAnalysis(); }}
                  />
                ) : filteredLiveMarket.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {liveSearch ? `No results for "${liveSearch}".` : "No market data found."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredLiveMarket.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.trend === "up" ? "bg-success/10" : "bg-destructive/10"}`}>
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
                        <div className="text-right">
                          <p className="text-xl font-bold">NPR {item.price}</p>
                          <Badge variant={item.trend === "up" ? "secondary" : "destructive"}>
                            {item.trend === "up" ? "+" : ""}{item.change}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MASTER PRODUCT TAB */}
          <TabsContent value="latest">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Latest Market Prices</CardTitle>
                  <CardDescription>Complete commodity snapshot (Master Product data)</CardDescription>
                </div>
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
              <CardContent className="space-y-4 relative min-h-[80px]">
                {productsError && <ErrorBanner message={productsError} />}
                {productsLoading && !productsError && (
                  <p className="absolute top-3 right-4 text-xs text-muted-foreground animate-pulse">
                    Updating results…
                  </p>
                )}
                {!productsLoading && !productsError && prices.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">
                    {debouncedSearch.trim()
                      ? `No products found matching "${debouncedSearch}".`
                      : "No products available."}
                  </div>
                )}
                {prices.map((item) => (
                  <div
                    key={item.id ?? item.commodityname}
                    className="group rounded-lg px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{item.commodityname}</p>
                          <p className="text-xs text-muted-foreground">Unit: {item.commodityunit || "kg"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">NPR {item.last_price ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">Last price</p>
                      </div>
                    </div>
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

          {/* PRICE PREDICTOR TAB */}
          <TabsContent value="predictor" className="space-y-6">

            {historyError && (
              <ErrorBanner
                message={`History: ${historyError}`}
                onRetry={() => { sessionStorage.removeItem(`cropHistory_${selectedCrop}`); setHistoryRetry((n) => n + 1); }}
              />
            )}

            {/* COMMODITY SELECTOR — from MasterProduct (instant) */}
            <Card>
              <CardContent className="p-4">
                <Select
                  value={selectedCrop}
                  onValueChange={(val) => {
                    setSelectedCrop(val);
                    setCropHistory([]);
                    setForecastData(null);
                    setForecastError(null);
                    sessionStorage.removeItem(`forecast_${val}`);
                    // Don't remove crop history cache — keep it for revisits
                  }}
                >
                  <SelectTrigger className="w-full h-11 rounded-lg bg-muted/40 border-border/50 focus:ring-2 focus:ring-primary/30">
                    <SelectValue placeholder="Select a commodity to forecast…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 overflow-y-auto">
                    {productsLoading ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading commodities…
                      </div>
                    ) : commodityOptions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No commodities found
                      </div>
                    ) : (
                      commodityOptions.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedCrop && (
              <>
                {/* COMMODITY HEADER CARD */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-destructive/15 flex items-center justify-center">
                          <span className="text-lg">🌾</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="capitalize">{selectedCrop}</CardTitle>
                            <Badge variant="secondary">
                              {selectedReal ? "Live" : "Historical"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Kalimati Market · Updated {analysis?.today ?? "—"}
                          </p>
                        </div>
                      </div>
                      {selectedReal && (
                        <div className="text-right">
                          <p className="text-3xl font-bold">
                            Rs {selectedReal.today}
                            <span className="text-sm font-normal text-muted-foreground"> / kg</span>
                          </p>
                          <p className={`text-xs ${selectedReal.trend === "up" ? "text-success" : "text-destructive"}`}>
                            {selectedReal.trend === "up" ? "↗" : "↘"} {selectedReal.change_percentage}% since yesterday
                          </p>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {[
                        { label: "Today", value: selectedReal?.today ? `Rs ${selectedReal.today}` : "—" },
                        { label: "Yesterday", value: selectedReal?.yesterday ? `Rs ${selectedReal.yesterday}` : "—" },
                        { label: "7-Day Avg", value: sevenDayAvg ? `Rs ${sevenDayAvg}` : "—" },
                        { label: "Monthly Avg", value: monthlyAvg ? `Rs ${monthlyAvg}` : "—" },
                        {
                          label: "Highest (Forecast)",
                          value: forecastHighest ? `Rs ${forecastHighest.toFixed(1)}` : "—",
                          className: "text-success",
                        },
                        {
                          label: "Lowest (Forecast)",
                          value: forecastLowest ? `Rs ${forecastLowest.toFixed(1)}` : "—",
                          className: "text-destructive",
                        },
                      ].map((tile, i) => (
                        <div key={i} className={`rounded-lg bg-muted/40 p-3 ${tile.className ?? ""}`}>
                          <p className="text-xs text-muted-foreground">{tile.label}</p>
                          <p className="text-lg font-semibold">{tile.value}</p>
                        </div>
                      ))}
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

                  {/* FORECAST TAB */}
                  <TabsContent value="forecast">
                    <Card>
                      <CardHeader>
                        <CardTitle>4-Week Price Forecast</CardTitle>
                        <CardDescription>
                          {forecastNotTrained
                            ? "Historical data available · AI forecast not yet trained for this commodity"
                            : "AI-powered predictions with confidence bands · hover to inspect"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Always show history chart if available */}
                        {(historyLoading || cropHistory.length > 0) && (
                          <LineChart
                            historicalData={cropHistory}
                            forecastData={forecastNotTrained ? [] : (forecastData?.forecast ?? [])}
                            loading={historyLoading}
                            error={historyError}
                          />
                        )}

                        {/* Forecast-specific states */}
                        {!historyLoading && cropHistory.length === 0 && !historyError && (
                          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                            No historical data available for {selectedCrop}.
                          </div>
                        )}

                        {forecastNotTrained && (
                          <div className="mt-2">
                            <NoForecastState commodity={selectedCrop} />
                          </div>
                        )}

                        {forecastGenericError && (
                          <ErrorBanner
                            message={forecastGenericError}
                            onRetry={() => {
                              sessionStorage.removeItem(`forecast_${selectedCrop}`);
                              setForecastRetry((n) => n + 1);
                            }}
                          />
                        )}

                        {forecastLoading && !forecastNotTrained && (
                          <InlineLoader text="Loading AI forecast…" className="h-16" />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* HISTORICAL TAB */}
                  <TabsContent value="historical">
                    <Card>
                      <CardHeader>
                        <CardTitle>Historical Price Trend</CardTitle>
                        <CardDescription>
                          {cropHistory.length > 0
                            ? `${cropHistory.length} days of recorded prices (last 30 days)`
                            : "30-day price movement"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {historyError ? (
                          <ErrorBanner
                            message={historyError}
                            onRetry={() => { sessionStorage.removeItem(`cropHistory_${selectedCrop}`); setHistoryRetry((n) => n + 1); }}
                          />
                        ) : historyLoading ? (
                          <InlineLoader text="Loading historical data…" />
                        ) : cropHistory.length === 0 ? (
                          <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                            No historical data available for {selectedCrop}.
                          </div>
                        ) : (
                          <>
                            <LineChart historicalData={cropHistory} forecastData={[]} loading={false} />
                            <div className="h-10 flex items-end justify-between px-6 mt-4">
                              {historicalMonths.map((m, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-foreground opacity-70" />
                                  <span className="text-xs text-muted-foreground">{m.month}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ANALYSIS TAB */}
                  <TabsContent value="analysis">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Forecast Confidence Analysis
                        </CardTitle>
                        <CardDescription>
                          {forecastNotTrained
                            ? "AI model not trained for this commodity"
                            : "Prediction reliability over time horizons"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {forecastNotTrained ? (
                          <NoForecastState commodity={selectedCrop} />
                        ) : forecastGenericError ? (
                          <ErrorBanner
                            message={forecastGenericError}
                            onRetry={() => {
                              sessionStorage.removeItem(`forecast_${selectedCrop}`);
                              setForecastRetry((n) => n + 1);
                            }}
                          />
                        ) : forecastLoading ? (
                          <InlineLoader text="Calculating confidence…" className="h-32" />
                        ) : weeklyForecast.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8 text-sm">
                            No confidence data available yet.
                          </div>
                        ) : (
                          weeklyForecast.map((p, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-sm font-medium">
                                <span>{p.date}</span>
                                <Badge variant="secondary">{p.confidence}%</Badge>
                              </div>
                              <div className="h-3 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-500"
                                  style={{ width: `${p.confidence}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Predicted: Rs {p.price}
                              </p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* AI PRICE FORECAST CARD */}
                {!forecastNotTrained && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Price Forecast</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {forecastGenericError ? (
                        <div className="col-span-4">
                          <ErrorBanner
                            message={forecastGenericError}
                            onRetry={() => {
                              sessionStorage.removeItem(`forecast_${selectedCrop}`);
                              setForecastRetry((n) => n + 1);
                            }}
                          />
                        </div>
                      ) : forecastLoading ? (
                        <div className="col-span-4">
                          <InlineLoader text="Generating AI forecast…" className="h-24" />
                        </div>
                      ) : aiForecastTiles.length === 0 ? (
                        <div className="col-span-4 text-center text-muted-foreground py-6 text-sm">
                          No forecast data available.
                        </div>
                      ) : (
                        aiForecastTiles.map((item, i) => (
                          <div key={i} className="rounded-xl bg-muted/40 p-4 hover:bg-muted transition">
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-2xl font-bold mt-1">NPR {item.price}</p>
                            <p className={`text-sm ${item.change >= 0 ? "text-success" : "text-destructive"}`}>
                              {item.change >= 0 ? "+" : ""}{item.change}%
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!selectedCrop && !productsLoading && (
              <NoForecastState commodity="" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}