import { useEffect, useState, useCallback } from "react";
import {
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
} from "@/api/admin";
import {
  CreditCard, Search, RefreshCw, ChevronLeft,
  ChevronRight, CheckCircle, XCircle, Trash2,
  ToggleLeft, ToggleRight, Calendar, User,
} from "lucide-react";
import { toast } from "sonner";

const PLAN_COLORS = {
  BASIC: "bg-slate-100 text-slate-700",
  PRO: "bg-blue-100 text-blue-700",
  PREMIUM: "bg-purple-100 text-purple-700",
};

const StatusBadge = ({ active }) =>
  active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle className="w-3 h-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <XCircle className="w-3 h-3" /> Inactive
    </span>
  );

const PlanBadge = ({ plan }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_COLORS[plan] ?? "bg-gray-100 text-gray-700"}`}>
    {plan}
  </span>
);

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const isExpired = (iso) => iso && new Date(iso) < new Date();

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState(null); // detail modal
  const [deleting, setDeleting] = useState(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (planFilter) params.plan = planFilter;
      if (statusFilter) params.is_active = statusFilter;
      const data = await getSubscriptions(params);
      setSubscriptions(data.results ?? data);
      setTotalCount(data.count ?? (data.results ?? data).length);
    } catch {
      toast.error("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, planFilter, statusFilter]);

  const handleToggleActive = async (sub) => {
    try {
      await updateSubscription(sub.id, { is_active: !sub.is_active });
      toast.success(`Subscription ${sub.is_active ? "deactivated" : "activated"}.`);
      load();
    } catch {
      toast.error("Failed to update subscription.");
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteSubscription(id);
      toast.success("Subscription deleted.");
      setSelected(null);
      load();
    } catch {
      toast.error("Failed to delete subscription.");
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Subscriptions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalCount} total subscription{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="">All plans</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
          <option value="PREMIUM">Premium</option>
        </select>

        <select
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <CreditCard className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No subscriptions found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["User", "Plan", "Status", "Started", "Expires", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => setSelected(sub)}
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{sub.user_name}</div>
                    <div className="text-slate-400 text-xs">{sub.user_email}</div>
                  </td>
                  <td className="px-5 py-4"><PlanBadge plan={sub.plan} /></td>
                  <td className="px-5 py-4"><StatusBadge active={sub.is_active} /></td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(sub.starts_at)}</td>
                  <td className="px-5 py-4">
                    <span className={isExpired(sub.expires_at) ? "text-red-500 font-medium" : "text-slate-600"}>
                      {formatDate(sub.expires_at)}
                      {isExpired(sub.expires_at) && " (expired)"}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        title={sub.is_active ? "Deactivate" : "Activate"}
                        onClick={() => handleToggleActive(sub)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500 hover:text-indigo-600"
                      >
                        {sub.is_active
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        title="Delete"
                        disabled={deleting === sub.id}
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages} — {totalCount} records
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          sub={selected}
          onClose={() => setSelected(null)}
          onToggle={() => { handleToggleActive(selected); setSelected(null); }}
          onDelete={() => handleDelete(selected.id)}
          deleting={deleting === selected.id}
        />
      )}
    </div>
  );
}

function DetailModal({ sub, onClose, onToggle, onDelete, deleting }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Subscription detail</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        <div className="space-y-4">
          <Row icon={<User className="w-4 h-4" />} label="User">
            <span className="font-medium">{sub.user_name}</span>
            <span className="text-slate-400 text-xs ml-1">({sub.user_email})</span>
          </Row>
          <Row icon={<CreditCard className="w-4 h-4" />} label="Plan">
            <PlanBadge plan={sub.plan} />
          </Row>
          <Row icon={<CheckCircle className="w-4 h-4" />} label="Status">
            <StatusBadge active={sub.is_active} />
          </Row>
          <Row icon={<Calendar className="w-4 h-4" />} label="Started">
            {formatDate(sub.starts_at)}
          </Row>
          <Row icon={<Calendar className="w-4 h-4" />} label="Expires">
            <span className={isExpired(sub.expires_at) ? "text-red-500 font-medium" : ""}>
              {formatDate(sub.expires_at)}
              {isExpired(sub.expires_at) && " — expired"}
            </span>
          </Row>
          {sub.payment_uuid && (
            <Row icon={<CreditCard className="w-4 h-4" />} label="Payment UUID">
              <span className="font-mono text-xs text-slate-600 break-all">{sub.payment_uuid}</span>
            </Row>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onToggle}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition"
          >
            {sub.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

const Row = ({ icon, label, children }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 text-slate-400">{icon}</span>
    <div className="flex-1 flex justify-between items-center">
      <span className="text-sm text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 text-right">{children}</span>
    </div>
  </div>
);