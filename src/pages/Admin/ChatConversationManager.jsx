/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Search, RefreshCw, MessageSquare, MessagesSquare,
  Trash2, Eye, User, Clock3, Pencil, AlertTriangle,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getChatConversations,
  getChatConversationDetail,
  deleteChatConversation,
  getDashboardStats,
} from "@/api/admin";

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

export default function ChatConversationManager() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [meta, setMeta] = useState({ count: 0, next: null, previous: null });
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(true); //

  const [selectedConversation, setSelectedConversation] = useState(null);

  const loadConversations = async (customPage = page) => {
    setLoading(true);
    setError("");
    try {
      const [listRes, statsRes] = await Promise.all([
        getChatConversations({ page: customPage, search: search || undefined }),
        getDashboardStats(),
      ]);

      const list = Array.isArray(listRes) ? listRes : listRes?.results || [];
      setConversations(list);
      setMeta({
        count: listRes?.count || list.length,
        next: listRes?.next || null,
        previous: listRes?.previous || null,
      });

      setStats({
        totalConversations: statsRes?.chatbot?.total_conversations || 0,
        totalMessages: statsRes?.chatbot?.total_messages || 0,
        deletedConversations: statsRes?.chatbot?.deleted_conversations || 0, 
      });
    } catch (err) {
      setError("Failed to load chat conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations(page);
  }, [page]);

  const applySearch = () => {
    setPage(1);
    loadConversations(1);
  };

  const openDetail = async (conversation) => {
    setDetailLoading(true);
    try {
      const detail = await getChatConversationDetail(conversation.id || conversation.pk);
      setSelectedConversation(detail);
    } catch {
      toast({ title: "Failed to load conversation detail.", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this conversation?")) return;
    try {
      await deleteChatConversation(id);
      toast({ title: "Conversation deleted!" }); 
      if (selectedConversation && (selectedConversation.id === id || selectedConversation.pk === id)) {
        setSelectedConversation(null);
      }
      loadConversations();
    } catch {
      toast({ title: "Failed to delete conversation.", variant: "destructive" })
    }
  };

  // Filter deleted ones on frontend if toggle is off
  const visibleConversations = useMemo(() => {
    if (showDeleted) return conversations;
    return conversations.filter((c) => !c.is_deleted);
  }, [conversations, showDeleted]);

  const pageStats = useMemo(() => {
    const withUsers = conversations.filter((c) => c?.user_name).length;
    return { withUsers };
  }, [conversations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Chat Conversations
        </h1>
        <p className="text-muted-foreground">
          Review AI assistant sessions and inspect conversation history.
        </p>
      </div>

      {/* Updated stat cards — includes deleted count */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Conversations" value={stats.totalConversations} icon={MessagesSquare} color="text-primary" />
        <StatCard title="Total Messages" value={stats.totalMessages} icon={MessageSquare} color="text-chart-4" />
        <StatCard title="Linked Users" value={pageStats.withUsers} icon={User} color="text-success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Search & Filter</CardTitle>
          <CardDescription>Find conversations by session, user name, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="Search conversations"
                className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <Button onClick={applySearch}>
              <Search className="w-4 h-4 mr-2" />Apply
            </Button>
            <Button variant="outline" onClick={() => loadConversations()}>
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
            {/* Toggle to show/hide soft-deleted conversations */}
            <Button
              variant={showDeleted ? "default" : "outline"}
              onClick={() => setShowDeleted((v) => !v)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {showDeleted ? "Hiding None" : "Show Deleted"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6">
        {/* Conversation List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Conversation List</CardTitle>
            <CardDescription>Total records: {meta.count}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">Loading conversations...</div>
            ) : visibleConversations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No conversations found.</div>
            ) : (
              <div className="space-y-3">
                {visibleConversations.map((conversation) => (
                  <div
                    key={conversation.id || conversation.pk}
                    className={`rounded-xl border p-4 flex flex-col gap-3 ${conversation.is_deleted
                        ? "border-destructive/30 bg-destructive/5"  
                        : "border-border"
                      }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {conversation?.user_name || "Anonymous User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {conversation?.user_email || "No email"}
                        </p>
                        <p className="text-xs text-muted-foreground break-all">
                          Session: {conversation?.session_id?.slice(-8) || "N/A"}
                        </p>
                        {/* Show deleted timestamp */}
                        {conversation.is_deleted && conversation.deleted_at && (
                          <p className="text-xs text-destructive">
                            Deleted: {new Date(conversation.deleted_at).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          Messages: {conversation?.message_count ?? conversation?.messages_count ?? "-"}
                        </Badge>
                        {/* Deleted badge */}
                        {conversation.is_deleted ? (
                          <Badge variant="destructive">Deleted</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDetail(conversation)}>
                        <Eye className="w-4 h-4 mr-1" />View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(conversation.id || conversation.pk)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />Delete
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-3">
                  <p className="text-sm text-muted-foreground">Page {page}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={!meta.previous} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <Button variant="outline" disabled={!meta.next} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Conversation Detail</CardTitle>
            <CardDescription>Inspect message sequence for the selected session</CardDescription>
          </CardHeader>
          <CardContent>
            {detailLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading detail...</div>
            ) : !selectedConversation ? (
              <div className="py-12 text-center text-muted-foreground">
                Select a conversation to view messages.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Conversation meta */}
                <div className={`rounded-xl border p-4 ${selectedConversation.is_deleted ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedConversation?.user_name || "Anonymous User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation?.user_email || "No email"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 break-all">
                        Session: {selectedConversation?.session_id?.slice(-8) || "N/A"}
                      </p>
                    </div>
                    {/* Show deleted warning in detail */}
                    {selectedConversation.is_deleted && (
                      <div className="flex items-center gap-1 text-xs text-destructive shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Deleted by user
                      </div>
                    )}
                  </div>
                  {selectedConversation.is_deleted && selectedConversation.deleted_at && (
                    <p className="text-xs text-destructive mt-2">
                      Deleted at: {new Date(selectedConversation.deleted_at).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {(selectedConversation?.messages || []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">No messages found.</div>
                  ) : (
                    selectedConversation.messages.map((message, index) => (
                      <div key={message.id || index} className="rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className={
                              message.role === "assistant"
                                ? "bg-primary/10 text-primary hover:bg-primary/10"
                                : "bg-muted text-foreground"
                            }
                          >
                            {message.role || "message"}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {/* Edited badge */}
                            {message.is_edited && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Pencil className="w-2.5 h-2.5" />
                                Edited
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock3 className="w-3 h-3" />
                              {message.timestamp
                                ? new Date(message.timestamp).toLocaleString()
                                : "No time"}
                            </div>
                          </div>
                        </div>

                        {/* Message content */}
                        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                          {message.content || "No content"}
                        </p>

                        {/* Show original content if edited */}
                        {message.is_edited && message.original_content && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Original message:
                            </p>
                            <p className="text-xs text-muted-foreground/70 italic whitespace-pre-wrap">
                              {message.original_content}
                            </p>
                            {message.edited_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Edited at: {new Date(message.edited_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}