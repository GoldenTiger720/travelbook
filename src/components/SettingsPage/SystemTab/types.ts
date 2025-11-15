export interface PaymentMethod {
  id: string
  name: string
  taxRate: number
  bankSlipFee: number
  cashFee: number
}

export interface BankAccount {
  id: string
  accountName: string
  currency: string
}

export interface FinancialConfig {
  id?: string
  baseCurrency: string
  taxRate: number
}

export interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
}

export interface SystemAppearance {
  id: string
  company_logo?: string
}

export interface TermsConfigItem {
  id: string
  termsAndConditions: string
  termsFileUrl: string
  termsFileName: string
}

export interface Category {
  id: string
  name: string
}

export type SortDirection = 'asc' | 'desc'

export const CURRENCY_OPTIONS = ['USD', 'EUR', 'BRL', 'ARS'] as const
export type Currency = typeof CURRENCY_OPTIONS[number]
