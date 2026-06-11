"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemedDropdown from "../components/ThemedDropdown";

const currencies = [
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
];

const defaultItems = [
  { id: "1", description: "Consulting Services", quantity: "5", price: "150", tax: "18" },
  { id: "2", description: "Design Mockups", quantity: "1", price: "500", tax: "5" },
];

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getFutureDate = (days) => {
  const today = new Date();
  today.setDate(today.getDate() + days);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function InvoiceGenerator() {
  const [businessName, setBusinessName] = useState("Acme Corp");
  const [clientName, setClientName] = useState("John Doe");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-001");
  const [date, setDate] = useState(getTodayDate());
  const [dueDate, setDueDate] = useState(getFutureDate(14));
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState(defaultItems);
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const toastTimerRef = useRef(null);

  // Set isClient to true to ensure localStorage loads only on the browser
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("boring-invoice-generator-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.clientName) setClientName(parsed.clientName);
        if (parsed.invoiceNumber) setInvoiceNumber(parsed.invoiceNumber);
        if (parsed.date) setDate(parsed.date);
        if (parsed.dueDate) setDueDate(parsed.dueDate);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.items && Array.isArray(parsed.items)) setItems(parsed.items);
      } catch (e) {
        console.error("Error loading saved state", e);
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isClient) {
      const state = { businessName, clientName, invoiceNumber, date, dueDate, currency, items };
      localStorage.setItem("boring-invoice-generator-state", JSON.stringify(state));
    }
  }, [businessName, clientName, invoiceNumber, date, dueDate, currency, items, isClient]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2000);
  };

  const selectedCurrencySymbol = useMemo(() => {
    return currencies.find((c) => c.value === currency)?.symbol ?? "$";
  }, [currency]);

  // Format currency helpers
  const formatCurrencyValue = (val) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(val) || 0);
  };

  // Calculations
  const calculatedData = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    const taxBreakdown = {};

    const itemsCalculated = items.map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const taxRate = Number(item.tax) || 0;
      
      const lineTotal = qty * price;
      const lineTax = lineTotal * (taxRate / 100);
      
      subtotal += lineTotal;
      totalTax += lineTax;

      if (taxRate > 0) {
        taxBreakdown[taxRate] = (taxBreakdown[taxRate] || 0) + lineTax;
      }

      return {
        ...item,
        lineTotal,
        lineTax,
      };
    });

    const grandTotal = subtotal + totalTax;

    return {
      itemsCalculated,
      subtotal,
      totalTax,
      taxBreakdown,
      grandTotal,
    };
  }, [items]);

  // Handlers
  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: "",
      quantity: "1",
      price: "0",
      tax: "0",
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      showToast("error", "An invoice must have at least one item.");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const handleResetForm = () => {
    setBusinessName("Acme Corp");
    setClientName("John Doe");
    setInvoiceNumber("INV-2026-001");
    setDate(getTodayDate());
    setDueDate(getFutureDate(14));
    setCurrency("USD");
    setItems([
      { id: "1", description: "Consulting Services", quantity: "5", price: "150", tax: "18" },
      { id: "2", description: "Design Mockups", quantity: "1", price: "500", tax: "5" },
    ]);
    showToast("success", "Form reset to default values.");
  };

  const copyInvoiceText = async () => {
    const lines = [
      `INVOICE: ${invoiceNumber}`,
      `Date Issued: ${date}`,
      `Due Date: ${dueDate}`,
      `==========================================`,
      `From: ${businessName}`,
      `To: ${clientName}`,
      `==========================================`,
      `ITEMS:`,
    ];

    items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const taxRate = Number(item.tax) || 0;
      const total = qty * price;
      lines.push(
        `- ${item.description || "Untitled Item"} (Qty: ${qty}, Price: ${selectedCurrencySymbol}${formatCurrencyValue(price)}, Tax: ${taxRate}%): ${selectedCurrencySymbol}${formatCurrencyValue(total)}`
      );
    });

    lines.push(`==========================================`);
    lines.push(`Subtotal: ${selectedCurrencySymbol}${formatCurrencyValue(calculatedData.subtotal)}`);
    
    Object.entries(calculatedData.taxBreakdown).forEach(([rate, amt]) => {
      lines.push(`Tax (${rate}%): ${selectedCurrencySymbol}${formatCurrencyValue(amt)}`);
    });

    lines.push(`------------------------------------------`);
    lines.push(`Total Amount: ${selectedCurrencySymbol}${formatCurrencyValue(calculatedData.grandTotal)} (${currency})`);
    lines.push(`==========================================`);
    lines.push(`Thank you for your business!`);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      showToast("success", "Invoice details copied to clipboard.");
    } catch (e) {
      showToast("error", "Failed to copy invoice.");
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
      const marginX = 50;
      let currentY = 780;

      // Color Palette helper
      const cSlateDark = rgb(0.09, 0.13, 0.24); // #17213d
      const cSlateMuted = rgb(0.4, 0.45, 0.55); // #66738c
      const cAmberAccent = rgb(0.96, 0.62, 0.04); // #f59e0b
      const cLightGrey = rgb(0.93, 0.94, 0.95);
      const cBorderGrey = rgb(0.85, 0.86, 0.88);

      const drawText = (text, x, y, size = 10, isBold = false, color = cSlateDark) => {
        page.drawText(String(text || ""), {
          x,
          y,
          size,
          font: isBold ? fontBold : fontRegular,
          color,
        });
      };

      const drawTextRight = (text, rightX, y, size = 10, isBold = false, color = cSlateDark) => {
        const fontToUse = isBold ? fontBold : fontRegular;
        const width = fontToUse.widthOfTextAtSize(String(text || ""), size);
        page.drawText(String(text || ""), {
          x: rightX - width,
          y,
          size,
          font: fontToUse,
          color,
        });
      };

      const drawLine = (y, thickness = 1, color = cBorderGrey) => {
        page.drawLine({
          start: { x: marginX, y },
          end: { x: 595.28 - marginX, y },
          thickness,
          color,
        });
      };

      // Amber Bar
      page.drawRectangle({
        x: marginX,
        y: 810,
        width: 595.28 - marginX * 2,
        height: 6,
        color: cAmberAccent,
      });

      // Header row
      drawText(businessName || "My Business", marginX, currentY - 20, 20, true, cSlateDark);
      drawTextRight("INVOICE", 595.28 - marginX, currentY - 20, 24, true, cSlateDark);

      currentY -= 45;
      drawLine(currentY, 1.5, cBorderGrey);
      currentY -= 25;

      // Bill To & Invoice Info Columns
      drawText("BILL TO", marginX, currentY, 9, true, cSlateMuted);
      drawText(clientName || "Client Name", marginX, currentY - 15, 12, true, cSlateDark);

      drawTextRight("Invoice No:", 440, currentY, 9, true, cSlateMuted);
      drawTextRight(invoiceNumber || "INV-001", 595.28 - marginX, currentY, 10, false, cSlateDark);

      drawTextRight("Date Issued:", 440, currentY - 15, 9, true, cSlateMuted);
      drawTextRight(date || "", 595.28 - marginX, currentY - 15, 10, false, cSlateDark);

      drawTextRight("Due Date:", 440, currentY - 30, 9, true, cSlateMuted);
      drawTextRight(dueDate || "", 595.28 - marginX, currentY - 30, 10, false, cSlateDark);

      currentY -= 65;
      drawLine(currentY, 1, cBorderGrey);
      currentY -= 20;

      // Table Header
      page.drawRectangle({
        x: marginX,
        y: currentY - 4,
        width: 595.28 - marginX * 2,
        height: 20,
        color: cLightGrey,
      });

      drawText("Item Description", marginX + 8, currentY, 9, true, cSlateMuted);
      drawTextRight("Qty", 340, currentY, 9, true, cSlateMuted);
      drawTextRight("Unit Price", 420, currentY, 9, true, cSlateMuted);
      drawTextRight("Tax", 480, currentY, 9, true, cSlateMuted);
      drawTextRight("Total", 595.28 - marginX - 8, currentY, 9, true, cSlateMuted);

      currentY -= 20;

      // Table Items
      items.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const taxRate = Number(item.tax) || 0;
        const total = qty * price;
        const desc = item.description || "Untitled Item";

        drawText(desc, marginX + 8, currentY, 9, false, cSlateDark);
        drawTextRight(qty.toString(), 340, currentY, 9, false, cSlateDark);
        drawTextRight(`${selectedCurrencySymbol}${formatCurrencyValue(price)}`, 420, currentY, 9, false, cSlateDark);
        drawTextRight(`${taxRate}%`, 480, currentY, 9, false, cSlateDark);
        drawTextRight(`${selectedCurrencySymbol}${formatCurrencyValue(total)}`, 595.28 - marginX - 8, currentY, 9, false, cSlateDark);

        currentY -= 20;
      });

      drawLine(currentY, 1, cBorderGrey);
      currentY -= 20;

      // Subtotal, Taxes and Grand Total on Right
      const rightColumnAlign = 595.28 - marginX - 8;
      
      drawTextRight("Subtotal:", 440, currentY, 10, false, cSlateMuted);
      drawTextRight(`${selectedCurrencySymbol}${formatCurrencyValue(calculatedData.subtotal)}`, rightColumnAlign, currentY, 10, false, cSlateDark);
      currentY -= 18;

      // Group tax rates
      Object.entries(calculatedData.taxBreakdown).forEach(([rateStr, amt]) => {
        drawTextRight(`Tax (${rateStr}%):`, 440, currentY, 10, false, cSlateMuted);
        drawTextRight(`${selectedCurrencySymbol}${formatCurrencyValue(amt)}`, rightColumnAlign, currentY, 10, false, cSlateDark);
        currentY -= 18;
      });

      drawLine(currentY, 1, cBorderGrey);
      currentY -= 20;

      drawTextRight("Total Amount:", 440, currentY, 12, true, cSlateDark);
      drawTextRight(`${currency} ${selectedCurrencySymbol}${formatCurrencyValue(calculatedData.grandTotal)}`, rightColumnAlign, currentY, 12, true, cAmberAccent);

      currentY -= 45;
      drawText("Thank you for your business!", marginX + 8, currentY, 10, false, cSlateMuted);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${invoiceNumber || "invoice"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      
      showToast("success", "PDF Invoice downloaded successfully.");
    } catch (e) {
      console.error(e);
      showToast("error", "Error building PDF invoice.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans print:bg-white print:p-0 print:block">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 w-full max-w-6xl border border-slate-200 flex flex-col gap-6 print:border-none print:shadow-none print:p-0 print:max-w-none">
        
        {/* Title / Info block (Hidden during print) */}
        <div className="flex flex-col gap-2 items-center text-center print:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Finance</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Invoice Generator</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Create professional invoices client-side instantly. Download PDFs, print, or copy results.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch print:block">
          
          {/* LEFT SIDE: Settings & Items Inputs (Hidden during print) */}
          <div className="flex flex-col gap-6 print:hidden">
            
            {/* Invoice Details Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Details</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Invoice Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Business Name</span>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Business Name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Client Name</span>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client Name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Number</span>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-001"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Currency</span>
                  <ThemedDropdown
                    ariaLabel="Choose currency"
                    value={currency}
                    options={currencies}
                    onChange={(value) => setCurrency(value)}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Issue Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Due Date</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </label>
              </div>
            </div>

            {/* Invoice Items Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Items</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Invoice Line Items</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>

              {/* Items Table / Form list */}
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="group border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 rounded-xl p-3 flex flex-col gap-3 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Item #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 underline underline-offset-2 decoration-red-300 hover:decoration-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</span>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                          placeholder="e.g. Consulting"
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Qty</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, "quantity", e.target.value)}
                          placeholder="1"
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Price ({selectedCurrencySymbol})</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(item.id, "price", e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tax (%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={item.tax}
                          onChange={(e) => handleUpdateItem(item.id, "tax", e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reset Control */}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 transition"
                >
                  Reset Invoice Form
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Real-time Interactive Paper Preview */}
          <div className="flex flex-col gap-6 print:block">
            
            {/* Control buttons (Hidden during print) */}
            <div className="grid grid-cols-3 gap-2 print:hidden">
              <button
                type="button"
                onClick={downloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-3 font-semibold text-white text-xs sm:text-sm shadow-md hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isGeneratingPdf ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                    </svg>
                    Building...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDF
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={printInvoice}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3 py-3 font-semibold text-white text-xs sm:text-sm shadow-md hover:bg-black transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>

              <button
                type="button"
                onClick={copyInvoiceText}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-3 font-semibold text-slate-700 text-xs sm:text-sm hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Text
              </button>
            </div>

            {/* Paper Preview Element */}
            <div className="invoice-print-container rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-md hover:shadow-lg transition-all duration-200 print:shadow-none print:border-none print:p-0 flex flex-col gap-6">
              
              {/* Colored branding stripe (standard in boring tools layout) */}
              <div className="h-2 w-full bg-amber-500 rounded-full" />

              {/* Invoice Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">{businessName || "My Business"}</h3>
                </div>
                <div className="text-left sm:text-right">
                  <h4 className="text-2xl font-black text-slate-800 tracking-wider">INVOICE</h4>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Invoice Billing Information and Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bill To</span>
                  <span className="font-bold text-slate-950 break-words">{clientName || "Client Name"}</span>
                </div>
                <div className="flex flex-col sm:items-end gap-1.5 text-slate-700">
                  <div className="flex gap-2 justify-between w-full max-w-[240px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice No:</span>
                    <span className="font-semibold text-slate-950">{invoiceNumber || "INV-001"}</span>
                  </div>
                  <div className="flex gap-2 justify-between w-full max-w-[240px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Issued:</span>
                    <span className="font-medium text-slate-900">{date}</span>
                  </div>
                  <div className="flex gap-2 justify-between w-full max-w-[240px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Date:</span>
                    <span className="font-medium text-slate-900">{dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Items Preview Table */}
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider rounded-l-lg">Item Description</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">Qty</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">Unit Price</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">Tax</th>
                      <th className="p-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right rounded-r-lg">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const qty = Number(item.quantity) || 0;
                      const price = Number(item.price) || 0;
                      const taxRate = Number(item.tax) || 0;
                      const total = qty * price;
                      return (
                        <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/30 transition">
                          <td className="p-2.5 font-medium text-slate-900 break-words max-w-[150px] sm:max-w-[240px]">{item.description || "Untitled Item"}</td>
                          <td className="p-2.5 text-slate-900 text-right tabular-nums">{qty}</td>
                          <td className="p-2.5 text-slate-900 text-right tabular-nums">{selectedCurrencySymbol}{formatCurrencyValue(price)}</td>
                          <td className="p-2.5 text-slate-900 text-right tabular-nums">{taxRate}%</td>
                          <td className="p-2.5 font-semibold text-slate-900 text-right tabular-nums">{selectedCurrencySymbol}{formatCurrencyValue(total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <hr className="border-slate-100" />

              {/* Summary Totals breakdown */}
              <div className="flex flex-col items-end gap-2 text-sm">
                <div className="flex justify-between w-full max-w-[280px]">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-medium text-slate-900 tabular-nums">{selectedCurrencySymbol}{formatCurrencyValue(calculatedData.subtotal)}</span>
                </div>

                {Object.entries(calculatedData.taxBreakdown).map(([rate, amt]) => (
                  <div key={rate} className="flex justify-between w-full max-w-[280px]">
                    <span className="text-slate-500">Tax ({rate}%):</span>
                    <span className="font-medium text-slate-900 tabular-nums">{selectedCurrencySymbol}{formatCurrencyValue(amt)}</span>
                  </div>
                ))}

                <hr className="w-full max-w-[280px] border-slate-100" />

                <div className="flex justify-between w-full max-w-[280px]">
                  <span className="font-bold text-slate-900">Total Amount:</span>
                  <span className="text-lg font-black text-amber-600 tabular-nums">{currency} {selectedCurrencySymbol}{formatCurrencyValue(calculatedData.grandTotal)}</span>
                </div>
              </div>

              {/* Thank you message footer */}
              <div className="mt-4 text-left">
                <p className="text-xs text-slate-400 italic">Thank you for your business!</p>
              </div>

            </div>

            {/* Print Instruction Box (Hidden during print) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 print:hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accuracy & Privacy</p>
              <p className="mt-1 text-xs text-slate-600">
                All math logic is computed locally inside your browser. No item list or contact information is sent to a server.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Toast Feedback notifications */}
      {toast.message ? (
        <div
          className={`fixed bottom-6 left-1/2 z-[99999] -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow-lg animate-fade-in-out ${toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      {/* Global CSS style tags for customized print media format and toast animation */}
      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
        .animate-fade-in-out {
          animation: fadeInOut 2s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px) translateX(-50%); }
          10% { opacity: 1; transform: translateY(0) translateX(-50%); }
          90% { opacity: 1; transform: translateY(0) translateX(-50%); }
          100% { opacity: 0; transform: translateY(-10px) translateX(-50%); }
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-container, .invoice-print-container * {
            visibility: visible;
          }
          .invoice-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
