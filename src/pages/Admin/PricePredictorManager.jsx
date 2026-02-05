import React, { useState, useEffect } from 'react';
import {
  getAdminProducts,
  getAdminPriceHistory,
  fetchAdminMarketPrices,
  getAdminPriceStats,
} from "@/api/admin";
import {
  DollarSign, TrendingUp, TrendingDown, Package, MapPin,
  Calendar, Search, Plus, Edit, Trash2, Eye, RefreshCw,
  ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react';


const PricePredictorManager = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const formatPrice = (price) => `NPR ${parseFloat(price).toFixed(2)}`;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriceChange = (current, previous) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const [priceStats, setPriceStats] = useState({
    total_products: 0,
    updated_today: 0,
    missing_today: 0,
    total_price_records: 0,
  });

  // Filter data based on active tab
  const currentData = activeTab === "products" ? products : priceHistory;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
  }, [activeTab, currentPage, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
      };

      if (activeTab === "products") {
        const data = await getAdminProducts(params);
        setProducts(data.results);
        setTotalCount(data.count);
      } else {
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
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'products' ? 'Product' : 'Price Entry'}
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
              }}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'products'
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
              }}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'prices'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              Daily Price History
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'products' ? 'Search products by name ...' : 'Search by product or market...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Products Table */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
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
                {currentData.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    {/* Product */}
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

                    {/* Unit */}
                    <td className="px-6 py-4 text-slate-700">
                      {product.commodityunit || "—"}
                    </td>

                    {/* Latest Price */}
                    <td className="px-6 py-4">
                      {product.last_price !== null ? (
                        <span className="text-green-600 font-bold">
                          NPR {product.last_price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Today Status (derived, NOT DB field) */}
                    <td className="px-6 py-4">
                      {product.avg_price === null ? (
                        <span className="text-orange-600 font-medium">No data today</span>
                      ) : (
                        <span className="text-green-600 font-medium">Updated</span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(product.last_update)}
                    </td>

                  {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Price History Table */}
        {activeTab === 'prices' && (
          <div className="overflow-x-auto">
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
                {currentData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{entry.product_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-green-600">
                        NPR {entry.avg_price.toFixed(2)}
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
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to
              {Math.min(currentPage * itemsPerPage, totalCount)} of
              {totalCount} {activeTab === 'products' ? 'products' : 'records'}
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
      </div>
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

export default PricePredictorManager;