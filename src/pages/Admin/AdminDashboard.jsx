import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, UserCheck, UserX, Shield,
  CreditCard, CheckCircle, XCircle, Leaf, MessageSquare,
  MessagesSquare, Trash2, DollarSign, ArrowRight, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '@/api/admin';

const COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))'
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e) {
      setError('Failed to load dashboard stats.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-destructive">{error}</p>
      <Button onClick={load} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />Retry
      </Button>
    </div>
  );

  const overview = stats?.overview ?? {};
  const regs = stats?.registrations ?? {};
  const subs = stats?.subscriptions ?? {};
  const chatbot = stats?.chatbot ?? {};

  // chart data 
  const userDistPie = [
    { name: 'Verified', value: overview.verified_users ?? 0 },
    { name: 'Unverified', value: overview.unverified_users ?? 0 },
    { name: 'Staff', value: overview.staff_users ?? 0 },
  ];

  const subsPie = [
    { name: 'Active', value: subs.active ?? 0 },
    { name: 'Inactive', value: subs.inactive ?? 0 },
  ];

  const regBar = [
    { period: 'Today', count: regs.today ?? 0 },
    { period: 'This Week', count: regs.this_week ?? 0 },
    { period: 'This Month', count: regs.this_month ?? 0 },
  ];

  const weeklyTrend = stats?.weekly_trend ?? [
    { day: 'Mon', users: 0 }, { day: 'Tue', users: 0 }, { day: 'Wed', users: 0 },
    { day: 'Thu', users: 0 }, { day: 'Fri', users: 0 }, { day: 'Sat', users: 0 },
    { day: 'Sun', users: 0 },
  ];

  // stat cards 
  const userStatCards = [
    { icon: Users, title: 'Total Users', value: overview.total_users ?? 0, color: 'text-chart-1' },
    { icon: UserCheck, title: 'Verified Users', value: overview.verified_users ?? 0, color: 'text-chart-2' },
    { icon: UserX, title: 'Unverified', value: overview.unverified_users ?? 0, color: 'text-destructive' },
    { icon: Shield, title: 'Staff', value: overview.staff_users ?? 0, color: 'text-chart-4' },
    { icon: CreditCard, title: 'Total Subscriptions', value: subs.total ?? 0, color: 'text-chart-5' },
    { icon: CheckCircle, title: 'Active Subscriptions', value: subs.active ?? 0, color: 'text-success' },
    { icon: XCircle, title: 'Inactive Subscriptions', value: subs.inactive ?? 0, color: 'text-muted-foreground' },
    { icon: Leaf, title: 'Total Farmers', value: overview.total_farmers ?? 0, color: 'text-primary' },
  ];

  // Separate chatbot stat cards
  const chatbotStatCards = [
    { icon: MessagesSquare, title: 'Total Conversations', value: chatbot.total_conversations ?? 0, color: 'text-primary' },
    { icon: MessageSquare, title: 'Total Messages', value: chatbot.total_messages ?? 0, color: 'text-chart-4' },
    { icon: Trash2, title: 'Deleted by Users', value: chatbot.deleted_conversations ?? 0, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Live platform analytics for Krishi Saathi</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-2" />Refresh
        </Button>
      </div>

      {/* User & Subscription Stat Cards  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {userStatCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {s.value.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chatbot Stat Cards  */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">
          AI Chatbot Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {chatbotStatCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.title}</p>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {s.value.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Row 1  */}
      <div className="grid lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">New Registrations</CardTitle>
            <CardDescription>Users registered by period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regBar} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">User Distribution</CardTitle>
            <CardDescription>Verified vs unverified vs staff</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={userDistPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {userDistPie.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {userDistPie.map((entry, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  {entry.name}: <strong className="text-foreground ml-0.5">{entry.value}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2  */}
      <div className="grid lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Weekly User Activity</CardTitle>
            <CardDescription>Daily new registrations this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))"
                  strokeWidth={2} fill="url(#primaryGrad)" name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Subscriptions</CardTitle>
            <CardDescription>Active vs inactive plans</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={subsPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  <Cell fill="hsl(var(--success))" />
                  <Cell fill="hsl(var(--muted-foreground))" />
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-display font-bold text-success">{subs.active ?? 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Inactive</p>
                <p className="text-lg font-display font-bold text-muted-foreground">{subs.inactive ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions*/}
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Manage Users', desc: 'View and edit user accounts', icon: Users, path: '/admin/users' },
            { title: 'Chat Logs', desc: 'Review AI conversations', icon: MessageSquare, path: '/admin/chat-conversations' },
            { title: 'Disease Scans', desc: 'Crop disease scan results', icon: Leaf, path: '/admin/scan-results' },
            { title: 'Price Predictor', desc: 'Manage prediction data', icon: DollarSign, path: '/admin/price-predictor' },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <Card
                key={i}
                className="group cursor-pointer hover:shadow-elegant transition-smooth hover:border-primary/50"
                onClick={() => navigate(a.path)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;