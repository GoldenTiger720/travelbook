import { Quote } from "@/types/quote"
import { format } from "date-fns"

interface ExportData {
  quotes: Quote[]
  filters?: {
    dateFrom?: Date
    dateTo?: Date
    status?: string
  }
}

export const exportToExcel = (data: ExportData) => {
  const { quotes } = data
  
  // Create CSV content
  const headers = [
    "Quote Number",
    "Status",
    "Customer Name",
    "Email",
    "Phone",
    "Company",
    "Destination",
    "Tour Type",
    "Start Date",
    "End Date",
    "Passengers",
    "Amount",
    "Currency",
    "Lead Source",
    "Assigned To",
    "Agency",
    "Created Date",
    "Valid Until",
    "Terms Accepted",
    "Terms Accepted Date"
  ]
  
  const rows = quotes.map(quote => [
    quote.quoteNumber,
    quote.status,
    quote.customer.name,
    quote.customer.email,
    quote.customer.phone || "",
    quote.customer.company || "",
    quote.tourDetails.destination,
    quote.tourDetails.tourType,
    format(quote.tourDetails.startDate, "yyyy-MM-dd"),
    quote.tourDetails.endDate ? format(quote.tourDetails.endDate, "yyyy-MM-dd") : "",
    quote.tourDetails.passengers,
    quote.pricing.amount,
    quote.pricing.currency,
    quote.leadSource,
    quote.assignedTo,
    quote.agency || "",
    format(quote.metadata.createdAt, "yyyy-MM-dd"),
    format(quote.validUntil, "yyyy-MM-dd"),
    quote.termsAccepted?.accepted ? "Yes" : "No",
    quote.termsAccepted?.acceptedAt ? format(quote.termsAccepted.acceptedAt, "yyyy-MM-dd") : ""
  ])
  
  // Convert to CSV format
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n")
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", `quotes_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
  link.style.visibility = "hidden"
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToPDF = (data: ExportData) => {
  const { quotes } = data
  
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Quotes Export</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px;
          color: #333;
        }
        h1 { 
          color: #2563eb;
          margin-bottom: 20px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
          font-size: 12px;
        }
        th { 
          background-color: #f3f4f6; 
          font-weight: bold;
        }
        tr:nth-child(even) { 
          background-color: #f9fafb; 
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .summary {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f3f4f6;
          border-radius: 8px;
        }
        .status-draft { color: #6b7280; }
        .status-pending { color: #f59e0b; }
        .status-sent { color: #3b82f6; }
        .status-approved { color: #10b981; }
        .status-converted { color: #8b5cf6; }
        .status-expired { color: #ef4444; }
        .status-cancelled { color: #6b7280; }
        @media print {
          body { margin: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>TravelBook - Quotes Report</h1>
      <div class="summary">
        <p><strong>Export Date:</strong> ${format(new Date(), "MMMM d, yyyy")}</p>
        <p><strong>Total Quotes:</strong> ${quotes.length}</p>
        <p><strong>Total Value:</strong> $${quotes
          .filter(q => q.pricing.currency === 'USD')
          .reduce((sum, q) => sum + q.pricing.amount, 0)
          .toLocaleString()} USD</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Quote #</th>
            <th>Status</th>
            <th>Customer</th>
            <th>Destination</th>
            <th>Date</th>
            <th>PAX</th>
            <th>Amount</th>
            <th>Lead Source</th>
            <th>Sales Rep</th>
            <th>Created</th>
            <th>Valid Until</th>
          </tr>
        </thead>
        <tbody>
          ${quotes.map(quote => `
            <tr>
              <td>${quote.quoteNumber}</td>
              <td class="status-${quote.status}">${quote.status.toUpperCase()}</td>
              <td>
                ${quote.customer.name}<br>
                <small>${quote.customer.email}</small>
              </td>
              <td>${quote.tourDetails.destination}</td>
              <td>${format(quote.tourDetails.startDate, "MMM d, yyyy")}</td>
              <td>${quote.tourDetails.passengers}</td>
              <td>${quote.pricing.currency} $${quote.pricing.amount.toLocaleString()}</td>
              <td>${quote.leadSource}</td>
              <td>${quote.assignedTo}</td>
              <td>${format(quote.metadata.createdAt, "MMM d, yyyy")}</td>
              <td>${format(quote.validUntil, "MMM d, yyyy")}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

export const exportQuoteToPDF = (quote: Quote) => {
  // Create HTML content for single quote PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Quote ${quote.quoteNumber}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .quote-number {
          font-size: 18px;
          color: #666;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .label {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }
        .value {
          font-size: 14px;
          font-weight: 500;
        }
        .pricing-table {
          width: 100%;
          margin-top: 15px;
          border-collapse: collapse;
        }
        .pricing-table th,
        .pricing-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .pricing-table th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        .total-row {
          font-weight: bold;
          font-size: 18px;
          background-color: #f3f4f6;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">TravelBook</div>
        <div class="quote-number">Quote #${quote.quoteNumber}</div>
      </div>

      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Name</div>
            <div class="value">${quote.customer.name}</div>
          </div>
          <div class="info-item">
            <div class="label">Email</div>
            <div class="value">${quote.customer.email}</div>
          </div>
          ${quote.customer.phone ? `
            <div class="info-item">
              <div class="label">Phone</div>
              <div class="value">${quote.customer.phone}</div>
            </div>
          ` : ''}
          ${quote.customer.company ? `
            <div class="info-item">
              <div class="label">Company</div>
              <div class="value">${quote.customer.company}</div>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Tour Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Destination</div>
            <div class="value">${quote.tourDetails.destination}</div>
          </div>
          <div class="info-item">
            <div class="label">Tour Type</div>
            <div class="value">${quote.tourDetails.tourType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</div>
          </div>
          <div class="info-item">
            <div class="label">Travel Date</div>
            <div class="value">${format(quote.tourDetails.startDate, "MMMM d, yyyy")}${quote.tourDetails.endDate ? ` - ${format(quote.tourDetails.endDate, "MMMM d, yyyy")}` : ''}</div>
          </div>
          <div class="info-item">
            <div class="label">Number of Passengers</div>
            <div class="value">${quote.tourDetails.passengers} PAX</div>
          </div>
        </div>
        ${quote.tourDetails.description ? `
          <div class="info-item" style="margin-top: 15px;">
            <div class="label">Description</div>
            <div class="value">${quote.tourDetails.description}</div>
          </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Pricing Details</div>
        ${quote.pricing.breakdown && quote.pricing.breakdown.length > 0 ? `
          <table class="pricing-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.pricing.breakdown.map(item => `
                <tr>
                  <td>${item.item}</td>
                  <td>${item.quantity}</td>
                  <td>${quote.pricing.currency} $${item.unitPrice.toLocaleString()}</td>
                  <td>${quote.pricing.currency} $${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td>${quote.pricing.currency} $${quote.pricing.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        ` : `
          <div class="info-item">
            <div class="label">Total Amount</div>
            <div class="value" style="font-size: 24px; color: #2563eb;">
              ${quote.pricing.currency} $${quote.pricing.amount.toLocaleString()}
            </div>
          </div>
        `}
      </div>

      <div class="section">
        <div class="section-title">Quote Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Valid Until</div>
            <div class="value">${format(quote.validUntil, "MMMM d, yyyy")}</div>
          </div>
          <div class="info-item">
            <div class="label">Prepared By</div>
            <div class="value">${quote.assignedTo}</div>
          </div>
          <div class="info-item">
            <div class="label">Created Date</div>
            <div class="value">${format(quote.metadata.createdAt, "MMMM d, yyyy")}</div>
          </div>
          ${quote.agency ? `
            <div class="info-item">
              <div class="label">Agency</div>
              <div class="value">${quote.agency}</div>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="footer">
        <p>TravelBook - Your trusted travel partner</p>
        <p>Email: info@travelbook.com | Phone: +1 (234) 567-890</p>
        <p>This quote is valid until ${format(quote.validUntil, "MMMM d, yyyy")}</p>
      </div>
    </body>
    </html>
  `
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}