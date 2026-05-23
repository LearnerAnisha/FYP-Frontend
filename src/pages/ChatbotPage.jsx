import { sendChatMessage, getConversationHistory, editMessage } from "@/api/chat";
import { v4 as uuidv4 } from "uuid";
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Leaf, Lightbulb, Loader2, History, Pencil, Check, X as XIcon } from "lucide-react";
import { ChatHistory } from "@/pages/ChatHistory";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(() => {
    return localStorage.getItem('showHistory') === 'true';
  });

  // Edit states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const messagesEndRef = useRef(null);

  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem('chatbot_session_id');
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem('chatbot_session_id', newId);
    return newId;
  });

  const [upgradeModal, setUpgradeModal] = useState({ open: false, used: 0, limit: 10 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const data = await getConversationHistory(sessionId);
        if (data.success && data.conversation.messages.length > 0) {
          const loadedMessages = data.conversation.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            is_edited: msg.is_edited,
          }));
          setMessages(loadedMessages);
        } else {
          setMessages([{
            role: "assistant",
            content: "Namaste! I'm your Krishi Saathi AI assistant. How can I help you with your farming today?",
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error loading history:', error);
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
    const userMessage = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    try {
      const data = await sendChatMessage({ session_id: sessionId, message: userMessage.content });
      setMessages((prev) => [...prev, {
        id: data.message_id,
        role: "assistant",
        content: data.response,
        timestamp: new Date(data.timestamp),
      }]);
    } catch (error) {
      if (error?.response?.status === 403) {
        const d = error.response.data;
        setUpgradeModal({ open: true, used: d?.used ?? 10, limit: d?.limit ?? 10 });
        setIsTyping(false);
        return;
      }
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    const newId = uuidv4();
    localStorage.setItem('chatbot_session_id', newId);
    setSessionId(newId);
    setMessages([{
      role: "assistant",
      content: "Namaste! I'm your Krishi Saathi AI assistant. How can I help you with your farming today?",
      timestamp: new Date()
    }]);
  };

  // Edit handlers
  const handleEditStart = (message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleEditSave = async (message) => {
    if (!editingContent.trim()) return;
    try {
      await editMessage(message.id, editingContent);

      // Remove this message and everything after it
      const msgIndex = messages.findIndex(m => m.id === message.id);
      const trimmed = messages.slice(0, msgIndex);

      setEditingMessageId(null);
      setEditingContent("");

      // Add edited message and re-send to AI
      const editedMessage = { ...message, content: editingContent, is_edited: true };
      setMessages([...trimmed, editedMessage]);
      setIsTyping(true);

      const data = await sendChatMessage({ session_id: sessionId, message: editingContent });
      setMessages(prev => [...prev, {
        id: data.message_id,
        role: "assistant",
        content: data.response,
        timestamp: new Date(data.timestamp),
      }]);
    } catch (error) {
      console.error('Error editing message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout noPadding>
      <div className="h-full flex flex-col overflow-hidden p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex items-center justify-between py-3 px-1 border-b border-border bg-background flex-shrink-0">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground leading-tight">
              AI Assistant
            </h1>
            <p className="text-muted-foreground text-sm">
              Ask me anything about farming, crops, diseases, or market prices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                const next = !showHistory;
                setShowHistory(next);
                localStorage.setItem('showHistory', next);
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              {showHistory ? "Hide" : "Show"} History
            </Button>
            <Button onClick={handleNewChat} variant="outline" size="sm" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Body grid */}
        <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-0 overflow-hidden pt-4">

          {/* History Sidebar */}
          {showHistory && (
            <div className="lg:col-span-1 overflow-y-auto">
              <ChatHistory
                currentSessionId={sessionId}
                onSelectConversation={(id) => {
                  localStorage.setItem('chatbot_session_id', id);
                  setSessionId(id);
                }}
                onNewChat={(id) => {
                  setSessionId(id);
                  setMessages([{
                    role: "assistant",
                    content: "Namaste! I'm your Krishi Saathi AI assistant. How can I help you with your farming today?",
                    timestamp: new Date()
                  }]);
                }}
              />
            </div>
          )}

          {/* Chat Card */}
          <Card className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col h-full min-h-0 overflow-hidden`}>
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
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
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
                    <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div className={`flex-1 max-w-[80%] flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>

                        {/* Edit mode */}
                        {editingMessageId === message.id ? (
                          <div className="w-full space-y-2">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full p-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                                <XIcon className="w-3.5 h-3.5 mr-1" /> Cancel
                              </Button>
                              <Button size="sm" onClick={() => handleEditSave(message)}>
                                <Check className="w-3.5 h-3.5 mr-1" /> Save & Resend
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Normal message
                          <div className="group relative">
                            <div className={`rounded-2xl p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                            </div>
                            {/* Edit button — only for user messages that have an id */}
                            {message.role === "user" && message.id && (
                              <button
                                onClick={() => handleEditStart(message)}
                                className="absolute -left-8 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted"
                              >
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-1 px-4">
                          <p className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {message.is_edited && (
                            <p className="text-xs text-muted-foreground">(edited)</p>
                          )}
                        </div>
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

            {/* Input */}
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

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  Suggested Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button key={index} onClick={() => setInput(question)}
                    className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-smooth"
                    disabled={isLoadingHistory}>
                    {question}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-hero border-primary/20">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Get Better Answers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ask specific questions about your crop type, location, and current challenges for more accurate advice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">What I Can Help With</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Crop disease identification", "Irrigation guidance", "Fertilization advice", "Market price insights", "Pest control tips", "Planting schedules"].map((feature, index) => (
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

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal((s) => ({ ...s, open: false }))}
        featureName="chatbot messages"
        used={upgradeModal.used}
        limit={upgradeModal.limit}
      />
    </DashboardLayout>
  );
}