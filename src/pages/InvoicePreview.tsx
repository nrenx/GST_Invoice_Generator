import { useLocation, useNavigate } from "react-router-dom";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StandardInvoiceTemplate } from "@/components/templates/StandardInvoiceTemplate";
import { ModernInvoiceTemplate } from "@/components/templates/ModernInvoiceTemplate";
import { TemplateSelector } from "@/components/TemplateSelector";

const InvoicePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<"original" | "duplicate">("original");
  const [selectedTemplate, setSelectedTemplate] = useState<"standard" | "modern">("standard");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceData = location.state as InvoiceData;

  if (!invoiceData) {
    navigate("/");
    return null;
  }

  const handleDownloadPDF = () => {
    if (isGeneratingPdf) {
      return;
    }

    const body = document.body;
    if (!body) {
      toast.error("Unable to access document body for printing");
      return;
    }

  const originalPage = document.querySelector('[data-page="original"]') as HTMLElement | null;
  const duplicatePage = document.querySelector('[data-page="duplicate"]') as HTMLElement | null;
  const selectedPageAfterExport = currentPage;

    setIsGeneratingPdf(true);

    body.classList.add("exporting-pdf");

    let cleanedUp = false;
    const cleanupCallbacks: Array<() => void> = [];

    const restorePageVisibility = () => {
      if (originalPage) {
        originalPage.style.display = selectedPageAfterExport === "original" ? "block" : "none";
      }
      if (duplicatePage) {
        duplicatePage.style.display = selectedPageAfterExport === "duplicate" ? "block" : "none";
      }
    };

    let restoreVisibilityCallbackAdded = false;
    const ensureRestoreCallback = () => {
      if (!restoreVisibilityCallbackAdded) {
        cleanupCallbacks.push(restorePageVisibility);
        restoreVisibilityCallbackAdded = true;
      }
    };

    if (originalPage) {
      ensureRestoreCallback();
      originalPage.style.display = "block";
    }

    if (duplicatePage) {
      ensureRestoreCallback();
      duplicatePage.style.display = "block";
    }

    const inlinePrintStyles = document.createElement("style");
    inlinePrintStyles.setAttribute("data-pdf-print-style", "true");
    inlinePrintStyles.textContent = `
      @media print {
        html, body {
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .invoice-preview-wrapper {
          background: transparent !important;
        }

        .invoice-container {
          width: calc(210mm - 0.3in) !important;
          min-height: calc(297mm - 0.3in) !important;
          margin: 0 auto !important;
          box-sizing: border-box !important;
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
          display: block !important;
          box-shadow: none !important;
          border-width: 2px !important;
        }

        .invoice-container + .invoice-container {
          page-break-before: always !important;
        }

        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        td, th {
          border: 1px solid #000000 !important;
          word-break: break-word !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(inlinePrintStyles);
    cleanupCallbacks.push(() => {
      if (inlinePrintStyles.parentNode) {
        inlinePrintStyles.parentNode.removeChild(inlinePrintStyles);
      }
    });

    const cleanup = () => {
      if (cleanedUp) {
        return;
      }
      cleanedUp = true;

      body.classList.remove("exporting-pdf");
      cleanupCallbacks.forEach((fn) => fn());
      setIsGeneratingPdf(false);
    };

    const afterPrintHandler = () => {
      cleanup();
    };

    window.addEventListener("afterprint", afterPrintHandler);
    cleanupCallbacks.push(() => window.removeEventListener("afterprint", afterPrintHandler));

    const mediaQueryList = typeof window.matchMedia === "function" ? window.matchMedia("print") : null;
    if (mediaQueryList) {
      const mediaQueryChangeHandler = (event: MediaQueryListEvent) => {
        if (!event.matches) {
          cleanup();
        }
      };

      if (typeof mediaQueryList.addEventListener === "function") {
        mediaQueryList.addEventListener("change", mediaQueryChangeHandler);
        cleanupCallbacks.push(() => mediaQueryList.removeEventListener("change", mediaQueryChangeHandler));
      } else if (typeof mediaQueryList.addListener === "function") {
        mediaQueryList.addListener(mediaQueryChangeHandler);
        cleanupCallbacks.push(() => mediaQueryList.removeListener(mediaQueryChangeHandler));
      }
    }

    const fallbackTimer = window.setTimeout(() => {
      cleanup();
    }, 8000);
    cleanupCallbacks.push(() => window.clearTimeout(fallbackTimer));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  };

  const handleNewInvoice = () => {
    localStorage.removeItem('invoice-form-data');
    navigate("/");
    toast.success("Starting new invoice - form cleared");
  };

  const togglePage = () => {
    setCurrentPage(currentPage === "original" ? "duplicate" : "original");
  };

  // Calculate totals
  const totalTaxableValue = invoiceData.items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCGST = invoiceData.items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSGST = invoiceData.items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIGST = invoiceData.items.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = totalCGST + totalSGST + totalIGST;
  const grandTotal = totalTaxableValue + totalTax;

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const amountInWords = numberToWords(Math.floor(grandTotal)) + ' Rupees Only';

  return (
    <div className="min-h-screen bg-white">
      {/* Action Bar */}
      <div className="no-print sticky top-0 z-10 bg-white border-b-2 border-black shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2 border-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
            <Button variant="secondary" onClick={handleNewInvoice} className="gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
            <Button variant="outline" onClick={togglePage} className="gap-2">
              View {currentPage === "original" ? "Duplicate" : "Original"}
            </Button>
            <Button variant="outline" onClick={() => setShowTemplateSelector(true)} className="gap-2">
              Change Template
            </Button>
          </div>
          <h1 className="text-xl font-bold text-center flex-1">
            Invoice Preview - {currentPage.toUpperCase()}
          </h1>
          <Button onClick={handleDownloadPDF} className="gap-2" disabled={isGeneratingPdf} aria-busy={isGeneratingPdf}>
            <Download className="h-4 w-4" />
            {isGeneratingPdf ? "Preparing PDF" : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Invoice Content - visually center the A4 sheet while keeping print metrics exact */}
      <div
        className="invoice-preview-wrapper flex flex-col items-center gap-8 px-4 py-6 lg:px-8"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        {/* Original Page */}
        <div 
          data-page="original"
          className="bg-white shadow-lg mx-auto border-2 border-black invoice-container"
          style={{
            width: "100%",
            maxWidth: "210mm",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            display: currentPage === "original" ? "block" : "none"
          }}
        >
          {selectedTemplate === "standard" ? <StandardInvoiceTemplate
            invoiceData={invoiceData} 
            pageType="ORIGINAL"
            totalTaxableValue={totalTaxableValue}
            totalCGST={totalCGST}
            totalSGST={totalSGST}
            totalIGST={totalIGST}
            totalTax={totalTax}
            grandTotal={grandTotal}
            amountInWords={amountInWords}
          /> : <ModernInvoiceTemplate
            invoiceData={invoiceData}
            pageType="ORIGINAL"
            totalTaxableValue={totalTaxableValue}
            totalCGST={totalCGST}
            totalSGST={totalSGST}
            totalIGST={totalIGST}
            totalTax={totalTax}
            grandTotal={grandTotal}
            amountInWords={amountInWords}
          />}
        </div>

        {/* Duplicate Page */}
        <div 
          data-page="duplicate"
          className="bg-white shadow-lg mx-auto border-2 border-black invoice-container"
          style={{
            width: "100%",
            maxWidth: "210mm",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            display: currentPage === "duplicate" ? "block" : "none"
          }}
        >
          {selectedTemplate === "standard" ? <StandardInvoiceTemplate
            invoiceData={invoiceData} 
            pageType="DUPLICATE"
            totalTaxableValue={totalTaxableValue}
            totalCGST={totalCGST}
            totalSGST={totalSGST}
            totalIGST={totalIGST}
            totalTax={totalTax}
            grandTotal={grandTotal}
            amountInWords={amountInWords}
          /> : <ModernInvoiceTemplate
            invoiceData={invoiceData}
            pageType="DUPLICATE"
            totalTaxableValue={totalTaxableValue}
            totalCGST={totalCGST}
            totalSGST={totalSGST}
            totalIGST={totalIGST}
            totalTax={totalTax}
            grandTotal={grandTotal}
            amountInWords={amountInWords}
          />}
        </div>
      </div>

      <TemplateSelector
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={(template) => {
          setSelectedTemplate(template);
          setShowTemplateSelector(false);
          toast.success(`Switched to ${template} template`);
        }}
      />
    </div>
  );
};

export default InvoicePreview;