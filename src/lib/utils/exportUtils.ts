import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'
import { format } from 'date-fns'
import { User } from '@/lib/hooks/useUsers'

// Interface for export data
interface ExportUser {
  'Full Name': string
  'Email': string
  'Phone': string
  'Role': string
  'Commission (%)': string
  'Status': string
}

// Transform user data for export
const transformUserForExport = (user: User): ExportUser => ({
  'Full Name': user.full_name,
  'Email': user.email,
  'Phone': user.phone || 'No phone',
  'Role': user.role || 'No Role',
  'Commission (%)': user.commission ? `${user.commission}%` : 'N/A',
  'Status': user.status || 'Unknown'
})

// Export to Excel
export const exportUsersToExcel = (users: User[], filename?: string) => {
  try {
    // Transform data for export
    const exportData = users.map(transformUserForExport)

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Full Name
      { wch: 35 }, // Email
      { wch: 20 }, // Phone
      { wch: 15 }, // Role
      { wch: 15 }, // Commission
      { wch: 12 }, // Status
    ]
    ws['!cols'] = colWidths

    // Add title row
    XLSX.utils.sheet_add_aoa(ws, [['Users Report - Generated on ' + format(new Date(), 'yyyy-MM-dd HH:mm')]], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A2' }) // Empty row

    // Move data down by 2 rows
    const originalData = XLSX.utils.sheet_to_json(ws, { header: 1 })
    const newData = [
      ['Users Report - Generated on ' + format(new Date(), 'yyyy-MM-dd HH:mm')],
      [''],
      ['Full Name', 'Email', 'Phone', 'Role', 'Commission (%)', 'Status'],
      ...exportData.map(user => Object.values(user))
    ]

    const newWs = XLSX.utils.aoa_to_sheet(newData)
    newWs['!cols'] = colWidths

    // Style the header row
    const headerCellStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E2E8F0' } },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    }

    // Apply styles to header row (row 3, index 2)
    const headerRow = 3
    const cols = ['A', 'B', 'C', 'D', 'E', 'F']
    cols.forEach(col => {
      const cellRef = col + headerRow
      if (!newWs[cellRef]) newWs[cellRef] = { v: '' }
      newWs[cellRef].s = headerCellStyle
    })

    XLSX.utils.book_append_sheet(wb, newWs, 'Users')

    // Generate filename
    const finalFilename = filename || `users_report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`

    // Download file
    XLSX.writeFile(wb, finalFilename)

    return true
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw new Error('Failed to export to Excel')
  }
}

// Export to PDF using html2pdf.js for immediate download
export const exportUsersToPDF = (users: User[], filename?: string) => {
  try {
    // Transform data for export
    const exportData = users.map(transformUserForExport)
    const currentDate = format(new Date(), 'yyyy-MM-dd HH:mm')
    const finalFilename = filename || `users_report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`

    // Create clean HTML content (black and white)
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
          <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold;">Users Report</h1>
          <p style="margin: 8px 0 0 0; color: #000; font-size: 14px;">Generated on: ${currentDate}</p>
          <p style="margin: 5px 0 0 0; color: #000; font-size: 14px;">Total Users: ${users.length}</p>
        </div>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #000;">
              <th style="border: 1px solid #000; padding: 12px 8px; text-align: left; color: #fff; font-weight: bold; font-size: 13px;">Full Name</th>
              <th style="border: 1px solid #000; padding: 12px 8px; text-align: left; color: #fff; font-weight: bold; font-size: 13px;">Email</th>
              <th style="border: 1px solid #000; padding: 12px 8px; text-align: left; color: #fff; font-weight: bold; font-size: 13px;">Phone</th>
              <th style="border: 1px solid #000; padding: 12px 8px; text-align: left; color: #fff; font-weight: bold; font-size: 13px;">Role</th>
              <th style="border: 1px solid #000; padding: 12px 8px; text-align: center; color: #fff; font-weight: bold; font-size: 13px;">Commission</th>
              <th style="border: 1px solid #000; padding: 12px 8px; text-align: center; color: #fff; font-weight: bold; font-size: 13px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${exportData.map((user, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f5f5f5' : '#ffffff'};">
                <td style="border: 1px solid #000; padding: 10px 8px; font-size: 12px; font-weight: 500; color: #000;">${user['Full Name']}</td>
                <td style="border: 1px solid #000; padding: 10px 8px; font-size: 12px; color: #000;">${user['Email']}</td>
                <td style="border: 1px solid #000; padding: 10px 8px; font-size: 12px; color: #000;">${user['Phone']}</td>
                <td style="border: 1px solid #000; padding: 10px 8px; font-size: 12px; color: #000;">${user['Role']}</td>
                <td style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 12px; font-weight: 500; color: #000;">${user['Commission (%)']}</td>
                <td style="border: 1px solid #000; padding: 10px 8px; text-align: center; font-size: 12px; color: #000;">${user['Status']}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Footer -->
        <div style="margin-top: 30px; text-align: center; color: #000; font-size: 12px; border-top: 1px solid #000; padding-top: 15px;">
          <p style="margin: 0;">This report contains ${users.length} user${users.length !== 1 ? 's' : ''} • Generated by User Management System</p>
        </div>
      </div>
    `

    // Create temporary element
    const element = document.createElement('div')
    element.innerHTML = htmlContent

    // Configure html2pdf options
    const options = {
      margin: 0.5,
      filename: finalFilename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    }

    // Generate and download PDF immediately
    return html2pdf().from(element).set(options).save().then(() => {
      console.log('PDF downloaded successfully:', finalFilename)
      return true
    }).catch((error) => {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF')
    })

  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw new Error('Failed to export to PDF')
  }
}

// Print functionality
export const printUsers = (users: User[]) => {
  try {
    // Transform data for printing
    const exportData = users.map(transformUserForExport)

    // Create HTML content for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Users Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              color: #1f2937;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #6b7280;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 8px 12px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background-color: #3b82f6;
              color: white;
              font-weight: bold;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:hover {
              background-color: #e5e7eb;
            }
            .status-active {
              color: #059669;
              font-weight: bold;
            }
            .status-inactive {
              color: #dc2626;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              th { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Users Report</h1>
            <p>Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
            <p>Total Users: ${users.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Commission (%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.map(user => `
                <tr>
                  <td>${user['Full Name']}</td>
                  <td>${user['Email']}</td>
                  <td>${user['Phone']}</td>
                  <td>${user['Role']}</td>
                  <td>${user['Commission (%)']}</td>
                  <td class="${user['Status'].toLowerCase() === 'active' ? 'status-active' : 'status-inactive'}">
                    ${user['Status']}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Could not open print window. Please allow popups for this site.')
    }

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      // Close the window after printing (optional)
      printWindow.onafterprint = () => {
        printWindow.close()
      }
    }

    return true
  } catch (error) {
    console.error('Error printing:', error)
    throw new Error('Failed to print users')
  }
}