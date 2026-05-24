import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  RefreshCw,
  Leaf,
  AlertTriangle,
  Eye,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
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
import {
  getScanResults,
  getScanResultDetail,
  deleteScanResult,
  getDashboardStats,
} from "@/api/admin";

// Normalize severity strings from backend (e.g. "Severe" → "high", "Moderate" → "medium")
const normalizeSeverity = (s) => {
  const map = {
    severe: "high",
    high: "high",
    moderate: "medium",
    medium: "medium",
    mild: "low",
    low: "low",
    none: "low",
  };
  return map[String(s || "").toLowerCase()] || "low";
};

const severityStyles = {
  low: "bg-success/10 text-success hover:bg-success/10",
  medium: "bg-warning/10 text-warning hover:bg-warning/10",
  high: "bg-destructive/10 text-destructive hover:bg-destructive/10",
};

const severityLabel = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

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

export default function ScanResultManager() {
  const { toast } = useToast();
  const [scans, setScans] = useState([]);
  const [meta, setMeta] = useState({ count: 0, next: null, previous: null });
  const [summary, setSummary] = useState({ total: 0 });

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [page, setPage] = useState(1);

  const [selectedScan, setSelectedScan] = useState(null);

  const loadScans = async (customPage = page) => {
    setLoading(true);
    setError("");

    try {
      const [scanRes, statsRes] = await Promise.all([
        getScanResults({
          page: customPage,
          search: search || undefined,
          severity: severity || undefined,
        }),
        getDashboardStats(),
      ]);

      const list = Array.isArray(scanRes) ? scanRes : scanRes?.results || [];
      setScans(list);
      setMeta({
        count: scanRes?.count || list.length,
        next: scanRes?.next || null,
        previous: scanRes?.previous || null,
      });

      setSummary({
        total: statsRes?.disease_detection?.total_scans || 0,
      });
    } catch (err) {
      setError("Failed to load scan results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans(page);
  }, [page]);

  // Uses normalizeSeverity so "Severe"/"Moderate"/"Mild" all count correctly
  const pageStats = useMemo(() => {
    return {
      high: scans.filter((s) => normalizeSeverity(s?.severity) === "high").length,
      medium: scans.filter((s) => normalizeSeverity(s?.severity) === "medium").length,
      low: scans.filter((s) => normalizeSeverity(s?.severity) === "low").length,
    };
  }, [scans]);

  const openDetail = async (scan) => {
    setDetailLoading(true);
    try {
      const detail = await getScanResultDetail(scan.id || scan.pk);
      setSelectedScan(detail);
    } catch {
      toast({ title: "Failed to load scan detail.", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scan result?")) return;
    try {
      await deleteScanResult(id);
      toast({ title: "Scan result deleted!" });
      if (selectedScan && (selectedScan.id === id || selectedScan.pk === id)) {
        setSelectedScan(null);
      }
      loadScans();
    } catch {
      toast({ title: "Failed to delete scan result.", variant: "destructive" });
    }
  };

  const applyFilters = () => {
    setPage(1);
    loadScans(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Disease Scan Results
        </h1>
        <p className="text-muted-foreground">
          Review uploaded scans and inspect disease detection outputs.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Scans" value={summary.total} icon={Leaf} color="text-primary" />
        <StatCard title="High Severity" value={pageStats.high} icon={AlertTriangle} color="text-destructive" />
        <StatCard title="Medium Severity" value={pageStats.medium} icon={AlertTriangle} color="text-warning" />
        <StatCard title="Low Severity" value={pageStats.low} icon={AlertTriangle} color="text-success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Filters</CardTitle>
          <CardDescription>Search by crop or disease and filter by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-3 relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crop type or disease"
                className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">All severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={applyFilters}>
              <Search className="w-4 h-4 mr-2" />
              Apply
            </Button>
            <Button variant="outline" onClick={() => loadScans()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Scan Records</CardTitle>
            <CardDescription>Total records: {meta.count}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">Loading scan results...</div>
            ) : scans.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No scan results found.</div>
            ) : (
              <div className="space-y-3">
                {scans.map((scan) => {
                  const level = normalizeSeverity(scan?.severity);
                  return (
                    <div
                      key={scan.id || scan.pk}
                      className="rounded-xl border border-border p-4 flex flex-col gap-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {scan?.crop_type || "Unknown Crop"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Disease: {scan?.disease || "Not available"}
                          </p>
                          {scan?.confidence != null && (
                            <p className="text-xs text-muted-foreground">
                              Confidence: {Number(scan.confidence).toFixed(1)}%
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {scan?.created_at
                              ? new Date(scan.created_at).toLocaleString()
                              : "No timestamp"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {scan?.is_healthy ? (
                            <Badge className="bg-success/10 text-success hover:bg-success/10">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Healthy
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className={severityStyles[level] || "bg-muted text-foreground"}
                            >
                              {severityLabel[level] || scan?.severity || "Unknown"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetail(scan)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(scan.id || scan.pk)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-3">
                  <p className="text-sm text-muted-foreground">Page {page}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={!meta.previous}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!meta.next}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Scan Detail</CardTitle>
            <CardDescription>Inspect image, crop, severity, treatment and prevention</CardDescription>
          </CardHeader>
          <CardContent>
            {detailLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading detail...</div>
            ) : !selectedScan ? (
              <div className="py-12 text-center text-muted-foreground">
                Select a scan to view details.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                  {selectedScan?.image ? (
                    <img
                      src={selectedScan.image}
                      alt="Scan preview"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mr-2" />
                      No image available
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Crop Type</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedScan?.crop_type || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Disease</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedScan?.disease || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedScan?.is_healthy
                        ? "✅ Healthy"
                        : severityLabel[normalizeSeverity(selectedScan?.severity)] ||
                          selectedScan?.severity ||
                          "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Confidence</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedScan?.confidence != null
                        ? `${Number(selectedScan.confidence).toFixed(1)}%`
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Scanned On</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {selectedScan?.created_at
                        ? new Date(selectedScan.created_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Description
                  </p>
                  <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                    {selectedScan?.description || "No description available."}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Treatment
                  </p>
                  <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                    {selectedScan?.treatment || "No treatment info available."}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Prevention
                  </p>
                  <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                    {selectedScan?.prevention || "No prevention info available."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}