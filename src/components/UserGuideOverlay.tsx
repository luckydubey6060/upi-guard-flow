import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload, Brain, Target, TrendingUp } from "lucide-react";

interface UserGuideOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuideOverlay: React.FC<UserGuideOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: Upload,
      title: "Upload Dataset",
      description: "Upload your CSV file with transaction data or use our sample dataset to get started instantly.",
      details: "Supports columns: TransactionID, UserID, Amount, Timestamp, Location, DeviceID, TransactionType, FraudLabel"
    },
    {
      icon: Brain,
      title: "Train Model",
      description: "Our AI trains a logistic regression model directly in your browser using TensorFlow.js.",
      details: "View real-time metrics: Accuracy, Precision, Recall, F1-score"
    },
    {
      icon: Target,
      title: "Make Predictions",
      description: "Test individual transactions or analyze patterns to detect potential fraud.",
      details: "Get confidence scores and detailed fraud risk analysis"
    },
    {
      icon: TrendingUp,
      title: "Monitor Analytics",
      description: "View live transaction streams and comprehensive analytics dashboards.",
      details: "Real-time fraud detection with visual insights"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <p className="text-muted-foreground mb-8 text-center">
            Follow these simple steps to detect UPI fraud using machine learning
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="absolute top-2 right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {step.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button onClick={onClose} size="lg" variant="hero">
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuideOverlay;