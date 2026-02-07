import { useState, useEffect } from "react";
import { getUserConversations } from "@/api/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Trash2, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export function ChatHistory({ currentSessionId, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await getUserConversations();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = uuidv4();
    localStorage.setItem('chatbot_session_id', newId);
    window.location.reload();
  };

  const handleSelectConversation = (sessionId) => {
    localStorage.setItem('chatbot_session_id', sessionId);
    window.location.reload();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat History
          </span>
          <Button
            onClick={handleNewChat}
            size="sm"
            variant="ghost"
            className="h-8 px-2"
          >
            New
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No chat history yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <button
                key={conv.session_id}
                onClick={() => handleSelectConversation(conv.session_id)}
                className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                  conv.session_id === currentSessionId ? 'bg-muted' : ''
                }`}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium line-clamp-1">
                    {conv.last_message || 'New conversation'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(conv.updated_at)}</span>
                    <span>•</span>
                    <span>{conv.message_count} messages</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}