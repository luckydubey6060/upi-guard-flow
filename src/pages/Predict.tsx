import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useML } from "@/context/MLContext";

const PredictPage: React.FC = () => {
  const { predictRow, encoders, model, loadSampleDataset } = useML();

  const [form, setForm] = useState({
    Amount: 999,
    Timestamp: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    Location: "Delhi",
    DeviceID: "dev-001",
    TransactionType: "P2P",
  });
  const [result, setResult] = useState<{ prob: number; label: string }>();

  useEffect(() => {
    document.title = "Fraud Prediction Tool | UPI Fraud Detection";
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;
    const iso = form.Timestamp.includes("T") ? new Date(form.Timestamp) : new Date(form.Timestamp);
    const res = await predictRow({
      Amount: Number(form.Amount),
      Timestamp: iso.toISOString(),
      Location: form.Location,
      DeviceID: form.DeviceID,
      TransactionType: form.TransactionType,
    } as any);
    setResult(res);
  };

  return (
    <div className="grid gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Fraud Prediction Tool</h1>
        <p className="text-muted-foreground">Enter transaction details to get an instant prediction.</p>
      </header>

      {!model && (
        <Card>
          <CardHeader>
            <CardTitle>Model not trained</CardTitle>
            <CardDescription>Train a model first or load the sample dataset.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="hero" asChild>
              <a href="/train">Go to Training</a>
            </Button>
            <Button variant="secondary" onClick={loadSampleDataset}>Load Sample</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>Fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Amount*</span>
              <input type="number" className="border rounded-md px-3 py-2 bg-background" value={form.Amount}
                onChange={(e) => setForm({ ...form, Amount: Number(e.target.value) })} required />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Time*</span>
              <input type="datetime-local" className="border rounded-md px-3 py-2 bg-background" value={form.Timestamp}
                onChange={(e) => setForm({ ...form, Timestamp: e.target.value })} required />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Location</span>
              <input className="border rounded-md px-3 py-2 bg-background" value={form.Location}
                onChange={(e) => setForm({ ...form, Location: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">DeviceID</span>
              <input className="border rounded-md px-3 py-2 bg-background" value={form.DeviceID}
                onChange={(e) => setForm({ ...form, DeviceID: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Transaction Type*</span>
              <select className="border rounded-md px-3 py-2 bg-background" value={form.TransactionType}
                onChange={(e) => setForm({ ...form, TransactionType: e.target.value })} required>
                {(encoders?.transTypeVocab ?? ["P2P","Merchant","BillPay","Recharge"]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2 flex items-center gap-3 mt-2">
              <Button type="submit" variant="hero">Predict</Button>
              {result && (
                <p className={`text-sm font-medium ${result.label === 'Fraud' ? 'text-destructive' : 'text-success'}`}>
                  {result.label} • Probability: {(result.prob * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictPage;
