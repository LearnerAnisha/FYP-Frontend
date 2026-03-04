import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2, Zap, Sprout, Crown, ArrowRight,
  HelpCircle, Shield, Headphones, BarChart3,
} from "lucide-react";

/* ── Plan data ─────────────────────────────────────────────────── */
const plans = [
  {
    id: "free",
    name: "Free",
    icon: Sprout,
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started with smart farming.",
    badge: null,
    highlight: false,
    features: [
      "5 crop disease scans / month",
      "Basic weather & irrigation tips",
      "Live market prices",
      "AI chatbot (10 messages/day)",
      "Email support",
    ],
    cta: "Get Started Free",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    price: { monthly: 499, yearly: 399 },
    description: "For active farmers who need real-time insights.",
    badge: "Most Popular",
    highlight: true,
    features: [
      "Unlimited disease scans",
      "Advanced weather analytics",
      "AI price predictions (weekly)",
      "AI chatbot (unlimited)",
      "SMS & email alerts",
      "Chat history & export",
      "Priority support",
    ],
    cta: "Start Pro Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    price: { monthly: 1499, yearly: 1199 },
    description: "For cooperatives and agribusinesses at scale.",
    badge: null,
    highlight: false,
    features: [
      "Everything in Pro",
      "Multi-farm management",
      "Custom AI model training",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
  },
];

/* ── Comparison rows ───────────────────────────────────────────── */
const comparisonRows = [
  { label: "Disease scans",          values: ["5 / month",    "Unlimited",  "Unlimited"]  },
  { label: "AI chatbot",             values: ["10 msgs/day",  "Unlimited",  "Unlimited"]  },
  { label: "Weather analytics",      values: ["Basic",        "Advanced",   "Advanced"]   },
  { label: "Price predictions",      values: ["—",            "✓",          "✓"]          },
  { label: "SMS alerts",             values: ["—",            "✓",          "✓"]          },
  { label: "Chat history & export",  values: ["—",            "✓",          "✓"]          },
  { label: "API access",             values: ["—",            "—",          "✓"]          },
  { label: "Multi-farm management",  values: ["—",            "—",          "✓"]          },
  { label: "Custom AI model",        values: ["—",            "—",          "✓"]          },
  { label: "Support",                values: ["Email",        "Priority",   "Dedicated"]  },
  { label: "SLA guarantee",          values: ["—",            "—",          "✓"]          },
];

/* ── Pricing FAQs ──────────────────────────────────────────────── */
const pricingFaqs = [
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately and you'll be charged the prorated difference. Downgrades take effect at the end of your current billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept eSewa, Khalti, ConnectIPS, and major credit/debit cards. All transactions are processed securely and billed in NPR.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes — all paid plans come with a 14-day free trial. No credit card is required to start. You'll only be charged after the trial ends if you choose to continue.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "Your data is retained for 30 days after cancellation. You can export all your scan history, reports, and chat history before that window closes.",
  },
  {
    question: "Do you offer discounts for cooperatives or NGOs?",
    answer: "Yes — we offer special pricing for agricultural cooperatives, government bodies, and NGOs. Contact us at info@krishisaathi.com to discuss a custom plan.",
  },
  {
    question: "Is the yearly plan billed all at once?",
    answer: "Yes, yearly plans are billed as a single annual payment at the discounted rate (20% off). You'll receive a receipt and a reminder 30 days before renewal.",
  },
];

/* ── Trust badges ──────────────────────────────────────────────── */
const trustItems = [
  { icon: Shield,      label: "Secure Payments",     sub: "eSewa, Khalti, Cards"       },
  { icon: ArrowRight,  label: "Cancel Anytime",       sub: "No lock-in contracts"       },
  { icon: Headphones,  label: "Local Support",        sub: "Nepali-language helpdesk"   },
  { icon: BarChart3,   label: "14-Day Free Trial",    sub: "No credit card needed"      },
];

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const handleCTA = (plan) => {
    if (plan.id === "enterprise") {
      window.location.href = "mailto:info@krishisaathi.com?subject=Enterprise Plan Inquiry";
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
            Simple, Transparent{" "}
            <span className="text-primary">Pricing</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Choose the plan that fits your farm. Start free, scale when you're ready.
            All plans include a 14-day trial — no credit card required.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-2 bg-muted rounded-xl p-1.5">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Plans ─────────────────────────────────────────────────── */}
      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.price.yearly : plan.price.monthly;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col transition-smooth hover:shadow-elegant ${
                    plan.highlight
                      ? "border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <CardHeader className="pb-4 pt-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        plan.highlight ? "bg-primary" : "bg-primary/10"
                      }`}>
                        <Icon className={`w-5 h-5 ${plan.highlight ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <CardTitle className="text-xl font-display">{plan.name}</CardTitle>
                    </div>

                    <div className="mb-2">
                      {price === 0 ? (
                        <span className="text-4xl font-display font-bold text-foreground">Free</span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm text-muted-foreground font-medium">NPR</span>
                          <span className="text-4xl font-display font-bold text-foreground">{price}</span>
                          <span className="text-sm text-muted-foreground">/ mo</span>
                        </div>
                      )}
                      {isYearly && price > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Billed annually — NPR {price * 12}/yr
                        </p>
                      )}
                    </div>

                    <CardDescription className="text-sm leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1 pb-8">
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${plan.highlight ? "bg-gradient-primary text-primary-foreground hover:opacity-90" : ""}`}
                      variant={plan.highlight ? "default" : "outline"}
                      onClick={() => handleCTA(plan)}
                    >
                      {plan.cta}
                      {plan.id !== "enterprise" && <ArrowRight className="ml-2 w-4 h-4" />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── Trust badges ──────────────────────────────────────────── */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {trustItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Feature comparison table ──────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Compare Plans
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Everything Side by <span className="text-primary">Side</span>
            </h2>
            <p className="text-muted-foreground">
              See exactly what you get with each plan before you commit.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 font-semibold text-foreground w-2/5">
                        Feature
                      </th>
                      {plans.map((p) => (
                        <th
                          key={p.id}
                          className={`text-center py-4 px-4 font-display font-semibold ${
                            p.highlight ? "text-primary" : "text-foreground"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {p.name}
                            {p.highlight && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                Popular
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row) => (
                      <tr key={row.label} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-6 text-muted-foreground">{row.label}</td>
                        {row.values.map((val, i) => (
                          <td
                            key={i}
                            className={`text-center py-3.5 px-4 ${
                              plans[i].highlight ? "font-medium text-foreground" : "text-foreground"
                            }`}
                          >
                            {val === "✓" ? (
                              <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                            ) : val === "—" ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              val
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Pricing FAQ ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Billing <span className="text-primary">Questions</span>
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about plans and payments.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {pricingFaqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary hover:no-underline gap-3">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary/60 shrink-0" />
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pl-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-xl max-w-4xl mx-auto">
            <CardContent className="p-8 sm:p-12 text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-display font-bold">
                Start growing smarter today
              </h2>
              <p className="text-primary-foreground/90 text-lg max-w-xl mx-auto">
                Join over 10,000 Nepalese farmers already using Krishi Saathi.
                Free forever, upgrade when you're ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => window.location.href = "mailto:info@krishisaathi.com"}
                >
                  Talk to Sales
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