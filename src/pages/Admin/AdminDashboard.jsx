// import { AdminLayout } from "@/components/AdminLayout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Users,
//   TrendingUp,
//   AlertCircle,
//   CheckCircle2,
//   Activity,
//   DollarSign,
//   UserCheck,
//   Clock
// } from "lucide-react";

// export default function AdminDashboard() {
//   const stats = [
//     { label: "Total Users", value: "12,458", change: "+12.5%", icon: Users, color: "text-primary" },
//     { label: "Active Today", value: "3,247", change: "+8.2%", icon: Activity, color: "text-success" },
//     { label: "Total Scans", value: "45,892", change: "+15.3%", icon: CheckCircle2, color: "text-chart-4" },
//     { label: "Revenue (MTD)", value: "NPR 2.4M", change: "+23.1%", icon: DollarSign, color: "text-accent" }
//   ];

//   const recentUsers = [
//     { name: "Ram Kumar", location: "Kathmandu", joined: "2 hours ago", status: "active" },
//     { name: "Sita Devi", location: "Pokhara", joined: "4 hours ago", status: "active" },
//     { name: "Hari Prasad", location: "Chitwan", joined: "6 hours ago", status: "pending" },
//     { name: "Maya Sharma", location: "Lalitpur", joined: "8 hours ago", status: "active" },
//     { name: "Krishna Thapa", location: "Bhaktapur", joined: "10 hours ago", status: "active" }
//   ];

//   const systemAlerts = [
//     { type: "warning", message: "High API usage detected", time: "5 mins ago" },
//     { type: "info", message: "Database backup completed", time: "1 hour ago" },
//     { type: "success", message: "System update deployed", time: "3 hours ago" }
//   ];

//   const topCrops = [
//     { name: "Rice", scans: 15420, percentage: 34 },
//     { name: "Wheat", scans: 12350, percentage: 27 },
//     { name: "Maize", scans: 9870, percentage: 22 },
//     { name: "Tomato", scans: 7652, percentage: 17 }
//   ];

//   return (
//     <AdminLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div>
//           <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
//             Admin Dashboard
//           </h1>
//           <p className="text-muted-foreground">
//             Monitor platform performance and user activity.
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {stats.map((stat, index) => {
//             const Icon = stat.icon;
//             return (
//               <Card key={index}>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm text-muted-foreground">{stat.label}</p>
//                     <Icon className={`w-5 h-5 ${stat.color}`} />
//                   </div>
//                   <div className="flex items-end justify-between">
//                     <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">
//                       {stat.value}
//                     </p>
//                     <Badge variant="secondary" className="text-success">
//                       {stat.change}
//                     </Badge>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>

//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* Recent Users */}
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle className="flex items-center justify-between">
//                 <span>Recent User Registrations</span>
//                 <Button variant="outline" size="sm">View All</Button>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {recentUsers.map((user, index) => (
//                   <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-smooth">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                         <Users className="w-5 h-5 text-primary" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-foreground">{user.name}</p>
//                         <p className="text-sm text-muted-foreground">{user.location}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <Badge variant={user.status === "active" ? "secondary" : "outline"}>
//                         {user.status}
//                       </Badge>
//                       <p className="text-xs text-muted-foreground mt-1">{user.joined}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           {/* System Alerts */}
//           <Card>
//             <CardHeader>
//               <CardTitle>System Alerts</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {systemAlerts.map((alert, index) => {
//                   const iconColor = alert.type === "warning" ? "text-warning" : alert.type === "info" ? "text-chart-4" : "text-success";
//                   const bgColor = alert.type === "warning" ? "bg-warning/10" : alert.type === "info" ? "bg-chart-4/10" : "bg-success/10";
//                   return (
//                     <div key={index} className={`p-3 rounded-lg ${bgColor}`}>
//                       <div className="flex items-start gap-2">
//                         <AlertCircle className={`w-4 h-4 ${iconColor} mt-0.5 flex-shrink-0`} />
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm text-foreground">{alert.message}</p>
//                           <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Top Crops */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Most Scanned Crops</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {topCrops.map((crop, index) => (
//                 <div key={index} className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="font-medium text-foreground">{crop.name}</span>
//                     <div className="flex items-center gap-2">
//                       <span className="text-muted-foreground">{crop.scans.toLocaleString()} scans</span>
//                       <Badge variant="outline">{crop.percentage}%</Badge>
//                     </div>
//                   </div>
//                   <div className="h-2 bg-muted rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-primary transition-all"
//                       style={{ width: `${crop.percentage * 3}%` }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </AdminLayout>
//   );
// }

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, LogOut } from 'lucide-react';
import { getDashboardStats, adminLogout } from '@/api/admin';
import { getAdminUser } from '@/lib/adminAuth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminUser = getAdminUser();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {adminUser?.full_name || adminUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Users"
            value={stats?.overview?.total_users || 0}
            color="blue"
          />
          <StatCard
            icon={<UserCheck className="w-8 h-8" />}
            title="Verified Users"
            value={stats?.overview?.verified_users || 0}
            color="green"
          />
          <StatCard
            icon={<UserX className="w-8 h-8" />}
            title="Unverified Users"
            value={stats?.overview?.unverified_users || 0}
            color="yellow"
          />
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Registrations
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.registrations?.today || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.registrations?.this_week || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.registrations?.this_month || 0}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default AdminDashboard;