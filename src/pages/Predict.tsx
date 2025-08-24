import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
              <Link to="/train">Go to Training</Link>
            </Button>
            <Button variant="secondary" onClick={loadSampleDataset}>Load Sample</Button>
          </CardContent>
        </Card>
      )}

      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>🔮 Real-Time Fraud Detection</CardTitle>
          <CardDescription>Enter transaction details to get an instant fraud probability assessment</CardDescription>
        </CardHeader>
      </Card>

      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>🛡️ SMS/Alert Fraud Detection Guide</CardTitle>
          <CardDescription>Received a suspicious transaction alert? Use this expert guide to analyze it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Immediate Red Flags</h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Unknown merchant or suspicious UPI ID</li>
              <li>• Urgent language: "Click immediately to cancel"</li>
              <li>• Links in SMS asking for OTP/passwords</li>
              <li>• Transactions you didn't initiate</li>
              <li>• Odd timing (late night, unusual amounts)</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">✅ Safe Verification Steps</h3>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal ml-4">
              <li>Open your official bank app (not from the SMS link)</li>
              <li>Check your account statement/transaction history</li>
              <li>Call your bank using the number on your card back</li>
              <li>Never click links in suspicious SMS messages</li>
              <li>Block the transaction through your bank if unauthorized</li>
            </ol>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🔍 Transaction ID Analysis</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Genuine transaction IDs usually follow bank-specific patterns (e.g., "TXN20245123456", "UPI1234567890"). 
              Random letter combinations or suspicious formats may indicate fraud.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>Transaction Details for Analysis</CardTitle>
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
