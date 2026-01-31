import { useState, useEffect } from "react";
import { fetchWeatherAndForecast } from "@/api/weather";
import { fetchCropSuggestion } from "@/api/cropSuggestion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  Cloud,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sprout
} from "lucide-react";

export default function WeatherIrrigation() {
  const [cropType, setCropType] = useState("rice");
  const [growthStage, setGrowthStage] = useState("vegetative");
  const [recommendations, setRecommendations] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);


  useEffect(() => {
    async function loadWeather() {
      try {
        setLoadingWeather(true);
        const data = await fetchWeatherAndForecast();
        setWeatherData(data);
      } catch (error) {
        setWeatherError("Failed to load weather data");
      } finally {
        setLoadingWeather(false);
      }
    }

    loadWeather();
  }, []);

  const weatherStats = weatherData
    ? [
      {
        label: "Temperature",
        value: `${weatherData.current.temperature}°C`,
        icon: Thermometer,
        color: "text-chart-5",
      },
      {
        label: "Humidity",
        value: `${weatherData.current.humidity}%`,
        icon: Droplets,
        color: "text-chart-4",
      },
      {
        label: "Rainfall",
        value: `${weatherData.current.rainfall}mm`,
        icon: CloudRain,
        color: "text-primary",
      },
      {
        label: "Wind Speed",
        value: `${weatherData.current.wind_speed} km/h`,
        icon: Wind,
        color: "text-chart-2",
      },
    ]
    : [];

  const getWeatherIcon = (condition) => {
    if (condition.includes("Sunny")) return Sun;
    if (condition.includes("Rain")) return CloudRain;
    return Cloud;
  };

  if (loadingWeather) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading weather data...</p>
      </DashboardLayout>
    );
  }

  if (weatherError) {
    return (
      <DashboardLayout>
        <p className="text-destructive">{weatherError}</p>
      </DashboardLayout>
    );
  }

  async function loadCropRecommendation() {
    try {
      setLoadingRecommendation(true);
      setRecommendationError(null);

      const data = await fetchCropSuggestion({
        location: "Kathmandu", // for now
        cropName: cropType,
        growthStage: growthStage,
      });

      setRecommendations(data.suggestion);
    } catch (error) {
      setRecommendationError("Failed to generate recommendation");
    } finally {
      setLoadingRecommendation(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Weather & Irrigation Guide
          </h1>
          <p className="text-muted-foreground">
            Get personalized irrigation and fertilization advice based on real-time weather data.
          </p>
        </div>

        {/* Crop Selection */}
        <Card>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                className="mt-4"
                onClick={loadCropRecommendation}
              >
                Get AI Recommendation
              </Button>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Crop Type</label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="tomato">Tomato</SelectItem>
                    <SelectItem value="potato">Potato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Growth Stage</label>
                <Select value={growthStage} onValueChange={setGrowthStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seedling">Seedling</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="fruiting">Fruiting/Grain Filling</SelectItem>
                    <SelectItem value="maturity">Maturity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Weather */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-primary" />
              Current Weather
            </CardTitle>
            <CardDescription>Live weather data for Kathmandu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {weatherStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* 5-Day Forecast */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                5-Day Forecast
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {weatherData.forecast.map((day, index) => {
                  const WeatherIcon = getWeatherIcon(day.condition);
                  return (
                    <div key={index} className="p-4 rounded-lg bg-gradient-hero border border-border text-center space-y-2">
                      <p className="text-sm font-medium text-foreground">{day.day}</p>
                      <WeatherIcon className="w-8 h-8 mx-auto text-primary" />
                      <p className="text-xl font-bold text-foreground">{day.temp}°C</p>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Droplets className="w-3 h-3" />
                        {day.rain}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Irrigation Recommendations */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  Irrigation Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {recommendations.irrigation.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {recommendations.irrigation.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Amount</p>
                      <p className="text-sm text-muted-foreground">{recommendations.irrigation.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Timing</p>
                      <p className="text-sm text-muted-foreground">{recommendations.irrigation.timing}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Frequency</p>
                      <p className="text-sm text-muted-foreground">{recommendations.irrigation.frequency}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fertilization Recommendations */}
            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-success" />
                  Fertilization Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground">
                    {recommendations.fertilization.notes}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Type</p>
                      <p className="text-sm text-muted-foreground">{recommendations.fertilization.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Amount</p>
                      <p className="text-sm text-muted-foreground">{recommendations.fertilization.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Method</p>
                      <p className="text-sm text-muted-foreground">{recommendations.fertilization.method}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Timing</p>
                      <p className="text-sm text-muted-foreground">{recommendations.fertilization.timing}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts */}
        {recommendations?.alerts && (
          <div className="space-y-3">
            {recommendations.alerts.map((alert, index) => {
              const isWarning = alert.type === "warning";
              return (
                <Card key={index} className={isWarning ? "border-warning/20 bg-warning/5" : "border-chart-4/20 bg-chart-4/5"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isWarning ? "text-warning" : "text-chart-4"}`} />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}