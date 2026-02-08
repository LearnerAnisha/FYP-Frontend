import React, { useState, useEffect } from 'react';
import {
  getAdminProducts,
  getAdminProductDetail,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminPriceHistory,
  getAdminPriceHistoryDetail,
  updateAdminPriceHistory,
  deleteAdminPriceHistory,
  fetchAdminMarketPrices,
  getAdminPriceStats,
} from "@/api/admin";
import {
  DollarSign, TrendingUp, TrendingDown, Package, MapPin,
  Calendar, Search, Plus, Edit, Trash2, Eye, RefreshCw,
  ChevronLeft, ChevronRight, BarChart3, X, Filter, SlidersHorizontal
} from 'lucide-react';

const PricePredictorManager = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editFormData, setEditFormData] = useState({});
  const itemsPerPage = 20;

  // Filter states
  const [filters, setFilters] = useState({
    // Product filters
    priceRange: { min: '', max: '' },
    hasDataToday: '',
    sortBy: 'commodityname',
    sortOrder: 'asc',
    // Price history filters
    dateRange: { start: '', end: '' },
    priceHistoryRange: { min: '', max: '' },
  });

  const [priceStats, setPriceStats] = useState({
    total_products: 0,
    updated_today: 0,
    missing_today: 0,
    total_price_records: 0,
  });

  // Filter data based on active tab
  const currentData = activeTab === "products" ? products : priceHistory;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '—';
    return `NPR ${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const loadPriceStats = async () => {
    try {
      const data = await getAdminPriceStats();
      setPriceStats(data);
    } catch (error) {
      console.error("Failed to load price stats", error);
    }
  };

  useEffect(() => {
    loadPriceStats();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, searchTerm, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
      };

      if (activeTab === "products") {
        // Add product-specific filters
        if (filters.priceRange.min) params.min_price__gte = filters.priceRange.min;
        if (filters.priceRange.max) params.max_price__lte = filters.priceRange.max;
        
        // Sorting
        const ordering = filters.sortOrder === 'desc' ? `-${filters.sortBy}` : filters.sortBy;
        params.ordering = ordering;

        const data = await getAdminProducts(params);
        
        // Apply client-side filter for "has data today"
        let filteredResults = data.results;
        if (filters.hasDataToday === 'yes') {
          filteredResults = data.results.filter(p => p.avg_price !== null);
        } else if (filters.hasDataToday === 'no') {
          filteredResults = data.results.filter(p => p.avg_price === null);
        }
        
        setProducts(filteredResults);
        setTotalCount(data.count);
      } else {
        // Add price history filters
        if (filters.dateRange.start) params.date__gte = filters.dateRange.start;
        if (filters.dateRange.end) params.date__lte = filters.dateRange.end;
        if (filters.priceHistoryRange.min) params.avg_price__gte = filters.priceHistoryRange.min;
        if (filters.priceHistoryRange.max) params.avg_price__lte = filters.priceHistoryRange.max;
        
        // Sorting
        const ordering = filters.sortOrder === 'desc' ? `-${filters.sortBy}` : filters.sortBy;
        params.ordering = ordering;

        const data = await getAdminPriceHistory(params);
        setPriceHistory(data.results);
        setTotalCount(data.count);
      }
    } catch (error) {
      console.error("Failed to load price data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      setLoading(true);
      let data;
      if (activeTab === 'products') {
        data = await getAdminProductDetail(id);
      } else {
        data = await getAdminPriceHistoryDetail(id);
      }
      setSelectedItem(data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Failed to load details", error);
      alert("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      let data;
      if (activeTab === 'products') {
        data = await getAdminProductDetail(id);
      } else {
        data = await getAdminPriceHistoryDetail(id);
      }
      setSelectedItem(data);
      setEditFormData(data);
      setShowEditModal(true);
    } catch (error) {
      console.error("Failed to load details", error);
      alert("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      if (activeTab === 'products') {
        await updateAdminProduct(selectedItem.id, editFormData);
      } else {
        await updateAdminPriceHistory(selectedItem.id, editFormData);
      }
      setShowEditModal(false);
      loadData();
      loadPriceStats();
      alert("Updated successfully");
    } catch (error) {
      console.error("Failed to update", error);
      alert("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      if (activeTab === 'products') {
        await deleteAdminProduct(selectedItem.id);
      } else {
        await deleteAdminPriceHistory(selectedItem.id);
      }
      setShowDeleteModal(false);
      loadData();
      loadPriceStats();
      alert("Deleted successfully");
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPrices = async () => {
    try {
      setLoading(true);
      await fetchAdminMarketPrices();
      loadData();
      loadPriceStats();
      alert("Market prices refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh prices", error);
      alert("Failed to refresh prices");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      priceRange: { min: '', max: '' },
      hasDataToday: '',
      sortBy: 'commodityname',
      sortOrder: 'asc',
      dateRange: { start: '', end: '' },
      priceHistoryRange: { min: '', max: '' },
    });
    setCurrentPage(1);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (activeTab === 'products') {
      if (filters.priceRange.min || filters.priceRange.max) count++;
      if (filters.hasDataToday) count++;
      if (filters.sortBy !== 'commodityname' || filters.sortOrder !== 'asc') count++;
    } else {
      if (filters.dateRange.start || filters.dateRange.end) count++;
      if (filters.priceHistoryRange.min || filters.priceHistoryRange.max) count++;
      if (filters.sortBy !== 'commodityname' || filters.sortOrder !== 'asc') count++;
    }
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            Price Predictor Management
          </h1>
          <p className="text-slate-500 mt-2">Manage products and daily price history</p>
        </div>
        <button
          onClick={handleRefreshPrices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Prices
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5 text-blue-600" />}
          label="Total Products"
          value={priceStats.total_products}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          label="Updated Today"
          value={priceStats.updated_today}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-amber-600" />}
          label="No Data Today"
          value={priceStats.missing_today}
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
          label="Price Records"
          value={priceStats.total_price_records}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab('products');
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Master Products
            </button>
            <button
              onClick={() => {
                setActiveTab('prices');
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'prices'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Daily Price History
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'products'
                    ? 'Search products by name or unit...'
                    : 'Search by product name...'
                }
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="relative flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount()}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount() > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-600">Active filters:</span>
              
              {activeTab === 'products' && (
                <>
                  {filters.hasDataToday && (
                    <FilterBadge
                      label={`Has data today: ${filters.hasDataToday === 'yes' ? 'Yes' : 'No'}`}
                      onRemove={() => setFilters({ ...filters, hasDataToday: '' })}
                    />
                  )}
                  {(filters.priceRange.min || filters.priceRange.max) && (
                    <FilterBadge
                      label={`Price: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}`}
                      onRemove={() => setFilters({ ...filters, priceRange: { min: '', max: '' } })}
                    />
                  )}
                </>
              )}

              {activeTab === 'prices' && (
                <>
                  {(filters.dateRange.start || filters.dateRange.end) && (
                    <FilterBadge
                      label={`Date: ${filters.dateRange.start || 'Start'} - ${filters.dateRange.end || 'End'}`}
                      onRemove={() => setFilters({ ...filters, dateRange: { start: '', end: '' } })}
                    />
                  )}
                  {(filters.priceHistoryRange.min || filters.priceHistoryRange.max) && (
                    <FilterBadge
                      label={`Price: ${filters.priceHistoryRange.min || '0'} - ${filters.priceHistoryRange.max || '∞'}`}
                      onRemove={() => setFilters({ ...filters, priceHistoryRange: { min: '', max: '' } })}
                    />
                  )}
                </>
              )}

              {(filters.sortBy !== 'commodityname' || filters.sortOrder !== 'asc') && (
                <FilterBadge
                  label={`Sort: ${filters.sortBy} (${filters.sortOrder})`}
                  onRemove={() => setFilters({ ...filters, sortBy: 'commodityname', sortOrder: 'asc' })}
                />
              )}

              <button
                onClick={resetFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Products Table */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No products found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Latest Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Today</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Last Updated</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-semibold">
                            {product.commodityname.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {product.commodityname}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {product.commodityunit || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {product.last_price !== null ? (
                          <span className="text-green-600 font-bold">
                            {formatPrice(product.last_price)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.avg_price === null ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            No data today
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Updated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(product.last_update)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(product.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
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
            )}
          </div>
        )}

        {/* Price History Table */}
        {activeTab === 'prices' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : priceHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No price history found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Range</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {priceHistory.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{entry.product_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(entry.avg_price)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-slate-600">
                            Min: <span className="font-semibold">{formatPrice(entry.min_price)}</span>
                          </p>
                          <p className="text-slate-600">
                            Max: <span className="font-semibold">{formatPrice(entry.max_price)}</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(entry.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(entry.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry)}
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
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{' '}
              {activeTab === 'products' ? 'products' : 'records'}
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
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <Modal onClose={() => setShowFilterModal(false)} title="Advanced Filters">
          <div className="space-y-6">
            {activeTab === 'products' ? (
              <>
                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Price Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Min Price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={filters.priceRange.min}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, min: e.target.value }
                      })}
                    />
                    <InputField
                      label="Max Price"
                      type="number"
                      step="0.01"
                      placeholder="9999.99"
                      value={filters.priceRange.max}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, max: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* Has Data Today Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Data Availability Today</label>
                  <select
                    value={filters.hasDataToday}
                    onChange={(e) => setFilters({ ...filters, hasDataToday: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  >
                    <option value="">All</option>
                    <option value="yes">Has data today</option>
                    <option value="no">No data today</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Sort By</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                      <option value="commodityname">Name</option>
                      <option value="min_price">Min Price</option>
                      <option value="max_price">Max Price</option>
                      <option value="avg_price">Avg Price</option>
                      <option value="last_price">Last Price</option>
                      <option value="last_update">Last Update</option>
                    </select>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Start Date"
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: e.target.value }
                      })}
                    />
                    <InputField
                      label="End Date"
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Price Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Min Price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={filters.priceHistoryRange.min}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceHistoryRange: { ...filters.priceHistoryRange, min: e.target.value }
                      })}
                    />
                    <InputField
                      label="Max Price"
                      type="number"
                      step="0.01"
                      placeholder="9999.99"
                      value={filters.priceHistoryRange.max}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceHistoryRange: { ...filters.priceHistoryRange, max: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Sort By</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                      <option value="date">Date</option>
                      <option value="avg_price">Avg Price</option>
                      <option value="min_price">Min Price</option>
                      <option value="max_price">Max Price</option>
                    </select>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowFilterModal(false);
                setCurrentPage(1);
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                resetFilters();
                setShowFilterModal(false);
              }}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Reset Filters
            </button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <Modal onClose={() => setShowViewModal(false)} title="View Details">
          {activeTab === 'products' ? (
            <div className="space-y-4">
              <DetailRow label="Commodity Name" value={selectedItem.commodityname} />
              <DetailRow label="Unit" value={selectedItem.commodityunit || '—'} />
              <DetailRow label="Minimum Price" value={formatPrice(selectedItem.min_price)} />
              <DetailRow label="Maximum Price" value={formatPrice(selectedItem.max_price)} />
              <DetailRow label="Average Price" value={formatPrice(selectedItem.avg_price)} />
              <DetailRow label="Last Known Price" value={formatPrice(selectedItem.last_price)} />
              <DetailRow label="Insert Date" value={formatDate(selectedItem.insert_date)} />
              <DetailRow label="Last Update" value={formatDate(selectedItem.last_update)} />
            </div>
          ) : (
            <div className="space-y-4">
              <DetailRow label="Product" value={selectedItem.product_name} />
              <DetailRow label="Date" value={formatDate(selectedItem.date)} />
              <DetailRow label="Minimum Price" value={formatPrice(selectedItem.min_price)} />
              <DetailRow label="Maximum Price" value={formatPrice(selectedItem.max_price)} />
              <DetailRow label="Average Price" value={formatPrice(selectedItem.avg_price)} />
            </div>
          )}
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <Modal onClose={() => setShowEditModal(false)} title="Edit Details">
          {activeTab === 'products' ? (
            <div className="space-y-4">
              <InputField
                label="Commodity Name"
                value={editFormData.commodityname || ''}
                onChange={(e) => setEditFormData({ ...editFormData, commodityname: e.target.value })}
              />
              <InputField
                label="Unit"
                value={editFormData.commodityunit || ''}
                onChange={(e) => setEditFormData({ ...editFormData, commodityunit: e.target.value })}
              />
              <InputField
                label="Minimum Price"
                type="number"
                step="0.01"
                value={editFormData.min_price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, min_price: e.target.value })}
              />
              <InputField
                label="Maximum Price"
                type="number"
                step="0.01"
                value={editFormData.max_price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, max_price: e.target.value })}
              />
              <InputField
                label="Average Price"
                type="number"
                step="0.01"
                value={editFormData.avg_price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, avg_price: e.target.value })}
              />
              <InputField
                label="Last Known Price"
                type="number"
                step="0.01"
                value={editFormData.last_price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, last_price: e.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                <strong>Product:</strong> {selectedItem.product_name}
              </div>
              <InputField
                label="Date"
                type="date"
                value={editFormData.date || ''}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
              />
              <InputField
                label="Minimum Price"
                type="number"
                step="0.01"
                value={editFormData.min_price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, min_price: e.target.value })}
              />
              <InputField
                label="Maximum Price"
                type="number"
                step="0.01"
                value={editFormData.max_price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, max_price: e.target.value })}
              />
              <InputField
                label="Average Price"
                type="number"
                step="0.01"
                value={editFormData.avg_price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, avg_price: e.target.value })}
              />
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleEditSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedItem && (
        <Modal onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
          <p className="text-slate-600 mb-6">
            Are you sure you want to delete{' '}
            <strong>
              {activeTab === 'products' ? selectedItem.commodityname : selectedItem.product_name}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Helper Components
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

const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-slate-100">
    <span className="font-semibold text-slate-600">{label}:</span>
    <span className="text-slate-900">{value}</span>
  </div>
);

const InputField = ({ label, type = 'text', value, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
      {...props}
    />
  </div>
);

const FilterBadge = ({ label, onRemove }) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

export default PricePredictorManager;