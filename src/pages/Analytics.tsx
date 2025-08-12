import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useML } from "@/context/MLContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent-foreground))", "hsl(var(--secondary-foreground))", "hsl(var(--muted-foreground))"]; // use theme colors

function dateKey(ts: string) {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

const AnalyticsPage: React.FC = () => {
  const { dataset, loadSampleDataset } = useML();

  useEffect(() => {
    document.title = "Analytics | UPI Fraud Detection";
  }, []);

  const fraudPerDay = useMemo(() => {
    const map = new Map<string, number>();
    dataset.filter(r => r.FraudLabel === 1).forEach(r => {
      const k = dateKey(r.Timestamp);
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }, [dataset]);

  const fraudByType = useMemo(() => {
    const map = new Map<string, number>();
    dataset.filter(r => r.FraudLabel === 1).forEach(r => {
      const k = r.TransactionType;
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([type, value]) => ({ name: type, value }));
  }, [dataset]);

  const volumeOverTime = useMemo(() => {
    const map = new Map<string, number>();
    dataset.forEach(r => {
      const k = dateKey(r.Timestamp);
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));
  }, [dataset]);

  return (
    <div className="grid gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Explore fraud patterns by time and type.</p>
      </header>

      {dataset.length === 0 && (
        <p className="text-sm">No dataset loaded. Go to Upload or click <button className="underline" onClick={loadSampleDataset}>here</button> to load the sample.</p>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fraud Count per Day</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fraud by Transaction Type</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fraudByType} dataKey="value" nameKey="name" outerRadius={100} label>
                  {fraudByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
