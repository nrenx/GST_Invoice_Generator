import { InvoiceData } from "@/types/invoice";

interface ModernInvoiceTemplateProps {
  invoiceData: InvoiceData;
  pageType: "ORIGINAL" | "DUPLICATE";
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalTax: number;
  grandTotal: number;
  amountInWords: string;
}

export const ModernInvoiceTemplate = ({
  invoiceData,
  pageType,
  totalTaxableValue,
  totalCGST,
  totalSGST,
  totalIGST,
  grandTotal,
  amountInWords
}: ModernInvoiceTemplateProps) => {
  const isInterstate = invoiceData.saleType === "Interstate";

  return (
    <div className="p-8 space-y-6" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-invoice-header to-invoice-header/80 text-primary-foreground p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{invoiceData.companyName}</h1>
            <p className="text-sm opacity-90">{invoiceData.companyAddress}</p>
            <p className="text-sm opacity-90">{invoiceData.companyState}</p>
            <div className="mt-3 space-y-1">
              <p className="text-sm"><span className="font-semibold">GSTIN:</span> {invoiceData.companyGSTIN}</p>
              <p className="text-sm"><span className="font-semibold">Email:</span> {invoiceData.companyEmail}</p>
              
            </div>
          </div>
          <div className="text-right bg-accent/20 px-4 py-2 rounded">
            <p className="text-xs font-semibold opacity-75">{pageType} FOR RECIPIENT</p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">TAX INVOICE</h3>
          <div className="space-y-1">
            <p className="text-sm"><span className="font-semibold">Invoice No:</span> {invoiceData.invoiceNumber}</p>
            <p className="text-sm"><span className="font-semibold">Date:</span> {invoiceData.invoiceDate}</p>
          </div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">TRANSPORT DETAILS</h3>
          <div className="space-y-1">
            <p className="text-sm"><span className="font-semibold">Mode:</span> {invoiceData.transportMode}</p>
            <p className="text-sm"><span className="font-semibold">Vehicle:</span> {invoiceData.vehicleNumber}</p>
          </div>
        </div>
      </div>

      {/* Party Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-invoice-header/20 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-invoice-header mb-2">BILLED TO</h3>
          <div className="space-y-1">
            <p className="font-semibold">{invoiceData.receiverName}</p>
            <p className="text-sm">{invoiceData.receiverAddress}</p>
            <p className="text-sm">{invoiceData.receiverState}</p>
            <p className="text-sm"><span className="font-semibold">GSTIN:</span> {invoiceData.receiverGSTIN}</p>
          </div>
        </div>
        <div className="border-2 border-invoice-header/20 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-invoice-header mb-2">SHIPPED TO</h3>
          <div className="space-y-1">
            <p className="font-semibold">{invoiceData.consigneeName}</p>
            <p className="text-sm">{invoiceData.consigneeAddress}</p>
            <p className="text-sm">{invoiceData.consigneeState}</p>
            <p className="text-sm"><span className="font-semibold">GSTIN:</span> {invoiceData.consigneeGSTIN}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border-2 border-invoice-header/20 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-invoice-header text-primary-foreground">
            <tr>
              <th className="p-2 text-left text-xs">Sr.</th>
              <th className="p-2 text-left text-xs">Description</th>
              <th className="p-2 text-right text-xs">HSN</th>
              <th className="p-2 text-right text-xs">Qty</th>
              <th className="p-2 text-right text-xs">Rate</th>
              <th className="p-2 text-right text-xs">Amount</th>
              {!isInterstate && <th className="p-2 text-right text-xs">CGST</th>}
              {!isInterstate && <th className="p-2 text-right text-xs">SGST</th>}
              {isInterstate && <th className="p-2 text-right text-xs">IGST</th>}
              <th className="p-2 text-right text-xs">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index} className="border-b border-invoice-header/10">
                <td className="p-2 text-sm">{index + 1}</td>
                <td className="p-2 text-sm">{item.description}</td>
                <td className="p-2 text-right text-sm">{item.hsnCode}</td>
                <td className="p-2 text-right text-sm">{item.quantity} {item.uom}</td>
                <td className="p-2 text-right text-sm">₹{item.rate.toFixed(2)}</td>
                <td className="p-2 text-right text-sm">₹{item.taxableValue.toFixed(2)}</td>
                {!isInterstate && <td className="p-2 text-right text-sm">₹{item.cgstAmount.toFixed(2)}</td>}
                {!isInterstate && <td className="p-2 text-right text-sm">₹{item.sgstAmount.toFixed(2)}</td>}
                {isInterstate && <td className="p-2 text-right text-sm">₹{item.igstAmount.toFixed(2)}</td>}
                <td className="p-2 text-right text-sm font-semibold">₹{item.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-accent/10 font-bold">
              <td colSpan={5} className="p-2 text-right">TOTAL:</td>
              <td className="p-2 text-right">₹{totalTaxableValue.toFixed(2)}</td>
              {!isInterstate && <td className="p-2 text-right">₹{totalCGST.toFixed(2)}</td>}
              {!isInterstate && <td className="p-2 text-right">₹{totalSGST.toFixed(2)}</td>}
              {isInterstate && <td className="p-2 text-right">₹{totalIGST.toFixed(2)}</td>}
              <td className="p-2 text-right text-lg text-accent">₹{grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <div className="bg-accent/10 p-4 rounded-lg">
        <p className="text-sm"><span className="font-semibold">Amount in Words:</span> {amountInWords}</p>
      </div>

      {/* Terms and Signature */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-muted p-4 rounded-lg">
          <h3 className="text-sm font-bold mb-2">Terms & Conditions</h3>
          <p className="text-xs whitespace-pre-line">{invoiceData.termsAndConditions}</p>
        </div>
        <div className="border border-muted p-4 rounded-lg text-right">
          <p className="text-sm font-semibold mb-12">For {invoiceData.companyName}</p>
          <p className="text-sm">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};
