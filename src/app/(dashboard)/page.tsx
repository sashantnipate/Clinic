"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Activity, Calendar, Loader2, ArrowUpRight } from "lucide-react";
import { getPatients } from "@/lib/actions/patient.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Standard UI colors for our charts that match modern themes
const PIE_COLORS = ['#5D87E6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function DashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch live data on mount using your existing server action
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("clinic_jwt") || "";
        const result = await getPatients(token);
        
        if (result.success) {
          setPatients(result.patients);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Compute Analytics derived straight from the patient pool
  const analytics = useMemo(() => {
    const totalPatients = patients.length;
    
    // Gender Distribution for Pie Chart
    const genderCount = patients.reduce((acc, p) => {
      const g = p.gender || 'Unknown';
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const genderData = Object.keys(genderCount).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: genderCount[key]
    }));

    // Registration dates for Bar Chart (Grouping by Month)
    const monthCounts = patients.reduce((acc, p) => {
      const date = new Date(p.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and take the last 6 months for a clean chart
    const registrationData = Object.keys(monthCounts)
      .map(month => ({ name: month, count: monthCounts[month] }))
      .slice(0, 6)
      .reverse();

    // Determine new patients this current month vs last month
    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    const newThisMonth = monthCounts[currentMonth] || 0;

    return { totalPatients, genderData, registrationData, newThisMonth };
  }, [patients]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Compiling clinic analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 antialiased">
      {/* Top Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here is what is happening in your clinic today.
          </p>
        </div>
        <Button asChild>
          <Link href="/patients">
            View All Patients <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-xs border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active registered records
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-muted/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+{analytics.newThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Patient intakes in the current period
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-muted/60 hidden lg:block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground/50">--</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduling module not yet connected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 shadow-xs border-muted/60">
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Patient intakes recorded over recent months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-2">
            {analytics.registrationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.registrationData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Not enough historical data to generate chart.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 shadow-xs border-muted/60">
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>Distribution across gender identities.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-2">
             {analytics.genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                 No demographic data available.
               </div>
             )}
             
             {/* Custom Legend */}
             <div className="flex justify-center gap-4 mt-2">
                {analytics.genderData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                    {entry.name}
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients Table */}
      <Card className="shadow-xs border-muted/60 overflow-hidden">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>The last 5 patients to be added to the clinic database.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Name</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Contact</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Gender</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Added On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                    No patients have been registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                patients.slice(0, 5).map((patient) => (
                  <TableRow key={patient._id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground py-3">
                      {patient.name}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{patient.phone}</span>
                        <span className="text-xs text-muted-foreground">{patient.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 capitalize text-sm text-muted-foreground">
                      {patient.gender}
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm text-muted-foreground">
                      {new Date(patient.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}