import { useState, useRef } from "react";
import { Camera, Upload, Shield, AlertTriangle, CheckCircle, History, Scan, CreditCard, Info, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import jsQR from "jsqr";
import { useQuery } from "@tanstack/react-query";

interface UPIDetails {
  pa?: string; // VPA (Payee Address)
  pn?: string; // Payee Name
  mc?: string; // Merchant Code
  tid?: string; // Transaction ID
  tr?: string; // Transaction Reference
  tn?: string; // Transaction Note
  am?: string; // Amount
  cu?: string; // Currency
  url?: string; // Full UPI URL
}

interface ScanResult {
  qrData: string;
  isAuthentic: boolean;
  upiDetails: UPIDetails | null;
  timestamp: string;
  fraudReasons: string[];
}

interface UPIIDResult {
  upiId: string;
  isValid: boolean;
  bankHandle: string;
  reasons: string[];
  timestamp: string;
}

const QRScan = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [upiIdResult, setUpiIdResult] = useState<UPIIDResult | null>(null);
  const [manualUpiId, setManualUpiId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch recent scan history
  const { data: scanHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['qr-scan-history'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('qr_scan_history')
        .select('*')
        .order('scan_timestamp', { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const parseUPIData = (qrData: string): UPIDetails | null => {
    try {
      // Check if it's a UPI URL
      if (!qrData.toLowerCase().includes('upi://')) {
        return null;
      }

      const url = new URL(qrData.replace('upi://', 'https://'));
      const params = new URLSearchParams(url.search);

      return {
        pa: params.get('pa') || undefined,
        pn: params.get('pn') || undefined,
        mc: params.get('mc') || undefined,
        tid: params.get('tid') || undefined,
        tr: params.get('tr') || undefined,
        tn: params.get('tn') || undefined,
        am: params.get('am') || undefined,
        cu: params.get('cu') || 'INR',
        url: qrData,
      };
    } catch {
      return null;
    }
  };

  const validateUPIQRCode = (upiDetails: UPIDetails | null): { isValid: boolean; reasons: string[] } => {
    const reasons: string[] = [];

    if (!upiDetails) {
      reasons.push("Not a valid UPI QR code");
      return { isValid: false, reasons };
    }

    // Validate VPA format
    const vpa = upiDetails.pa;
    if (!vpa) {
      reasons.push("Missing VPA (Payee Address)");
    } else {
      const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
      if (!vpaRegex.test(vpa)) {
        reasons.push("Invalid VPA format");
      }

      // Check PSP handle (after @)
      const handle = vpa.split('@')[1]?.toLowerCase();
      const validHandles = ['paytm', 'ybl', 'okaxis', 'oksbi', 'okicici', 'okhdfcbank', 'upi', 'apl', 'axl', 'ibl', 'pnb'];
      
      if (handle && !validHandles.includes(handle)) {
        reasons.push(`Suspicious PSP handle: ${handle}`);
      }
    }

    // Check for missing critical fields
    if (!upiDetails.pn) {
      reasons.push("Missing payee name - possible tampered QR");
    }

    // Validate amount if present
    if (upiDetails.am) {
      const amount = parseFloat(upiDetails.am);
      if (isNaN(amount) || amount <= 0) {
        reasons.push("Invalid amount specified");
      }
      if (amount > 100000) {
        reasons.push("Unusually high amount - verify carefully");
      }
    }

    return { isValid: reasons.length === 0, reasons };
  };

  const validateManualUPIId = (upiId: string): { isValid: boolean; reasons: string[]; bankHandle: string } => {
    const reasons: string[] = [];
    let bankHandle = "";

    if (!upiId || upiId.trim() === "") {
      reasons.push("UPI ID cannot be empty");
      return { isValid: false, reasons, bankHandle };
    }

    const trimmedId = upiId.trim().toLowerCase();

    // Check basic format: username@bank
    const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!vpaRegex.test(trimmedId)) {
      reasons.push("Invalid UPI ID format. Must be like: username@bank");
    }

    // Extract and validate PSP handle
    const parts = trimmedId.split('@');
    if (parts.length === 2) {
      const username = parts[0];
      bankHandle = parts[1].toUpperCase();

      // Check username length
      if (username.length < 3) {
        reasons.push("Username too short (minimum 3 characters)");
      }

      // Validate PSP handle
      const validHandles = ['paytm', 'ybl', 'okaxis', 'oksbi', 'okicici', 'okhdfcbank', 'upi', 'apl', 'axl', 'ibl', 'pnb', 'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'boi', 'cbi', 'pnb', 'bob', 'canara', 'union', 'indian', 'idbi', 'rbl', 'federal', 'yes', 'indus', 'dbs', 'hsbc', 'sc', 'citi', 'freecharge', 'airtel', 'jio', 'gpay', 'phonepe', 'amazonpay', 'whatsapp'];
      
      if (!validHandles.includes(parts[1])) {
        reasons.push(`Unrecognized bank handle: @${bankHandle}. Verify with your bank.`);
      }
    } else {
      reasons.push("UPI ID must contain exactly one '@' symbol");
    }

    return { isValid: reasons.length === 0, reasons, bankHandle };
  };

  const verifyManualUPIId = () => {
    if (!manualUpiId.trim()) {
      toast.error("Please enter a UPI ID");
      return;
    }

    toast.loading("Verifying UPI ID...");
    const validation = validateManualUPIId(manualUpiId);

    const result: UPIIDResult = {
      upiId: manualUpiId.trim(),
      isValid: validation.isValid,
      bankHandle: validation.bankHandle,
      reasons: validation.reasons,
      timestamp: new Date().toISOString(),
    };

    setUpiIdResult(result);
    setScanResult(null); // Clear QR scan result

    if (validation.isValid) {
      toast.success("✅ Valid UPI ID!");
    } else {
      toast.error("⚠️ Invalid or Suspicious UPI ID!");
    }
  };

  const startLiveScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        scanQRFromVideo();
      }
    } catch (error) {
      toast.error("Failed to access camera. Please check permissions.");
      console.error("Camera access error:", error);
    }
  };

  const stopLiveScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanQRFromVideo = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        verifyQRCode(code.data);
        stopLiveScanning();
        return;
      }
    }

    requestAnimationFrame(scanQRFromVideo);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          verifyQRCode(code.data);
        } else {
          toast.error("No QR code found in the image");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const verifyQRCode = async (qrData: string) => {
    try {
      toast.loading("Analyzing UPI QR code...");
      
      const upiDetails = parseUPIData(qrData);
      const validation = validateUPIQRCode(upiDetails);

      const result: ScanResult = {
        qrData,
        isAuthentic: validation.isValid,
        upiDetails,
        timestamp: new Date().toISOString(),
        fraudReasons: validation.reasons,
      };

      setScanResult(result);
      setUpiIdResult(null); // Clear manual UPI ID result
      refetchHistory();

      // Store in history
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('qr_scan_history').insert({
        qr_code_hash: qrData.substring(0, 100),
        is_authentic: validation.isValid,
        scan_timestamp: result.timestamp,
      });

      if (validation.isValid) {
        toast.success("✅ Verified UPI QR Code!");
      } else {
        toast.error("⚠️ Fraud / Suspicious QR Code Detected!");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      console.error("Verification error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">UPI QR Fraud Detection</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#scanner" className="text-sm hover:text-primary transition-colors">Scanner</a>
            <a href="#how-it-works" className="text-sm hover:text-primary transition-colors">How It Works</a>
            <a href="#history" className="text-sm hover:text-primary transition-colors">History</a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 space-y-16">

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            <span>Advanced Fraud Detection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            UPI QR Fraud Detection
          </h2>
          <p className="text-lg text-muted-foreground">
            Scan any UPI QR code to check if it's genuine or fraudulent. Uses QR structure analysis, 
            UPI handle validation, and metadata checks to protect you from payment fraud.
          </p>
        </section>

        {/* Scanner Section */}
        <section id="scanner" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-primary" />
                  QR Scanner & Upload
                </CardTitle>
                <CardDescription>
                  Scan or upload a UPI QR code for instant verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="camera" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="camera">
                      <Camera className="h-4 w-4 mr-2" />
                      Camera
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="upi-id">
                      <AtSign className="h-4 w-4 mr-2" />
                      UPI ID
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="camera" className="space-y-4">
                    <div className="bg-muted rounded-xl overflow-hidden aspect-video flex items-center justify-center relative border-2 border-dashed border-border">
                      {isScanning ? (
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <div className="text-center p-8">
                          <Camera className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground font-medium">Ready to scan UPI QR codes</p>
                          <p className="text-xs text-muted-foreground mt-2">Click "Scan Now" to begin</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {!isScanning ? (
                        <Button onClick={startLiveScanning} className="flex-1" size="lg">
                          <Camera className="h-4 w-4 mr-2" />
                          Scan Now
                        </Button>
                      ) : (
                        <Button onClick={stopLiveScanning} variant="destructive" className="flex-1" size="lg">
                          Stop Scanning
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-muted rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Upload QR Code Image</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        PNG, JPG, or JPEG format
                      </p>
                      <Button variant="outline">
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="upi-id" className="space-y-4">
                    <div className="space-y-4 p-6 border-2 border-dashed border-muted rounded-xl">
                      <div className="text-center mb-4">
                        <AtSign className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-lg font-medium">Enter UPI ID</p>
                        <p className="text-sm text-muted-foreground">
                          Type any UPI ID to verify if it's valid
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          type="text"
                          placeholder="example@paytm, name@ybl, etc."
                          value={manualUpiId}
                          onChange={(e) => setManualUpiId(e.target.value)}
                          className="text-center text-lg h-12"
                          onKeyDown={(e) => e.key === 'Enter' && verifyManualUPIId()}
                        />
                        <Button onClick={verifyManualUPIId} className="w-full" size="lg">
                          <Shield className="h-4 w-4 mr-2" />
                          Verify UPI ID
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground text-center mt-4">
                        <p>Examples: yourname@paytm, merchant@ybl, shop@oksbi</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>

            {/* Result Box */}
            {scanResult && (
              <Card className={`border-2 ${scanResult.isAuthentic ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {scanResult.isAuthentic ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-success" />
                        <span className="text-success">Verified QR Code</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <span className="text-destructive">Fake / Fraud QR Code</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Scanned: {new Date(scanResult.timestamp).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scanResult.upiDetails ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">UPI Details:</span>
                      </div>
                      
                      <div className="grid gap-2 text-sm">
                        {scanResult.upiDetails.pa && (
                          <div className="flex justify-between p-2 rounded bg-background">
                            <span className="text-muted-foreground">VPA (UPI ID):</span>
                            <span className="font-mono font-medium">{scanResult.upiDetails.pa}</span>
                          </div>
                        )}
                        {scanResult.upiDetails.pn && (
                          <div className="flex justify-between p-2 rounded bg-background">
                            <span className="text-muted-foreground">Payee Name:</span>
                            <span className="font-medium">{scanResult.upiDetails.pn}</span>
                          </div>
                        )}
                        {scanResult.upiDetails.pa && (
                          <div className="flex justify-between p-2 rounded bg-background">
                            <span className="text-muted-foreground">Bank Handle:</span>
                            <span className="font-mono font-medium">{scanResult.upiDetails.pa.split('@')[1]?.toUpperCase()}</span>
                          </div>
                        )}
                        {scanResult.upiDetails.am && (
                          <div className="flex justify-between p-2 rounded bg-background">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-medium">₹{scanResult.upiDetails.am}</span>
                          </div>
                        )}
                        {scanResult.upiDetails.mc && (
                          <div className="flex justify-between p-2 rounded bg-background">
                            <span className="text-muted-foreground">Merchant Code:</span>
                            <span className="font-mono text-xs">{scanResult.upiDetails.mc}</span>
                          </div>
                        )}
                        {scanResult.upiDetails.tn && (
                          <div className="flex justify-between p-2 rounded bg-background">
                            <span className="text-muted-foreground">Note:</span>
                            <span className="text-xs">{scanResult.upiDetails.tn}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription>Not a valid UPI QR code</AlertDescription>
                    </Alert>
                  )}

                  {!scanResult.isAuthentic && scanResult.fraudReasons.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-destructive">Fraud Indicators:</p>
                      <div className="space-y-1">
                        {scanResult.fraudReasons.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* UPI ID Result Box */}
            {upiIdResult && (
              <Card className={`border-2 ${upiIdResult.isValid ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {upiIdResult.isValid ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-success" />
                        <span className="text-success">Valid UPI ID</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <span className="text-destructive">Invalid / Suspicious UPI ID</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Verified: {new Date(upiIdResult.timestamp).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 rounded bg-background">
                      <span className="text-muted-foreground">UPI ID:</span>
                      <span className="font-mono font-medium">{upiIdResult.upiId}</span>
                    </div>
                    {upiIdResult.bankHandle && (
                      <div className="flex justify-between p-3 rounded bg-background">
                        <span className="text-muted-foreground">Bank Handle:</span>
                        <Badge variant={upiIdResult.isValid ? "default" : "destructive"}>
                          @{upiIdResult.bankHandle}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {!upiIdResult.isValid && upiIdResult.reasons.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-semibold text-destructive">Issues Found:</p>
                      <div className="space-y-1">
                        {upiIdResult.reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {upiIdResult.isValid && (
                    <Alert className="bg-success/10 border-success/20">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertTitle className="text-success">Verified</AlertTitle>
                      <AlertDescription>
                        This UPI ID follows valid format and uses a recognized bank handle.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card id="history">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Scans
                </CardTitle>
                <CardDescription>Latest verification history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scanHistory && scanHistory.length > 0 ? (
                    scanHistory.map((scan: any) => (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {scan.is_authentic ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                          <div className="text-sm">
                            <p className="font-medium">
                              {scan.is_authentic ? "Verified" : "Fraud"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(scan.scan_timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No scans yet. Start scanning to see history.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-3">
                <Info className="h-8 w-8 text-primary" />
                How It Works
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Our advanced fraud detection system validates UPI QR codes through multiple security checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Validate UPI VPA Format</h3>
                      <p className="text-sm text-muted-foreground">
                        Checks if the UPI ID follows the correct format: <code className="text-xs bg-muted px-1 py-0.5 rounded">username@bankhandle</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Check PSP Handle</h3>
                      <p className="text-sm text-muted-foreground">
                        Verifies the bank/PSP handle (e.g., paytm, ybl, oksbi, okhdfcbank) against a whitelist of known providers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Detect Tampered Metadata</h3>
                      <p className="text-sm text-muted-foreground">
                        Analyzes QR metadata for missing critical fields like payee name, suspicious amounts, or malformed data
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Verify QR-code Encoding</h3>
                      <p className="text-sm text-muted-foreground">
                        Ensures the QR follows UPI protocol standards and contains properly encoded payment information
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-accent/50 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Supported PSP Handles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['paytm', 'ybl', 'okaxis', 'oksbi', 'okicici', 'okhdfcbank', 'upi', 'apl', 'axl', 'ibl', 'pnb'].map(handle => (
                    <Badge key={handle} variant="secondary" className="font-mono text-xs">
                      @{handle}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default QRScan;
