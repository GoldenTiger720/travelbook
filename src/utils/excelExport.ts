import * as XLSX from 'xlsx'
import type { Vehicle } from '@/types/vehicle'

interface ExcelExportOptions {
  filename?: string
  sheetName?: string
}

export const exportVehiclesToExcel = (
  vehicles: Vehicle[],
  options: ExcelExportOptions = {}
) => {
  const { filename = 'vehicles-export', sheetName = 'Vehicles' } = options

  // Prepare data for Excel export
  const excelData = vehicles.map((vehicle, index) => ({
    'No.': index + 1,
    'Vehicle Name': vehicle.vehicle_name,
    'License Plate': vehicle.license_plate,
    'Brand': vehicle.brand,
    'Model': vehicle.model,
    'Capacity': vehicle.capacity,
    'Type': vehicle.external_vehicle ? 'External' : 'Internal',
    'Status': vehicle.status ? 'Active' : 'Inactive',
    'Created Date': new Date(vehicle.created_at).toLocaleDateString(),
    'Created Time': new Date(vehicle.created_at).toLocaleTimeString(),
    'Last Updated': new Date(vehicle.updated_at).toLocaleDateString()
  }))

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths for better formatting
  const columnWidths = [
    { wch: 5 },  // No.
    { wch: 20 }, // Vehicle Name
    { wch: 15 }, // License Plate
    { wch: 15 }, // Brand
    { wch: 15 }, // Model
    { wch: 10 }, // Capacity
    { wch: 10 }, // Type
    { wch: 10 }, // Status
    { wch: 15 }, // Created Date
    { wch: 15 }, // Created Time
    { wch: 15 }  // Last Updated
  ]
  worksheet['!cols'] = columnWidths

  // Add some styling to headers
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']!)
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!worksheet[cellAddress]) continue

    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } },
      alignment: { horizontal: "center" }
    }
  }

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Add a summary sheet
  const summaryData = [
    ['Report Summary', ''],
    ['', ''],
    ['Total Vehicles', vehicles.length],
    ['Active Vehicles', vehicles.filter(v => v.status).length],
    ['Inactive Vehicles', vehicles.filter(v => !v.status).length],
    ['External Vehicles', vehicles.filter(v => v.external_vehicle).length],
    ['Internal Vehicles', vehicles.filter(v => !v.external_vehicle).length],
    ['', ''],
    ['Export Date', new Date().toLocaleString()],
    ['', ''],
    ['Vehicle Brands', ''],
    ...Array.from(new Set(vehicles.map(v => v.brand))).map(brand => [
      `- ${brand}`,
      vehicles.filter(v => v.brand === brand).length
    ])
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }]

  // Style the summary sheet header
  if (summarySheet['A1']) {
    summarySheet['A1'].s = {
      font: { bold: true, sz: 14 },
      fill: { fgColor: { rgb: "FFFFCC" } }
    }
  }

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Generate Excel file and download
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
  const finalFilename = `${filename}_${timestamp}.xlsx`

  XLSX.writeFile(workbook, finalFilename)
}

export const exportFilteredVehiclesToExcel = (
  allVehicles: Vehicle[],
  filteredVehicles: Vehicle[],
  filterInfo?: { searchTerm?: string; statusFilter?: string; typeFilter?: string }
) => {
  const filename = filteredVehicles.length === allVehicles.length
    ? 'all-vehicles'
    : 'filtered-vehicles'

  // If filtered, add filter info to summary
  if (filteredVehicles.length < allVehicles.length && filterInfo) {
    // Create a modified export with filter information
    const workbook = XLSX.utils.book_new()

    // Main data sheet
    const excelData = filteredVehicles.map((vehicle, index) => ({
      'No.': index + 1,
      'Vehicle Name': vehicle.vehicle_name,
      'License Plate': vehicle.license_plate,
      'Brand': vehicle.brand,
      'Model': vehicle.model,
      'Capacity': vehicle.capacity,
      'Type': vehicle.external_vehicle ? 'External' : 'Internal',
      'Status': vehicle.status ? 'Active' : 'Inactive',
      'Created Date': new Date(vehicle.created_at).toLocaleDateString(),
      'Created Time': new Date(vehicle.created_at).toLocaleTimeString(),
      'Last Updated': new Date(vehicle.updated_at).toLocaleDateString()
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const columnWidths = [
      { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }
    ]
    worksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Vehicles')

    // Summary with filter info
    const summaryData = [
      ['Filtered Vehicle Report', ''],
      ['', ''],
      ['Applied Filters:', ''],
      ['- Search Term', filterInfo.searchTerm || 'None'],
      ['- Status Filter', filterInfo.statusFilter === 'all' ? 'All' : filterInfo.statusFilter || 'All'],
      ['- Type Filter', filterInfo.typeFilter === 'all' ? 'All' : filterInfo.typeFilter || 'All'],
      ['', ''],
      ['Results Summary', ''],
      ['Total Vehicles (Filtered)', filteredVehicles.length],
      ['Total Vehicles (All)', allVehicles.length],
      ['Active Vehicles (Filtered)', filteredVehicles.filter(v => v.status).length],
      ['Inactive Vehicles (Filtered)', filteredVehicles.filter(v => !v.status).length],
      ['External Vehicles (Filtered)', filteredVehicles.filter(v => v.external_vehicle).length],
      ['Internal Vehicles (Filtered)', filteredVehicles.filter(v => !v.external_vehicle).length],
      ['', ''],
      ['Export Date', new Date().toLocaleString()]
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Filter Summary')

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
    XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`)
  } else {
    // Use the standard export for all vehicles
    exportVehiclesToExcel(filteredVehicles, { filename })
  }
}