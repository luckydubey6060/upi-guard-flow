import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportReportsProps {
  data: any[];
  title: string;
  variant?: 'default' | 'icon';
}

const ExportReports: React.FC<ExportReportsProps> = ({ data, title, variant = 'default' }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(138, 43, 226); // Purple color
      doc.text('UPI Fraud Detection Report', 20, 25);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(title, 20, 40);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
      doc.text(`Total Records: ${data.length}`, 20, 58);
      
      // Summary stats
      const fraudCount = data.filter(item => item.FraudLabel === 1).length;
      const fraudRate = ((fraudCount / data.length) * 100).toFixed(2);
      
      doc.setFontSize(12);
      doc.text('Summary Statistics:', 20, 75);
      doc.setFontSize(10);
      doc.text(`• Total Transactions: ${data.length.toLocaleString()}`, 25, 85);
      doc.text(`• Fraud Cases: ${fraudCount.toLocaleString()}`, 25, 93);
      doc.text(`• Fraud Rate: ${fraudRate}%`, 25, 101);
      doc.text(`• Clean Transactions: ${(data.length - fraudCount).toLocaleString()}`, 25, 109);
      
      // Data table
      if (data.length > 0) {
        const tableData = data.slice(0, 50).map(item => [
          item.TransactionID || 'N/A',
          item.UserID || 'N/A',
          `₹${Number(item.Amount).toLocaleString()}`,
          new Date(item.Timestamp).toLocaleDateString(),
          item.Location || 'N/A',
          item.TransactionType || 'N/A',
          item.FraudLabel === 1 ? 'Fraud' : 'Clean'
        ]);
        
        autoTable(doc, {
          head: [['Transaction ID', 'User ID', 'Amount', 'Date', 'Location', 'Type', 'Status']],
          body: tableData,
          startY: 120,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [138, 43, 226] },
          alternateRowStyles: { fillColor: [240, 240, 240] },
        });
      }
      
      doc.save(`${title.replace(/\s+/g, '_')}_Report_${new Date().getTime()}.pdf`);
      
      toast.success("PDF report exported successfully!", {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />
      });
    } catch (error) {
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      if (data.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_Data_${new Date().getTime()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("CSV data exported successfully!", {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />
      });
    } catch (error) {
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            disabled={isExporting || data.length === 0}
            className="h-9 w-9 border-primary/20 hover:bg-primary/5"
          >
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
            <FileText className="h-4 w-4 mr-2 text-red-500" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
            Export as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          disabled={isExporting || data.length === 0}
          className="border-primary/20 hover:bg-primary/5"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2 text-red-500" />
          📄 Export Full Report (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
          📊 Export Data (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportReports;