import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
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

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [meta, setMeta] = useState({ count: 0, next: null, previous: null });
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  const [editingSub, setEditingSub] = useState(null);
  const [form, setForm] = useState({
    plan: "",
    is_active: true,
    start_date: "",
    end_date: "",
  });

  const loadSubscriptions = async (customPage = page) => {
    setLoading(true);
    setError("");

    try {
      const [subRes, statsRes] = await Promise.all([
        getSubscriptions({
          page: customPage,
          search: search || undefined,
          plan: plan || undefined,
          is_active: isActive || undefined,
        }),
        getDashboardStats(),
      ]);

      const list = Array.isArray(subRes) ? subRes : subRes?.results || [];
      setSubscriptions(list);
      setMeta({
        count: subRes?.count || list.length,
        next: subRes?.next || null,
        previous: subRes?.previous || null,
      });

      setSummary({
        total: statsRes?.subscriptions?.total || 0,
        active: statsRes?.subscriptions?.active || 0,
        inactive: statsRes?.subscriptions?.inactive || 0,
      });
    } catch (err) {
      setError("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions(page);
  }, [page]);

  const pageStats = useMemo(() => {
    return {
      expiringSoon: subscriptions.filter((s) => {
        if (!s?.end_date) return false;
        const end = new Date(s.end_date);
        const now = new Date();
        const diff = (end - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      }).length,
    };
  }, [subscriptions]);

  const applyFilters = () => {
    setPage(1);
    loadSubscriptions(1);
  };

  const resetFilters = () => {
    setSearch("");
    setPlan("");
    setIsActive("");
    setPage(1);
    setTimeout(() => loadSubscriptions(1), 0);
  };

  const openEdit = (sub) => {
    setEditingSub(sub);
    setForm({
      plan: sub?.plan || "",
      is_active: !!sub?.is_active,
      start_date: sub?.start_date ? String(sub.start_date).slice(0, 10) : "",
      end_date: sub?.end_date ? String(sub.end_date).slice(0, 10) : "",
    });
  };

  const closeEdit = () => {
    setEditingSub(null);
    setForm({
      plan: "",
      is_active: true,
      start_date: "",
      end_date: "",
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingSub) return;

    setActionLoading(true);
    try {
      await updateSubscription(editingSub.id || editingSub.pk, form);
      closeEdit();
      loadSubscriptions();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update subscription."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      await deleteSubscription(id);
      loadSubscriptions();
    } catch {
      setError("Failed to delete subscription.");
    }
  };

  const inputClass =
    "w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground">
          Monitor active plans, expirations, and subscription status.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Plans" value={summary.total} icon={CreditCard} color="text-primary" />
        <StatCard title="Active" value={summary.active} icon={CheckCircle2} color="text-success" />
        <StatCard title="Inactive" value={summary.inactive} icon={XCircle} color="text-muted-foreground" />
        <StatCard title="Expiring Soon" value={pageStats.expiringSoon} icon={CalendarDays} color="text-chart-4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Filters</CardTitle>
          <CardDescription>Find subscriptions by user, plan, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user email or name"
                className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <input
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Plan name"
              className={inputClass}
            />

            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className={inputClass}
            >
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={applyFilters}>
              <Search className="w-4 h-4 mr-2" />
              Apply
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button variant="outline" onClick={() => loadSubscriptions()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Subscription Records</CardTitle>
          <CardDescription>Total records: {meta.count}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No subscriptions found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 pr-4 font-medium text-muted-foreground">User</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Plan</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Status</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Start</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">End</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.id || sub.pk} className="border-b border-border/60">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-foreground">
                            {sub?.user?.full_name || "Unknown User"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sub?.user?.email || "-"}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant="outline">{sub?.plan || "N/A"}</Badge>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge
                            variant="secondary"
                            className={
                              sub?.is_active
                                ? "bg-success/10 text-success hover:bg-success/10"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {sub?.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">
                          {sub?.start_date ? String(sub.start_date).slice(0, 10) : "-"}
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">
                          {sub?.end_date ? String(sub.end_date).slice(0, 10) : "-"}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(sub)}>
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(sub.id || sub.pk)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">Page {page}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!meta.previous}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!meta.next}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {editingSub && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-xl">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-display font-semibold text-foreground">
                Edit Subscription
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update plan details and active state
              </p>
            </div>

            <form onSubmit={saveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Plan</label>
                <input
                  className={inputClass}
                  value={form.plan}
                  onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Start date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.start_date}
                    onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">End date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.end_date}
                    onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-border p-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm text-foreground">Active subscription</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}