
"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { useTimer } from "@/context/TimerContext";
import { ref, get } from "firebase/database";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, LineChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function DashboardRollupCard() {
  const { currentUser, firebaseServices } = useTimer();
  const [eventId, setEventId] = useState<string>("default");
  const [days, setDays] = useState<number>(7);
  const [chartData, setChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!currentUser || !firebaseServices?.db) return;

    const logRef = ref(firebaseServices.db, `auditLogs/${currentUser.uid}`);
    get(logRef).then(snapshot => {
      const logs: Record<string, any> = snapshot.val() || {};
      const now = Date.now();
      const recentLogs = Object.values(logs)
        .filter((entry: any) => entry.timestamp > now - days * 86400000)
        .filter((entry: any) => eventId === "default" || entry.eventId === eventId);

      const rollup: Record<string, number> = {};
      const chartMap: Record<string, { date: string, count: number }> = {};

      recentLogs.forEach((entry: any) => {
        const dateKey = new Date(entry.timestamp).toLocaleDateString();
        rollup[entry.action] = (rollup[entry.action] || 0) + 1;

        if (!chartMap[dateKey]) {
            chartMap[dateKey] = { date: dateKey, count: 0 };
        }
        chartMap[dateKey].count++;
      });

      const sortedChart = Object.values(chartMap)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setSummary(rollup);
      setChartData(sortedChart);
    });
  }, [currentUser, firebaseServices, days, eventId]);
  
  const chartConfig = {
    count: {
      label: "Actions",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card data-testid="dashboard-rollup-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
            📈 Dashboard Rollup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select value={String(days)} onValueChange={(val) => setDays(parseInt(val))}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Days" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1 Day</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventId} onValueChange={(val) => setEventId(val)} disabled>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Event" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">All Events (Coming Soon)</SelectItem>
              {/* <SelectItem value="event-abc">Event ABC</SelectItem>
              <SelectItem value="event-xyz">Event XYZ</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        <ChartContainer config={chartConfig} className="h-52 w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="count"
              type="monotone"
              stroke="var(--color-count)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>

        <div className="mt-4 space-y-2">
          {Object.entries(summary).map(([action, count]) => (
            <div key={action} className="flex justify-between text-sm text-muted-foreground">
              <span className="capitalize">{action.replace(/_/g, ' ')}</span>
              <span className="font-mono font-medium text-foreground">{count}</span>
            </div>
          ))}
           {Object.keys(summary).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No activity recorded for this period.</p>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
