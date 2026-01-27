import React, { useState, useEffect } from 'react';
import {
  Leaf, Search, Eye, Image, AlertTriangle, CheckCircle,
  Clock, Calendar, Filter, ChevronLeft, ChevronRight,
  RefreshCw, Loader, X
} from 'lucide-react';
import { getScanResults, getScanResultDetail } from '@/api/admin';

const ScanResultManager = () => {
  const [scanResults, setScanResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadScanResults();
  }, [currentPage, searchTerm, severityFilter]);

  const loadScanResults = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: 20,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (severityFilter) params.severity = severityFilter;

      const data = await getScanResults(params);
      setScanResults(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 20));
    } catch (error) {
      console.error('Failed to load scan results:', error);
      alert('Failed to load scan results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (scan) => {
    setDetailsLoading(true);
    setSelectedScan(scan);
    
    try {
      const details = await getScanResultDetail(scan.id);
      setSelectedScan(details);
    } catch (error) {
      console.error('Failed to load scan details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[severity?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getSeverityIcon = (severity) => {
    if (severity?.toLowerCase() === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (severity?.toLowerCase() === 'low') return <CheckCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const stats = {
    total: totalCount,
    high: scanResults.filter(s => s.severity?.toLowerCase() === 'high').length,
    medium: scanResults.filter(s => s.severity?.toLowerCase() === 'medium').length,
    low: scanResults.filter(s => s.severity?.toLowerCase() === 'low').length,
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
        <button 
          onClick={loadScanResults}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          label="High Severity"
          value={stats.high}
          bgColor="bg-red-50"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          label="Medium Severity"
          value={stats.medium}
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          label="Low Severity"
          value={stats.low}
          bgColor="bg-green-50"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by crop type or disease..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={severityFilter || ''}
            onChange={(e) => {
              setSeverityFilter(e.target.value || null);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <Loader className="w-12 h-12 text-green-600 mx-auto animate-spin" />
          <p className="mt-4 text-slate-600">Loading scan results...</p>
        </div>
      ) : scanResults.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <Leaf className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No scan results found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scanResults.map((scan) => (
              <div
                key={scan.id}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-100">
                  {scan.image_url || scan.image ? (
                    <img
                      src={scan.image_url || scan.image}
                      alt="Crop scan"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=Crop+Scan';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-16 h-16 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Crop Type & Disease */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-600">Crop Type</label>
                    <p className="text-lg font-bold text-slate-900 mt-1">{scan.crop_type || 'Unknown'}</p>
                  </div>

                  {scan.disease && (
                    <>
                      <div className="mb-4">
                        <label className="text-sm font-medium text-slate-600">Detected Disease</label>
                        <p className="text-lg font-bold text-slate-900 mt-1">{scan.disease}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Confidence</label>
                          <div className="mt-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                  style={{ width: `${(scan.confidence || 0) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-900">
                                {Math.round((scan.confidence || 0) * 100)}%
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

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(scan.created_at)}
                    </div>
                    <button
                      onClick={() => handleViewDetails(scan)}
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {scanResults.length} of {totalCount} results
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

      {/* Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedScan(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Scan Result Details</h3>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {detailsLoading ? (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 text-green-600 mx-auto animate-spin" />
                  <p className="mt-4 text-slate-600">Loading details...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedScan.image_url || selectedScan.image || 'https://via.placeholder.com/400x300/10b981/ffffff?text=Crop+Scan'}
                      alt="Crop scan"
                      className="w-full rounded-lg border border-slate-200"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=Crop+Scan';
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Crop Type</label>
                      <p className="mt-1 text-xl font-bold text-slate-900">{selectedScan.crop_type || 'Unknown'}</p>
                    </div>
                    {selectedScan.disease && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Disease Detected</label>
                          <p className="mt-1 text-xl font-bold text-slate-900">{selectedScan.disease}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Confidence Score</label>
                          <p className="mt-1 text-2xl font-bold text-green-600">
                            {Math.round((selectedScan.confidence || 0) * 100)}%
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

export default ScanResultManager;