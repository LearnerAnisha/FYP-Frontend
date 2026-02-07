import { sendChatMessage, getConversationHistory } from "@/api/chat";
import { v4 as uuidv4 } from "uuid";
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Leaf, Lightbulb, Loader2, History } from "lucide-react";
import { ChatHistory } from "@/pages/ChatHistory";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get or create session ID from localStorage
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chatbot_session_id');
    if (stored) {
      return stored;
    }
    const newId = uuidv4();
    localStorage.setItem('chatbot_session_id', newId);
    return newId;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const data = await getConversationHistory(sessionId);
        
        if (data.success && data.conversation.messages.length > 0) {
          // Convert API messages to component format
          const loadedMessages = data.conversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(loadedMessages);
        } else {
          // No history found, show welcome message
          setMessages([{
            role: "assistant",
            content: "Namaste! I'm your Krishi Saathi AI assistant. How can I help you with your farming today?",
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error loading history:', error);
        // Show welcome message on error
        setMessages([{
          role: "assistant",
          content: "Namaste! I'm your Krishi Saathi AI assistant. How can I help you with your farming today?",
          timestamp: new Date()
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [sessionId]);

  const suggestedQuestions = [
    "How do I prevent rice blast disease?",
    "When is the best time to plant tomatoes?",
    "What fertilizer is best for wheat?",
    "How to improve soil quality?"
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await sendChatMessage({
        session_id: sessionId,
        message: userMessage.content,
      });

      const aiMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(data.timestamp),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
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

  const handleNewChat = () => {
    // Generate new session ID
    const newId = uuidv4();
    localStorage.setItem('chatbot_session_id', newId);
    // Reload page to start fresh
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-3 px-1 border-b border-border bg-background sticky top-0 z-10">

          {/* Left Title */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground leading-tight">
              AI Assistant
            </h1>
            <p className="text-muted-foreground text-sm">
              Ask me anything about farming, crops, diseases, or market prices.
            </p>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              {showHistory ? "Hide" : "Show"} History
            </Button>

            <Button
              onClick={handleNewChat}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-0">
          {/* History Sidebar (conditionally rendered) */}
          {showHistory && (
            <div className="lg:col-span-1">
              <ChatHistory 
                currentSessionId={sessionId}
                onSelectConversation={(id) => {
                  localStorage.setItem('chatbot_session_id', id);
                  window.location.reload();
                }}
              />
            </div>
          )}

          {/* Chat Area */}
          <Card className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col`}>
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
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading your conversation...</p>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
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
                  disabled={isLoadingHistory}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || isLoadingHistory}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Sidebar */}
          <div className={`${showHistory ? 'lg:col-span-1' : 'lg:col-span-1'} space-y-4`}>
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
                    disabled={isLoadingHistory}
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