import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageSquare, Smartphone, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface AlertSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  whatsappAlerts: boolean;
  emailAddress: string;
  phoneNumber: string;
  priority: 'high' | 'medium-high' | 'all';
}

interface FraudAlert {
  id: string;
  amount: number;
  time: string;
  riskLevel: 'high' | 'medium' | 'low';
  type: string;
  sent: boolean;
}

const AlertsNotifications: React.FC = () => {
  const [settings, setSettings] = useState<AlertSettings>({
    emailAlerts: true,
    smsAlerts: false,
    whatsappAlerts: false,
    emailAddress: '',
    phoneNumber: '',
    priority: 'high'
  });

  const [recentAlerts, setRecentAlerts] = useState<FraudAlert[]>([
    {
      id: '1',
      amount: 25000,
      time: '10:32 AM',
      riskLevel: 'high',
      type: 'Unusual Location',
      sent: true
    },
    {
      id: '2', 
      amount: 15000,
      time: '09:15 AM',
      riskLevel: 'medium',
      type: 'Large Amount',
      sent: true
    }
  ]);

  const [showDemoAlert, setShowDemoAlert] = useState(false);

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('alertSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('alertSettings', JSON.stringify(settings));
    toast.success("Alert settings saved successfully!");
  };

  const testAlert = () => {
    setShowDemoAlert(true);
    toast.success("Test alert sent!", {
      description: "Check your configured channels for the test message"
    });
    setTimeout(() => setShowDemoAlert(false), 5000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Alert Popup */}
      {showDemoAlert && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <Card className="w-80 border-red-500/50 bg-red-500/5 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                    HIGH RISK
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mt-1 -mr-1"
                  onClick={() => setShowDemoAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <h4 className="font-semibold text-red-700 mb-1">
                Suspicious Transaction Detected
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                ₹25,000 flagged as suspicious at 10:32 AM
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Alert sent via:</span>
                {settings.emailAlerts && <Mail className="w-3 h-3" />}
                {settings.smsAlerts && <Smartphone className="w-3 h-3" />}
                {settings.whatsappAlerts && <MessageSquare className="w-3 h-3" />}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Configure real-time fraud detection alerts</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="surface-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Channels
              </CardTitle>
              <CardDescription>
                Choose how you want to receive fraud detection alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <Label className="text-base font-medium">Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, emailAlerts: checked})}
                  />
                </div>
                
                {settings.emailAlerts && (
                  <div className="ml-8 space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={settings.emailAddress}
                      onChange={(e) => setSettings({...settings, emailAddress: e.target.value})}
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-500" />
                    <div>
                      <Label className="text-base font-medium">SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, smsAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <Label className="text-base font-medium">WhatsApp Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via WhatsApp</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.whatsappAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, whatsappAlerts: checked})}
                  />
                </div>

                {(settings.smsAlerts || settings.whatsappAlerts) && (
                  <div className="ml-8 space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={settings.phoneNumber}
                      onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="surface-elevated">
            <CardHeader>
              <CardTitle>Alert Priority</CardTitle>
              <CardDescription>
                Choose which risk levels should trigger alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={settings.priority}
                onValueChange={(value) => setSettings({...settings, priority: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High Risk Only</SelectItem>
                  <SelectItem value="medium-high">🟠 Medium & High Risk</SelectItem>
                  <SelectItem value="all">🟡 All Risk Levels</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={saveSettings} className="btn-hero">
              Save Settings
            </Button>
            <Button onClick={testAlert} variant="outline">
              Test Alert
            </Button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="space-y-6">
          <Card className="surface-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getRiskColor(alert.riskLevel)}>
                      {alert.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-sm font-medium">₹{alert.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{alert.type}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Alert sent</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-elevated">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Stay Protected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Real-time alerts help you catch fraudulent activities as they happen.
              </p>
              <div className="text-xs text-muted-foreground">
                Response time: &lt; 30 seconds
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlertsNotifications;