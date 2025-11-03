import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Leaf, Lightbulb } from "lucide-react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! I'm your Krishi Saathi AI assistant. How can I help you with your farming today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    "How do I prevent rice blast disease?",
    "When is the best time to plant tomatoes?",
    "What fertilizer is best for wheat?",
    "How to improve soil quality?"
  ];

  // Mock AI responses
  const getAIResponse = (question) => {
    const responses = {
      default: "Based on your query, here are some recommendations:\n\n1. Monitor your crops regularly for early signs\n2. Maintain proper irrigation schedules\n3. Use balanced fertilization\n4. Consult with local agricultural experts for specific conditions\n\nWould you like more detailed information on any of these points?",
      disease: "For disease prevention and management:\n\n• Practice crop rotation\n• Use disease-resistant varieties\n• Remove infected plant parts immediately\n• Apply appropriate fungicides when needed\n• Maintain proper plant spacing for air circulation\n\nWould you like me to analyze a specific crop disease?",
      fertilizer: "For optimal fertilization:\n\n• Conduct soil testing first\n• Apply NPK based on crop requirements\n• Use organic compost for soil health\n• Split fertilizer applications during growth stages\n• Avoid over-fertilization which can harm crops\n\nWhat crop are you growing?",
      irrigation: "For efficient irrigation:\n\n• Water early morning or late evening\n• Use drip irrigation to save water\n• Check soil moisture before watering\n• Adjust based on weather conditions\n• Ensure proper drainage to prevent waterlogging\n\nNeed weather-based irrigation advice?"
    };

    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes("disease") || lowerQuestion.includes("blast") || lowerQuestion.includes("pest")) {
      return responses.disease;
    } else if (lowerQuestion.includes("fertilizer") || lowerQuestion.includes("nutrient")) {
      return responses.fertilizer;
    } else if (lowerQuestion.includes("water") || lowerQuestion.includes("irrigation")) {
      return responses.irrigation;
    }
    return responses.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Ask me anything about farming, crops, diseases, or market prices.
          </p>
        </div>

        <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-0">
          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader className="border-b border-border flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-base">Krishi Saathi AI</p>
                  <p className="text-xs text-muted-foreground font-normal">Always here to help</p>
                </div>
              </CardTitle>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4" style={{ minHeight: 0 }}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-4">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about farming..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Suggested Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  Suggested Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-smooth"
                  >
                    {question}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-hero border-primary/20">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  Get Better Answers
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ask specific questions about your crop type, location, and current challenges for more accurate advice.
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What I Can Help With</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Crop disease identification",
                  "Irrigation guidance",
                  "Fertilization advice",
                  "Market price insights",
                  "Pest control tips",
                  "Planting schedules"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-sm text-muted-foreground">{feature}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}