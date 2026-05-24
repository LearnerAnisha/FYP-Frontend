import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  RefreshCw,
  Database,
  BarChart3,
  DownloadCloud,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAdminProducts,
  getAdminPriceHistory,
  getAdminPriceStats,
  fetchAdminMarketPrices,
} from "@/api/admin";

const StatCard = ({ title, value, icon: Icon, color = "text-primary" }) => (
  <Card>
    <CardContent className="p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    color: "hsl(var(--foreground))",
    fontSize: 13,
  },
};

export default function PricePredictorManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [productMeta, setProductMeta] = useState({ count: 0, next: null, previous: null });
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ count: 0, next: null, previous: null });
  const [stats, setStats] = useState(null);

  const [productsLoading, setProductsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const loadProducts = async (page = 1, searchTerm = search) => {
    setProductsLoading(true);
    try {
      const res = await getAdminProducts({ page, search: searchTerm || undefined });
      const list = Array.isArray(res) ? res : res?.results || [];
      setProducts(list);
      setProductMeta({
        count: res?.count || list.length,
        next: res?.next || null,
        previous: res?.previous || null,
      });
    } catch {
      setError("Failed to load products.");
    } finally {
      setProductsLoading(false);
    }
  };

  const loadHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await getAdminPriceHistory({ page });
      const list = Array.isArray(res) ? res : res?.results || [];
      setHistory(list);
      setHistoryMeta({
        count: res?.count || list.length,
        next: res?.next || null,
        previous: res?.previous || null,
      });
    } catch {
      setError("Failed to load price history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getAdminPriceStats();
      setStats(res || {});
    } catch {
      setStats({});
    }
  };

  useEffect(() => {
    loadProducts(1);
    loadHistory(1);
    loadStats();
  }, []);

  useEffect(() => { loadProducts(productPage); }, [productPage]);
  useEffect(() => { loadHistory(historyPage); }, [historyPage]);

  const applySearch = () => { setProductPage(1); loadProducts(1, search); };
  const resetSearch = () => { setSearch(""); setProductPage(1); loadProducts(1, ""); };

  const handleRefreshMarketData = async () => {
    setFetching(true);
    setError("");
    try {
      await fetchAdminMarketPrices();
      await Promise.all([loadProducts(productPage), loadHistory(historyPage), loadStats()]);
      toast({ title: "Market prices updated successfully!" });
    } catch {
      toast({ title: "Failed to fetch latest market prices.", variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  const topProducts = useMemo(() => {
    return [...products]
      .map((p) => ({ ...p, avg_price: parseFloat(p?.avg_price) || 0 }))
      .filter((p) => p.avg_price > 0)
      .sort((a, b) => b.avg_price - a.avg_price)
      .slice(0, 6)
      .map((item) => ({
        name: item.commodityname || item.name || "Product",
        avg_price: item.avg_price,
      }));
  }, [products]);

  const recentTrend = useMemo(() => {
    const items = [...history]
      .slice(0, 10)
      .reverse()
      .map((item, index) => ({
        label: item?.date ? String(item.date).slice(5, 10) : `#${index + 1}`,
        avg_price: parseFloat(item?.avg_price) || 0,
      }));

    const values = items.map((i) => i.avg_price).filter((v) => v > 0).sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)] || 1;
    const threshold = median * 5;

    return items.map((i) => ({
      ...i,
      avg_price: i.avg_price > threshold ? median : i.avg_price,
    }));
  }, [history]);

  const summary = {
    productCount: stats?.total_products ?? productMeta.count,
    historyCount: stats?.total_history_records ?? historyMeta.count,
    avgPrice: stats?.average_price ?? 0,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Price Predictor Manager
          </h1>
          <p className="text-muted-foreground">
            Monitor commodity pricing data, history, and market refresh tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadProducts(productPage);
              loadHistory(historyPage);
              loadStats();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleRefreshMarketData} disabled={fetching}>
            <DownloadCloud className="w-4 h-4 mr-2" />
            {fetching ? "Fetching..." : "Fetch Latest Prices"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={summary.productCount} icon={Database} color="text-primary" />
        <StatCard title="History Records" value={summary.historyCount} icon={CalendarDays} color="text-chart-4" />
        <StatCard title="Average Price" value={Number(summary.avgPrice || 0).toFixed(2)} icon={TrendingUp} color="text-success" />
        <StatCard title="Loaded Products" value={products.length} icon={BarChart3} color="text-chart-5" />
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Search Products</CardTitle>
          <CardDescription>Filter commodity records by product name or unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="Search products"
                className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary text-foreground"
              />
            </div>
            <Button onClick={applySearch}>
              <Search className="w-4 h-4 mr-2" />
              Apply
            </Button>
            <Button variant="outline" onClick={resetSearch}>
              Reset
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Top Product Prices</CardTitle>
            <CardDescription>Highest average prices on this page</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No price data available for chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProducts} margin={{ bottom: 30, left: 0, right: 10, top: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="avg_price" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent History Trend</CardTitle>
            <CardDescription>Average price across recent history entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTrend.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No history trend data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={recentTrend} margin={{ bottom: 5, left: 0, right: 10, top: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    domain={[0, "auto"]}
                    allowDataOverflow={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="avg_price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products + History — equal height cards so pagination rows align */}
      <div className="grid xl:grid-cols-2 gap-6 items-start">

        {/* Products */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-display">Products</CardTitle>
            <CardDescription>
              Page {productPage} — {productMeta.count} total records
            </CardDescription>
          </CardHeader>

          {/* flex flex-col so pagination always sticks to bottom */}
          <CardContent className="flex flex-col gap-0 flex-1">
            {productsLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No products found.</div>
            ) : (
              <>
                <div className="flex-1 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {products.map((product) => (
                    <div key={product.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {product.commodityname || "Unknown Product"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Unit: {product.commodityunit || "-"}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          Avg: {product.avg_price ?? "-"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                        {[
                          { label: "Min", val: product.min_price },
                          { label: "Max", val: product.max_price },
                          { label: "Last", val: product.last_price },
                        ].map(({ label, val }) => (
                          <div key={label} className="rounded-lg bg-muted/50 p-3">
                            <p className="text-muted-foreground text-xs">{label}</p>
                            <p className="font-medium text-foreground">{val ?? "-"}</p>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Last update:{" "}
                        {product.last_update
                          ? new Date(product.last_update).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                  <p className="text-sm text-muted-foreground leading-none">
                    Page {productPage}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!productMeta.previous}
                      onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!productMeta.next}
                      onClick={() => setProductPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Price History */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-display">Price History</CardTitle>
            <CardDescription>
              Page {historyPage} — {historyMeta.count} total records
            </CardDescription>
          </CardHeader>

          {/* flex flex-col so pagination always sticks to bottom */}
          <CardContent className="flex flex-col gap-0 flex-1">
            {historyLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No history found.</div>
            ) : (
              <>
                <div className="flex-1 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {history.map((row) => (
                    <div key={row.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {row?.product_name || "Unknown Product"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Date: {row?.date || "-"}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/10 shrink-0"
                        >
                          Avg {row?.avg_price ?? "-"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                        {[
                          { label: "Min", val: row?.min_price },
                          { label: "Max", val: row?.max_price },
                          { label: "Avg", val: row?.avg_price },
                        ].map(({ label, val }) => (
                          <div key={label} className="rounded-lg bg-muted/50 p-3">
                            <p className="text-muted-foreground text-xs">{label}</p>
                            <p className="font-medium text-foreground">{val ?? "-"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                  <p className="text-sm text-muted-foreground leading-none">
                    Page {historyPage}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!historyMeta.previous}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!historyMeta.next}
                      onClick={() => setHistoryPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}