import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Search, Eye, Trash2, Calendar,
  User, MessageCircle, Clock, ChevronLeft, ChevronRight, 
  RefreshCw, Loader, X
} from 'lucide-react';
import { getChatConversations, getChatConversationDetail, deleteChatConversation } from '@/api/admin';

const ChatConversationManager = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [currentPage, searchTerm]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: 20,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const data = await getChatConversations(params);
      setConversations(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 20));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      alert('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (conversation) => {
    setDetailsLoading(true);
    try {
      const details = await getChatConversationDetail(conversation.id);
      setSelectedConversation(details);
    } catch (error) {
      console.error('Failed to load conversation details:', error);
      alert('Failed to load conversation details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    setActionLoading(id);
    try {
      await deleteChatConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      setTotalCount(prev => prev - 1);
      alert('Conversation deleted successfully!');
      
      if (conversations.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
          icon={<User className="w-5 h-5 text-green-600" />}
          label="Active Users"
          value={conversations.filter(c => c.user).length}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5 text-purple-600" />}
          label="Total Messages"
          value={conversations.reduce((sum, c) => sum + (c.message_count || 0), 0)}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by session ID, user name, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
            <p className="mt-4 text-slate-600">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Session ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Messages</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Last Message</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {conversations.map((conversation) => (
                    <tr key={conversation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {conversation.user_name?.charAt(0) || conversation.user_email?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{conversation.user_name || 'Guest'}</p>
                            <p className="text-sm text-slate-500">{conversation.user_email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">
                          {conversation.session_id?.substring(0, 12)}...
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold text-slate-900">{conversation.message_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {conversation.last_message ? (
                            <>
                              <p className="text-sm text-slate-700 truncate">
                                {conversation.last_message.content}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(conversation.last_message.timestamp)}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-slate-400">No messages</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(conversation.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(conversation)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(conversation.id)}
                            disabled={actionLoading === conversation.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {actionLoading === conversation.id ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
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
                  Showing {conversations.length} of {totalCount} conversations
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedConversation(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Conversation Details</h3>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {detailsLoading ? (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
                  <p className="mt-4 text-slate-600">Loading details...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">User</label>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{selectedConversation.user_name || 'Guest'}</p>
                    <p className="text-sm text-slate-500">{selectedConversation.user_email || 'No email'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Session ID</label>
                    <code className="block mt-1 text-sm bg-slate-100 px-3 py-2 rounded font-mono break-all">
                      {selectedConversation.session_id}
                    </code>
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
                  
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-3">
                      Messages ({selectedConversation.messages?.length || 0})
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                        selectedConversation.messages.map((message, index) => (
                          <div
                            key={message.id || index}
                            className={`p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-green-50 border border-green-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-semibold ${
                                message.role === 'user' ? 'text-blue-700' : 'text-green-700'
                              }`}>
                                {message.role === 'user' ? 'User' : 'Assistant'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-4">No messages in this conversation</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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

export default ChatConversationManager;

// import React, { useState, useEffect } from 'react';
// import {
//   getChatConversations,
//   deleteChatConversation,
//   getChatMessages,
// } from "@/api/admin";

// import {
//   MessageSquare, Search, Filter, Eye, Trash2, Calendar,
//   User, MessageCircle, Clock, CheckCircle, XCircle,
//   ChevronLeft, ChevronRight, RefreshCw
// } from 'lucide-react';

// const ChatConversationsManager = () => {
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterActive, setFilterActive] = useState(null);
//   const [selectedConversation, setSelectedConversation] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalCount, setTotalCount] = useState(0);
//   const [messages, setMessages] = useState([]);
//   const totalPages = Math.ceil(totalCount / 20);

//   useEffect(() => {
//     loadConversations();
//   }, [currentPage, searchTerm, filterActive]);

//   const loadConversations = async () => {
//     setLoading(true);

//     try {
//       const data = await getChatConversations({
//         page: currentPage,
//         search: searchTerm,
//       });

//       setConversations(data.results);
//       setTotalCount(data.count);
//     } catch (error) {
//       console.error("Failed to load conversations:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openConversation = async (conversation) => {
//     setSelectedConversation(conversation);

//     try {
//       const data = await getChatMessages({
//         conversation_id: conversation.id,
//       });

//       setMessages(data.results);
//     } catch (error) {
//       console.error("Failed to load messages:", error);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to delete this conversation?"))
//       return;

//     try {
//       await deleteChatConversation(id);

//       setConversations((prev) =>
//         prev.filter((c) => c.id !== id)
//       );
//     } catch (error) {
//       console.error("Delete failed:", error);
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//   };

//   const filteredConversations = conversations.filter(conv => {
//     const matchesSearch = conv.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       conv.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       conv.title.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterActive === null || conv.is_active === filterActive;
//     return matchesSearch && matchesFilter;
//   });

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
//             <MessageSquare className="w-8 h-8 text-indigo-600" />
//             Chat Conversations
//           </h1>
//           <p className="text-slate-500 mt-2">Manage all user chat conversations</p>
//         </div>
//         <button
//           onClick={loadConversations}
//           className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
//         >
//           <RefreshCw className="w-4 h-4" />
//           Refresh
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <StatCard
//           icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
//           label="Total Conversations"
//           value={totalCount}
//           bgColor="bg-blue-50"
//         />
//         <StatCard
//           icon={<CheckCircle className="w-5 h-5 text-green-600" />}
//           label="Active Conversations"
//           value={conversations.filter(c => c.is_active).length}
//           bgColor="bg-green-50"
//         />
//         <StatCard
//           icon={<XCircle className="w-5 h-5 text-amber-600" />}
//           label="Inactive Conversations"
//           value={conversations.filter(c => !c.is_active).length}
//           bgColor="bg-amber-50"
//         />
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
//         <div className="flex flex-col lg:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//             <input
//               type="text"
//               placeholder="Search by user name, email, or conversation title..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
//             />
//           </div>

//           <div className="flex gap-2">
//             <button
//               onClick={() => setFilterActive(null)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterActive === null
//                   ? 'bg-indigo-600 text-white'
//                   : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                 }`}
//             >
//               All
//             </button>
//             <button
//               onClick={() => setFilterActive(true)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterActive === true
//                   ? 'bg-green-600 text-white'
//                   : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                 }`}
//             >
//               Active
//             </button>
//             <button
//               onClick={() => setFilterActive(false)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterActive === false
//                   ? 'bg-amber-600 text-white'
//                   : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                 }`}
//             >
//               Inactive
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Conversations List */}
//       <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
//         {loading ? (
//           <div className="p-12 text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//             <p className="mt-4 text-slate-600">Loading conversations...</p>
//           </div>
//         ) : filteredConversations.length === 0 ? (
//           <div className="p-12 text-center">
//             <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//             <p className="text-slate-600">No conversations found</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-slate-50 border-b border-slate-200">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">User</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Conversation</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Messages</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Last Message</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                   {filteredConversations.map((conversation) => (
//                     <tr key={conversation.id} className="hover:bg-slate-50 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
//                             {conversation.user_name.charAt(0)}
//                           </div>
//                           <div>
//                             <p className="font-semibold text-slate-900">{conversation.user_name}</p>
//                             <p className="text-sm text-slate-500">{conversation.user_email}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div>
//                           <p className="font-medium text-slate-900">
//                             {conversation.title || 'Untitled Conversation'}
//                           </p>
//                           <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
//                             <Calendar className="w-3 h-3" />
//                             Started {formatDate(conversation.created_at)}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <MessageCircle className="w-4 h-4 text-indigo-600" />
//                           <span className="font-semibold text-slate-900">{conversation.message_count}</span>
//                           <span className="text-sm text-slate-500">messages</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="max-w-xs">
//                           <p className="text-sm text-slate-700 truncate">
//                             {conversation.last_message?.content || 'No messages yet'}
//                           </p>
//                           {conversation.last_message && (
//                             <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
//                               <Clock className="w-3 h-3" />
//                               {formatTime(conversation.last_message.created_at)}
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${conversation.is_active
//                             ? 'bg-green-100 text-green-700'
//                             : 'bg-slate-100 text-slate-700'
//                           }`}>
//                           {conversation.is_active ? (
//                             <><CheckCircle className="w-3 h-3" /> Active</>
//                           ) : (
//                             <><XCircle className="w-3 h-3" /> Inactive</>
//                           )}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => openConversation(conversation)}
//                             className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
//                             title="View Details"
//                           >
//                             <Eye className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(conversation.id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
//               <div className="flex items-center justify-between">
//                 <p className="text-sm text-slate-600">
//                   Showing {filteredConversations.length} of {totalCount} conversations
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(totalPages, p + 1))
//                     }
//                     disabled={currentPage === totalPages}
//                     className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>
//                   <span className="px-4 py-2 text-sm font-medium text-slate-700">
//                     Page {currentPage}
//                   </span>
//                   <button
//                     onClick={() => setCurrentPage(currentPage + 1)}
//                     className="p-2 border border-slate-300 rounded-lg hover:bg-white transition-colors"
//                   >
//                     <ChevronRight className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Conversation Detail Modal */}
//       {selectedConversation && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
//               <h3 className="text-xl font-bold text-slate-900">Conversation Details</h3>
//               <button
//                 onClick={() => setSelectedConversation(null)}
//                 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//               >
//                 <XCircle className="w-6 h-6" />
//               </button>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">

//                 {/* User */}
//                 <div>
//                   <label className="text-sm font-medium text-slate-600">User</label>
//                   <p className="mt-1 text-lg font-semibold text-slate-900">
//                     {selectedConversation.user_name}
//                   </p>
//                   <p className="text-sm text-slate-500">
//                     {selectedConversation.user_email}
//                   </p>
//                 </div>

//                 {/* Title */}
//                 <div>
//                   <label className="text-sm font-medium text-slate-600">Title</label>
//                   <p className="mt-1 text-lg text-slate-900">
//                     {selectedConversation.title || "Untitled"}
//                   </p>
//                 </div>

//                 {/* Dates */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-sm font-medium text-slate-600">
//                       Created
//                     </label>
//                     <p className="mt-1 text-slate-900">
//                       {formatDate(selectedConversation.created_at)}
//                     </p>
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium text-slate-600">
//                       Last Updated
//                     </label>
//                     <p className="mt-1 text-slate-900">
//                       {formatDate(selectedConversation.updated_at)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Total Messages */}
//                 <div>
//                   <label className="text-sm font-medium text-slate-600">
//                     Total Messages
//                   </label>
//                   <p className="mt-1 text-2xl font-bold text-indigo-600">
//                     {selectedConversation.message_count}
//                   </p>
//                 </div>

//                 {/* 🔥 ADD THIS SECTION HERE */}
//                 <div>
//                   <label className="text-sm font-medium text-slate-600">
//                     Messages
//                   </label>

//                   <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
//                     {messages.length === 0 ? (
//                       <p className="text-sm text-slate-500">
//                         No messages found.
//                       </p>
//                     ) : (
//                       messages.map((msg) => (
//                         <div
//                           key={msg.id}
//                           className={`p-3 rounded-lg ${msg.role === "user"
//                               ? "bg-slate-100"
//                               : "bg-indigo-50"
//                             }`}
//                         >
//                           <p className="text-sm text-slate-800">
//                             {msg.content}
//                           </p>

//                           <p className="text-xs text-slate-500 mt-1">
//                             {formatDate(msg.timestamp)}
//                           </p>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//                 {/* 🔥 END */}

//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const StatCard = ({ icon, label, value, bgColor }) => (
//   <div className={`${bgColor} rounded-xl p-4 border border-slate-200`}>
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
//         <p className="text-2xl font-bold text-slate-900">{value}</p>
//       </div>
//       <div className="p-2 bg-white rounded-lg">{icon}</div>
//     </div>
//   </div>
// );

// export default ChatConversationsManager;