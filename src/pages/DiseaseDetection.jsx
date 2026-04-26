import { useState, useEffect } from "react";
import { detectDisease, getRecentScans } from "@/api/disease";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Scan,
  Upload,
  Camera,
  AlertCircle,
  CheckCircle2,
  Leaf,
  ArrowRight,
  RefreshCw,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

const SEVERITY_VARIANT = {
  None: "secondary",
  Mild: "secondary",
  Moderate: "outline",
  Severe: "destructive",
  Unknown: "outline",
};

const SUPPORTED_CROPS = [
  "Apple", "Blueberry", "Cherry", "Corn",
  "Grape", "Orange", "Peach", "Bell Pepper",
  "Potato", "Raspberry", "Soybean", "Squash",
  "Strawberry", "Tomato",
];

function SupportedCropsList({ crops }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {crops.map((crop) => (
        <span
          key={crop}
          className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
        >
          {crop}
        </span>
      ))}
    </div>
  );
}

// Normalize treatment/prevention — backend may store as string or array
function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // error state: null | { type: "not_a_plant" | "unsupported_crop" | "generic", message, supportedCrops? }
  const [errorState, setErrorState] = useState(null);

  const [recentScans, setRecentScans] = useState([]);
  const [scansLoading, setScansLoading] = useState(true);
  const [showAllScans, setShowAllScans] = useState(false);
  const [cropsExpanded, setCropsExpanded] = useState(false);

  // Scan detail modal
  const [selectedScan, setSelectedScan] = useState(null);
  const [scanDetailOpen, setScanDetailOpen] = useState(false);

  useEffect(() => {
    async function loadScans() {
      try {
        const data = await getRecentScans();
        setRecentScans(data);
      } catch {
        // non-critical
      } finally {
        setScansLoading(false);
      }
    }
    loadScans();
  }, []);

  const clearState = () => {
    setResult(null);
    setErrorState(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    clearState();
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleImageUpload({ target: { files: [file] } });
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    clearState();
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      toast.error("Please upload an image first");
      return;
    }

    setAnalyzing(true);
    clearState();

    try {
      const data = await detectDisease(imageFile);
      setResult(data);
      toast.success("Analysis complete!");

      try {
        const scans = await getRecentScans();
        setRecentScans(scans);
      } catch {
        // ignore
      }
    } catch (error) {
      const res = error?.response;
      const data = res?.data;

      if (res?.status === 422 && data?.error === "not_a_plant") {
        setErrorState({ type: "not_a_plant", message: data.message });
      } else if (res?.status === 422 && data?.error === "unsupported_crop") {
        setErrorState({
          type: "unsupported_crop",
          message: data.message,
          supportedCrops: data.supported_crops ?? [],
        });
      } else {
        setErrorState({
          type: "generic",
          message: data?.error || "Something went wrong. Please try again.",
        });
        toast.error("Analysis failed");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScanClick = (scan) => {
    setSelectedScan(scan);
    setScanDetailOpen(true);
  };

  const visibleScans = showAllScans ? recentScans : recentScans.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Crop Disease Detection
          </h1>
          <p className="text-muted-foreground">
            Upload a photo of your crop leaf to get instant AI-powered disease
            identification.
          </p>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Main Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                Upload Crop Image
              </CardTitle>
              <CardDescription>
                Take a clear photo of the affected crop leaf for best results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Drop Zone */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 sm:p-12 text-center hover:border-primary/50 transition-smooth cursor-pointer group"
                onClick={() => document.getElementById("image-upload").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {selectedImage ? (
                  <div className="space-y-4">
                    <img
                      src={selectedImage}
                      alt="Uploaded crop"
                      className="max-h-64 mx-auto rounded-lg shadow-lg object-contain"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG or WEBP (max. 10MB)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 bg-gradient-primary text-primary-foreground"
                  onClick={handleAnalyze}
                  disabled={!selectedImage || analyzing}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById("image-upload").click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>

              {/* Error States */}
              {errorState?.type === "not_a_plant" && (
                <Alert variant="destructive" className="animate-fade-in">
                  <XCircle className="w-5 h-5" />
                  <AlertTitle className="ml-2">Not a plant leaf</AlertTitle>
                  <AlertDescription className="ml-2">
                    {errorState.message}
                  </AlertDescription>
                </Alert>
              )}

              {errorState?.type === "unsupported_crop" && (
                <Alert className="border-warning/40 bg-warning/5 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <AlertTitle className="ml-2 text-foreground">
                    Crop not supported
                  </AlertTitle>
                  <AlertDescription className="ml-2">
                    <p className="text-muted-foreground mb-1">
                      {errorState.message}
                    </p>
                    <p className="text-sm font-medium text-foreground mt-2">
                      Supported crops:
                    </p>
                    <SupportedCropsList crops={errorState.supportedCrops} />
                  </AlertDescription>
                </Alert>
              )}

              {errorState?.type === "generic" && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertCircle className="w-5 h-5" />
                  <AlertTitle className="ml-2">Analysis failed</AlertTitle>
                  <AlertDescription className="ml-2">
                    {errorState.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Result */}
              {result && (
                <div className="space-y-4 animate-fade-in">
                  <Alert
                    className={
                      result.isHealthy
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-primary/20 bg-primary/5"
                    }
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${result.isHealthy ? "text-green-500" : "text-primary"}`}
                    />
                    <AlertDescription className="ml-2">
                      {result.isHealthy
                        ? `Your crop looks healthy! (${result.confidence}% confidence)`
                        : `Disease detected with ${result.confidence}% confidence`}
                    </AlertDescription>
                  </Alert>

                  <Card className="border-primary/20">
                    <CardContent className="p-6 space-y-6">
                      {/* Crop / Disease row */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Crop Type</p>
                          <p className="text-lg font-semibold text-foreground">
                            {result.cropType}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {result.isHealthy ? "Status" : "Disease Detected"}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-lg font-semibold text-foreground">
                              {result.disease}
                            </p>
                            <Badge
                              variant={SEVERITY_VARIANT[result.severity] ?? "outline"}
                            >
                              {result.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">Description</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {result.description}
                        </p>
                      </div>

                      {/* Treatment */}
                      {!result.isHealthy && toList(result.treatment).length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-primary" />
                            Recommended Treatment
                          </h4>
                          <ul className="space-y-2">
                            {toList(result.treatment).map((step, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Prevention */}
                      {toList(result.prevention).length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-border">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-green-500" />
                            Prevention Tips
                          </h4>
                          <ul className="space-y-2">
                            {toList(result.prevention).map((tip, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-1">

            {/* Recent Scans */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Scans</CardTitle>
                <CardDescription className="text-xs">
                  Click any scan to view full details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {scansLoading ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-lg bg-muted/50 animate-pulse"
                    />
                  ))
                ) : recentScans.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No scans yet. Analyze your first crop!
                  </p>
                ) : (
                  <>
                    {visibleScans.map((scan, index) => (
                      <div
                        key={scan.id ?? index}
                        className="px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-smooth cursor-pointer border border-transparent hover:border-primary/20"
                        onClick={() => handleScanClick(scan)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-foreground truncate">
                            {scan.crop}
                          </p>
                          <Badge
                            variant={
                              scan.status === "healthy"
                                ? "secondary"
                                : "destructive"
                            }
                            className="shrink-0 text-xs"
                          >
                            {scan.disease}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                          <span>{scan.date}</span>
                          {scan.confidence && (
                            <span>{scan.confidence}% confidence</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {recentScans.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-7 mt-1"
                        onClick={() => setShowAllScans((v) => !v)}
                      >
                        {showAllScans ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show {recentScans.length - 3} more
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Supported Crops */}
            <Card className="border-primary/20">
              <button
                className="w-full text-left"
                onClick={() => setCropsExpanded((v) => !v)}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="flex items-center justify-between text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Supported Crops
                    </span>
                    {cropsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
              </button>

              {cropsExpanded && (
                <CardContent className="pt-0 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {SUPPORTED_CROPS.map((crop) => (
                      <span
                        key={crop}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 pt-3 border-t border-border">
                    <Leaf className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      For best results, photograph in natural daylight with the
                      affected leaf clearly filling the frame.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* ── Scan Detail Modal ── */}
      <Dialog open={scanDetailOpen} onOpenChange={setScanDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-primary" />
              Scan Detail
            </DialogTitle>
          </DialogHeader>

          {selectedScan && (
            <div className="space-y-5 py-2">

              {/* Scanned image */}
              {selectedScan.image && (
                <img
                  src={selectedScan.image}
                  alt="Scanned leaf"
                  className="w-full max-h-52 object-contain rounded-lg border border-border"
                />
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Crop Type
                  </p>
                  <p className="font-semibold text-foreground">{selectedScan.crop}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Disease
                  </p>
                  <p className="font-semibold text-foreground">{selectedScan.disease}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Status
                  </p>
                  <Badge
                    variant={
                      selectedScan.severity === "high"
                        ? "destructive"
                        : selectedScan.severity === "medium"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {selectedScan.severity}
                  </Badge>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Confidence
                  </p>
                  <p className="font-semibold text-foreground">
                    {selectedScan.confidence}%
                  </p>
                </div>
              </div>

              {/* Scanned on */}
              <p className="text-xs text-muted-foreground">
                Scanned on: {selectedScan.date}
              </p>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedScan.description || "No description available."}
                </p>
              </div>

              {/* Treatment */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Recommended Treatment
                </h4>
                {toList(selectedScan.treatment).length > 0 ? (
                  <ul className="space-y-1">
                    {toList(selectedScan.treatment).map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No treatment info available.
                  </p>
                )}
              </div>

              {/* Prevention */}
              <div className="space-y-2 pt-3 border-t border-border">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-500" />
                  Prevention Tips
                </h4>
                {toList(selectedScan.prevention).length > 0 ? (
                  <ul className="space-y-1">
                    {toList(selectedScan.prevention).map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No prevention info available.
                  </p>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}