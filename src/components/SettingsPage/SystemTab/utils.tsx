import React from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { SortDirection } from './types'

/**
 * Returns the appropriate sort icon based on current field and direction
 */
export const getSortIcon = (field: string, currentField: string, direction: SortDirection) => {
  if (field !== currentField) {
    return <ArrowUpDown className="w-4 h-4 ml-1 inline" />
  }
  return direction === 'asc' ? (
    <ArrowUp className="w-4 h-4 ml-1 inline" />
  ) : (
    <ArrowDown className="w-4 h-4 ml-1 inline" />
  )
}

/**
 * Generic sort function for arrays of objects
 */
export const sortData = <T extends Record<string, any>>(
  data: T[],
  sortField: keyof T | '',
  sortDirection: SortDirection
): T[] => {
  if (!sortField) return data

  return [...data].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Generic sort handler
 */
export const createSortHandler = <T extends string>(
  currentField: T | '',
  currentDirection: SortDirection,
  setField: (field: T) => void,
  setDirection: (direction: SortDirection) => void
) => {
  return (field: T) => {
    if (currentField === field) {
      setDirection(currentDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setField(field)
      setDirection('asc')
    }
  }
}
