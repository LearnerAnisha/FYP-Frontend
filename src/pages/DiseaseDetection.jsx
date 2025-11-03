import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scan, Upload, Camera, AlertCircle, CheckCircle2, Leaf, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setAnalyzing(true);

    // Mock AI analysis
    setTimeout(() => {
      setResult({
        cropType: "Rice",
        disease: "Leaf Blast",
        confidence: 92,
        severity: "Moderate",
        description: "Rice blast is caused by the fungus Magnaporthe oryzae. It appears as diamond-shaped lesions on leaves.",
        treatment: [
          "Remove and destroy infected plant parts",
          "Apply Tricyclazole fungicide (0.06%) at 10-day intervals",
          "Ensure proper field drainage",
          "Avoid excessive nitrogen fertilization",
          "Use resistant rice varieties in future planting"
        ],
        prevention: [
          "Plant disease-resistant varieties",
          "Maintain proper plant spacing",
          "Apply balanced fertilization",
          "Practice crop rotation"
        ]
      });
      setAnalyzing(false);
      toast.success("Analysis completed successfully!");
    }, 2500);
  };

  const recentScans = [
    { crop: "Rice", disease: "Healthy", date: "2 hours ago", status: "success" },
    { crop: "Wheat", disease: "Rust", date: "Yesterday", status: "warning" },
    { crop: "Tomato", disease: "Healthy", date: "2 days ago", status: "success" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Crop Disease Detection
          </h1>
          <p className="text-muted-foreground">
            Upload a photo of your crop to get instant AI-powered disease identification.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Section */}
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
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 sm:p-12 text-center hover:border-primary/50 transition-smooth cursor-pointer group"
                onClick={() => document.getElementById('image-upload').click()}
              >
                {selectedImage ? (
                  <div className="space-y-4">
                    <img
                      src={selectedImage}
                      alt="Uploaded crop"
                      className="max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                        setResult(null);
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
                      <p className="text-lg font-semibold text-foreground mb-2">
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
                      <span className="animate-spin mr-2">○</span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>

              {/* Results */}
              {result && (
                <div className="space-y-4 animate-fade-in">
                  <Alert className="border-primary/20 bg-primary/5">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <AlertDescription className="ml-2">
                      Analysis completed with {result.confidence}% confidence
                    </AlertDescription>
                  </Alert>

                  <Card className="border-primary/20">
                    <CardContent className="p-6 space-y-6">
                      {/* Detection Info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Crop Type</p>
                          <p className="text-lg font-semibold text-foreground">{result.cropType}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Disease Detected</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-foreground">{result.disease}</p>
                            <Badge variant={result.severity === "Severe" ? "destructive" : "secondary"}>
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
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-primary" />
                          Recommended Treatment
                        </h4>
                        <ul className="space-y-2">
                          {result.treatment.map((step, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prevention */}
                      <div className="space-y-3 pt-4 border-t border-border">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Leaf className="w-5 h-5 text-success" />
                          Prevention Tips
                        </h4>
                        <ul className="space-y-2">
                          {result.prevention.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <ArrowRight className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Scans Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>Your latest disease detection history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentScans.map((scan, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-smooth space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">{scan.crop}</p>
                        <Badge variant={scan.status === "success" ? "secondary" : "destructive"}>
                          {scan.disease}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{scan.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-hero border-primary/20">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  Pro Tip
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For best results, take photos in natural daylight with the affected area clearly visible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}