import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Scan,
  CloudRain,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Users,
  Leaf,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Quote
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Scan,
      title: "Crop Disease Detection",
      description: "Upload crop images and get instant AI-powered disease identification with treatment recommendations.",
      color: "text-primary"
    },
    {
      icon: CloudRain,
      title: "Weather & Irrigation Tips",
      description: "Receive personalized irrigation and fertilization advice based on real-time weather and crop data.",
      color: "text-chart-4"
    },
    {
      icon: TrendingUp,
      title: "Price Predictions",
      description: "Access real-time market prices and AI forecasts to make informed selling decisions.",
      color: "text-accent"
    },
    {
      icon: MessageSquare,
      title: "AI Chatbot Assistant",
      description: "Ask questions in natural language and get personalized agricultural guidance instantly.",
      color: "text-chart-5"
    }
  ];

  const benefits = [
    "Early disease detection prevents crop loss",
    "Optimize water and fertilizer usage",
    "Maximize profits with price predictions",
    "24/7 AI-powered agricultural support"
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Sign Up",
      description: "Create your free account in minutes"
    },
    {
      step: "02",
      title: "Input Data",
      description: "Upload crop images or enter your farm details"
    },
    {
      step: "03",
      title: "Get Insights",
      description: "Receive AI-powered recommendations instantly"
    },
    {
      step: "04",
      title: "Take Action",
      description: "Implement suggestions and track results"
    }
  ];

  const testimonials = [
    {
      name: "Ram Bahadur Thapa",
      location: "Chitwan",
      text: "Krishi Saathi helped me detect rice blast disease early. I saved 40% of my crop!",
      rating: 5
    },
    {
      name: "Sita Kumari Sharma",
      location: "Kaski",
      text: "The irrigation tips reduced my water usage by 30% while improving yield. Amazing!",
      rating: 5
    },
    {
      name: "Hari Prasad Gautam",
      location: "Rupandehi",
      text: "Price predictions helped me sell at the right time. Increased my income by 25%.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "What is Krishi Saathi?",
      answer: "Krishi Saathi is an AI-powered agricultural assistant designed for Nepalese farmers. It provides crop disease detection, weather-based irrigation advice, market price predictions, and a conversational AI chatbot for agricultural guidance."
    },
    {
      question: "How accurate is the disease detection?",
      answer: "Our CNN-based model has been trained on thousands of crop images and achieves high accuracy in detecting common crop diseases. However, we always recommend consulting with agricultural experts for critical decisions."
    },
    {
      question: "Is the service free?",
      answer: "We offer a free tier with basic features. Premium features like advanced analytics and unlimited predictions are available through our subscription plans."
    },
    {
      question: "What crops are supported?",
      answer: "Currently, we support major crops grown in Nepal including rice, wheat, maize, lentils, and various vegetables. We're continuously adding more crops to our database."
    },
    {
      question: "Do I need internet to use the app?",
      answer: "Yes, an internet connection is required to access real-time weather data, market prices, and AI predictions. We're working on offline capabilities for basic features."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Leaf className="w-3 h-3 mr-1" />
                AI-Powered Agricultural Assistant
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Empowering Farmers with{" "}
                <span className="text-primary">Smart Agriculture</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Detect crop diseases instantly, optimize irrigation with weather insights, predict market prices, and get 24/7 AI guidance—all in one platform designed for Nepalese farmers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-smooth" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative lg:h-[600px] animate-fade-in">
              <img
                src="https://images.unsplash.com/photo-1761839257144-297ce252742e"
                alt="Farmer using technology"
                className="w-full h-full object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "10,000+", label: "Active Farmers" },
              { icon: Leaf, value: "50+", label: "Crops Supported" },
              { icon: BarChart3, value: "95%", label: "Accuracy Rate" },
              { icon: Globe, value: "75", label: "Districts Covered" }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center space-y-2">
                  <Icon className="w-8 h-8 mx-auto text-primary" />
                  <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Comprehensive AI-powered tools designed specifically for the challenges faced by Nepalese farmers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-elegant transition-smooth border-border hover:border-primary/50">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-smooth">
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Get Started in <span className="text-primary">4 Simple Steps</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-2xl font-display font-bold text-primary-foreground">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-display font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
                {index < howItWorks.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Trusted by <span className="text-primary">Farmers Across Nepal</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-elegant transition-smooth">
                <CardContent className="p-6 space-y-4">
                  <Quote className="w-10 h-10 text-primary/20" />
                  <p className="text-muted-foreground leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-accent text-lg">★</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-xl">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold">
                Ready to Transform Your Farming?
              </h2>
              <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Join thousands of farmers who are already using Krishi Saathi to increase productivity and profitability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-white text-primary hover:bg-white/90 transition-smooth"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}