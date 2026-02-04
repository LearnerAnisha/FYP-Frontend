import React, { useState, useEffect } from 'react';
import {
  Leaf, Search, Eye, Image, AlertTriangle, CheckCircle,
  Clock, User, Calendar, Filter, ChevronLeft, ChevronRight,
  RefreshCw, Download, XCircle
} from 'lucide-react';

// Mock data
const mockScanResults = [
  {
    id: 1,
    user: 1,
    user_name: 'John Doe',
    user_email: 'john@example.com',
    disease_detected: 'Tomato Late Blight',
    confidence_score: 0.95,
    severity: 'high',
    status: 'completed',
    created_at: '2024-02-20T10:30:00Z',
    image: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Crop+Scan'
  },
  {
    id: 2,
    user: 2,
    user_name: 'Jane Smith',
    user_email: 'jane@example.com',
    disease_detected: 'Potato Early Blight',
    confidence_score: 0.88,
    severity: 'medium',
    status: 'completed',
    created_at: '2024-02-19T14:15:00Z',
    image: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Crop+Scan'
  },
  {
    id: 3,
    user: 3,
    user_name: 'Bob Wilson',
    user_email: 'bob@example.com',
    disease_detected: '',
    confidence_score: null,
    severity: '',
    status: 'processing',
    created_at: '2024-02-20T15:45:00Z',
    image: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Processing'
  },
  {
    id: 4,
    user: 4,
    user_name: 'Alice Brown',
    user_email: 'alice@example.com',
    disease_detected: 'Healthy Leaf',
    confidence_score: 0.92,
    severity: 'low',
    status: 'completed',
    created_at: '2024-02-18T09:20:00Z',
    image: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Healthy'
  },
];

const ScanResultsManager = () => {
  const [scanResults, setScanResults] = useState(mockScanResults);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[severity] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      processing: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (severity === 'low') return <CheckCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const filteredResults = scanResults.filter(scan => {
    const matchesSearch = scan.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.disease_detected.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === null || scan.status === statusFilter;
    const matchesSeverity = severityFilter === null || scan.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const currentResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const stats = {
    total: scanResults.length,
    completed: scanResults.filter(s => s.status === 'completed').length,
    processing: scanResults.filter(s => s.status === 'processing').length,
    highSeverity: scanResults.filter(s => s.severity === 'high').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Leaf className="w-8 h-8 text-green-600" />
            Crop Disease Scan Results
          </h1>
          <p className="text-slate-500 mt-2">Monitor and analyze crop disease detections</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Image className="w-5 h-5 text-blue-600" />}
          label="Total Scans"
          value={stats.total}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          label="Completed"
          value={stats.completed}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          label="Processing"
          value={stats.processing}
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          label="High Severity"
          value={stats.highSeverity}
          bgColor="bg-red-50"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user, email, or disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={severityFilter || ''}
              onChange={(e) => setSeverityFilter(e.target.value || null)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">All Severity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentResults.map((scan) => (
          <div
            key={scan.id}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Image */}
            <div className="relative h-48 bg-slate-100">
              <img
                src={scan.image}
                alt="Crop scan"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(scan.status)}`}>
                  {scan.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {scan.user_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{scan.user_name}</p>
                  <p className="text-sm text-slate-500">{scan.user_email}</p>
                </div>
              </div>

              {/* Disease Info */}
              {scan.status === 'completed' && (
                <>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-600">Detected Disease</label>
                    <p className="text-lg font-bold text-slate-900 mt-1">
                      {scan.disease_detected || 'No disease detected'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Confidence</label>
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              style={{ width: `${(scan.confidence_score || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {Math.round((scan.confidence_score || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Severity</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(scan.severity)}`}>
                          {getSeverityIcon(scan.severity)}
                          {scan.severity?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {scan.status === 'processing' && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-sm font-medium text-blue-700">Processing scan...</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(scan.created_at)}
                </div>
                <button
                  onClick={() => setSelectedScan(scan)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length} results
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
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Scan Result Details</h3>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedScan.image}
                    alt="Crop scan"
                    className="w-full rounded-lg border border-slate-200"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">User</label>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{selectedScan.user_name}</p>
                    <p className="text-sm text-slate-500">{selectedScan.user_email}</p>
                  </div>
                  {selectedScan.disease_detected && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Disease Detected</label>
                        <p className="mt-1 text-xl font-bold text-slate-900">{selectedScan.disease_detected}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Confidence Score</label>
                        <p className="mt-1 text-2xl font-bold text-green-600">
                          {Math.round((selectedScan.confidence_score || 0) * 100)}%
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Severity Level</label>
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border ${getSeverityColor(selectedScan.severity)}`}>
                            {getSeverityIcon(selectedScan.severity)}
                            {selectedScan.severity?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-600">Scan Date</label>
                    <p className="mt-1 text-slate-900">{formatDate(selectedScan.created_at)}</p>
                  </div>
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

export default ScanResultsManager;