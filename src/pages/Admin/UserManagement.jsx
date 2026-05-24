import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  UserCheck,
  Power,
  Users,
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
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  verifyUser,
} from "@/api/admin";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  is_verified: false,
  is_active: true,
  is_staff: false,
  is_superuser: false,
};

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

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadUsers = async (customPage = page) => {
    setLoading(true);
    setError("");

    try {
      const res = await getUsers({
        page: customPage,
        search: search || undefined,
        is_verified: verified || undefined,
        is_active: active || undefined,
      });

      const list = Array.isArray(res) ? res : res?.results || [];
      setUsers(list);
      setMeta({
        count: res?.count || list.length,
        next: res?.next || null,
        previous: res?.previous || null,
      });
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  const summary = useMemo(() => {
    return {
      verifiedCount: users.filter((u) => u.is_verified).length,
      activeCount: users.filter((u) => u.is_active).length,
      staffCount: users.filter((u) => u.is_staff).length,
    };
  }, [users]);

  const applyFilters = () => {
    setPage(1);
    loadUsers(1);
  };

  const resetFilters = () => {
    setSearch("");
    setVerified("");
    setActive("");
    setPage(1);
    setTimeout(() => loadUsers(1), 0);
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm(initialForm);
    setOpenModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      is_verified: !!user.is_verified,
      is_active: !!user.is_active,
      is_staff: !!user.is_staff,
      is_superuser: !!user.is_superuser,
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditingUser(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      if (editingUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await updateUser(editingUser.id, payload);
        toast({ title: "User updated successfully!" });
      } else {
        await createUser(form);
        toast({ title: "User created successfully!" }); 
      }
      closeModal();
      loadUsers();
    } catch {
      toast({ title: "Failed to save user.", variant: "destructive" })
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      toast({ title: "User deleted!" });   
      loadUsers();
    } catch {
      toast({ title: "Failed to delete user.", variant: "destructive" });
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleUserStatus(id);
      toast({ title: "User status updated!" }); 
      loadUsers();
    } catch {
      toast({ title: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyUser(id);
      toast({ title: "User verified!" }); 
      loadUsers();
    } catch {
      toast({ title: "Failed to verify user.", variant: "destructive" });
    }
  };

  const inputClass =
    "w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary";
  const checkboxClass = "h-4 w-4 rounded border-border";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users, roles, and verification status.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Visible Users" value={users.length} icon={Users} color="text-primary" />
        <StatCard title="Verified" value={summary.verifiedCount} icon={CheckCircle2} color="text-success" />
        <StatCard title="Active" value={summary.activeCount} icon={UserCheck} color="text-chart-4" />
        <StatCard title="Staff" value={summary.staffCount} icon={Shield} color="text-chart-5" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Filters</CardTitle>
          <CardDescription>Search and filter user records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone"
                className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <select
              value={verified}
              onChange={(e) => setVerified(e.target.value)}
              className={inputClass}
            >
              <option value="">All verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>

            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
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
            <Button variant="outline" onClick={() => loadUsers()}>
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
          <CardTitle className="font-display">Users</CardTitle>
          <CardDescription>Total records: {meta.count}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No users found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Name</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Email</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Phone</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Status</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Role</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/60">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-foreground">{user.full_name || "-"}</div>
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">{user.email || "-"}</td>
                        <td className="py-4 pr-4 text-muted-foreground">{user.phone || "-"}</td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                user.is_active
                                  ? "bg-success/10 text-success hover:bg-success/10"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={
                                user.is_verified
                                  ? "bg-primary/10 text-primary hover:bg-primary/10"
                                  : "bg-warning/10 text-warning hover:bg-warning/10"
                              }
                            >
                              {user.is_verified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-2">
                            {user.is_staff && <Badge variant="outline">Staff</Badge>}
                            {user.is_superuser && <Badge variant="outline">Superuser</Badge>}
                            {!user.is_staff && !user.is_superuser && (
                              <Badge variant="outline">User</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>

                            <Button variant="outline" size="sm" onClick={() => handleToggle(user.id)}>
                              <Power className="w-4 h-4 mr-1" />
                              Toggle
                            </Button>

                            {!user.is_verified && (
                              <Button variant="outline" size="sm" onClick={() => handleVerify(user.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Verify
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(user.id)}
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
                <p className="text-sm text-muted-foreground">
                  Page {page}
                </p>
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

      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-display font-semibold text-foreground">
                {editingUser ? "Edit User" : "Create User"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update user details and permissions
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Full name</label>
                  <input
                    className={inputClass}
                    value={form.full_name}
                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Phone</label>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Password {editingUser && <span className="text-muted-foreground">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={form.is_verified}
                    onChange={(e) => setForm((p) => ({ ...p, is_verified: e.target.checked }))}
                  />
                  <span className="text-sm text-foreground">Verified user</span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  />
                  <span className="text-sm text-foreground">Active user</span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={form.is_staff}
                    onChange={(e) => setForm((p) => ({ ...p, is_staff: e.target.checked }))}
                  />
                  <span className="text-sm text-foreground">Staff role</span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={form.is_superuser}
                    onChange={(e) => setForm((p) => ({ ...p, is_superuser: e.target.checked }))}
                  />
                  <span className="text-sm text-foreground">Superuser role</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}