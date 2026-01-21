"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardAPI, doctorsAPI, patientsAPI, appointmentsAPI } from "@/lib/api-client";
import { StatsSkeleton, ChartSkeleton } from "@/components/skeletons";
import { Users, UserCog, Calendar, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => dashboardAPI.getOverview(),
  });

  const overviewData = overview?.data?.data;
  const weeklyData = overviewData?.weeklySignups?.days || [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <StatsSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Patients",
      value: overviewData?.totals?.patients?.count || 0,
      change: overviewData?.totals?.patients?.weekOverWeekChangePct || 0,
      icon: Users,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Doctors",
      value: overviewData?.totals?.doctors?.count || 0,
      change: overviewData?.totals?.doctors?.weekOverWeekChangePct || 0,
      icon: UserCog,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "New Signups",
      value: (overviewData?.totals?.patients?.weeklyNew || 0) + (overviewData?.totals?.doctors?.weeklyNew || 0),
      change: 0,
      icon: TrendingUp,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  const chartData = weeklyData.map((day: any) => ({
    name: day.label,
    patients: day.patients,
    doctors: day.doctors,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your health platform overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    {stat.change !== 0 && (
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={stat.change > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {stat.change > 0 ? "+" : ""}{stat.change}%
                        </Badge>
                        <span className="text-xs text-gray-600">vs last week</span>
                      </div>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`${stat.iconColor} h-6 w-6`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Joining Report</CardTitle>
          <CardDescription>Weekly signup trends for patients and doctors</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#3B82F6"
                  dot={{ fill: "#3B82F6" }}
                  name="Patients"
                />
                <Line
                  type="monotone"
                  dataKey="doctors"
                  stroke="#EF4444"
                  dot={{ fill: "#EF4444" }}
                  name="Doctors"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
