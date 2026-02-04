import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Search, Filter, Eye, Trash2, Calendar,
  User, MessageCircle, Clock, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';

// Mock API call
const mockGetConversations = async () => {
  return {
    results: [
      { id: 1, user: 1, user_name: 'John Doe', user_email: 'john@example.com', title: 'Crop Disease Query', created_at: '2024-02-20T10:30:00Z', updated_at: '2024-02-20T15:45:00Z', is_active: true, message_count: 12, last_message: { content: 'Thank you for the help with identifying the disease.', created_at: '2024-02-20T15:45:00Z' } },
      { id: 2, user: 2, user_name: 'Jane Smith', user_email: 'jane@example.com', title: 'Weather Information', created_at: '2024-02-19T08:15:00Z', updated_at: '2024-02-20T12:20:00Z', is_active: true, message_count: 8, last_message: { content: 'What will be the weather tomorrow?', created_at: '2024-02-20T12:20:00Z' } },
      { id: 3, user: 3, user_name: 'Bob Wilson', user_email: 'bob@example.com', title: '', created_at: '2024-02-18T14:20:00Z', updated_at: '2024-02-19T09:30:00Z', is_active: false, message_count: 5, last_message: { content: 'How do I plant tomatoes?', created_at: '2024-02-19T09:30:00Z' } },
    ],
    count: 50,
  };
};

const ChatConversationsManager = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadConversations();
  }, [currentPage, searchTerm, filterActive]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await mockGetConversations();
      setConversations(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      setConversations(conversations.filter(c => c.id !== id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === null || conv.is_active === filterActive;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            Chat Conversations
          </h1>
          <p className="text-slate-500 mt-2">Manage all user chat conversations</p>
        </div>
        <button
          onClick={loadConversations}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
          label="Total Conversations"
          value={totalCount}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          label="Active Conversations"
          value={conversations.filter(c => c.is_active).length}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5 text-amber-600" />}
          label="Inactive Conversations"
          value={conversations.filter(c => !c.is_active).length}
          bgColor="bg-amber-50"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user name, email, or conversation title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterActive === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterActive === true
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterActive === false
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No conversations found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Conversation</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Messages</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Last Message</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredConversations.map((conversation) => (
                    <tr key={conversation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {conversation.user_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{conversation.user_name}</p>
                            <p className="text-sm text-slate-500">{conversation.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {conversation.title || 'Untitled Conversation'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            Started {formatDate(conversation.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold text-slate-900">{conversation.message_count}</span>
                          <span className="text-sm text-slate-500">messages</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-slate-700 truncate">
                            {conversation.last_message?.content || 'No messages yet'}
                          </p>
                          {conversation.last_message && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(conversation.last_message.created_at)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                          conversation.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {conversation.is_active ? (
                            <><CheckCircle className="w-3 h-3" /> Active</>
                          ) : (
                            <><XCircle className="w-3 h-3" /> Inactive</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedConversation(conversation)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(conversation.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {filteredConversations.length} of {totalCount} conversations
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-slate-700">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Conversation Details</h3>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">User</label>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{selectedConversation.user_name}</p>
                  <p className="text-sm text-slate-500">{selectedConversation.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Title</label>
                  <p className="mt-1 text-lg text-slate-900">{selectedConversation.title || 'Untitled'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Created</label>
                    <p className="mt-1 text-slate-900">{formatDate(selectedConversation.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Last Updated</label>
                    <p className="mt-1 text-slate-900">{formatDate(selectedConversation.updated_at)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Total Messages</label>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">{selectedConversation.message_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-4 border border-slate-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="p-2 bg-white rounded-lg">{icon}</div>
    </div>
  </div>
);

export default ChatConversationsManager;