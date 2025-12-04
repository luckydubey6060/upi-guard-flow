import React from "react";
import { ConfusionMatrix as ConfusionMatrixType } from "@/context/MLContext";

interface ConfusionMatrixProps {
  data: ConfusionMatrixType;
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ data }) => {
  const { tp, tn, fp, fn } = data;
  const total = tp + tn + fp + fn;
  
  const getIntensity = (value: number) => {
    const ratio = value / Math.max(total, 1);
    return Math.min(ratio * 2, 1); // Scale for visibility
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500/50" />
          <span>Correct Predictions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/30 border border-destructive/50" />
          <span>Incorrect Predictions</span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <div className="inline-block">
          {/* Column Headers */}
          <div className="flex">
            <div className="w-24" />
            <div className="text-center text-sm font-medium text-muted-foreground pb-2 col-span-2" style={{ width: '240px' }}>
              Predicted
            </div>
          </div>
          <div className="flex">
            <div className="w-24" />
            <div className="w-28 text-center text-sm font-medium pb-2">Fraud</div>
            <div className="w-28 text-center text-sm font-medium pb-2">Genuine</div>
          </div>

          {/* Matrix Rows */}
          <div className="flex items-center">
            <div className="w-24 text-right pr-4 text-sm font-medium text-muted-foreground flex items-center justify-end" style={{ height: '80px' }}>
              <span className="writing-mode-vertical transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>Actual</span>
            </div>
            <div className="space-y-2">
              {/* Row 1: Actual Fraud */}
              <div className="flex items-center gap-2">
                <div className="w-20 text-right text-sm font-medium">Fraud</div>
                <div 
                  className="w-28 h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all"
                  style={{
                    backgroundColor: `rgba(16, 185, 129, ${0.2 + getIntensity(tp) * 0.4})`,
                    borderColor: `rgba(16, 185, 129, ${0.5 + getIntensity(tp) * 0.5})`
                  }}
                >
                  <span className="text-2xl font-bold">{tp}</span>
                  <span className="text-xs text-muted-foreground">True Positive</span>
                </div>
                <div 
                  className="w-28 h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all"
                  style={{
                    backgroundColor: `rgba(239, 68, 68, ${0.2 + getIntensity(fn) * 0.4})`,
                    borderColor: `rgba(239, 68, 68, ${0.5 + getIntensity(fn) * 0.5})`
                  }}
                >
                  <span className="text-2xl font-bold">{fn}</span>
                  <span className="text-xs text-muted-foreground">False Negative</span>
                </div>
              </div>

              {/* Row 2: Actual Genuine */}
              <div className="flex items-center gap-2">
                <div className="w-20 text-right text-sm font-medium">Genuine</div>
                <div 
                  className="w-28 h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all"
                  style={{
                    backgroundColor: `rgba(239, 68, 68, ${0.2 + getIntensity(fp) * 0.4})`,
                    borderColor: `rgba(239, 68, 68, ${0.5 + getIntensity(fp) * 0.5})`
                  }}
                >
                  <span className="text-2xl font-bold">{fp}</span>
                  <span className="text-xs text-muted-foreground">False Positive</span>
                </div>
                <div 
                  className="w-28 h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all"
                  style={{
                    backgroundColor: `rgba(16, 185, 129, ${0.2 + getIntensity(tn) * 0.4})`,
                    borderColor: `rgba(16, 185, 129, ${0.5 + getIntensity(tn) * 0.5})`
                  }}
                >
                  <span className="text-2xl font-bold">{tn}</span>
                  <span className="text-xs text-muted-foreground">True Negative</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-border/50">
        <div className="text-center p-3 rounded-md bg-emerald-500/10">
          <p className="text-xs text-muted-foreground">Correct Fraud</p>
          <p className="text-lg font-semibold text-emerald-600">{tp}</p>
        </div>
        <div className="text-center p-3 rounded-md bg-emerald-500/10">
          <p className="text-xs text-muted-foreground">Correct Genuine</p>
          <p className="text-lg font-semibold text-emerald-600">{tn}</p>
        </div>
        <div className="text-center p-3 rounded-md bg-destructive/10">
          <p className="text-xs text-muted-foreground">Missed Fraud</p>
          <p className="text-lg font-semibold text-destructive">{fn}</p>
        </div>
        <div className="text-center p-3 rounded-md bg-destructive/10">
          <p className="text-xs text-muted-foreground">False Alarm</p>
          <p className="text-lg font-semibold text-destructive">{fp}</p>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrix;
