import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useML } from "@/context/MLContext";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Upload } from "lucide-react";

const UploadPage: React.FC = () => {
  const { setDatasetFromCSV, dataset, loadSampleDataset } = useML();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loadStatus, setLoadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Upload Dataset | UPI Fraud Detection";
  }, []);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setIsLoading(true);
    setLoadStatus(null);
    
    try {
      const text = await file.text();
      const result = await setDatasetFromCSV(text);
      
      if (result.success) {
        setLoadStatus({
          success: true,
          message: `Loaded ${result.rowCount} rows (${result.labeledCount} labeled for training)`
        });
        toast.success(`Dataset loaded: ${result.rowCount} rows, ${result.labeledCount} labeled`);
        
        if (result.errors.length > 0) {
          result.errors.forEach(err => {
            if (err.startsWith("Warning:")) {
              toast.warning(err);
            }
          });
        }
      } else {
        setLoadStatus({
          success: false,
          message: result.errors.join(". ")
        });
        toast.error("Failed to load CSV: " + result.errors[0]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setLoadStatus({ success: false, message: errorMsg });
      toast.error("Error reading file: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setIsLoading(true);
    setLoadStatus(null);
    setFileName("");
    try {
      await loadSampleDataset();
      setLoadStatus({ success: true, message: "Sample dataset loaded successfully" });
      toast.success("Sample dataset loaded");
    } catch (error) {
      toast.error("Failed to load sample dataset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Dataset Upload & Preview</h1>
        <p className="text-muted-foreground">Upload a CSV or use the preloaded sample to get started.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>
              Required columns: Amount, Timestamp, TransactionType. Optional: FraudLabel (0/1), Location, DeviceID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
            
            {loadStatus && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                loadStatus.success 
                  ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                  : "bg-destructive/10 text-destructive"
              }`}>
                {loadStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span className="text-sm">{loadStatus.message}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="hero" onClick={() => inputRef.current?.click()} disabled={isLoading}>
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? "Loading..." : "Choose File"}
              </Button>
              <Button variant="secondary" onClick={handleLoadSample} disabled={isLoading}>
                Use Sample Dataset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dataset Preview</CardTitle>
            <CardDescription>
              {dataset.length > 0 
                ? `${dataset.length} rows loaded • ${dataset.filter(r => r.FraudLabel !== undefined).length} labeled`
                : "No dataset loaded"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[360px]">
              {dataset.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Upload a CSV file or load sample data</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      {["TransactionID","UserID","Amount","Timestamp","Location","DeviceID","TransactionType","FraudLabel"].map(col => (
                        <th key={col} className="py-2 pr-4 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.slice(0, 50).map((row, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-2 pr-4">{row.TransactionID}</td>
                        <td className="py-2 pr-4">{row.UserID ?? "-"}</td>
                        <td className="py-2 pr-4">{row.Amount}</td>
                        <td className="py-2 pr-4">{row.Timestamp}</td>
                        <td className="py-2 pr-4">{row.Location ?? "-"}</td>
                        <td className="py-2 pr-4">{row.DeviceID ?? "-"}</td>
                        <td className="py-2 pr-4">{row.TransactionType}</td>
                        <td className="py-2 pr-4">{row.FraudLabel ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {dataset.length > 50 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Showing first 50 of {dataset.length} rows
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPage;
