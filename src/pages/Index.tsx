import React, { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useML } from "@/context/MLContext";

const Index: React.FC = () => {
  const { loadSampleDataset } = useML();
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const areaRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div className="relative overflow-hidden rounded-lg border surface-elevated">
      <div
        ref={areaRef}
        onMouseMove={onMove}
        className="relative px-6 py-16 sm:px-12 sm:py-20 grid gap-8 text-center"
        style={{
          background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, hsl(var(--primary) / 0.15), transparent 60%)`,
        }}
      >
        <header>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">UPI Fraud Detection Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload datasets, train a machine learning model directly in your browser, and monitor live predictions and analytics — all in one place.
          </p>
        </header>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button asChild variant="hero" size="lg">
            <a href="/upload">Upload Dataset</a>
          </Button>
          <Button asChild variant="secondary" size="lg" onClick={loadSampleDataset}>
            <a href="/train">Use Sample & Train</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/predict">Try Manual Prediction</a>
          </Button>
        </div>

        <section className="grid sm:grid-cols-3 gap-4 text-left mt-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Dataset Upload & Preview</CardTitle>
              <CardDescription>CSV with columns: TransactionID, UserID, Amount, Timestamp, Location, DeviceID, TransactionType, FraudLabel</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Model Training</CardTitle>
              <CardDescription>Logistic Regression using TensorFlow.js with metrics: Accuracy, Precision, Recall, F1</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Live Stream & Analytics</CardTitle>
              <CardDescription>Simulate live transactions, highlight fraud, and explore charts</CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
