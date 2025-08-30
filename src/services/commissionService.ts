import { Commission, CommissionFilters, CommissionSummary } from '@/types/commission'
import { addDays, subDays } from 'date-fns'

// Commission rates by salesperson/agency
const COMMISSION_RATES: { [key: string]: number } = {
  'Thiago Andrade': 10,
  'Maria Silva': 12,
  'Juan Rodriguez': 10,
  'Ana Martinez': 15,
  'Travel Plus': 8,
  'World Tours': 10,
  'Adventure Agency': 12,
  'Sunset Travel': 9,
  'default': 10
}

// Cost percentages for different tour types
const TOUR_COST_RATES: { [key: string]: number } = {
  'city': 0.65,
  'wine': 0.70,
  'adventure': 0.75,
  'cultural': 0.68,
  'nature': 0.72,
  'historical': 0.66,
  'default': 0.70
}

const generateMockCommissions = (): Commission[] => {
  const commissions: Commission[] = []
  const today = new Date()
  
  const salespersons = ['Thiago Andrade', 'Maria Silva', 'Juan Rodriguez', 'Ana Martinez', '']
  const agencies = ['Travel Plus', 'World Tours', 'Adventure Agency', 'Sunset Travel', '']
  
  const tours = [
    { id: '1', name: 'Santiago City Tour', code: 'SCL-CT01', destination: 'Santiago', category: 'city' },
    { id: '2', name: 'Casablanca Valley Wine Tour', code: 'VAL-WT01', destination: 'Valparaíso', category: 'wine' },
    { id: '3', name: 'Circuito Chico', code: 'BAR-CC01', destination: 'Bariloche', category: 'nature' },
    { id: '4', name: 'La Cueva del Viejo Volcán', code: 'BAR-LC01', destination: 'Bariloche', category: 'adventure' },
    { id: '5', name: 'Atacama Full Day Tour', code: 'ATR-FD01', destination: 'Atacama Desert', category: 'nature' },
    { id: '6', name: 'Moai Discovery Tour', code: 'EIS-MD01', destination: 'Easter Island', category: 'cultural' },
    { id: '7', name: 'Torres del Paine Day Trip', code: 'PAT-TDP01', destination: 'Patagonia', category: 'adventure' },
    { id: '8', name: 'Seven Lakes Route', code: 'BAR-7L01', destination: 'Bariloche', category: 'nature' }
  ]
  
  const clients = [
    { name: 'John Smith', email: 'john@example.com', country: 'USA' },
    { name: 'Maria Garcia', email: 'maria@example.com', country: 'Argentina' },
    { name: 'Pierre Dubois', email: 'pierre@example.com', country: 'France' },
    { name: 'Liu Wei', email: 'liu@example.com', country: 'China' },
    { name: 'Ana Silva', email: 'ana@example.com', country: 'Brazil' },
    { name: 'Hans Mueller', email: 'hans@example.com', country: 'Germany' },
    { name: 'Yuki Tanaka', email: 'yuki@example.com', country: 'Japan' },
    { name: 'Sophie Anderson', email: 'sophie@example.com', country: 'Australia' },
    { name: 'Carlos Rodriguez', email: 'carlos@example.com', country: 'Chile' },
    { name: 'Emma Johnson', email: 'emma@example.com', country: 'UK' }
  ]
  
  const statuses: Commission['commission']['status'][] = ['pending', 'approved', 'paid', 'cancelled']
  const currencies = ['CLP', 'USD', 'EUR', 'BRL', 'ARS']
  
  // Generate 200 commission records
  for (let i = 0; i < 200; i++) {
    const operationDate = addDays(today, Math.floor(Math.random() * 90) - 45) // -45 to +45 days
    const saleDate = subDays(operationDate, Math.floor(Math.random() * 30) + 1) // 1-30 days before
    const tour = tours[Math.floor(Math.random() * tours.length)]
    const client = clients[Math.floor(Math.random() * clients.length)]
    
    const hasSalesperson = Math.random() > 0.3
    const salesperson = hasSalesperson ? salespersons[Math.floor(Math.random() * 4)] : ''
    const agency = !hasSalesperson ? agencies[Math.floor(Math.random() * 4)] : ''
    
    const adults = Math.floor(Math.random() * 4) + 1
    const children = Math.floor(Math.random() * 3)
    const infants = Math.floor(Math.random() * 2)
    const totalPax = adults + children + infants
    
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    
    // Calculate pricing based on currency
    let basePrice = 0
    switch(currency) {
      case 'USD':
        basePrice = 100 + Math.floor(Math.random() * 300)
        break
      case 'EUR':
        basePrice = 90 + Math.floor(Math.random() * 270)
        break
      case 'BRL':
        basePrice = 500 + Math.floor(Math.random() * 1500)
        break
      case 'ARS':
        basePrice = 30000 + Math.floor(Math.random() * 90000)
        break
      default: // CLP
        basePrice = 50000 + Math.floor(Math.random() * 150000)
    }
    
    const grossTotal = basePrice * adults + (basePrice * 0.6 * children)
    const costRate = TOUR_COST_RATES[tour.category as keyof typeof TOUR_COST_RATES] || TOUR_COST_RATES.default
    const costs = grossTotal * costRate
    const netReceived = grossTotal - costs
    
    const commissionEntity = salesperson || agency || 'default'
    const commissionRate = COMMISSION_RATES[commissionEntity] || COMMISSION_RATES.default
    const commissionAmount = netReceived * (commissionRate / 100)
    
    const commissionStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const paymentDate = commissionStatus === 'paid' ? addDays(saleDate, Math.floor(Math.random() * 30) + 15) : undefined
    
    commissions.push({
      id: `COM${String(i + 1).padStart(6, '0')}`,
      reservationNumber: `R${new Date().getFullYear()}${String(i + 1).padStart(5, '0')}`,
      saleDate,
      operationDate,
      tour: {
        id: tour.id,
        name: tour.name,
        code: tour.code,
        destination: tour.destination
      },
      client,
      salesperson: salesperson || undefined,
      externalAgency: agency || undefined,
      passengers: {
        adults,
        children,
        infants,
        total: totalPax
      },
      pricing: {
        grossTotal,
        costs,
        netReceived,
        currency
      },
      commission: {
        percentage: commissionRate,
        amount: commissionAmount,
        status: commissionStatus,
        paymentDate
      },
      notes: Math.random() > 0.7 ? 'Special rate applied' : undefined
    })
  }
  
  return commissions
}

class CommissionService {
  private commissions: Commission[] = generateMockCommissions()
  
  async getAllCommissions(): Promise<Commission[]> {
    return this.commissions
  }
  
  async getFilteredCommissions(filters: CommissionFilters): Promise<Commission[]> {
    let filtered = [...this.commissions]
    
    // Date range filter
    if (filters.startDate && filters.endDate) {
      const dateField = filters.dateType === 'operation' ? 'operationDate' : 'saleDate'
      filtered = filtered.filter(c => {
        const date = c[dateField]
        return date >= filters.startDate! && date <= filters.endDate!
      })
    }
    
    // Tour filter
    if (filters.tour && filters.tour !== 'all') {
      filtered = filtered.filter(c => c.tour.id === filters.tour)
    }
    
    // Salesperson filter
    if (filters.salesperson && filters.salesperson !== 'all') {
      filtered = filtered.filter(c => c.salesperson === filters.salesperson)
    }
    
    // External agency filter
    if (filters.externalAgency && filters.externalAgency !== 'all') {
      filtered = filtered.filter(c => c.externalAgency === filters.externalAgency)
    }
    
    // Commission status filter
    if (filters.commissionStatus && filters.commissionStatus !== 'all') {
      filtered = filtered.filter(c => c.commission.status === filters.commissionStatus)
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.reservationNumber.toLowerCase().includes(search) ||
        c.client.name.toLowerCase().includes(search) ||
        c.tour.name.toLowerCase().includes(search)
      )
    }
    
    // Sort by sale date descending
    filtered.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime())
    
    return filtered
  }
  
  async getCommissionSummary(commissions: Commission[]): Promise<CommissionSummary> {
    const summary = commissions.reduce((acc, c) => {
      // Convert to USD for summary
      const rates: { [key: string]: number } = {
        CLP: 0.0012,
        ARS: 0.0034,
        BRL: 0.20,
        EUR: 1.09,
        USD: 1
      }
      
      const rate = rates[c.pricing.currency] || 1
      const grossUSD = c.pricing.grossTotal * rate
      const costsUSD = c.pricing.costs * rate
      const netUSD = c.pricing.netReceived * rate
      const commissionUSD = c.commission.amount * rate
      
      acc.totalSales += grossUSD
      acc.totalCosts += costsUSD
      acc.totalNet += netUSD
      acc.totalCommissions += commissionUSD
      
      if (c.commission.status === 'pending') {
        acc.pendingCommissions += commissionUSD
      } else if (c.commission.status === 'paid') {
        acc.paidCommissions += commissionUSD
      }
      
      acc.totalCommissionPercentage += c.commission.percentage
      acc.count++
      
      return acc
    }, {
      totalSales: 0,
      totalCosts: 0,
      totalNet: 0,
      totalCommissions: 0,
      pendingCommissions: 0,
      paidCommissions: 0,
      totalCommissionPercentage: 0,
      count: 0
    })
    
    return {
      totalSales: summary.totalSales,
      totalCosts: summary.totalCosts,
      totalNet: summary.totalNet,
      totalCommissions: summary.totalCommissions,
      pendingCommissions: summary.pendingCommissions,
      paidCommissions: summary.paidCommissions,
      averageCommissionRate: summary.count > 0 ? summary.totalCommissionPercentage / summary.count : 0,
      reservationCount: summary.count
    }
  }
  
  async getUniqueValues() {
    const salespersons = new Set<string>()
    const agencies = new Set<string>()
    const tours = new Map<string, string>()
    
    this.commissions.forEach(c => {
      if (c.salesperson) salespersons.add(c.salesperson)
      if (c.externalAgency) agencies.add(c.externalAgency)
      tours.set(c.tour.id, c.tour.name)
    })
    
    return {
      salespersons: Array.from(salespersons).sort(),
      agencies: Array.from(agencies).sort(),
      tours: Array.from(tours.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
    }
  }
  
  formatCurrency(amount: number, currency: string): string {
    const symbols: { [key: string]: string } = {
      CLP: 'CLP$',
      USD: 'USD$',
      EUR: '€',
      BRL: 'R$',
      ARS: 'ARS$'
    }
    return `${symbols[currency] || currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
}

export const commissionService = new CommissionService()